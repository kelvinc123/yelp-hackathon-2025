from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import restaurants, chat, talk

app = FastAPI(
    title=os.getenv("API_TITLE", "Core API"),
    version=os.getenv("API_VERSION", "1.0.0")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true",
    allow_methods=os.getenv("CORS_ALLOW_METHODS", "*").split(","),
    allow_headers=os.getenv("CORS_ALLOW_HEADERS", "*").split(","),
)

app.include_router(restaurants.router)
app.include_router(chat.router)
app.include_router(talk.router)

@app.get("/")
async def root():
    return {"message": "Core API Service"}

@app.get("/health")
async def health():
    return {"status": "healthy"}