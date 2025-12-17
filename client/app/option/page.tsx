"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";

export default function OptionPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("sessionId");
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    const raw = sessionStorage.getItem(`yon:${sessionId}`);
    if (!raw) return;
    const data = JSON.parse(raw);
    setRestaurant(data.restaurant);
  }, [sessionId]);

  if (!sessionId) return <div className="p-6">Missing sessionId</div>;
  if (!restaurant) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <RestaurantCard
        restaurant={restaurant}
        saved={false}
        onHeartToggle={(v) => console.log("saved:", v)}
        onSwipe={(dir) => {
          console.log("swipe:", dir);
          // later: dir === "left" => NEXT (call /api/next)
          // dir === "right" => YES (call /api/yes)
        }}
      />
    </div>
  );
}
