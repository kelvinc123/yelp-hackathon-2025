"use client";

import { useState } from "react";
import MainScreen from "@/components/MainScreen";
import ChatInterface from "@/components/ChatInterface";
import TalkInterface from "@/components/TalkInterface";
import RestaurantSwipeView from "@/components/RestaurantSwipeView";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [mode, setMode] = useState<"main" | "chat" | "talk">("main");
  const [isLoading, setIsLoading] = useState(true);
  const [voiceInputComplete, setVoiceInputComplete] = useState(false);

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
    // Show voice input interface first, then cards after input is complete
    if (!voiceInputComplete) {
      return (
        <TalkInterface
          onModeChange={(newMode: "chat" | "talk") => {
            if (newMode === "chat") {
              setMode("chat");
            }
          }}
          onVoiceComplete={() => {
            setVoiceInputComplete(true);
          }}
        />
      );
    }

    // After voice input is complete, show the swipeable restaurant cards
    return (
      <RestaurantSwipeView
        onModeChange={(newMode: "chat" | "talk") => {
          if (newMode === "chat") {
            setMode("chat");
            setVoiceInputComplete(false); // Reset when switching modes
          }
        }}
        onBack={() => {
          setVoiceInputComplete(false); // Go back to voice input
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
          setVoiceInputComplete(false); // Reset voice input state
        }
      }}
    />
  );
}
