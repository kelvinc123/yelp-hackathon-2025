"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Map, Share2 } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import RestaurantCard from "@/components/RestaurantCard";

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

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const urlMode = searchParams.get("mode"); // optional
  // Fallback: if talk session data exists in storage, assume talk mode
  const storedTalk = sessionId
    ? sessionStorage.getItem(`yon-talk:${sessionId}`)
    : null;
  const mode = urlMode || (storedTalk ? "talk" : null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [choice, setChoice] = useState<"reserve" | "directions" | "yes" | null>(
    null
  );
  const [showDirectionsChoice, setShowDirectionsChoice] = useState(false);
  const [reservationTime, setReservationTime] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
      if (typeof data.reservationTime === "string") {
        setReservationTime(data.reservationTime);
      }
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }

    // Check if we have talk data to determine mode
    if (!mode && sessionId) {
      const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
      if (talkData) {
        // We're in talk mode
      }
    }
  }, [sessionId, mode]);

  const handleSwipeRight = async (restaurant: Restaurant) => {
    // Swipe right = Yes = Confirm and continue conversation in convo transcript page
    // Check if we're in talk mode (from URL or session storage)
    const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
    const isTalkMode = mode === "talk" || !!talkData;

    if (isTalkMode && talkData) {
      // For talk mode, try to call backend with yes action
      try {
        const { yelpChatId, latitude, longitude } = JSON.parse(talkData);
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const fd = new FormData();
        fd.append("latitude", String(latitude));
        fd.append("longitude", String(longitude));
        fd.append("locale", "en_US");
        fd.append("chatId", yelpChatId);
        fd.append("sessionId", sessionId || "");
        fd.append("action", "yes");
        fd.append("businessId", restaurant.id);
        fd.append("file", new Blob([], { type: "audio/webm" }), "empty.webm");

        const res = await fetch(`${backendUrl}/api/talk`, {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const data = await res.json();
          // Store restaurant (without choice) and navigate to convo transcript page
          sessionStorage.setItem(
            `yon-result:${data.sessionId}`,
            JSON.stringify({
              restaurant: data.restaurant || restaurant,
            })
          );
          // Store that we're coming from result page with yes action
          sessionStorage.setItem(
            `yon-result-choice:${data.sessionId}`,
            JSON.stringify({ choice: "yes" })
          );
          // Update talk data with new sessionId if it changed
          if (data.sessionId !== sessionId) {
            sessionStorage.setItem(
              `yon-talk:${data.sessionId}`,
              JSON.stringify({
                yelpChatId: data.yelpChatId,
                sessionId: data.sessionId,
                latitude,
                longitude,
              })
            );
          }
          // Navigate to convo transcript page to continue conversation
          router.push(`/convo?sessionId=${data.sessionId}`);
          return;
        } else {
          // Backend call failed, but still navigate to convo page
          console.warn("Backend call failed, but continuing to convo page");
        }
      } catch (error) {
        // Backend call failed, but still navigate to convo page
        console.error("Error confirming restaurant:", error);
      }
    }

    // Fallback: Navigate to convo page even if backend call fails or not in talk mode
    // Store restaurant and mark that we're coming from result page
    sessionStorage.setItem(
      `yon-result:${sessionId}`,
      JSON.stringify({
        restaurant: restaurant,
      })
    );
    sessionStorage.setItem(
      `yon-result-choice:${sessionId}`,
      JSON.stringify({ choice: "yes" })
    );

    // Navigate to convo transcript page to continue conversation
    router.push(
      `/convo?sessionId=${sessionId}${isTalkMode ? "&mode=talk" : ""}`
    );
  };

  const handleSwipeLeft = async () => {
    // Swipe left = Next = Get another restaurant
    if (mode === "talk" && sessionId) {
      const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
      if (talkData) {
        const { yelpChatId, latitude, longitude } = JSON.parse(talkData);
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const fd = new FormData();
        fd.append("latitude", String(latitude));
        fd.append("longitude", String(longitude));
        fd.append("locale", "en_US");
        fd.append("chatId", yelpChatId);
        fd.append("sessionId", sessionId);
        fd.append("action", "next");
        fd.append("file", new Blob([], { type: "audio/webm" }), "empty.webm");

        try {
          const res = await fetch(`${backendUrl}/api/talk`, {
            method: "POST",
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            // Update restaurant with new option
            if (data.restaurant) {
              sessionStorage.setItem(
                `yon-result:${data.sessionId}`,
                JSON.stringify({
                  restaurant: data.restaurant,
                })
              );
              setRestaurant(data.restaurant);
              setChoice(null); // Reset choice
            }
          }
        } catch (error) {
          console.error("Error getting next restaurant:", error);
        }
      }
    } else {
      // For chat mode, go back to option page or chat
      if (sessionId) {
        router.push(`/option?sessionId=${sessionId}&mode=${mode || "chat"}`);
      } else {
        router.push("/chat");
      }
    }
  };

  const handleHeartToggle = (isSaved: boolean) => {
    setSaved(isSaved);
    // TODO: Save to favorites if needed
  };

  // Get current index for display (for now, just show 1)
  const [currentIndex, setCurrentIndex] = useState(1);
  const totalCount = 8; // This could be dynamic based on available restaurants

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header - Match the design */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-xl font-bold text-black mb-6">Option</h1>

          {/* YesorNext Button */}
          <div className="flex justify-center mb-2">
            <button className="rounded-full border border-grey-300 bg-grey-200 px-6 py-2 text-sm font-medium text-black">
              YesorNext
            </button>
          </div>

          {/* Counter */}
          <div className="flex justify-center mb-4">
            <p className="text-sm font-medium text-primary">
              {currentIndex} out of {totalCount}
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-black text-center mb-6">
            Here is your choice!
          </h2>
        </div>

        {/* Swipeable Restaurant Card */}
        {restaurant && !choice && (
          <div className="min-h-[500px] flex items-center justify-center px-6 py-6">
            <RestaurantCard
              restaurant={restaurant}
              saved={saved}
              onHeartToggle={handleHeartToggle}
              onSwipe={(direction: "left" | "right") => {
                if (direction === "right") {
                  handleSwipeRight(restaurant);
                } else {
                  handleSwipeLeft();
                }
              }}
            />
          </div>
        )}

        {/* Swipe Instructions */}
        {restaurant && !choice && (
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-grey-600">
              swipe left for next, and swipe right for yes
            </p>
          </div>
        )}

        {/* Confirmation - Show after swipe right */}
        {choice === "yes" && restaurant && (
          <div className="px-6 pb-6">
            <div className="bg-white rounded-3xl p-6 mb-6">
              <h2 className="text-xl font-bold text-black mb-4 text-center">
                Great choice!
              </h2>
              <p className="text-base text-grey-600 text-center mb-6">
                What would you like to do next?
              </p>

              {/* Action Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setChoice("directions")}
                  className="w-full rounded-full bg-primary text-white py-3 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <MapPin className="h-5 w-5" />
                  Get Directions
                </button>

                <button
                  onClick={() => {
                    // For now, just set a placeholder reservation time
                    // In a real app, you'd have a date/time picker
                    const time = new Date();
                    time.setHours(time.getHours() + 2); // 2 hours from now
                    setReservationTime(time.toISOString());
                    setChoice("reserve");
                  }}
                  className="w-full rounded-full bg-white border-2 border-black text-black py-3 font-semibold hover:bg-grey-50 transition-colors"
                >
                  Make a Reservation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Confirmation */}
        {choice === "reserve" && restaurant && reservationTime && (
          <div className="px-6 pb-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-black mb-2">
                Your plan is set!
              </h2>
              <p className="text-base font-semibold text-primary">
                You&apos;re going to {restaurant.name} on{" "}
                {new Date(reservationTime).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            </div>
          </div>
        )}

        {/* Directions Confirmation */}
        {choice === "directions" && restaurant && (
          <div className="px-6 pb-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-black mb-2">
                You&apos;re all set to go!
              </h2>
              <p className="text-base font-semibold text-primary">
                Use the button below to open directions.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {/* Add to calendar when they made a reservation */}
          {choice === "reserve" && restaurant && reservationTime && (
            <button
              onClick={() => {
                const title = encodeURIComponent(`Visit to ${restaurant.name}`);
                const detailsParts = [
                  `Time: ${new Date(reservationTime).toLocaleString()}`,
                  restaurant.address ? `Address: ${restaurant.address}` : "",
                  restaurant.phone ? `Phone: ${restaurant.phone}` : "",
                ].filter(Boolean);
                const details = encodeURIComponent(detailsParts.join("\n"));
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
                window.open(url, "_blank");
              }}
              className="w-full rounded-full bg-white border-2 border-black text-black py-3 font-semibold hover:bg-grey-50 transition-colors flex items-center justify-center gap-2"
            >
              Add to Google Calendar
            </button>
          )}

          {/* Share with friends (custom message) */}
          {restaurant && (
            <button
              onClick={() => {
                const whenText =
                  choice === "reserve" && reservationTime
                    ? `Time: ${new Date(reservationTime).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : null;

                const lines = [
                  `Hey, want to meet at ${restaurant.name}?`,
                  restaurant.address ? `Address: ${restaurant.address}` : "",
                  whenText || "",
                  restaurant.phone ? `Phone: ${restaurant.phone}` : "",
                ].filter(Boolean);

                const text = lines.join("\n");
                if (navigator.share) {
                  navigator.share({
                    title: restaurant.name,
                    text,
                  });
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(text);
                  alert("Restaurant info copied to clipboard!");
                }
              }}
              className="w-full rounded-full bg-grey-200 text-black py-3 font-semibold hover:bg-grey-300 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share with friends
            </button>
          )}

          {/* Directions buttons (available for both reserve + directions flows) */}
          {choice && restaurant && (
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
