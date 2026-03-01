# AI Ask Your Dataset

A modern, complete AI-powered data analytics web application built with React, FastAPI, Pandas, and Llama 3 on Groq.

## Features

- **Multi Dataset Upload**: Upload multiple identical-schema CSV files. The app validates and merges them, adding a `dataset_source` column.
- **Natural Language Analytics**: Ask questions in plain English (e.g., "Which region generated the highest revenue?").
- **Automatic Visualizations**: Dynamic generation of Bar, Line, and Pie charts using Recharts based on LLM outputs and Pandas aggregations.
- **AI Insights**: Get text-based explanations of the generated analytical data.
- **Dashboard UI**: Clean, responsive layout using TailwindCSS.
- **AI-Generated Report**: Download analytical reports in PDF format containing questions, insights, and charts.

## Project Structure

- `/backend`: Python FastAPI logic, dataset processing, Llama 3 prompt mechanics.
- `/frontend`: React + Vite frontend code.
- `/uploads`: Temporary directory to store CSV datasets locally before merging.
- `/reports`: Temporary directory storing generated PDF reports.

## Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Groq API Key](https://console.groq.com/keys) (Free)

## Setup and Running

### 1. Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment (Optional but recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Groq API Key:
   ```bash
   # On Windows (Command Prompt)
   set GROQ_API_KEY=your_api_key_here
   # On Windows (PowerShell)
   $env:GROQ_API_KEY="your_api_key_here"
   # On Mac/Linux
   export GROQ_API_KEY="your_api_key_here"
   ```
5. Start the FastAPI server (Runs on port 8000 default):
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL shown in the console (Usually `http://localhost:5173`).

## Example Usage

### Example Datasets
You can create examples called `sales_2021.csv`, `sales_2022.csv`, and `sales_2023.csv` with columns:
`Region`, `Country`, `Item Type`, `Units Sold`, `Unit Price`, `Total Revenue`, `Total Profit`, `Order Date`

### Example Questions
- "Which region has the highest revenue?"
- "Compare total profit by item type."
- "Show units sold across all regions."

## Stack & Libraries

- **Frontend**: React, Vite, TailwindCSS, Recharts, Lucide React.
- **Backend**: FastAPI, Pandas, SentenceTransformers `all-MiniLM-L6-v2` (Local CPU embeddings), FAISS CPU, Groq API (Llama 3 8B).
- **Report Generation**: ReportLab.
