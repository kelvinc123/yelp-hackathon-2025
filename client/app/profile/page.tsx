"use client";

import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";
import { Clock, MapPin, MessageCircle, Star } from "lucide-react";

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
  savedDate: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  summary: string;
}

const SAVED_RESTAURANTS: SavedRestaurant[] = [
  {
    id: "1",
    name: "House of Fortune Vegan Chinese",
    cuisine: "Chinese",
    rating: 4.7,
    distance: "4.7 mi",
    time: "Closed now",
    summary: "Vegan comfort plates with big flavor and family-style portions.",
    vibes: ["Cozy", "Comfort food", "Casual"],
    savedDate: "2024-12-10T18:30:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Mazesoba Hero",
    cuisine: "Ramen",
    rating: 4.8,
    distance: "2.1 mi",
    time: "Open until late",
    summary: "Brothy bowls and mazemen built for chilly nights and catch-ups.",
    vibes: ["Late-night", "Noodles", "Casual"],
    savedDate: "2024-12-11T19:15:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Midnight Ramen Club",
    cuisine: "Japanese Comfort",
    rating: 4.9,
    distance: "0.8 mi",
    time: "Tonight",
    summary:
      "Late-night bowls when you and YonTheBot both said 'one more place'.",
    vibes: ["Cozy", "Late-night", "Soulful"],
    savedDate: "2024-12-12T21:45:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=400&q=80",
  },
];

const CHAT_HISTORY: ChatHistoryItem[] = [
  {
    id: "c1",
    title: "Spicy date-night ideas 🌶️",
    timestamp: "Today · 7:42 PM",
    summary:
      "You and YonTheBot narrowed 18 spots down to a cozy Thai place with cocktails.",
  },
  {
    id: "c2",
    title: "Where to eat after the concert",
    timestamp: "Yesterday · 10:15 PM",
    summary: "Found a late-night taco truck 5 min from your venue.",
  },
  {
    id: "c3",
    title: "Team lunch near the office",
    timestamp: "Dec 12 · 1:03 PM",
    summary: "Picked a bright cafe with fast Wi-Fi and group seating.",
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header / Identity */}
        <div className="px-6 pt-8 pb-4 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
            Y
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black">YonTheBot</h1>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mt-1">
              Always Hungry
            </span>
            <p className="text-sm text-grey-500 mt-1">
              Your foodie twin that remembers your cravings, late-night chats,
              and saved spots.
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3 text-center">
              <div className="text-lg font-bold text-black">
                {SAVED_RESTAURANTS.length}
              </div>
              <div className="text-xs text-grey-500">Saved places</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center">
              <div className="text-lg font-bold text-black">
                {CHAT_HISTORY.length}
              </div>
              <div className="text-xs text-grey-500">Chat sessions</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center">
              <div className="text-lg font-bold text-black">9.4</div>
              <div className="text-xs text-grey-500">Avg. rating</div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="px-6 pb-4">
          <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-black" />
            Chat history
          </h2>
          <div className="bg-white rounded-2xl p-4 divide-y divide-grey-100">
            {CHAT_HISTORY.map((chat) => (
              <div key={chat.id} className="py-3">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-black truncate">
                    {chat.title}
                  </p>
                  <span className="text-[11px] text-grey-400 whitespace-nowrap">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-xs text-grey-500">{chat.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Places */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-black" />
            Saved places
          </h2>

          <div className="space-y-4">
            {SAVED_RESTAURANTS.map((restaurant) => (
              <div
                key={restaurant.id}
                className="saved-card bg-white rounded-2xl overflow-hidden shadow-sm transition group border border-transparent"
                style={{
                  WebkitTapHighlightColor: "rgba(0,0,0,0)",
                }}
              >
                <div className="flex h-28 sm:h-28">
                  {/* Image */}
                  <div className="w-24 h-full bg-grey-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="object-cover w-full h-full aspect-[4/5]"
                        width={96}
                        height={128}
                        unoptimized
                        priority={restaurant.id === "1"} // Just as example: prioritize the first image
                      />
                    ) : (
                      <div className="text-grey-400 text-xs">Image</div>
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
                        className="text-sm text-grey-500 mb-1 truncate"
                        title={restaurant.cuisine}
                      >
                        {restaurant.cuisine}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-grey-500 mb-1">
                        <Star className="h-3 w-3 text-green-500 fill-green-500" />
                        <span>{restaurant.rating.toFixed(1)}</span>
                        <span className="mx-1">·</span>
                        <MapPin className="h-3 w-3 text-black" />
                        <span>{restaurant.distance}</span>
                        <span className="mx-1">·</span>
                        <Clock className="h-3 w-3 text-black" />
                        <span>{restaurant.time}</span>
                      </div>
                      {/* Vibes */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {restaurant.vibes.slice(0, 3).map((vibe) => (
                          <span
                            key={vibe}
                            className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-900 truncate"
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
        </div>
      </div>

      <BottomNavigation />
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
          border: 2px solid #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
