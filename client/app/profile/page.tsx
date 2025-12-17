"use client";

import { useEffect, useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";

interface SavedRestaurant {
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
  savedDate: string;
}

export default function ProfilePage() {
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);

  useEffect(() => {
    // Load saved restaurants from localStorage
    const savedData = localStorage.getItem("savedRestaurantsData");
    if (savedData) {
      try {
        const restaurants = JSON.parse(savedData);
        setSavedRestaurants(restaurants);
      } catch (e) {
        console.error("Error loading saved restaurants:", e);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-black">Profile</h1>
        </div>

        {/* Saved Restaurants Section */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-black mb-4">Saved</h2>
          {savedRestaurants.length === 0 ? (
            <div className="bg-white rounded-2xl p-6">
              <p className="text-base text-grey-500 text-center">
                No saved restaurants yet. Tap the heart on a restaurant card to
                save it!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="saved-card bg-white rounded-2xl overflow-hidden shadow-sm transition group border border-transparent"
                  style={{
                    // For hover on mobile add tap effect 
                    WebkitTapHighlightColor: "rgba(0,0,0,0)",
                  }}
                >
                  <div className="flex h-28 sm:h-28">
                    {/* Image */}
                    <div className="w-24 h-full bg-grey-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      {restaurant.imageUrl ? (
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="object-cover w-full h-full aspect-[4/5]"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      ) : (
                        <div className="text-grey-400 text-xs">Image</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 flex flex-col justify-between py-3 min-w-0">
                      <div>
                        <div className="text-lg font-bold text-black mb-1 truncate" title={restaurant.name}>
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-grey-500 mb-2 truncate" title={restaurant.cuisine}>
                          {restaurant.cuisine}
                        </div>
                        {/* Vibes */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {restaurant.vibes.slice(0, 3).map((vibe) => (
                            <span
                              key={vibe}
                              className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900 truncate"
                              title={vibe}
                            >
                              {vibe}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Date */}
                      <div className="text-xs text-grey-400 truncate">
                        Saved {formatDate(restaurant.savedDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
      {/* Responsive styling helper and hover styling */}
      <style jsx global>{`
        @media (max-width: 480px) {
          .text-lg {
            font-size: 1.05rem;
          }
          .h-28 {
            height: 6.5rem;
          }
          .w-24 {
            width: 5rem;
          }
        }
        .saved-card:hover {
          border: 2px solid #ef4444 !important; /* Tailwind rose-500, or rose-400 slightly lighter (#fb7185) */
        }
      `}</style>
    </div>
  );
}
