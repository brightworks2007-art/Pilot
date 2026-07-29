"""
Single shared Supabase client. Import `get_supabase()` wherever the app
needs to talk to Supabase (Postgres rows or Storage) instead of creating
new clients ad hoc.
"""
from functools import lru_cache

from supabase import create_client, Client

from app.core.config import settings


@lru_cache
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)
