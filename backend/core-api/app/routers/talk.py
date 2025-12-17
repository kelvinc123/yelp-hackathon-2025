from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import requests
import uuid
from app.services.yelp_ai import YelpAIService
from app.services.whisper_service import get_openai_whisper_service

router = APIRouter(prefix="/api/talk", tags=["talk"])


def pick_one_business(yelp_json: dict):
    """Extract the first business from Yelp AI response"""
    businesses = []
    entities = yelp_json.get("entities", [])
    for entity in entities:
        businesses.extend(entity.get("businesses", []))
    return businesses[0] if businesses else None


class TalkCard(BaseModel):
    yelp_business_id: str
    name: str
    rating: Optional[float] = None
    price: Optional[str] = None
    url: Optional[str] = None
    address: Optional[str] = None
    categories: Optional[list[str]] = None


class TalkResponse(BaseModel):
    sessionId: str
    transcript: str
    yelpChatId: str
    card: TalkCard


@router.post("")
async def talk(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    locale: str = Form("en_US")
):
    """Handle voice input with audio file, transcribe, and get restaurant recommendation"""
    try:
        # Read audio file
        audio_bytes = await file.read()
        
        # Transcribe audio using Whisper
        whisper_service = get_openai_whisper_service()
        transcript, _ = await whisper_service.transcribe_audio(audio_bytes)
        
        if not transcript.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not transcribe audio. Please try again."
            )
        
        # Initialize Yelp AI Service
        try:
            yelp_service = YelpAIService()
        except ValueError as e:
            raise HTTPException(
                status_code=500,
                detail=str(e)
            )
        
        # Call Yelp AI with transcribed text
        query = f"Recommend EXACTLY ONE restaurant.\nNo lists. No alternatives.\nKeep the 'why' to one sentence.\n\nUser: {transcript}"
        
        try:
            yelp_json = yelp_service.chat(
                query=query,
                latitude=latitude,
                longitude=longitude,
                locale=locale
            )
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=502,
                detail=f"Yelp AI API error: {str(e)}"
            )
        
        # Extract business
        biz = pick_one_business(yelp_json)
        if not biz or not biz.get("id"):
            raise HTTPException(
                status_code=404,
                detail="No business found in Yelp response"
            )
        
        business_id = biz["id"]
        yelp_chat_id = yelp_json.get("chat_id", "")
        
        # Fetch business details
        try:
            details_response = requests.get(
                f"https://api.yelp.com/v3/businesses/{business_id}",
                headers={"Authorization": f"Bearer {yelp_service.api_key}"},
                timeout=30
            )
            details_response.raise_for_status()
            details = details_response.json()
        except requests.exceptions.RequestException:
            details = {}
        
        # Build card response
        categories = []
        if details.get("categories"):
            categories = [cat.get("title", "") for cat in details.get("categories", [])]
        elif biz.get("categories"):
            categories = [cat.get("title", "") for cat in biz.get("categories", [])]
        
        card = TalkCard(
            yelp_business_id=business_id,
            name=biz.get("name") or details.get("name", "Restaurant"),
            rating=float(biz.get("rating") or details.get("rating") or 0),
            price=biz.get("price") or details.get("price"),
            url=details.get("url"),
            address=", ".join(details.get("location", {}).get("display_address", [])) if details.get("location") else None,
            categories=categories if categories else None
        )
        
        session_id = str(uuid.uuid4())
        
        return TalkResponse(
            sessionId=session_id,
            transcript=transcript,
            yelpChatId=yelp_chat_id,
            card=card
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

