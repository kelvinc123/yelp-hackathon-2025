"use client";

import { useState } from "react";
import MainScreen from "@/components/MainScreen";
import ChatInterface from "@/components/ChatInterface";
import TalkInterface from "@/components/TalkInterface";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [mode, setMode] = useState<"main" | "chat" | "talk">("main");
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (mode === "chat") {
    return (
      <ChatInterface
        onBack={() => setMode("main")}
        onModeChange={(newMode: "chat" | "talk") => {
          if (newMode === "talk") {
            setMode("talk");
          }
        }}
      />
    );
  }

  if (mode === "talk") {
    return (
      <TalkInterface
        onBack={() => setMode("main")}
        onModeChange={(newMode: "chat" | "talk") => {
          if (newMode === "chat") {
            setMode("chat");
          }
        }}
      />
    );
  }

  return (
    <MainScreen
      onModeChange={(newMode) => {
        if (newMode === "chat") {
          setMode("chat");
        } else if (newMode === "talk") {
          setMode("talk");
        }
      }}
    />
  );
}
