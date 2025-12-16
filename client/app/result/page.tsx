"use client";

import { useRouter } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

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

export default function ResultPage() {
  const router = useRouter();

  // TODO: Get this from API/context based on selected restaurant
  const restaurant: Restaurant = {
    id: "2",
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.5,
    distance: "0.8 mi",
    time: "15 min",
    summary: "Authentic Italian cuisine in a cozy neighborhood setting",
    vibes: ["Cozy", "Family-friendly", "Casual"],
  };

  const reservationDate = "Thursday, Dec 15, 2025 4.00 PM";

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-black">Summary</h1>
        </div>

        {/* Restaurant Card */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative h-48 bg-grey-200 flex items-center justify-center">
              <div className="text-grey-400 text-sm">Restaurant Image</div>
            </div>

            {/* Content */}
            <div className="px-5 pt-4 pb-5">
              <div className="leading-tight mb-3">
                <div className="text-xl font-extrabold text-black">
                  {restaurant.name}
                </div>
                <div className="mt-1 text-sm font-medium text-grey-500">
                  {restaurant.cuisine}
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-black mb-3">
                <span className="font-semibold text-black">$$$</span>
                <span className="font-semibold text-black">
                  {restaurant.distance}
                </span>
                <span className="font-semibold text-black">
                  {restaurant.time}
                </span>
              </div>

              {/* Vibes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900"
                  >
                    {vibe}
                  </span>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-2xl border-2 border-rose-400 px-4 py-3 text-center text-sm font-medium text-black">
                {restaurant.summary}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-black mb-2">
              Your reservation has been made!
            </h2>
            <p className="text-base font-semibold text-primary">
              {reservationDate}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => {
              // TODO: Add to calendar functionality
              console.log("Add to calendar");
            }}
            className="w-full rounded-full bg-white border-2 border-black text-black py-3 font-semibold hover:bg-grey-50 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="h-5 w-5" />
            Add to calendar
          </button>
          <button
            onClick={() => {
              // TODO: Get direction functionality
              console.log("Get direction");
            }}
            className="w-full rounded-full bg-primary text-white py-3 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MapPin className="h-5 w-5" />
            Get Direction
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
