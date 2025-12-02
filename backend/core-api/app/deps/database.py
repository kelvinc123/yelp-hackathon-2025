from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import os

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None

async def get_database() -> AsyncIOMotorDatabase:
    global _client, _db
    
    if _db is None:
        mongodb_url = os.getenv("MONGODB_URL")
        database_name = os.getenv("MONGODB_DATABASE")
        
        if not mongodb_url:
            raise ValueError("MONGODB_URL environment variable is required")
        if not database_name:
            raise ValueError("MONGODB_DATABASE environment variable is required")

        _client = AsyncIOMotorClient(mongodb_url)
        _db = _client[database_name]
    
    return _db

async def close_database():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
