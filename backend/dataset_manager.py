import os
import pandas as pd
import csv
from typing import List, Dict, Any, Optional, Tuple

_merged_df_cache = None

def get_merged_dataframe(upload_dir: str) -> Optional[pd.DataFrame]:
    global _merged_df_cache
    if _merged_df_cache is not None:
        return _merged_df_cache
    
    process_uploaded_files(upload_dir)
    return _merged_df_cache

def list_datasets(upload_dir: str) -> List[str]:
    if not os.path.exists(upload_dir):
        return []
    return [f for f in os.listdir(upload_dir) if f.endswith('.csv')]

def process_uploaded_files(upload_dir: str, clear: bool = False) -> Tuple[bool, str]:
    global _merged_df_cache
    
    if clear:
        _merged_df_cache = None
        return True, "Cleared"

    csv_files = list_datasets(upload_dir)
    
    if not csv_files:
        _merged_df_cache = None
        return False, "No datasets found."

    dataframes = []
    base_columns = None

    for file in csv_files:
        file_path = os.path.join(upload_dir, file)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                sample = f.read(1024)
                dialect = csv.Sniffer().sniff(sample)
                df = pd.read_csv(file_path, sep=dialect.delimiter)
            
            valid_cols = [c for c in df.columns if "Unnamed" not in str(c)]
            df = df[valid_cols]
            print(f"Loaded {file} with {len(df)} rows and {len(df.columns)} columns (Sep: {dialect.delimiter})")
            
            df['dataset_source'] = os.path.splitext(file)[0]
            dataframes.append(df)
            
        except Exception as e:
            try:
                df = pd.read_csv(file_path)
                valid_cols = [c for c in df.columns if "Unnamed" not in str(c)]
                df = df[valid_cols]
                df['dataset_source'] = os.path.splitext(file)[0]
                dataframes.append(df)
            except:
                return False, f"Error reading {file}: {str(e)}"

    if dataframes:
        _merged_df_cache = pd.concat(dataframes, ignore_index=True)
        return True, "Datasets merged successfully."
    
    return False, "Failed to process datasets."

def get_merged_dataset_preview(upload_dir: str, sample_size: int = 10) -> Optional[Dict[str, Any]]:
    df = get_merged_dataframe(upload_dir)
    if df is None or df.empty:
        return None
    
    n_sample = min(sample_size, len(df))
    df_preview = df.sample(n=n_sample).replace([float('inf'), float('-inf')], None).astype(object).where(pd.notnull(df), None)
    return {
        "columns": df.columns.tolist(),
        "data": df_preview.to_dict(orient='records')
    }

def get_column_metadata(df: pd.DataFrame) -> List[Dict[str, Any]]:
    metadata = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        nunique = int(df[col].nunique())
        
        sample_values = df[col].dropna().unique()[:5].tolist()
        
        info = {
            "name": col,
            "type": "numeric" if "int" in dtype or "float" in dtype else "categorical",
            "unique_count": nunique,
            "sample_values": sample_values
        }
        
        if info["type"] == "numeric":
            info["min"] = float(df[col].min()) if not pd.isna(df[col].min()) else None
            info["max"] = float(df[col].max()) if not pd.isna(df[col].max()) else None
            
        metadata.append(info)
    return metadata
