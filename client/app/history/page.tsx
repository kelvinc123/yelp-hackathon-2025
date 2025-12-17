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
      imageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "2",
      name: "Bella Italia",
      cuisine: "Italian",
      vibes: ["Cozy", "Family-friendly", "Casual"],
      visitedDate: "Went by Dec 10",
      imageUrl:
        "https://images.unsplash.com/photo-1523987355523-c7b5b0723c83?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-2">
          <h1 className="text-2xl font-bold text-black mb-1">Your History</h1>
          <p className="text-base text-grey-500">
            Places you&apos;ve actually gone to after saying &quot;Yes&quot;.
          </p>
        </div>

        {/* History List */}
        <div className="px-6 pb-6 space-y-4 mt-2">
          {savedRestaurants.length === 0 ? (
            <div className="text-center text-grey-400 text-sm py-12">None</div>
          ) : (
            savedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-transparent saved-card"
              >
                <div className="flex h-28 sm:h-28">
                  {/* Image */}
                  <div className="w-24 h-full bg-grey-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {restaurant.imageUrl ? (
                      // Use native <img> to avoid next/image remote domain config issues
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <div className="text-grey-400 text-xs">None</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-4 flex flex-col justify-between py-3 min-w-0">
                    <div>
                      <div
                        className="text-lg font-bold text-black mb-1 truncate"
                        title={restaurant.name}
                      >
                        {restaurant.name}
                      </div>
                      <div
                        className="text-sm text-grey-500 mb-2 truncate"
                        title={restaurant.cuisine}
                      >
                        {restaurant.cuisine}
                      </div>

                      {/* Vibes */}
                      <div className="flex flex-wrap gap-1 mb-1">
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
                      {restaurant.visitedDate}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
      <style jsx global>{`
        @media (max-width: 480px) {
          .history-card .text-lg {
            font-size: 1.05rem;
          }
          .history-card .h-28 {
            height: 6.5rem;
          }
          .history-card .w-24 {
            width: 5rem;
          }
        }
        .saved-card:hover {
          border: 2px solid #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
