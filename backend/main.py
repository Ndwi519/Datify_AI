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

@app.on_event("startup")
async def startup_event():
    df = get_merged_dataframe(UPLOAD_DIR)
    if df is not None and not df.empty:
        index_columns(df.columns.tolist())

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
            
        # Clear existing datasets first
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
                
        # Only take the first file
        file = files[0]
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
    except HTTPException:
        raise
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
        config = request.model_dump() if hasattr(request, "model_dump") else request.dict()
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
    results = []
    for c in history:
        try:
            results.append({
                "id": c.id,
                "question": c.question,
                "answer": json.loads(c.answer) if c.answer else {},
                "chart_config": json.loads(c.chart_config) if c.chart_config else [],
                "timestamp": c.timestamp.isoformat()
            })
        except Exception:
            continue
    return results

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
        index_columns([])
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
            
            df = get_merged_dataframe(UPLOAD_DIR)
            if df is not None and not df.empty:
                index_columns(df.columns.tolist())
            else:
                index_columns([])
                
            return {"message": f"Dataset '{filename}' deleted.", "cache_rebuilt": success}
        else:
            raise HTTPException(status_code=404, detail="Dataset not found.")
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.get("/export-analytics")
async def export_analytics():
    try:
        df = get_merged_dataframe(UPLOAD_DIR)
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="No dataset available for export.")
            
        # Clean the dataset for BI
        # Remove duplicate rows
        clean_df = df.drop_duplicates()
        
        # Save to temporary file in exports dir
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        export_path = os.path.join(export_dir, "datify_analytics_export.csv")
        
        # Export as UTF-8 CSV without index
        clean_df.to_csv(export_path, index=False, encoding='utf-8')
        
        return FileResponse(export_path, media_type='text/csv', filename="datify_analytics_export.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export analytics: {str(e)}")

@app.get("/analytics-summary")
async def analytics_summary():
    import time
    start_time = time.time()
    try:
        df = get_merged_dataframe(UPLOAD_DIR)
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="No dataset available for summary.")
            
        clean_df = df.drop_duplicates()
        
        from datetime import datetime
        
        numeric_cols = clean_df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = clean_df.select_dtypes(exclude=['number']).columns.tolist()
        missing_values = int(clean_df.isnull().sum().sum())
        
        total_rows_raw = len(df)
        total_rows_clean = len(clean_df)
        duplicate_rows = total_rows_raw - total_rows_clean
        duplicate_percentage = round((duplicate_rows / total_rows_raw) * 100, 2) if total_rows_raw > 0 else 0
        total_cells = total_rows_clean * len(clean_df.columns)
        total_null_percentage = round((missing_values / total_cells) * 100, 2) if total_cells > 0 else 0
        
        memory_usage_bytes = clean_df.memory_usage(deep=True).sum()
        memory_usage_kb = round(memory_usage_bytes / 1024, 2)
        dataset_size_kb = memory_usage_kb
        
        dataset_name = "Merged_Analytics_Dataset"
        if 'dataset_source' in clean_df.columns and not clean_df['dataset_source'].empty:
            raw_name = str(clean_df['dataset_source'].iloc[0])
            # Ensure the dataset name always includes the .csv extension
            dataset_name = raw_name if raw_name.endswith('.csv') else f"{raw_name}.csv"
             
        end_time = time.time()
        processing_time = round(end_time - start_time, 3)
             
        summary = {
            "Dataset Name": dataset_name,
            "Total Rows": total_rows_clean,
            "Total Columns": len(clean_df.columns),
            "Missing Values": missing_values,
            "Duplicate Rows": duplicate_rows,
            "Duplicate Percentage": duplicate_percentage,
            "Total Null Percentage": total_null_percentage,
            "Numeric Columns": len(numeric_cols),
            "Categorical Columns": len(categorical_cols),
            "Dataset Size (KB)": dataset_size_kb,
            "Memory Usage (KB)": memory_usage_kb,
            "Processing Time (seconds)": processing_time,
            "Processing Status": "Success",
            "Column Names": clean_df.columns.tolist(),
            "Numeric Column Names": numeric_cols,
            "Categorical Column Names": categorical_cols,
            "Export Timestamp": datetime.now().isoformat(),
            "generated_by": "Datify AI",
            "version": "1.0"
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics summary: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
