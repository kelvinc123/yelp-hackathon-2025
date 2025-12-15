"use client";

import { useState } from "react";
import MainScreen from "@/components/MainScreen";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [mode, setMode] = useState<"main" | "chat">("main");

  if (mode === "chat") {
    return <ChatInterface onBack={() => setMode("main")} />;
  }

  return (
    <MainScreen
      onModeChange={(newMode) => newMode === "chat" && setMode("chat")}
    />
  );
}
