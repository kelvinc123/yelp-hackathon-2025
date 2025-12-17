"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import RestaurantCardStack from "@/components/RestaurantCardStack";
import RestaurantCardDisplay from "@/components/RestaurantCardDisplay";
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
  phone?: string;
  url?: string;
}

export default function OptionPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("sessionId");
  const mode = sp.get("mode"); // "talk" or "chat"
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const NO_CHOICE_TIMEOUT = 30000; // 30 seconds

  useEffect(() => {
    if (!sessionId) return;
    const raw = sessionStorage.getItem(`yon:${sessionId}`);
    if (!raw) return;
    const data = JSON.parse(raw);

    // Handle both old format (single restaurant) and new format (restaurants array)
    if (data.restaurants && Array.isArray(data.restaurants)) {
      setRestaurants(data.restaurants);
    } else if (data.restaurant) {
      setRestaurants([data.restaurant]);
    } else if (data.card) {
      // Legacy format - convert card to restaurant
      const restaurant: Restaurant = {
        id: data.card.yelp_business_id,
        name: data.card.name,
        cuisine: data.card.categories?.[0] || "Restaurant",
        rating: data.card.rating || 0,
        distance: "Nearby",
        time: "Check hours",
        summary: "Great match for your vibe.",
        imageUrl: undefined,
        vibes: data.card.categories?.slice(0, 3) || [],
        address: data.card.address,
        url: data.card.url,
      };
      setRestaurants([restaurant]);
    }
  }, [sessionId]);

  // Set timeout to redirect to convo transcript if no choice in talk mode
  useEffect(() => {
    if (mode === "talk" && restaurants.length > 0) {
      timeoutRef.current = setTimeout(() => {
        // User didn't choose - redirect to convo transcript
        router.push(`/convo?sessionId=${sessionId}`);
      }, NO_CHOICE_TIMEOUT);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [mode, restaurants.length, sessionId, router]);

  const handleSwipeRight = async (restaurant: Restaurant) => {
    // Clear timeout since user made a choice
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (mode === "talk") {
      // For talk mode, call backend with yes action
      const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
      if (talkData) {
        const { yelpChatId, latitude, longitude } = JSON.parse(talkData);
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://my-service-prod-84243174586.us-west1.run.app";
        const fd = new FormData();
        fd.append("latitude", String(latitude));
        fd.append("longitude", String(longitude));
        fd.append("locale", "en_US");
        fd.append("chatId", yelpChatId);
        fd.append("sessionId", sessionId || "");
        fd.append("action", "yes");
        fd.append("businessId", restaurant.id);
        // Create empty audio file for the request
        fd.append("file", new Blob([], { type: "audio/webm" }), "empty.webm");

        try {
          const res = await fetch(`${backendUrl}/api/talk`, {
            method: "POST",
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            // Store result and navigate to result page
            // Use restaurant from response if available (has full details), otherwise use the one from props
            const finalRestaurant = data.restaurant || restaurant;
            sessionStorage.setItem(
              `yon-result:${data.sessionId}`,
              JSON.stringify({
                restaurant: finalRestaurant,
                choice: "yes",
              })
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
            // include mode so result page knows to continue convo
            router.push(`/result?sessionId=${data.sessionId}&mode=talk`);
          }
        } catch (error) {
          console.error("Error confirming restaurant:", error);
        }
      }
    } else {
      // For chat mode, navigate to result page
      sessionStorage.setItem(
        `yon-result:${sessionId}`,
        JSON.stringify({
          restaurant: restaurant,
          choice: "yes",
        })
      );
      router.push(`/result?sessionId=${sessionId}`);
    }
  };

  const handleSwipeLeft = async () => {
    if (mode === "talk" && restaurants.length > 0) {
      // For talk mode, call backend with next action
      const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
      if (talkData) {
        const { yelpChatId, latitude, longitude } = JSON.parse(talkData);
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://my-service-prod-84243174586.us-west1.run.app";
        const fd = new FormData();
        fd.append("latitude", String(latitude));
        fd.append("longitude", String(longitude));
        fd.append("locale", "en_US");
        fd.append("chatId", yelpChatId);
        fd.append("sessionId", sessionId || "");
        fd.append("action", "next");
        // Create empty audio file for the request
        fd.append("file", new Blob([], { type: "audio/webm" }), "empty.webm");

        try {
          const res = await fetch(`${backendUrl}/api/talk`, {
            method: "POST",
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            // Update restaurants list with new option
            if (data.restaurant) {
              setRestaurants((prev) => {
                // Remove first restaurant and add new one at the end
                const updated = [...prev.slice(1), data.restaurant];
                return updated;
              });
            }
          }
        } catch (error) {
          console.error("Error getting next restaurant:", error);
        }
      }
    }
    // For chat mode, just rotate the stack (handled by RestaurantCardStack)
  };

  const handleHeartToggle = (restaurantId: string, isSaved: boolean) => {
    setSaved((prev) => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(restaurantId);
      } else {
        newSet.delete(restaurantId);
      }
      return newSet;
    });
  };

  if (!sessionId) return <div className="p-6">Missing sessionId</div>;
  if (restaurants.length === 0) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="min-h-screen flex items-center justify-center p-6">
        {restaurants.length > 1 ? (
          <RestaurantCardStack
            restaurants={restaurants}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            saved={saved}
            onHeartToggle={handleHeartToggle}
          />
        ) : (
          <RestaurantCardDisplay
            restaurant={restaurants[0]}
            onYes={() => handleSwipeRight(restaurants[0])}
            onNext={() => handleSwipeLeft()}
            saved={saved.has(restaurants[0].id)}
            onHeartToggle={(isSaved) =>
              handleHeartToggle(restaurants[0].id, isSaved)
            }
          />
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
