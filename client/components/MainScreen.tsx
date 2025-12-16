"use client";

import { useState } from "react";
import AppLogo from "./AppLogo";
import ModeToggle from "./ModeToggle";
import Image from "next/image";

interface MainScreenProps {
  onModeChange?: (mode: "chat" | "talk") => void;
}

export default function MainScreen({ onModeChange }: MainScreenProps) {
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");

  const handleModeChange = (mode: "chat" | "talk") => {
    // Only navigate if clicking a different mode
    if (mode !== activeMode) {
      setActiveMode(mode);
      onModeChange?.(mode);
    }
  };

  // Handler for clicking the central picture - always goes to Talk
  const handleCentralImageClick = () => {
    if (activeMode !== "talk") {
      setActiveMode("talk");
    }
    onModeChange?.("talk");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-100">
      <div className="w-full max-w-md h-screen flex flex-col items-center rounded-3xl px-6 pb-8 pt-12 relative">
        {/* Logo */}
        <div className="mb-6">
          <AppLogo />
        </div>

        {/* Horizontal line */}
        <div className="w-full max-w-[208px] h-px bg-grey-300 my-6" />

        {/* Tagline */}
        <p className="text-center text-base text-black mb-8">
          No overwhelm in lists. AI gives you just one great place at a time.
        </p>

        {/* Central Avatar (now clickable) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full my-8">
          <button
            type="button"
            onClick={handleCentralImageClick}
            className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform"
            aria-label="Start talking"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Image
              src="/main.png"
              alt="Main"
              className="object-contain"
              draggable="false"
              width={256}
              height={256}
            />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="mt-auto mb-4 w-full flex items-center justify-center">
          <ModeToggle activeMode={activeMode} onModeChange={handleModeChange} />
        </div>
      </div>
    </div>
  );
}
