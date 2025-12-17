from supabase import create_client, Client
from typing import Optional
import os

_supabase: Optional[Client] = None

def get_supabase() -> Client:
    global _supabase
    
    if _supabase is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not supabase_key:
            raise ValueError("SUPABASE_KEY environment variable is required")

        _supabase = create_client(supabase_url, supabase_key)
    
    return _supabase

def get_database() -> Client:
    return get_supabase()
