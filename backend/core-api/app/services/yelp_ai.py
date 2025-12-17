import os
import requests
from typing import Optional, Dict, Any


class YelpAIService:
    BASE_URL = "https://api.yelp.com/ai/chat/v2"
    
    def __init__(self):
        self.api_key = os.getenv("YELP_API_KEY")
        if not self.api_key:
            raise ValueError("YELP_API_KEY environment variable is required")

    def chat(
        self, 
        query: str, 
        latitude: Optional[float] = None, 
        longitude: Optional[float] = None,
        chat_id: Optional[str] = None,
        locale: str = "en_US"
    ) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload: Dict[str, Any] = {
            "query": query
        }
        
        user_context: Dict[str, Any] = {"locale": locale}
        if latitude is not None:
            user_context["latitude"] = latitude
        if longitude is not None:
            user_context["longitude"] = longitude
        
        if user_context:
            payload["user_context"] = user_context
        
        if chat_id:
            payload["chat_id"] = chat_id
        
        response = requests.post(
            self.BASE_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        return response.json()
    
    def extract_businesses_from_response(self, yelp_response: Dict[str, Any]) -> list:
        businesses = []
        
        if "entities" in yelp_response:
            for entity in yelp_response["entities"]:
                if "businesses" in entity:
                    for biz in entity["businesses"]:
                        contextual_info = biz.get("contextual_info", {})
                        photos = contextual_info.get("photos", [])
                        location = biz.get("location", {})
                        coordinates = biz.get("coordinates", {})
                        categories = biz.get("categories", [])
                        summaries = biz.get("summaries", {})
                        attributes = biz.get("attributes", {})
                        
                        business = {
                            "yelp_business_id": biz.get("id"),
                            "alias": biz.get("alias"),
                            "name": biz.get("name"),
                            "rating": biz.get("rating"),
                            "review_count": biz.get("review_count", 0),
                            "price": biz.get("price"),
                            "phone": biz.get("phone"),
                            "yelp_url": biz.get("url"),
                            "image_url": photos[0]["original_url"] if photos else None,
                            "photos": [photo["original_url"] for photo in photos[:3]],
                            "cuisine": categories[0]["title"] if categories else "Restaurant",
                            "categories": [cat["title"] for cat in categories],
                            "address": location.get("formatted_address"),
                            "address1": location.get("address1"),
                            "city": location.get("city"),
                            "state": location.get("state"),
                            "zip_code": location.get("zip_code"),
                            "country": location.get("country"),
                            "latitude": coordinates.get("latitude"),
                            "longitude": coordinates.get("longitude"),
                            "ai_insight": summaries.get("short"),
                            "business_url": attributes.get("BusinessUrl"),
                            "menu_url": attributes.get("MenuUrl"),
                            "accepts_reservations": attributes.get("RestaurantsReservations"),
                            "delivery_available": attributes.get("RestaurantsDelivery"),
                            "takeout_available": attributes.get("RestaurantsTakeOut"),
                            "good_for_groups": attributes.get("RestaurantsGoodForGroups"),
                            "good_for_kids": attributes.get("GoodForKids"),
                            "wheelchair_accessible": attributes.get("WheelchairAccessible"),
                            "alcohol": attributes.get("Alcohol"),
                            "wifi": attributes.get("WiFi"),
                            "has_tv": attributes.get("HasTV"),
                            "outdoor_seating": attributes.get("OutdoorSeating"),
                            "parking": attributes.get("BusinessParking"),
                            "ambience": attributes.get("Ambience"),
                            "noise_level": attributes.get("NoiseLevel"),
                            "price_range": attributes.get("RestaurantsPriceRange2"),
                        }
                        
                        businesses.append(business)
        
        return businesses


def get_yelp_ai_service() -> YelpAIService:
    return YelpAIService()
