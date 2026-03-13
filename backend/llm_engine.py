import os
import json
import ast
import re
from groq import Groq
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

load_dotenv()

# Setup Groq Client
# Ensure GROQ_API_KEY environment variable is set
api_key = os.environ.get("GROQ_API_KEY")

class ChartInstructions(BaseModel):
    chart_type: str = Field(description="The type of chart to generate (e.g. bar, line, pie).")
    x_column: str = Field(description="Column name to use for X axis (or categories in pie chart).")
    y_column: str = Field(description="Column name to use for Y axis (or values in pie chart).")
    aggregation: str = Field(description="The type of aggregation to perform: sum, mean, count, min, max, none.")
    explanation: str = Field(description="Brief analysis summarizing insights.")

def generate_chart_instructions(question: str, all_columns: List[str], relevant_columns: List[str], column_metadata: List[dict] = [], max_retries: int = 3) -> List[dict]:
    if not api_key:
        return [{
             "chart_type": "bar",
             "x_column": relevant_columns[0] if relevant_columns else all_columns[0],
             "y_column": relevant_columns[1] if len(relevant_columns)>1 else all_columns[1],
             "aggregation": "sum",
             "explanation": "Please ensure GROQ_API_KEY is configured correctly."
        }]

    client = Groq(api_key=api_key)
    
    system_prompt = f"""
    You are an expert data analyst AI. 
    User Question: {question}
    Available Columns & Metadata: {column_metadata}
    Specifically Relevant Columns: {relevant_columns}
    
    TASKS: 
    1. Recommend 1 to 3 DIFFERENT chart configurations that fully answer the user's question.
    2. Since the user can upload multiple datasets, they are merged into one large table.
    3. Use the 'dataset_source' column (which contains the filename) if the user wants to compare data ACROSS different files.
    
    VISUALIZATION BEST PRACTICES (MANDATORY):
    1. X-AXIS SELECTION: 
       - Never use columns like 'ID', 'Index', 'PassengerId' as the X-axis for bar/pie/area charts.
       - Prefer categorical columns with low unique counts (< 25) for X-axis in Bar/Pie charts.
       - Use 'dataset_source' as the X-axis for high-level comparisons across files.
       - If a question asks for a comparison but only high-cardinality columns exist, choose the most 'meaningful' categorical one.
    2. CHART TYPES:
       - Use 'line' or 'area' for temporal/ordinal data (Year, Date, Price trends).
       - Use 'bar' for comparisons between distinct categories.
       - Use 'pie' ONLY for part-to-whole relationships (top 5 categories).
    3. AGGREGATION:
       - Default to 'sum' or 'mean' depending on the query context.
    
    SPECIAL HANDLING (DASHBOARD MODE):
    - If the user asks for a "summary", "overview", or "tell me about this data", ENTER 'DASHBOARD MODE'.
    - In 'DASHBOARD MODE', return 3 configurations that together summarize the dataset.
    
    ALWAYS reply with VALID JSON containing a single key "charts" that holds a LIST of objects matching the instructions.
    """
    
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            reply = chat_completion.choices[0].message.content.strip()
            data = json.loads(reply)
            charts_list = data.get("charts", [])
            if charts_list and isinstance(charts_list, list):
                return charts_list
            else:
                raise ValueError("LLM did not return a 'charts' list.")
        except Exception as e:
            print(f"Failed attempt {attempt+1}: {e}")
            continue
            
    return [{"chart_type": "bar", "x_column": all_columns[0], "y_column": all_columns[1], "aggregation": "sum", "explanation": "Default view."}]

def generate_insights(question: str, all_columns: List[str], summary_table: str, history_context: str = "", max_retries: int = 3) -> dict:
    if not api_key:
        return {
            "key_insight": "API key missing.",
            "explanation": "Cannot generate insights without GROQ_API_KEY.",
            "takeaway": "Please configure your environment variables."
        }

    client = Groq(api_key=api_key)
    
    system_prompt = f"""
    You are a 'Chief Data Strategist'. Your mission is to provide an executive-level analysis that identifies not just WHAT the data shows, but WHY it matters and WHAT the user should do next.
    
    User Query: {question}
    Columns Analyzed: {all_columns}
    
    STATISTICAL EVIDENCE (Crucial - Use these exact figures):
    {summary_table}
    
    Strategic Context (Previous findings):
    {history_context if history_context else "None"}
    
    Analysis Framework:
    - If the user is asking for a general "Summary" or "Overview", provide a holistic breakdown of the entire dataset's health, key players, and primary trends.
    - If multiple datasets are present (indicated by 'dataset_source' variations), provide "Cross-file Analytics" by comparing performance or distributions between sources.
    - Otherwise, focus on the specific question.
    
    Output Requirements:
    1. **Executive Insight**: A punchy, data-backed headline.
    2. **Deep Reasoning**: Connect the dots. Explain correlations, outliers, or trends in plain but professional English. Focus on "Real-world Meaning".
    3. **The Strategic Move**: Provide a specific, actionable business recommendation.
    4. **Accuracy First**: Only use the numbers provided in the 'STATISTICAL EVIDENCE'.
    
    ALWAYS reply with VALID JSON containing strictly: "key_insight", "explanation", "takeaway".
    """

    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Generate the JSON insights based on the provided summary. Do not output anything else."}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            reply = chat_completion.choices[0].message.content.strip()
            
            match = re.search(r'\{.*\}', reply, re.DOTALL)
            if match:
                reply = match.group(0)

            data = json.loads(reply)
            
            required_keys = {"key_insight", "explanation", "takeaway"}
            if not required_keys.issubset(set(data.keys())):
                raise ValueError("Missing required keys in JSON insight response")
                
            return {
                "key_insight": data["key_insight"],
                "explanation": data["explanation"],
                "takeaway": data["takeaway"]
            }
            
        except Exception as e:
            last_error = str(e)
            print(f"Attempt {attempt+1}/{max_retries} failed to parse JSON insights from LLM: {last_error}")
            continue
            
    return {
        "key_insight": "Could not generate insights.",
        "explanation": f"The AI model failed. Error: {last_error}",
        "takeaway": "Please verify your text prompt or your API limit."
    }
