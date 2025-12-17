from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Literal
from datetime import datetime


class TextPromptRequest(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    text: str = Field(..., description="User text input/prompt")
    latitude: Optional[float] = Field(None, description="User latitude")
    longitude: Optional[float] = Field(None, description="User longitude")
    chat_id: Optional[str] = Field(None, description="Yelp AI chat_id for follow-up questions. If null, starts new conversation.")


class VoiceInputRequest(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    audio_data: str = Field(..., description="Base64 encoded audio data")
    latitude: Optional[float] = Field(None, description="User latitude")
    longitude: Optional[float] = Field(None, description="User longitude")
    chat_id: Optional[str] = Field(None, description="Yelp AI chat_id for follow-up questions. If null, starts new conversation.")


class SwipeAction(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    yelp_business_id: str = Field(..., description="Business identifier")
    action: Literal["right", "left"] = Field(
        ..., 
        description="Swipe direction: right=yes, left=next"
    )


class ReservationRequest(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    restaurant_id: str = Field(..., description="Restaurant identifier")
    party_size: int = Field(..., ge=1, le=20, description="Number of people")
    reservation_time: datetime = Field(..., description="Desired reservation time")
    special_requests: Optional[str] = Field(None, description="Special requests or notes")


class Restaurant(BaseModel):
    id: str
    name: str
    cuisine: str
    image_url: Optional[str] = None
    rating: float
    price_level: str
    distance: float
    address: str
    latitude: float
    longitude: float
    ai_insight: Optional[str] = None
