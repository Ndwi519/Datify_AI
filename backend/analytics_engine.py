import pandas as pd
from typing import Dict, Any, List

def execute_pandas_operations(df: pd.DataFrame, instructions: dict) -> List[Dict[str, Any]]:
    """
    Takes a dataset and a structured JSON from the LLM, executes Pandas group_by + aggregations,
    and formats the data nicely for Recharts on the frontend.
    """
    
    x_col = instructions.get("x_column")
    y_col = instructions.get("y_column")
    agg = instructions.get("aggregation", "sum").lower()
    
    if x_col not in df.columns or y_col not in df.columns:
        return []
        
    try:
        df_copy = df.copy()
        df_copy[y_col] = pd.to_numeric(df_copy[y_col], errors='coerce')
        df_copy = df_copy.dropna(subset=[y_col])
        
        is_categorical = df_copy[x_col].nunique() < 100
        
        if agg == "none" and not is_categorical:
            result_df = df_copy[[x_col, y_col]].head(50)
        else:
             if agg == "none":
                 agg = "mean" # Enforce average instead of raw rows for categorical data
             agg_funcs = {
                 "sum": pd.NamedAgg(column=y_col, aggfunc="sum"),
                 "mean": pd.NamedAgg(column=y_col, aggfunc="mean"),
                 "count": pd.NamedAgg(column=y_col, aggfunc="count"),
                 "min": pd.NamedAgg(column=y_col, aggfunc="min"),
                 "max": pd.NamedAgg(column=y_col, aggfunc="max"),
             }
             
             chosen_agg = agg_funcs.get(agg, pd.NamedAgg(column=y_col, aggfunc="mean"))
             
             result_df = df_copy.groupby(x_col).agg(
                 y_value=chosen_agg
             ).reset_index()
             
             chart_type = instructions.get("chart_type", "bar").lower()
             if chart_type in ["line", "area"]:
                 result_df = result_df.sort_values(by=x_col).head(30)
             else:
                 result_df = result_df.sort_values(by="y_value", ascending=False).head(15)
             
             result_df = result_df.rename(columns={"y_value": y_col})
             
        sanitized_df = result_df.replace([float('inf'), float('-inf')], None).astype(object).where(pd.notnull(result_df), None)
        return sanitized_df.to_dict(orient='records')
        
    except Exception as e:
        print(f"Pandas analytics failed: {str(e)}")
        return []

def compute_global_context(df: pd.DataFrame) -> str:
    """
    Provides a high-level summary of the entire dataset (columns, numeric stats, row count)
    to the LLM so it always has basic context.
    """
    try:
        num_rows = len(df)
        num_cols = len(df.columns)
        num_df = df.select_dtypes(include=['number'])
        
        context = f"--- DATASET ARCHITECTURE ---\n"
        context += f"Node Density: {num_rows} records | Dimensions: {num_cols} columns\n"
        context += f"Schema: {', '.join(df.columns.tolist())}\n\n"
        
        missing_counts = df.isnull().sum()
        missing_info = missing_counts[missing_counts > 0]
        context += "--- DATA QUALITY: MISSING VALUES ---\n"
        if not missing_info.empty:
            for col, count in missing_info.items():
                context += f"- {col}: {count} missing values ({(count/num_rows)*100:.1f}%)\n"
        else:
            context += "No missing values detected across any features.\n"
        context += "\n"
        
        duplicate_count = df.duplicated().sum()
        context += "--- DATA QUALITY: DUPLICATES ---\n"
        if duplicate_count > 0:
            context += f"Duplicate Rows Found: {duplicate_count} ({(duplicate_count/num_rows)*100:.1f}% of dataset)\n"
        else:
            context += "No duplicate rows detected.\n"
        context += "\n"
        
        if not num_df.empty:
            context += "--- NUMERIC OVERVIEW ---\n"
            context += str(num_df.describe().loc[['mean', 'min', 'max', '50%']]) + "\n\n"
            
            Q1 = num_df.quantile(0.25)
            Q3 = num_df.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_counts = ((num_df < lower_bound) | (num_df > upper_bound)).sum()
            outliers = outlier_counts[outlier_counts > 0]
            
            context += "--- DATA QUALITY: OUTLIERS (IQR METHOD) ---\n"
            if not outliers.empty:
                for col, count in outliers.items():
                    context += f"- {col}: {count} possible outliers ({(count/num_rows)*100:.1f}%)\n"
            else:
                context += "No significant outliers detected in numeric features.\n"
            context += "\n"
        return context
    except Exception as e:
        return f"Context Generation Error: {str(e)}"

def compute_statistical_summary(df: pd.DataFrame, instructions: dict) -> str:
    """
    Computes a statistical summary (mean, min, max, std, count) for the dataset based
    on the chosen groupings, to be fed into the LLM for insight generation.
    """
    x_col = instructions.get("x_column")
    y_col = instructions.get("y_column")
    
    global_ctx = compute_global_context(df)
    
    if x_col not in df.columns or y_col not in df.columns:
        return global_ctx + "\nNote: Specific grouping failed. Providing Global Context as fallback.\n"
        
    try:
        df_copy = df.copy()
        df_copy[y_col] = pd.to_numeric(df_copy[y_col], errors='coerce')
        df_copy = df_copy.dropna(subset=[y_col])
        
        summary_str = f"--- GLOBAL STATISTICAL CONTEXT ---\n"
        summary_str += f"Metric Column: {y_col}\n"
        summary_str += str(df_copy[y_col].describe()) + "\n\n"
        
        summary_str += f"--- GROUPED DATA CONTEXT ---\n"
        summary_str += f"Grouping by: {x_col}\n"
        
        if df_copy[x_col].nunique() <= 100:
            grouped = df_copy.groupby(x_col)[y_col].agg(
                ["mean", "min", "max", "std", "count"]
            ).reset_index()
            
            if not grouped.empty:
                grouped_sorted = grouped.sort_values(by="mean", ascending=False)
                highest_group = grouped_sorted.iloc[0][x_col]
                highest_val = grouped_sorted.iloc[0]["mean"]
                lowest_group = grouped_sorted.iloc[-1][x_col]
                lowest_val = grouped_sorted.iloc[-1]["mean"]
                
                diff = highest_val - lowest_val
                
                summary_str += f"Peak: {highest_group} ({highest_val:.2f})\n"
                summary_str += f"Floor: {lowest_group} ({lowest_val:.2f})\n"
                summary_str += f"Range (Delta): {diff:.2f}\n\n"
                
                summary_str += "--- DETAILED GROUP DATA (Top 30 by Mean) ---\n"
                summary_str += grouped_sorted.head(30).to_string(index=False)
                return global_ctx + "\n" + summary_str
        
        summary_str += "No specific grouping found or too many unique items. Refer to Global Context above."
        return global_ctx + "\n" + summary_str
        
    except Exception as e:
        return f"Error computing summary: {str(e)}"
