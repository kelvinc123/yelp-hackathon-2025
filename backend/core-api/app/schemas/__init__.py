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
    voice: Optional[Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"]] = Field(
        default="nova",
        description="Voice for TTS response: alloy (neutral), echo (male), fable (British), onyx (deep male), nova (female), shimmer (female)"
    )


class SwipeAction(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    yelp_business_id: str = Field(..., description="Business identifier")
    action: Literal["right", "left"] = Field(
        ..., 
        description="Swipe direction: right=yes, left=next"
    )


class ReservationTextRequest(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    chat_id: str = Field(..., description="Yelp AI chat_id from conversation")
    yelp_business_id: str = Field(..., description="Yelp business identifier")
    text: str = Field(..., description="Reservation request text, e.g., 'Make a reservation for 2 people at 7pm tonight'")
    latitude: Optional[float] = Field(None, description="User latitude")
    longitude: Optional[float] = Field(None, description="User longitude")


class ReservationVoiceRequest(BaseModel):
    user_id: str = Field(default="user_123", description="User identifier")
    chat_id: str = Field(..., description="Yelp AI chat_id from conversation")
    yelp_business_id: str = Field(..., description="Yelp business identifier")
    audio_data: str = Field(..., description="Base64 encoded audio data")
    latitude: Optional[float] = Field(None, description="User latitude")
    longitude: Optional[float] = Field(None, description="User longitude")
    voice: Optional[Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"]] = Field(
        default="nova",
        description="Voice for TTS response"
    )


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
