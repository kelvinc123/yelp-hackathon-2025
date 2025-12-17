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
    <>
      {currentReservation && (
        <div className="w-full bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-md mx-auto flex flex-col gap-1">
            <p className="text-xs font-semibold text-yellow-800 uppercase">
              You have a plan
            </p>
            <p className="text-sm text-black">
              {`Meeting at ${currentReservation.restaurantName} on `}
              {new Date(currentReservation.reservationTime).toLocaleString([], {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  if (currentReservation.sessionId) {
                    router.push(
                      `/result?sessionId=${currentReservation.sessionId}`
                    );
                  } else {
                    router.push("/result");
                  }
                }}
                className="flex-1 rounded-full bg-primary text-white py-1.5 text-xs font-semibold hover:opacity-90"
              >
                View details
              </button>
              <button
                onClick={() => router.push("/chat")}
                className="flex-1 rounded-full bg-white border border-grey-300 text-black py-1.5 text-xs font-semibold hover:bg-grey-50"
              >
                Find another place
              </button>
            </div>
          </div>
        </div>
      )}
      <MainScreen
        onModeChange={(newMode) => {
          if (newMode === "chat") {
            router.push("/chat");
          } else if (newMode === "talk") {
            router.push("/talk");
          }
        }}
      />
    </>
  );
}
