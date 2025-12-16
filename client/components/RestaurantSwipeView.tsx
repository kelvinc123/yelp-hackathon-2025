"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";

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
  onSwipeComplete?: (direction: "left" | "right") => void;
  onBack?: () => void;
}

export default function RestaurantSwipeView({
  onSwipeComplete,
  onBack,
}: RestaurantSwipeViewProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setRestaurants([
      {
        id: "1",
        name: "Sakura Fusion",
        cuisine: "Japanese Fusion",
        rating: 4.7,
        distance: "1.2 mi",
        time: "25 min",
        summary:
          "Modern Japanese fusion with creative twists on classic dishes",
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
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    if (!restaurants[currentIndex]) return;

    if (direction === "right") {
      // User swiped right (YES) - navigate to result page
      onSwipeComplete?.(direction);
      return;
    }

    // If swiped left (NEXT), move to next restaurant
    if (currentIndex < restaurants.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      console.log("No more restaurants, fetch next batch");
      // TODO: Fetch more restaurants from API
    }
  };

  const currentRestaurant = restaurants[currentIndex];

  return (
    <div className="min-h-dvh bg-[#F6F6F6] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-3">
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-1 text-sm font-semibold shadow-sm">
            Yes<span className="text-rose-500">or</span>Next
          </div>

          <div className="text-sm font-medium text-gray-500">
            <span className="font-bold text-rose-500">{currentIndex + 1}</span>{" "}
            out of {restaurants.length}
          </div>

          <h1 className="mt-6 text-xl sm:text-xl font-extrabold tracking-tight text-black">
            Here is your choice!
          </h1>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6">
        {currentRestaurant ? (
          <RestaurantCard
            restaurant={currentRestaurant}
            onSwipe={handleSwipe}
            onSwipeComplete={() => {
              // This is called after the swipe animation completes
            }}
          />
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-500">No more restaurants</p>
            <p className="text-sm text-gray-500 mt-2">
              Check back later for more options
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-6 pb-6 text-center">
        <p className="text-sm text-gray-400">
          swipe left for next, and swipe right for yes
        </p>
      </div>
    </div>
  );
}
