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
    restaurants: Optional[List[Restaurant]] = None  # For multiple options
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


def pick_businesses(yelp_json: dict, limit: int = 3):
    """Extract businesses from Yelp AI response (up to limit)"""
    businesses = []
    entities = yelp_json.get("entities", [])
    for entity in entities:
        businesses.extend(entity.get("businesses", []))
    return businesses[:limit] if businesses else []


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
            "The user has selected this restaurant and wants to proceed. "
            "Respond warmly and ask what they'd like to do next: make a reservation, get directions, or something else. "
            "Keep your response brief and friendly - just one sentence asking what they'd like to do."
        )
    elif request.action == "next":
        query = "User wants to see another option. Recommend a different restaurant."
    else:
        # Request 3 restaurants for swipeable options
        query = f"Recommend EXACTLY 3 restaurants that match the user's request.\nNo lists. No alternatives.\nKeep the 'why' to one sentence for each.\n\nUser: {request.message}"
    
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
    
    # Extract businesses and fetch details
    restaurant = None
    restaurants = None
    
    # Helper function to build Restaurant object from business data
    def build_restaurant(biz_data: dict, details_data: dict = None, include_contact: bool = False) -> Restaurant:
        """Build a Restaurant object from business and details data"""
        cuisine = (
            biz_data.get("categories", [{}])[0].get("title")
            or (details_data.get("categories", [{}])[0].get("title") if details_data else None)
            or "Restaurant"
        )
        
        rating = float(biz_data.get("rating") or (details_data.get("rating") if details_data else 0) or 0)
        
        # Calculate distance
        distance = "Nearby"
        if (
            request.latitude is not None
            and request.longitude is not None
            and (biz_data.get("coordinates") or (details_data.get("coordinates") if details_data else None))
        ):
            coords = biz_data.get("coordinates") or (details_data.get("coordinates") if details_data else {})
            if coords.get("latitude") and coords.get("longitude"):
                lat = coords["latitude"]
                lon = coords["longitude"]
                miles = haversine_miles(request.latitude, request.longitude, lat, lon)
                distance = f"{miles:.1f} mi" if miles < 10 else f"{miles:.0f} mi"
        
        # Time status
        time = "Check hours"
        if details_data:
            hours = details_data.get("hours", [])
            is_open_now = hours[0].get("is_open_now") if hours else None
            if isinstance(is_open_now, bool):
                time = "Open now" if is_open_now else "Closed now"
        
        # Get ai_insight from business summaries
        summaries = biz_data.get("summaries", {})
        summary = summaries.get("short") if summaries else None
        if not summary:
            summary = "Great match for your vibe."
        
        # Get image URL - prioritize from business entity, then details API
        image_url = None
        
        # First try: Get from business entity contextual_info photos (Yelp AI response)
        contextual_info = biz_data.get("contextual_info", {})
        photos = contextual_info.get("photos", [])
        if photos and len(photos) > 0:
            if isinstance(photos[0], dict):
                image_url = photos[0].get("original_url")
            elif isinstance(photos[0], str):
                image_url = photos[0]
        
        # Second try: Get from details API image_url
        if not image_url and details_data:
            image_url = details_data.get("image_url")
        
        # Third try: Get from details API photos array
        if not image_url and details_data:
            details_photos = details_data.get("photos", [])
            if details_photos and len(details_photos) > 0:
                if isinstance(details_photos[0], str):
                    image_url = details_photos[0]
                elif isinstance(details_photos[0], dict):
                    image_url = details_photos[0].get("url") or details_photos[0].get("original_url")
        
        price = biz_data.get("price") or (details_data.get("price") if details_data else "") or ""
        vibes = [cuisine, price, "Top rated" if rating >= 4.5 else ""]
        vibes = [v for v in vibes if v][:3]
        
        business_id = biz_data.get("id") or (details_data.get("id") if details_data else "")
        
        return Restaurant(
            id=business_id,
            name=biz_data.get("name") or (details_data.get("name") if details_data else "Restaurant") or "Restaurant",
            cuisine=cuisine,
            rating=rating,
            distance=distance,
            time=time,
            summary=summary,
            imageUrl=image_url,
            vibes=vibes,
            address=(
                ", ".join(details_data.get("location", {}).get("display_address", []))
                if include_contact and details_data else None
            ),
            phone=(
                details_data.get("display_phone") or details_data.get("phone")
                if include_contact and details_data else None
            ),
            url=details_data.get("url") if details_data else None,
        )
    
    # Handle different action types
    if request.action == "yes" and request.businessId:
        # User confirmed a restaurant - fetch full details
        try:
            details_response = requests.get(
                f"https://api.yelp.com/v3/businesses/{request.businessId}",
                headers={"Authorization": f"Bearer {yelp_service.api_key}"},
                timeout=30
            )
            details_response.raise_for_status()
            details = details_response.json()
        except requests.exceptions.RequestException:
            details = None
        
        biz = pick_businesses(yelp_json, limit=1)
        biz_data = biz[0] if biz else {}
        restaurant = build_restaurant(biz_data, details, include_contact=True)
    
    elif request.action == "next":
        # User wants next option - return single restaurant
        biz_list = pick_businesses(yelp_json, limit=1)
        if biz_list:
            biz_data = biz_list[0]
            business_id = biz_data.get("id")
            if business_id:
                try:
                    details_response = requests.get(
                        f"https://api.yelp.com/v3/businesses/{business_id}",
                        headers={"Authorization": f"Bearer {yelp_service.api_key}"},
                        timeout=30
                    )
                    details_response.raise_for_status()
                    details = details_response.json()
                except requests.exceptions.RequestException:
                    details = None
                
                restaurant = build_restaurant(biz_data, details, include_contact=False)
    
    else:
        # New query - return 3 restaurants for swipeable options
        biz_list = pick_businesses(yelp_json, limit=3)
        if biz_list:
            restaurants_list = []
            for biz_data in biz_list:
                business_id = biz_data.get("id")
                if business_id:
                    try:
                        details_response = requests.get(
                            f"https://api.yelp.com/v3/businesses/{business_id}",
                            headers={"Authorization": f"Bearer {yelp_service.api_key}"},
                            timeout=30
                        )
                        details_response.raise_for_status()
                        details = details_response.json()
                    except requests.exceptions.RequestException:
                        details = None
                    
                    rest = build_restaurant(biz_data, details, include_contact=False)
                    restaurants_list.append(rest)
            
            if restaurants_list:
                restaurants = restaurants_list
    
    # Legacy single restaurant support (for backward compatibility)
    if not restaurant and restaurants and len(restaurants) > 0:
        restaurant = restaurants[0]
    
    session_id = request.sessionId or str(uuid.uuid4())
    
    return ChatResponse(
        chatId=new_chat_id or "",
        message=response_text,
        restaurant=restaurant,
        restaurants=restaurants,
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



