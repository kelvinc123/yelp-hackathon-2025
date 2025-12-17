from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import requests
import math
import uuid
from app.services.yelp_ai import YelpAIService
from app.deps.database import get_database

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: Optional[str] = None
    chatId: Optional[str] = None
    sessionId: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    locale: str = "en_US"
    action: Optional[str] = None  # "yes", "next", or None
    businessId: Optional[str] = None


class Restaurant(BaseModel):
    id: str
    name: str
    cuisine: str
    rating: float
    distance: str
    time: str
    summary: str
    imageUrl: Optional[str] = None
    vibes: list[str]
    address: Optional[str] = None
    phone: Optional[str] = None
    url: Optional[str] = None


class ChatResponse(BaseModel):
    chatId: str
    message: str
    restaurant: Optional[Restaurant] = None
    sessionId: str


class ChatSummary(BaseModel):
    id: str
    chat_id: Optional[str]
    created_at: str
    last_message: Optional[str] = None


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in miles"""
    R = 3958.8
    to_rad = lambda d: (d * math.pi) / 180
    d_lat = to_rad(lat2 - lat1)
    d_lon = to_rad(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lon / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def pick_one_business(yelp_json: dict):
    """Extract the first business from Yelp AI response"""
    businesses = []
    entities = yelp_json.get("entities", [])
    for entity in entities:
        businesses.extend(entity.get("businesses", []))
    return businesses[0] if businesses else None


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db=Depends(get_database)):
    """Handle chat requests with Yelp AI"""
    if not request.message and not request.action:
        raise HTTPException(
            status_code=400,
            detail="Missing message or action"
        )
    
    # Initialize Yelp AI Service
    try:
        yelp_service = YelpAIService()
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
    # Build query for Yelp AI
    if request.action == "yes":
        query = (
            "User confirmed they want this restaurant. Here are the details. "
            "Ask if they want to make a reservation or share this with friends."
        )
    elif request.action == "next":
        query = "User wants to see another option. Recommend a different restaurant."
    else:
        query = f"Recommend EXACTLY ONE restaurant.\nNo lists. No alternatives.\nKeep the 'why' to one sentence.\n\nUser: {request.message}"
    
    # Call Yelp AI Chat API using the service
    try:
        yelp_json = yelp_service.chat(
            query=query,
            latitude=request.latitude,
            longitude=request.longitude,
            chat_id=request.chatId,
            locale=request.locale
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Yelp AI API error: {str(e)}"
        )
    response_text = yelp_json.get("response", {}).get("text", "")
    new_chat_id = yelp_json.get("chat_id") or request.chatId

    # --- Persist conversation + prompt in Supabase ---
    # For now we use a fixed user_id; later this can come from auth/session
    user_id = "user_123"

    # Upsert conversation by chat_id
    conversation_id = None
    if new_chat_id:
        conv_existing = (
            db.table("conversations")
            .select("id")
            .eq("user_id", user_id)
            .eq("chat_id", new_chat_id)
            .limit(1)
            .execute()
        )
        if conv_existing.data:
            conversation_id = conv_existing.data[0]["id"]
        else:
            conv_insert = (
                db.table("conversations")
                .insert({"user_id": user_id, "chat_id": new_chat_id})
                .execute()
            )
            if conv_insert.data:
                conversation_id = conv_insert.data[0]["id"]

    # Insert prompt row with Yelp JSON response
    try:
        db.table("prompts").insert(
            {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "prompt_text": request.message or "",
                "prompt_type": "text",
                "latitude": request.latitude,
                "longitude": request.longitude,
                "yelp_response": yelp_json,
            }
        ).execute()
    except Exception:
        # Don't fail the chat if logging to DB fails
        pass
    
    # Extract business and fetch details
    restaurant = None
    needs_details = False
    business_id_to_fetch = request.businessId
    biz = None
    
    if not business_id_to_fetch:
        # New recommendation - extract business from Yelp AI response
        biz = pick_one_business(yelp_json)
        if biz and biz.get("id"):
            business_id_to_fetch = biz["id"]
            needs_details = True
    else:
        # We have a businessId (from "yes" action), try to get biz from Yelp AI response
        biz = pick_one_business(yelp_json)
        needs_details = True
    
    if needs_details and business_id_to_fetch:
        # Fetch business details for image, address, phone, hours
        try:
            details_response = requests.get(
                f"https://api.yelp.com/v3/businesses/{business_id_to_fetch}",
                headers={"Authorization": f"Bearer {yelp_service.api_key}"},
                timeout=30
            )
            details_response.raise_for_status()
            details = details_response.json()
        except requests.exceptions.RequestException:
            details = None
        
        if details:
            # Use biz from Yelp AI if available, otherwise use details
            if not biz:
                biz = details
            
            cuisine = (
                biz.get("categories", [{}])[0].get("title")
                or details.get("categories", [{}])[0].get("title")
                or "Restaurant"
            )
            
            rating = float(biz.get("rating") or details.get("rating") or 0)
            
            # Calculate distance
            distance = "Nearby"
            if (
                request.latitude is not None
                and request.longitude is not None
                and (biz.get("coordinates") or details.get("coordinates"))
            ):
                coords = biz.get("coordinates") or details.get("coordinates")
                if coords.get("latitude") and coords.get("longitude"):
                    lat = coords["latitude"]
                    lon = coords["longitude"]
                    miles = haversine_miles(request.latitude, request.longitude, lat, lon)
                    distance = f"{miles:.1f} mi" if miles < 10 else f"{miles:.0f} mi"
            
            # Time status
            hours = details.get("hours", [])
            is_open_now = hours[0].get("is_open_now") if hours else None
            if isinstance(is_open_now, bool):
                time = "Open now" if is_open_now else "Closed now"
            else:
                time = "Check hours"
            
            # Get ai_insight from business summaries
            summaries = biz.get("summaries", {})
            summary = summaries.get("short") if summaries else None
            if not summary:
                summary = "Great match for your vibe."
            
            # Get image URL - prioritize from business entity, then details API
            image_url = None
            
            # First try: Get from business entity contextual_info photos (Yelp AI response)
            if biz:
                contextual_info = biz.get("contextual_info", {})
                photos = contextual_info.get("photos", [])
                if photos and len(photos) > 0:
                    # Photos are objects with original_url
                    if isinstance(photos[0], dict):
                        image_url = photos[0].get("original_url")
                    elif isinstance(photos[0], str):
                        image_url = photos[0]
            
            # Second try: Get from details API image_url
            if not image_url and details:
                image_url = details.get("image_url")
            
            # Third try: Get from details API photos array
            if not image_url and details:
                details_photos = details.get("photos", [])
                if details_photos and len(details_photos) > 0:
                    # Photos can be URLs or objects
                    if isinstance(details_photos[0], str):
                        image_url = details_photos[0]
                    elif isinstance(details_photos[0], dict):
                        image_url = details_photos[0].get("url") or details_photos[0].get("original_url")
            
            price = biz.get("price") or details.get("price") or ""
            vibes = [cuisine, price, "Top rated" if rating >= 4.5 else ""]
            vibes = [v for v in vibes if v][:3]
            
            restaurant = Restaurant(
                id=business_id_to_fetch,
                name=biz.get("name") or details.get("name") or "Restaurant",
                cuisine=cuisine,
                rating=rating,
                distance=distance,
                time=time,
                summary=summary,
                imageUrl=image_url,
                vibes=vibes,
                address=(
                    ", ".join(details.get("location", {}).get("display_address", []))
                    if request.action == "yes" else None
                ),
                phone=(
                    details.get("display_phone") or details.get("phone")
                    if request.action == "yes" else None
                ),
                url=details.get("url"),
            )
    
    session_id = request.sessionId or str(uuid.uuid4())
    
    return ChatResponse(
        chatId=new_chat_id or "",
        message=response_text,
        restaurant=restaurant,
        sessionId=session_id
    )


@router.get("/history", response_model=List[ChatSummary])
async def get_chat_history(db=Depends(get_database)):
    """Return recent chat conversations for the current user."""
    user_id = "user_123"

    conv_resp = (
        db.table("conversations")
        .select("id, chat_id, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    conversations = conv_resp.data or []

    # Optionally fetch a short summary from the latest prompt per conversation
    history: List[ChatSummary] = []
    for conv in conversations:
        last_prompt = (
            db.table("prompts")
            .select("prompt_text")
            .eq("conversation_id", conv["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        last_text = (
            last_prompt.data[0]["prompt_text"]
            if last_prompt.data
            else None
        )

        history.append(
            ChatSummary(
                id=conv["id"],
                chat_id=conv.get("chat_id"),
                created_at=conv["created_at"],
                last_message=last_text,
            )
        )

    return history



