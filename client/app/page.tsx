"use client";

import { useState } from "react";
import MainScreen from "@/components/MainScreen";
import ChatInterface from "@/components/ChatInterface";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [mode, setMode] = useState<"main" | "chat">("main");
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (mode === "chat") {
    return <ChatInterface onBack={() => setMode("main")} />;
  }

  return (
    <MainScreen
      onModeChange={(newMode) => newMode === "chat" && setMode("chat")}
    />
  );
}
