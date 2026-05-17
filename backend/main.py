import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from dataset_manager import process_uploaded_files, get_merged_dataset_preview, list_datasets, get_merged_dataframe
from vector_store import index_columns, search_columns
from llm_engine import generate_chart_instructions, generate_insights
from analytics_engine import execute_pandas_operations, compute_statistical_summary
from report_generator import generate_pdf_report
from fastapi.responses import FileResponse
from auth import router as auth_router, get_db, get_current_user
from database import SessionLocal, User, Conversation, Base, engine
from sqlalchemy.orm import Session
import json

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AI Ask Your Dataset API")
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AskRequest(BaseModel):
    question: str

class ReportRequest(BaseModel):
    question: str
    explanation: str
    chart_config: Dict[str, Any]
    chart_image_base64: str

@app.post("/upload")
async def upload_datasets(files: List[UploadFile] = File(...)):
    import shutil
    try:
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR, exist_ok=True)

        
        if not files:
            raise HTTPException(status_code=400, detail="No files provided.")
            
        existing_df = get_merged_dataframe(UPLOAD_DIR)
        existing_cols = None
        if existing_df is not None and not existing_df.empty:
            existing_cols = set(existing_df.columns.tolist())
            if 'dataset_source' in existing_cols:
                existing_cols.remove('dataset_source')
                
        import pandas as pd
        import io
        import csv
        
        for file in files:
            content = await file.read()
            try:
                sample_text = content[:1024].decode('utf-8', errors='ignore')
                try:
                    dialect = csv.Sniffer().sniff(sample_text)
                    sep = dialect.delimiter
                except:
                    sep = ','
                    
                df_test = pd.read_csv(io.BytesIO(content), sep=sep, nrows=0)
                new_cols = set(df_test.columns.tolist())
                if existing_cols is not None and new_cols != existing_cols:
                    raise HTTPException(status_code=400, detail=f"Schema mismatch: '{file.filename}' columns do not match existing datasets.")
                if existing_cols is None:
                    existing_cols = new_cols
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise e
            await file.seek(0)
            
            
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())

        process_uploaded_files(UPLOAD_DIR, clear=True)
        success, message = process_uploaded_files(UPLOAD_DIR)
        
        if not success:
            raise HTTPException(status_code=400, detail=message)
        
        df = get_merged_dataframe(UPLOAD_DIR)
        if df is not None:
            index_columns(df.columns.tolist())
            
        return {"message": f"{len(files)} dataset(s) uploaded and indexed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/datasets")
async def get_datasets():
    datasets = list_datasets(UPLOAD_DIR)
    return {"datasets": datasets}


@app.get("/dataset-preview")
async def get_dataset_preview():
    preview = get_merged_dataset_preview(UPLOAD_DIR)
    if preview is None:
        return {"data": [], "columns": []}
    return preview


@app.post("/ask")
async def ask_question(
    request: AskRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = request.question
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    df = get_merged_dataframe(UPLOAD_DIR)
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset available. Please upload datasets first.")

    try:
        relevant_columns = search_columns(question, top_k=5)

        from dataset_manager import get_column_metadata
        column_metadata = get_column_metadata(df)
        
        llm_response = generate_chart_instructions(question, df.columns.tolist(), list(relevant_columns.keys()), column_metadata)
        
        charts = []
        for config in llm_response:
            try:
                chart_data = execute_pandas_operations(df, config)
                charts.append({
                    "chart_type": config.get("chart_type", "bar"),
                    "chart_data": chart_data,
                    "metadata": config
                })
            except Exception as e:
                print(f"Failed to generate data for chart {config.get('chart_type')}: {e}")

        summary_table = compute_statistical_summary(df, llm_response[0])
        
        history = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.timestamp.desc()).limit(5).all()
        history_text = ""
        for c in reversed(history):
            try:
                ans = json.loads(c.answer)
                history_text += f"Q: {c.question}\nA: {ans.get('key_insight')}\n"
            except:
                continue
        
        insights = generate_insights(question, df.columns.tolist(), summary_table, history_context=history_text)
        
        new_conv = Conversation(
            user_id=current_user.id,
            question=question,
            answer=json.dumps(insights),
            chart_config=json.dumps(charts)
        )
        db.add(new_conv)
        db.commit()
 
        return {
            "charts": charts,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process question: {str(e)}")

class ManualAnalyzeRequest(BaseModel):
    x_column: str
    y_column: str
    chart_type: str
    aggregation: str

@app.post("/analyze-direct")
async def analyze_direct(
    request: ManualAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    df = get_merged_dataframe(UPLOAD_DIR)
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset available.")

    try:
        config = request.dict()
        chart_data = execute_pandas_operations(df, config)
        
        chart_obj = {
            "chart_type": config["chart_type"],
            "chart_data": chart_data,
            "metadata": config
        }

        return {
            "charts": [chart_obj],
            "insights": {
                "key_insight": f"Manual Analysis: {config['aggregation'].capitalize()} of {config['y_column']} by {config['x_column']}",
                "explanation": f"This chart was generated via direct column selection. It displays the {config['aggregation']} values for each category found in {config['x_column']}.",
                "takeaway": "Use the manual selector to pivot and explore different data relationships directly."
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/history")
async def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.timestamp.desc()).limit(5).all()
    return [{
        "id": c.id,
        "question": c.question,
        "answer": json.loads(c.answer),
        "chart_config": json.loads(c.chart_config),
        "timestamp": c.timestamp.isoformat()
    } for c in history]

@app.delete("/history")
async def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db.query(Conversation).filter(Conversation.user_id == current_user.id).delete()
        db.commit()
        return {"message": "History cleared successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")

@app.delete("/history/{history_id}")
async def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        deleted = db.query(Conversation).filter(Conversation.id == history_id, Conversation.user_id == current_user.id).delete()
        if deleted == 0:
            raise HTTPException(status_code=404, detail="History item not found.")
        db.commit()
        return {"message": "History item deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete history item: {str(e)}")

@app.post("/download-report")
async def download_report(request: ReportRequest):
    try:
        pdf_path = generate_pdf_report(request)
        return FileResponse(pdf_path, media_type='application/pdf', filename="Analytics_Report.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@app.delete("/datasets")
async def clear_datasets():
    import shutil
    try:
        if os.path.exists(UPLOAD_DIR):
            shutil.rmtree(UPLOAD_DIR)
            os.makedirs(UPLOAD_DIR)
        process_uploaded_files(UPLOAD_DIR, clear=True)
        return {"message": "All datasets cleared."}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.delete("/datasets/{filename}")
async def delete_dataset(filename: str):
    try:
        if not filename.endswith('.csv'):
            filename += '.csv'
            
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            process_uploaded_files(UPLOAD_DIR, clear=True)
            success, msg = process_uploaded_files(UPLOAD_DIR)
            return {"message": f"Dataset '{filename}' deleted.", "cache_rebuilt": success}
        else:
            raise HTTPException(status_code=404, detail="Dataset not found.")
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
