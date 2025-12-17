import sys
import os
from pathlib import Path

project_root = Path(__file__).parent.parent.parent
env_file = project_root / "infra" / "env" / "common.local.env"

from dotenv import load_dotenv
load_dotenv(env_file)

sys.path.insert(0, str(Path(__file__).parent / "app"))

from services.yelp_ai import YelpAIService

def test_text_query():
    print("🧪 Testing Yelp AI API with text query...\n")
    
    service = YelpAIService()
    
    query = "I want vegan pizza near me"
    latitude = 40.7128
    longitude = -74.0060
    
    print(f"📝 Query: {query}")
    print(f"📍 Location: ({latitude}, {longitude})\n")
    
    try:
        response = service.chat(query, latitude, longitude)

        print("✅ API Response received!\n")
        print(f"💬 AI Response: {response['response']['text']}\n")
        print(f"🆔 Chat ID: {response.get('chat_id')}\n")
        
        businesses = service.extract_businesses_from_response(response)
        
        print(f"🍽️  Found {len(businesses)} restaurants:\n")
        for i, biz in enumerate(businesses, 1):
            print(f"{i}. {biz['name']}")
            print(f"   ⭐ Rating: {biz['rating']}")
            print(f"   💰 Price: {biz['price']}")
            print(f"   🏷️  Cuisine: {biz['cuisine']}")
            print(f"   💡 AI Insight: {biz['ai_insight']}")
            print(f"   📍 Address: {biz['address']}\n")
        
        return response
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_text_query()
