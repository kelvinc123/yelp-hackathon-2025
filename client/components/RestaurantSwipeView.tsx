"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";
import ModeToggle from "./ModeToggle";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  time: string;
  summary: string;
  imageUrl?: string;
  vibes: string[];
}

interface RestaurantSwipeViewProps {
  onModeChange?: (mode: "chat" | "talk") => void;
  onBack?: () => void;
}

export default function RestaurantSwipeView({
  onModeChange,
  onBack,
}: RestaurantSwipeViewProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");

  // TODO: Replace this with actual API call
  // Place this logic in: client/app/api/restaurants/route.ts or similar
  // Example API structure:
  // GET /api/restaurants?query=...&location=...
  // Returns: Restaurant[]
  useEffect(() => {
    // Mock data - replace with API call
    const fetchRestaurants = async () => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/restaurants?query=...');
      // const data = await response.json();
      // setRestaurants(data);

      // Mock data for now
      setRestaurants([
        {
          id: "1",
          name: "Sakura Fusion",
          cuisine: "Japanese Fusion",
          rating: 4.7,
          distance: "1.2 mi",
          time: "25 min",
          summary: "Modern Japanese fusion with creative twists on classic dishes",
          vibes: ["Trendy", "Romantic", "Upscale"],
        },
        {
          id: "2",
          name: "Bella Italia",
          cuisine: "Italian",
          rating: 4.5,
          distance: "0.8 mi",
          time: "15 min",
          summary: "Authentic Italian cuisine in a cozy neighborhood setting",
          vibes: ["Cozy", "Family-friendly", "Casual"],
        },
      ]);
    };

    fetchRestaurants();
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    // TODO: Add API call to save user decision
    // Place this logic in: client/app/api/restaurants/[id]/decision/route.ts
    // Example: POST /api/restaurants/{id}/decision
    // Body: { decision: "yes" | "no" }
    
    if (direction === "right") {
      // User swiped right (YES) - save to favorites/bookmark
      console.log("User liked:", restaurants[currentIndex]);
      // await fetch(`/api/restaurants/${restaurants[currentIndex].id}/decision`, {
      //   method: 'POST',
      //   body: JSON.stringify({ decision: 'yes' })
      // });
    } else {
      // User swiped left (NEXT) - skip this restaurant
      console.log("User skipped:", restaurants[currentIndex]);
      // await fetch(`/api/restaurants/${restaurants[currentIndex].id}/decision`, {
      //   method: 'POST',
      //   body: JSON.stringify({ decision: 'no' })
      // });
    }

    // Move to next restaurant
    if (currentIndex < restaurants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // TODO: Fetch more restaurants from API
      // When no more restaurants, fetch next batch
      console.log("No more restaurants, fetch next batch");
    }
  };

  const handleSwipeComplete = () => {
    // Animation complete, can add any cleanup here
  };

  const currentRestaurant = restaurants[currentIndex];

  return (
    <div className="flex min-h-screen flex-col bg-grey-100">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-center">
          <p className="text-sm text-grey-500 mb-1">
            {currentIndex + 1} out of {restaurants.length}
          </p>
          <p className="text-xl font-bold text-black">Here is your choice!</p>
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {currentRestaurant ? (
          <RestaurantCard
            restaurant={currentRestaurant}
            onSwipe={handleSwipe}
            onSwipeComplete={handleSwipeComplete}
          />
        ) : (
          <div className="text-center">
            <p className="text-lg text-grey-500">No more restaurants</p>
            <p className="text-sm text-grey-500 mt-2">
              Check back later for more options
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-6 pb-4 text-center">
        <p className="text-sm text-grey-500">
          Swipe left for next, and swipe right for you
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="px-6 pb-6">
        <div className="flex justify-center">
          <ModeToggle
            activeMode={activeMode}
            onModeChange={(mode) => {
              setActiveMode(mode);
              if (mode === "chat") {
                onModeChange?.("chat");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

