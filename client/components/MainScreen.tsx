"use client";

import { useState } from "react";
import AppLogo from "./AppLogo";
import CircularAvatar from "./CircularAvatar";
import ModeToggle from "./ModeToggle";

interface MainScreenProps {
  onModeChange?: (mode: "chat" | "talk") => void;
}

export default function MainScreen({ onModeChange }: MainScreenProps) {
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");

  const handleModeChange = (mode: "chat" | "talk") => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-12">
      {/* Logo */}
      <div className="mt-8">
        <AppLogo />
      </div>

      {/* Tagline */}
      <p className="mt-4 text-center text-base text-black">
        No overwhelm in lists. AI gives you just one great place at a time.
      </p>

      {/* Central Avatar */}
      <div className="my-12 flex flex-col items-center">
        <CircularAvatar
          variant={activeMode === "talk" ? "microphone" : "avatar"}
        />
        <div className="mt-8 text-center">
          <p className="mb-2 text-lg font-bold text-black">
            Let&apos;s get started!
          </p>
          <p className="text-base text-black">What would you like eat?</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-8">
        <ModeToggle activeMode={activeMode} onModeChange={handleModeChange} />
      </div>
    </div>
  );
}
