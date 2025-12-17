from fastapi import APIRouter, HTTPException, Depends, status
from supabase import Client
from typing import List
from datetime import datetime
import base64
import uuid
import logging

from app.deps.database import get_database
from app.schemas import (
    TextPromptRequest,
    VoiceInputRequest,
    SwipeAction,
    ReservationRequest,
    Restaurant
)
from app.services.yelp_ai import get_yelp_ai_service
from app.services.whisper_service import get_whisper_service

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("/prompt/text")
async def process_text_prompt(
    request: TextPromptRequest,
    db: Client = Depends(get_database)
):
    """
    Process user text input and return restaurant recommendations.
    
    This endpoint accepts text prompts like:
    - "I want Italian food near me"
    - "Something spicy under $30"
    - "Date night restaurant"
    """
    try:
        logger.info(f"Processing text prompt for user {request.user_id}: {request.text}")
        
        yelp_service = get_yelp_ai_service()
        
        yelp_response = yelp_service.chat(
            query=request.text,
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        businesses = yelp_service.extract_businesses_from_response(yelp_response)
        
        conversation_id = str(uuid.uuid4())
        prompt_id = str(uuid.uuid4())
        
        conversation_data = {
            "id": conversation_id,
            "user_id": request.user_id,
            "chat_id": yelp_response.get("chat_id"),
            "created_at": datetime.utcnow().isoformat()
        }
        db.table("conversations").insert(conversation_data).execute()
        
        prompt_data = {
            "id": prompt_id,
            "conversation_id": conversation_id,
            "user_id": request.user_id,
            "prompt_text": request.text,
            "prompt_type": "text",
            "latitude": request.latitude,
            "longitude": request.longitude,
            "yelp_response": yelp_response,
            "created_at": datetime.utcnow().isoformat()
        }
        db.table("prompts").insert(prompt_data).execute()
        
        for business in businesses:
            restaurant_data = {
                "id": str(uuid.uuid4()),
                "prompt_id": prompt_id,
                "user_id": request.user_id,
                **business,
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("restaurants_discovered").insert(restaurant_data).execute()
        
        logger.info(f"Found {len(businesses)} restaurants for user {request.user_id}")
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "chat_id": yelp_response.get("chat_id"),
            "ai_response": yelp_response["response"]["text"],
            "restaurants": businesses,
            "total_results": len(businesses)
        }
        
    except Exception as e:
        logger.error(f"Error processing text prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/prompt/voice")
async def process_voice_input(
    request: VoiceInputRequest,
    db: Client = Depends(get_database)
):
    """
    Process user voice input (base64 audio) and return restaurant recommendations.
    
    Steps:
    1. Decode base64 audio
    2. Convert speech to text (STT)
    3. Process text prompt
    4. Return recommendations
    """
    try:
        logger.info(f"Processing voice input for user {request.user_id}")
        
        audio_bytes = base64.b64decode(request.audio_data)
        
        whisper_service = get_whisper_service()
        transcribed_text, detected_language = await whisper_service.transcribe_audio(audio_bytes)
        
        logger.info(f"Transcribed text ({detected_language}): {transcribed_text}")
        
        if not transcribed_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not transcribe audio. Please try again."
            )
        
        yelp_service = get_yelp_ai_service()
        
        yelp_response = yelp_service.chat(
            query=transcribed_text,
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        businesses = yelp_service.extract_businesses_from_response(yelp_response)
        
        conversation_id = str(uuid.uuid4())
        prompt_id = str(uuid.uuid4())
        
        conversation_data = {
            "id": conversation_id,
            "user_id": request.user_id,
            "chat_id": yelp_response.get("chat_id"),
            "created_at": datetime.utcnow().isoformat()
        }
        db.table("conversations").insert(conversation_data).execute()
        
        prompt_data = {
            "id": prompt_id,
            "conversation_id": conversation_id,
            "user_id": request.user_id,
            "prompt_text": transcribed_text,
            "prompt_type": "voice",
            "latitude": request.latitude,
            "longitude": request.longitude,
            "yelp_response": yelp_response,
            "created_at": datetime.utcnow().isoformat()
        }
        db.table("prompts").insert(prompt_data).execute()
        
        for business in businesses:
            restaurant_data = {
                "id": str(uuid.uuid4()),
                "prompt_id": prompt_id,
                "user_id": request.user_id,
                **business,
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("restaurants_discovered").insert(restaurant_data).execute()
        
        logger.info(f"Found {len(businesses)} restaurants for user {request.user_id}")
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "chat_id": yelp_response.get("chat_id"),
            "transcribed_text": transcribed_text,
            "detected_language": detected_language,
            "ai_response": yelp_response["response"]["text"],
            "restaurants": businesses,
            "total_results": len(businesses)
        }
        
    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/swipe")
async def handle_swipe(
    swipe: SwipeAction,
    db: Client = Depends(get_database)
):
    """
    Handle swipe actions on restaurant cards.
    
    Actions:
    - right: Add to "My List"
    - left: Skip/Next
    - up: Super Yes (priority bookmark)
    - down: Never show this type again (AI learns)
    """
    try:
        if swipe.action == "right":
            pass
        elif swipe.action == "left":
            pass
        
        return {
            "success": True,
            "message": f"Swipe {swipe.action} recorded for restaurant {swipe.restaurant_id}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/reservation")
async def make_reservation(
    reservation: ReservationRequest,
    db: Client = Depends(get_database)
):
    """
    Create a restaurant reservation.
    
    Note: This is optional functionality. Most users prefer to save restaurants
    and decide timing later.
    """
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/feed")
async def get_restaurant_feed(
    user_id: str = "user_123",
    latitude: float = None,
    longitude: float = None,
    limit: int = 10,
    db: Client = Depends(get_database)
):
    """
    Get personalized restaurant feed for swiping.
    
    AI pulls restaurants based on:
    - Time of day
    - Location
    - Past preferences (stored locally or in DB)
    - User's swipe history
    """
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/my-list")
async def get_my_list(
    user_id: str = "user_123",
    db: Client = Depends(get_database)
):
    """
    Get user's saved restaurants (all right-swipes).
    
    Groups:
    - Going soon (with reservations)
    - Saved for later
    - Been there (visited)
    """
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/feeling-lucky")
async def feeling_lucky(
    user_id: str = "user_123",
    latitude: float = None,
    longitude: float = None,
    db: Client = Depends(get_database)
):
    """
    AI picks ONE restaurant instantly.
    
    For users who want zero friction and decision-making.
    """
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

