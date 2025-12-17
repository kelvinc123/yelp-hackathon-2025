"use client";

import { useState, useEffect } from "react";
import AppLogo from "./AppLogo";
import ModeToggle from "./ModeToggle";
import Image from "next/image";

interface MainScreenProps {
  onModeChange?: (mode: "chat" | "talk") => void;
  reservation?: {
    restaurantName: string;
    reservationTime: string;
    onView: () => void;
    onFindAnother: () => void;
    onMarkedVisited?: () => void;
  } | null;
}

export default function MainScreen({
  onModeChange,
  reservation,
}: MainScreenProps) {
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");
  // Show the reservation toast if there's a reservation
  const [showReservation, setShowReservation] = useState(!!reservation);

  // Keep showReservation in sync if reservation changes from parent
  useEffect(() => {
    setShowReservation(!!reservation);
  }, [reservation]);

  const handleModeChange = (mode: "chat" | "talk") => {
    if (mode !== activeMode) {
      setActiveMode(mode);
      onModeChange?.(mode);
    }
  };

  const handleCentralImageClick = () => {
    if (activeMode !== "talk") {
      setActiveMode("talk");
    }
    onModeChange?.("talk");
  };

  // User clicks Mark as Visited
  const handleMarkedVisited = () => {
    // Call parent callback
    if (reservation?.onMarkedVisited) {
      reservation.onMarkedVisited();
    }
    // Hide the toast
    setShowReservation(false);
    // Parent is expected to move this reservation to history in their state when onMarkedVisited is called.
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
        <div className="flex-1 flex flex-col items-center justify-center w-full my-8 space-y-4">
          <button
            type="button"
            onClick={handleCentralImageClick}
            className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform hover:scale-105 hover:bg-grey-200"
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

          {/* Reservation Toast */}
          {reservation && showReservation && (
            <div className="w-full max-w-sm">
              <div className="mx-auto rounded-2xl bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-grey-200 px-4 py-3 flex flex-col gap-1 transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wide">
                    Upcoming plan
                  </span>
                  <span className="text-[11px] text-grey-400">
                    {new Date(reservation.reservationTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
                <p className="text-sm font-semibold text-black truncate">
                  {reservation.restaurantName}
                </p>
                <p className="text-xs text-black">
                  {new Date(reservation.reservationTime).toLocaleString([], {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={reservation.onView}
                    className="flex-1 rounded-full bg-primary text-white py-1.5 text-xs font-semibold hover:opacity-90 transition duration-150 hover:shadow-md"
                  >
                    View details
                  </button>
                  <button
                    onClick={handleMarkedVisited}
                    className="flex-1 rounded-full bg-grey-200 text-black py-1.5 text-xs font-semibold transition duration-150 hover:bg-green-500 hover:text-white hover:shadow-md cursor-pointer"
                  >
                    Mark as Visited
                  </button>
                </div>
                {/* After marking as visited, the reservation should disappear from the main screen.
                    This expects the parent to update/remove the reservation state when onMarkedVisited is called. */}
              </div>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mt-auto mb-4 w-full flex items-center justify-center">
          <ModeToggle activeMode={activeMode} onModeChange={handleModeChange} />
        </div>
      </div>
    </div>
  );
}
