"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainScreen from "@/components/MainScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<{
    restaurantName: string;
    reservationTime: string;
    sessionId: string | null;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only show the loading screen the very first time in this browser session
    const hasSeenLoading = window.sessionStorage.getItem("hasSeenLoading");
    if (!hasSeenLoading) {
      setIsLoading(true);
    }

    // Look for an existing reservation saved from result/chat flow
    let found: {
      restaurantName: string;
      reservationTime: string;
      sessionId: string | null;
    } | null = null;

    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (!key || !key.startsWith("yon-result:")) continue;
      try {
        const raw = window.sessionStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (
          data.choice === "reserve" &&
          data.restaurant &&
          data.reservationTime
        ) {
          found = {
            restaurantName: data.restaurant.name,
            reservationTime: data.reservationTime,
            sessionId: key.startsWith("yon-result:temp")
              ? null
              : key.replace("yon-result:", ""),
          };
          break;
        }
      } catch {
        // ignore bad entries
      }
    }

    if (found) {
      setCurrentReservation(found);
    }
  }, []);

  const handleLoadingComplete = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("hasSeenLoading", "true");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <MainScreen
      onModeChange={(newMode) => {
        if (newMode === "chat") {
          router.push("/chat");
        } else if (newMode === "talk") {
          router.push("/talk");
        }
      }}
      reservation={
        currentReservation
          ? {
              restaurantName: currentReservation.restaurantName,
              reservationTime: currentReservation.reservationTime,
              onView: () => {
                if (currentReservation.sessionId) {
                  router.push(
                    `/result?sessionId=${currentReservation.sessionId}`
                  );
                } else {
                  router.push("/result");
                }
              },
              onFindAnother: () => router.push("/chat"),
            }
          : null
      }
    />
  );
}
