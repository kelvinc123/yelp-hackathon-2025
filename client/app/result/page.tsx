"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Map } from "lucide-react";
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
  address?: string;
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [choice, setChoice] = useState<"reserve" | "directions" | null>(null);
  const [showDirectionsChoice, setShowDirectionsChoice] = useState(false);

  useEffect(() => {
    const key = sessionId ? `yon-result:${sessionId}` : "yon-result:temp";
    const raw =
      typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.restaurant) {
        setRestaurant(data.restaurant);
      }
      if (data.choice === "reserve" || data.choice === "directions") {
        setChoice(data.choice);
      }
    } catch {
      // ignore parse errors
    }
  }, [sessionId]);

  const reservationDate = "Thursday, Dec 15, 2025 4.00 PM";

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-xl font-bold text-black">Summary</h1>
          <p className="text-sm text-grey-500">
            Here is your chosen restaurant.
          </p>
        </div>

        {/* Restaurant Card */}
        {restaurant && (
          <div className="px-6 pb-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {/* Image */}
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />

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
        )}

        {/* Confirmation */}
        <div className="px-6 pb-6">
          {choice === "reserve" && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-black mb-2">
                Your reservation details
              </h2>
              <p className="text-base font-semibold text-primary">
                {reservationDate}
              </p>
            </div>
          )}
          {choice === "directions" && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-black mb-2">
                You&apos;re all set to go!
              </h2>
              <p className="text-base font-semibold text-primary">
                Use the button below to open directions.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {choice === "reserve" && (
            <button
              onClick={() => {
                // Simple add-to-calendar placeholder; hook into real calendar later
                alert("Reservation added to your calendar (demo).");
              }}
              className="w-full rounded-full bg-white border-2 border-black text-black py-3 font-semibold hover:bg-grey-50 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Add to calendar
            </button>
          )}

          {choice === "directions" && restaurant && (
            <>
              {!showDirectionsChoice ? (
                <button
                  onClick={() => setShowDirectionsChoice(true)}
                  className="w-full rounded-full bg-primary text-white py-3 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <MapPin className="h-5 w-5" />
                  Get Directions
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row gap-3">
                    <button
                      onClick={() => {
                        const query = encodeURIComponent(
                          restaurant.address || restaurant.name
                        );
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${query}`,
                          "_blank"
                        );
                      }}
                      className="flex-1 rounded-full bg-[#4285F4] text-white py-2 font-semibold hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-1"
                    >
                      <Map className="h-4 w-4" />
                      <span className="text-xs font-medium">Google Maps</span>
                    </button>
                    <button
                      onClick={() => {
                        const query = encodeURIComponent(
                          restaurant.address || restaurant.name
                        );
                        window.open(
                          `https://maps.apple.com/?daddr=${query}`,
                          "_blank"
                        );
                      }}
                      className="flex-1 rounded-full bg-[#222222] text-white py-2 font-semibold hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-1"
                    >
                      <Map className="h-4 w-4" />
                      <span className="text-xs font-medium">Apple Maps</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowDirectionsChoice(false)}
                    className="w-full rounded-full bg-grey-200 text-black py-2 font-semibold transition-all text-sm mt-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
