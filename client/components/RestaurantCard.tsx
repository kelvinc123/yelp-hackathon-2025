"use client";

import { useMemo, useRef, useState } from "react";
import {
  Heart,
  Star,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  time: string;
  summary: string;
  imageUrl?: string;
  vibes: string[];
}

export default function RestaurantCard({
  restaurant,
  onSwipe,
  onSwipeComplete,
  saved,
  onHeartToggle,
  disabled = false,
}: {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  onSwipeComplete?: () => void;
  saved?: boolean;
  onHeartToggle?: (newValue: boolean) => void;
  disabled?: boolean;
}) {
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  // Remove internal saved state, delegate to props
  // const [saved, setSaved] = useState(false);

  const rotate = useMemo(() => {
    const clamped = Math.max(-120, Math.min(120, dx));
    return (clamped / 120) * 6;
  }, [dx]);

  const threshold = 90;

  function onPointerDown(e: React.PointerEvent) {
    if (leaving || disabled) return;
    setDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || startX.current == null || leaving) return;
    setDx(e.clientX - startX.current);
  }

  function endDrag() {
    setDragging(false);

    if (dx > threshold) {
      setLeaving("right");
      setDx(420);
      setTimeout(() => {
        onSwipe("right");
        onSwipeComplete?.();
        setLeaving(null);
        setDx(0);
      }, 220);
      return;
    }

    if (dx < -threshold) {
      setLeaving("left");
      setDx(-420);
      setTimeout(() => {
        onSwipe("left");
        onSwipeComplete?.();
        setLeaving(null);
        setDx(0);
      }, 220);
      return;
    }

    setDx(0);
    onSwipeComplete?.();
  }

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onHeartToggle) {
      onHeartToggle(!saved);
    }
    // Optionally: trigger callback or persist saved restaurant
  }

  return (
    <div className="relative w-full max-w-[340px] select-none">
      {/* Layered pink accent effect - top and right edges */}
      <div className="absolute inset-0 -z-20 translate-x-1 translate-y-1 rounded-[28px] bg-depth/40" />
      <div className="absolute inset-0 -z-10 translate-x-0.5 translate-y-0.5 rounded-[28px] bg-gloss/60" />

      {/* main card */}
      <div
        className={[
          "relative overflow-hidden rounded-[28px] bg-white",
          "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
          disabled ? "cursor-default" : "touch-none", // helps pointer swiping on mobile
          dragging
            ? "transition-none"
            : "transition-transform duration-200 ease-out",
        ].join(" ")}
        style={{ transform: `translateX(${dx}px) rotate(${rotate}deg)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* image */}
        <div className="relative h-[240px] bg-grey-200 flex items-center justify-center overflow-hidden">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <ImageIcon className="h-14 w-14 text-grey-400" />
          )}

          {/* heart - top left, white circle with black heart outline */}
          <button
            type="button"
            className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md active:scale-95 transition"
            aria-label={saved ? "saved" : "favorite"}
            onClick={handleHeartClick}
          >
            <Heart
              className={`h-5 w-5 ${
                saved ? "text-primary fill-primary" : "text-black"
              }`}
              fill={saved ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>

          {/* rating badge - top right, white oval with green star */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
            <Star className="h-3.5 w-3.5 text-accent fill-accent" />
            <span className="text-sm font-semibold text-black">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-xs text-grey-500">(328)</span>
          </div>
        </div>

        {/* content */}
        <div className="px-6 pt-5 pb-6">
          {/* Restaurant name and cuisine */}
          <div className="leading-tight mb-4">
            <div className="text-xl font-bold text-black">
              {restaurant.name}
            </div>
            <div className="mt-1 text-sm font-medium text-grey-500">
              {restaurant.cuisine}
            </div>
          </div>

          {/* Details row - icons with text */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-black" />
              <span className="font-medium text-black">
                {restaurant.vibes?.find(
                  (v) => v && (v.includes("$") || v.match(/^\$+$/))
                ) || "$$"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-black" />
              <span className="font-medium text-black">
                {restaurant.distance}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-black" />
              <span className="font-medium text-black">{restaurant.time}</span>
            </div>
          </div>

          {/* Cuisine tag - pink background with white text */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-depth px-3 py-1 text-xs font-semibold text-white">
              {restaurant.cuisine}
            </span>
          </div>

          {/* Description box - red outline */}
          <div className="mt-4 rounded-2xl border-2 border-primary px-4 py-4 text-sm font-medium text-black leading-relaxed">
            {restaurant.summary}
          </div>
        </div>

        {/* Swipe indicators */}
        {dragging && (
          <>
            {dx > 50 && (
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-primary text-4xl font-bold">
                YES
              </div>
            )}
            {dx < -50 && (
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-black text-4xl font-bold">
                NEXT
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
