"use client";

import { useRouter } from "next/navigation";
import RestaurantSwipeView from "@/components/RestaurantSwipeView";

export default function OptionPage() {
  const router = useRouter();

  const handleSwipeComplete = (direction: "left" | "right") => {
    // TODO: Save user decision to API
    // POST /api/restaurants/{id}/decision
    // Body: { decision: "yes" | "no" }

    if (direction === "right") {
      // User swiped right (YES) - navigate to result page
      router.push("/result");
    }
    // If swiped left (NEXT), RestaurantSwipeView will handle showing next restaurant
  };

  return (
    <RestaurantSwipeView
      onSwipeComplete={handleSwipeComplete}
      onBack={() => router.push("/talk")}
    />
  );
}

