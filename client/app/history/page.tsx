"use client";

import BottomNavigation from "@/components/BottomNavigation";

interface SavedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  imageUrl?: string;
  vibes: string[];
  visitedDate: string;
}

export default function HistoryPage() {
  // TODO: Fetch from API
  const savedRestaurants: SavedRestaurant[] = [
    {
      id: "1",
      name: "Sakura Fusion",
      cuisine: "Japanese Fusion",
      vibes: ["Trendy", "Romantic", "Upscale"],
      visitedDate: "Went by Dec 12",
    },
    {
      id: "2",
      name: "Bella Italia",
      cuisine: "Italian",
      vibes: ["Cozy", "Family-friendly", "Casual"],
      visitedDate: "Went by Dec 10",
    },
  ];

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-black mb-2">Your History</h1>
          <p className="text-base text-grey-500">
            Places you&apos;ve said Yes to!
          </p>
        </div>

        {/* Restaurant List */}
        <div className="px-6 pb-6 space-y-4">
          {savedRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex">
                {/* Image */}
                <div className="w-24 h-24 bg-grey-200 flex items-center justify-center flex-shrink-0">
                  <div className="text-grey-400 text-xs">Image</div>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-3">
                  <div className="text-lg font-bold text-black mb-1">
                    {restaurant.name}
                  </div>
                  <div className="text-sm text-grey-500 mb-2">
                    {restaurant.cuisine}
                  </div>

                  {/* Vibes */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {restaurant.vibes.slice(0, 3).map((vibe) => (
                      <span
                        key={vibe}
                        className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-900"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-grey-400">
                    {restaurant.visitedDate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}


