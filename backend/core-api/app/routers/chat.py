from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import math
import re
import uuid
from app.services.yelp_ai import YelpAIService

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


class ChatResponse(BaseModel):
    chatId: str
    message: str
    restaurant: Optional[Restaurant] = None
    sessionId: str


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


def extract_why(yelp_json: dict, business_id: str) -> str:
    """Extract the 'why' summary for a specific business"""
    text = yelp_json.get("response", {}).get("text", "")
    tags = yelp_json.get("response", {}).get("tags", [])
    
    idx = -1
    for i, tag in enumerate(tags):
        if tag.get("tag_type") == "business" and tag.get("meta", {}).get("business_id") == business_id:
            idx = i
            break
    
    if idx == -1:
        return text[:140].strip()
    
    start = tags[idx].get("end", 0)
    next_biz = None
    for tag in tags[idx + 1:]:
        if tag.get("tag_type") == "business":
            next_biz = tag
            break
    
    end = next_biz.get("start") if next_biz else min(len(text), start + 220)
    summary = text[start:end]
    # Replace multiple spaces with single space
    summary = re.sub(r'\s+', ' ', summary).strip()
    # Remove leading dashes/colons
    summary = summary.lstrip("-–—: ").strip()
    return summary


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
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
        query = "User confirmed they want this restaurant. Here are the details. Ask if they want to share this with friends."
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
    
    # Extract business and fetch details
    restaurant = None
    needs_details = False
    business_id_to_fetch = request.businessId
    
    if not business_id_to_fetch:
        # New recommendation - extract business
        biz = pick_one_business(yelp_json)
        if biz and biz.get("id"):
            business_id_to_fetch = biz["id"]
            needs_details = True
    else:
        # We have a businessId (from "yes" action), fetch details
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
            biz = pick_one_business(yelp_json) or details
            
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
            
            summary = extract_why(yelp_json, business_id_to_fetch)
            if not summary:
                summary = "Great match for your vibe."
            
            image_url = details.get("image_url") or (details.get("photos", [None])[0] if details.get("photos") else None)
            
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
            )
    
    session_id = request.sessionId or str(uuid.uuid4())
    
    return ChatResponse(
        chatId=new_chat_id or "",
        message=response_text,
        restaurant=restaurant,
        sessionId=session_id
    )



