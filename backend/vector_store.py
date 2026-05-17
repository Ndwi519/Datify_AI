import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict

model = SentenceTransformer("all-MiniLM-L6-v2", device='cpu')

_index = None
_column_names = []

def index_columns(columns: List[str]):
    global _index, _column_names
    _column_names = columns
    
    if not columns:
        return
        
    embeddings = model.encode(columns, convert_to_numpy=True)
    embeddings = embeddings.astype('float32')
    
    dimension = embeddings.shape[1]
    _index = faiss.IndexFlatL2(dimension)
    _index.add(embeddings)

def search_columns(query: str, top_k: int = 3) -> Dict[str, float]:
    global _index, _column_names
    
    if _index is None or not _column_names:
        return {}
        
    query_embedding = model.encode([query], convert_to_numpy=True).astype('float32')
    distances, indices = _index.search(query_embedding, min(top_k, len(_column_names)))
    
    results = {}
    for i, idx in enumerate(indices[0]):
        if idx != -1 and idx < len(_column_names):
            results[_column_names[idx]] = float(distances[0][i])
            
    return results
