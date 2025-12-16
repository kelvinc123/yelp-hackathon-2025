"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainScreen from "@/components/MainScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
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
    />
  );
}
