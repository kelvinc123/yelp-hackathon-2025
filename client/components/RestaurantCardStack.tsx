"use client";

import { useState } from "react";
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
  address?: string;
  phone?: string;
  url?: string;
}

interface RestaurantCardStackProps {
  restaurants: Restaurant[];
  onSwipeRight: (restaurant: Restaurant) => void; // User agrees - show options
  onSwipeLeft: () => void; // Move to back
  saved?: Set<string>;
  onHeartToggle?: (restaurantId: string, isSaved: boolean) => void;
}

export default function RestaurantCardStack({
  restaurants,
  onSwipeRight,
  onSwipeLeft,
  saved = new Set(),
  onHeartToggle,
}: RestaurantCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedRightCards, setSwipedRightCards] = useState<Set<number>>(new Set());

  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  // Get visible restaurants starting from currentIndex
  // When swiping left, we rotate the stack (move current to back)
  const getVisibleRestaurants = () => {
    const visible: Restaurant[] = [];
    let idx = currentIndex;
    let count = 0;
    const maxVisible = Math.min(3, restaurants.length);
    
    // Start from current index and wrap around, skipping cards that were swiped right
    while (count < maxVisible) {
      if (!swipedRightCards.has(idx)) {
        visible.push(restaurants[idx]);
        count++;
      }
      idx = (idx + 1) % restaurants.length;
      // Prevent infinite loop
      if (count === 0 && swipedRightCards.size === restaurants.length) break;
      if (visible.length >= restaurants.length) break;
    }
    
    return visible;
  };

  const visibleRestaurants = getVisibleRestaurants();
  
  if (visibleRestaurants.length === 0) {
    return null;
  }

  const currentRestaurant = visibleRestaurants[0];
  const nextRestaurant = visibleRestaurants[1];
  const thirdRestaurant = visibleRestaurants[2];

  const handleSwipeComplete = () => {
    // Called after swipe animation completes
  };

  const handleSwipe = (direction: "left" | "right", restaurant: Restaurant) => {
    if (direction === "right") {
      // User agrees - show options
      onSwipeRight(restaurant);
      // Mark this card as swiped right (removed from stack)
      const originalIndex = restaurants.indexOf(restaurant);
      setSwipedRightCards((prev) => new Set(prev).add(originalIndex));
      // Move to next card
      const nextIdx = (currentIndex + 1) % restaurants.length;
      setCurrentIndex(nextIdx);
    } else {
      // Swipe left - move to back (rotate the stack)
      onSwipeLeft();
      // Rotate: move current card to back by advancing index
      const nextIdx = (currentIndex + 1) % restaurants.length;
      setCurrentIndex(nextIdx);
    }
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto my-4" style={{ minHeight: "500px", height: "auto" }}>
      {/* Third card (back) */}
      {thirdRestaurant && (
        <div
          className="absolute inset-0"
          style={{
            transform: "scale(0.85) translateY(20px)",
            zIndex: 1,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        >
          <RestaurantCard
            restaurant={thirdRestaurant}
            onSwipe={() => {}}
            onSwipeComplete={handleSwipeComplete}
            saved={saved.has(thirdRestaurant.id)}
            onHeartToggle={
              onHeartToggle
                ? (isSaved) => onHeartToggle(thirdRestaurant.id, isSaved)
                : undefined
            }
          />
        </div>
      )}

      {/* Second card (middle) */}
      {nextRestaurant && (
        <div
          className="absolute inset-0"
          style={{
            transform: "scale(0.92) translateY(10px)",
            zIndex: 2,
            opacity: 0.8,
            pointerEvents: "none",
          }}
        >
          <RestaurantCard
            restaurant={nextRestaurant}
            onSwipe={() => {}}
            onSwipeComplete={handleSwipeComplete}
            saved={saved.has(nextRestaurant.id)}
            onHeartToggle={
              onHeartToggle
                ? (isSaved) => onHeartToggle(nextRestaurant.id, isSaved)
                : undefined
            }
          />
        </div>
      )}

      {/* Top card (front) */}
      {currentRestaurant && (
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          <RestaurantCard
            restaurant={currentRestaurant}
            onSwipe={(direction) => handleSwipe(direction, currentRestaurant)}
            onSwipeComplete={handleSwipeComplete}
            saved={saved.has(currentRestaurant.id)}
            onHeartToggle={
              onHeartToggle
                ? (isSaved) => onHeartToggle(currentRestaurant.id, isSaved)
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

