-- YesorNext Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table (tracks chat sessions with Yelp AI)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user_123',
    chat_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL DEFAULT 'user_123',
    prompt_text TEXT NOT NULL,
    prompt_type TEXT CHECK (prompt_type IN ('text', 'voice')),
    latitude FLOAT,
    longitude FLOAT,
    yelp_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompts_conversation_id ON prompts(conversation_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Restaurants discovered (individual restaurants from Yelp AI results)
CREATE TABLE restaurants_discovered (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL DEFAULT 'user_123',
    yelp_business_id TEXT NOT NULL,
    alias TEXT,
    name TEXT NOT NULL,
    rating FLOAT,
    review_count INT,
    price TEXT,
    phone TEXT,
    yelp_url TEXT,
    image_url TEXT,
    photos JSONB,
    cuisine TEXT,
    categories JSONB,
    address TEXT,
    address1 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    latitude FLOAT,
    longitude FLOAT,
    ai_insight TEXT,
    business_url TEXT,
    menu_url TEXT,
    accepts_reservations BOOLEAN,
    delivery_available BOOLEAN,
    takeout_available BOOLEAN,
    good_for_groups BOOLEAN,
    good_for_kids BOOLEAN,
    wheelchair_accessible BOOLEAN,
    alcohol TEXT,
    wifi TEXT,
    has_tv BOOLEAN,
    outdoor_seating BOOLEAN,
    parking JSONB,
    ambience JSONB,
    noise_level TEXT,
    price_range INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurants_discovered_prompt_id ON restaurants_discovered(prompt_id);
CREATE INDEX idx_restaurants_discovered_user_id ON restaurants_discovered(user_id);
CREATE INDEX idx_restaurants_discovered_yelp_business_id ON restaurants_discovered(yelp_business_id);
CREATE INDEX idx_restaurants_discovered_created_at ON restaurants_discovered(created_at DESC);

-- User swipes (tracks swipe actions)
CREATE TABLE user_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user_123',
    restaurant_id UUID REFERENCES restaurants_discovered(id) ON DELETE CASCADE,
    yelp_business_id TEXT NOT NULL,
    action TEXT CHECK (action IN ('right', 'left')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_swipes_user_id ON user_swipes(user_id);
CREATE INDEX idx_user_swipes_restaurant_id ON user_swipes(restaurant_id);
CREATE INDEX idx_user_swipes_action ON user_swipes(action);
CREATE INDEX idx_user_swipes_created_at ON user_swipes(created_at DESC);

-- User saved restaurants
CREATE TABLE user_saved_restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user_123',
    restaurant_id UUID REFERENCES restaurants_discovered(id) ON DELETE CASCADE,
    yelp_business_id TEXT NOT NULL,
    swipe_type TEXT CHECK (swipe_type IN ('right', 'up')),
    status TEXT CHECK (status IN ('saved', 'reserved', 'visited')) DEFAULT 'saved',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_saved_restaurants_user_id ON user_saved_restaurants(user_id);
CREATE INDEX idx_user_saved_restaurants_status ON user_saved_restaurants(status);
CREATE INDEX idx_user_saved_restaurants_created_at ON user_saved_restaurants(created_at DESC);

-- Reservations table (optional)
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user_123',
    saved_restaurant_id UUID REFERENCES user_saved_restaurants(id) ON DELETE CASCADE,
    yelp_business_id TEXT NOT NULL,
    party_size INT NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    special_requests TEXT,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_reservation_time ON reservations(reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);

-- User preferences (for AI learning)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user_123' UNIQUE,
    dietary_restrictions JSONB,
    favorite_cuisines JSONB,
    price_preference TEXT,
    distance_preference FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Comments
COMMENT ON TABLE conversations IS 'Tracks chat sessions with Yelp AI API';
COMMENT ON TABLE prompts IS 'Stores user text/voice queries and full Yelp AI responses';
COMMENT ON TABLE restaurants_discovered IS 'Individual restaurants from Yelp AI search results';
COMMENT ON TABLE user_swipes IS 'Tracks all swipe actions (right/left/up/down)';
COMMENT ON TABLE user_saved_restaurants IS 'User''s saved restaurants (right/up swipes only)';
COMMENT ON TABLE reservations IS 'Restaurant reservations made by users';
COMMENT ON TABLE user_preferences IS 'User preferences for AI personalization';
