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
from app.services.whisper_service import get_openai_whisper_service

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/restaurants", tags=["restaurants"])


def build_user_preference_context(db: Client, user_id: str) -> str:
    """
    Build hidden system context based on user's swipe history.
    This context is prepended to the user's query to personalize recommendations.
    """
    try:
        liked_swipes = db.table("user_swipes").select(
            "restaurant_id, restaurants_discovered(name, cuisine, categories, price)"
        ).eq("user_id", user_id).in_("action", ["right"]).limit(20).execute()
        
        disliked_swipes = db.table("user_swipes").select(
            "restaurant_id, restaurants_discovered(name, cuisine, categories, price)"
        ).eq("user_id", user_id).in_("action", ["left"]).limit(10).execute()
        
        context_parts = []
        
        if liked_swipes.data and len(liked_swipes.data) > 0:
            liked_restaurants = [s.get("restaurants_discovered", {}) for s in liked_swipes.data if s.get("restaurants_discovered")]
            if liked_restaurants:
                names = list(set([r.get("name") for r in liked_restaurants if r.get("name")]))
                cuisines = list(set([r.get("cuisine") for r in liked_restaurants if r.get("cuisine")]))
                prices = list(set([r.get("price") for r in liked_restaurants if r.get("price")]))

                if names:
                    context_parts.append(f"User likes: {', '.join(list(set(names[:10])))}")
                if cuisines:
                    context_parts.append(f"User prefers: {', '.join(list(set(cuisines[:10])))} cuisine")
                if prices:
                    context_parts.append(f"Price range: {', '.join(prices)}")
        
        if disliked_swipes.data and len(disliked_swipes.data) > 0:
            disliked_restaurants = [s.get("restaurants_discovered", {}) for s in disliked_swipes.data if s.get("restaurants_discovered")]
            if disliked_restaurants:
                names = list(set([r.get("name") for r in disliked_restaurants if r.get("name")]))
                disliked_cuisines = list(set([r.get("cuisine") for r in disliked_restaurants if r.get("cuisine")]))
                if names:
                    context_parts.append(f"User dislikes: {', '.join(names[:3])}")
        
        if context_parts:
            return "[HIDDEN CONTEXT: Here are the user's preferences, please find the restaurants that are not in these names but match the user's preferences: " + ". ".join(context_parts) + "]. "
        
        return ""

    except Exception as e:
        logger.warning(f"Failed to build preference context: {str(e)}")
        return ""


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
        user_query = "\n\nUser query: " + request.text

        preference_context = build_user_preference_context(db, request.user_id)
        enhanced_query = preference_context + user_query
        
        logger.info(f"Enhanced query with preferences: {enhanced_query}")
        
        yelp_response = yelp_service.chat(
            query=enhanced_query,
            latitude=request.latitude,
            longitude=request.longitude,
            chat_id=request.chat_id
        )
        
        businesses = yelp_service.extract_businesses_from_response(yelp_response)
        
        if request.chat_id:
            result = db.table("conversations").select("id").eq("chat_id", request.chat_id).execute()
            if result.data and len(result.data) > 0:
                conversation_id = result.data[0]["id"]
            else:
                conversation_id = str(uuid.uuid4())
                conversation_data = {
                    "id": conversation_id,
                    "user_id": request.user_id,
                    "chat_id": yelp_response.get("chat_id"),
                    "created_at": datetime.utcnow().isoformat()
                }
                db.table("conversations").insert(conversation_data).execute()
        else:
            conversation_id = str(uuid.uuid4())
            conversation_data = {
                "id": conversation_id,
                "user_id": request.user_id,
                "chat_id": yelp_response.get("chat_id"),
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("conversations").insert(conversation_data).execute()
        
        prompt_id = str(uuid.uuid4())
        
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

        whisper_service = get_openai_whisper_service()
        transcribed_text, detected_language = await whisper_service.transcribe_audio(audio_bytes)
        
        logger.info(f"Transcribed text ({detected_language}): {transcribed_text}")
        
        if not transcribed_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not transcribe audio. Please try again."
            )
        
        yelp_service = get_yelp_ai_service()
        
        preference_context = build_user_preference_context(db, request.user_id)
        user_query = "\n\nUser query: " + transcribed_text
        enhanced_query = preference_context + transcribed_text
        
        logger.info(f"Enhanced query with preferences: {enhanced_query}")
        
        yelp_response = yelp_service.chat(
            query=enhanced_query,
            latitude=request.latitude,
            longitude=request.longitude,
            chat_id=request.chat_id
        )
        
        businesses = yelp_service.extract_businesses_from_response(yelp_response)
        
        if request.chat_id:
            result = db.table("conversations").select("id").eq("chat_id", request.chat_id).execute()
            if result.data and len(result.data) > 0:
                conversation_id = result.data[0]["id"]
            else:
                conversation_id = str(uuid.uuid4())
                conversation_data = {
                    "id": conversation_id,
                    "user_id": request.user_id,
                    "chat_id": yelp_response.get("chat_id"),
                    "created_at": datetime.utcnow().isoformat()
                }
                db.table("conversations").insert(conversation_data).execute()
        else:
            conversation_id = str(uuid.uuid4())
            conversation_data = {
                "id": conversation_id,
                "user_id": request.user_id,
                "chat_id": yelp_response.get("chat_id"),
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("conversations").insert(conversation_data).execute()
        
        prompt_id = str(uuid.uuid4())
        
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

@router.get("/discover")
async def restaurants_discovered(
    user_id: str = "user_123",
    limit: int = 20,
    db: Client = Depends(get_database)
):
    """
    View all the discovered restaurants for a user that hasn't been swiped yet.
    
    Returns restaurants ordered by most recently discovered.
    """
    try:
        logger.info(f"Fetching unswiped restaurants for user {user_id}")
        
        all_discovered = db.table("restaurants_discovered").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        if not all_discovered.data:
            return {
                "success": True,
                "restaurants": [],
                "total": 0,
                "message": "No restaurants discovered yet"
            }
        
        swiped_restaurant_ids_result = db.table("user_swipes").select("restaurant_id").eq("user_id", user_id).execute()

        swiped_ids = set()
        if swiped_restaurant_ids_result.data:
            swiped_ids = {swipe["restaurant_id"] for swipe in swiped_restaurant_ids_result.data}
        
        unswiped_restaurants = [
            restaurant for restaurant in all_discovered.data 
            if restaurant["id"] not in swiped_ids
        ]
        
        unswiped_restaurants = unswiped_restaurants[:limit]
        
        logger.info(f"Found {len(unswiped_restaurants)} unswiped restaurants out of {len(all_discovered.data)} total")
        
        return {
            "success": True,
            "restaurants": unswiped_restaurants,
            "total": len(unswiped_restaurants),
            "total_discovered": len(all_discovered.data),
            "total_swiped": len(swiped_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling discover: {str(e)}")
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
    """
    try:
        logger.info(f"Recording swipe {swipe.action} for restaurant {swipe.yelp_business_id} by user {swipe.user_id}")
        
        swipe_id = str(uuid.uuid4())
        
        restaurant_result = db.table("restaurants_discovered").select("*").eq("yelp_business_id", swipe.yelp_business_id).execute()
        
        if not restaurant_result.data or len(restaurant_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant {swipe.yelp_business_id} not found"
            )
        
        restaurant = restaurant_result.data[0]
        yelp_business_id = restaurant["yelp_business_id"]
        restaurant_id = restaurant["id"]

        swipe_data = {
            "id": swipe_id,
            "user_id": swipe.user_id,
            "restaurant_id": restaurant_id,
            "yelp_business_id": yelp_business_id,
            "action": swipe.action,
            "created_at": datetime.utcnow().isoformat()
        }
        db.table("user_swipes").insert(swipe_data).execute()
        
        if swipe.action in ["right"]:
            saved_id = str(uuid.uuid4())
            saved_data = {
                "id": saved_id,
                "user_id": swipe.user_id,
                "restaurant_id": restaurant_id,
                "yelp_business_id": yelp_business_id,
                "swipe_type": swipe.action,
                "status": "saved",
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("user_saved_restaurants").insert(saved_data).execute()
            logger.info(f"Restaurant {restaurant['name']} saved to My List")
        
        return {
            "success": True,
            "action": swipe.action,
            "restaurant_name": restaurant["name"],
            "message": f"Swipe {swipe.action} recorded for {restaurant['name']}",
            "saved": swipe.action in ["right", "up"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling swipe: {str(e)}")
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

