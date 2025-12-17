"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainScreen from "@/components/MainScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only show the loading screen the very first time in this browser session
    if (typeof window === "undefined") return;

    const hasSeenLoading = window.sessionStorage.getItem("hasSeenLoading");
    if (!hasSeenLoading) {
      setIsLoading(true);
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
    />
  );
}
