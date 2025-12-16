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
}: {
  restaurant: Restaurant;
  onSwipe: (direction: "left" | "right") => void;
  onSwipeComplete?: () => void;
  saved?: boolean;
  onHeartToggle?: (newValue: boolean) => void;
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
    if (leaving) return;
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
      {/* stacked pink paper behind */}
      <div className="absolute inset-0 -z-20 translate-x-2 translate-y-2 rotate-[3deg] rounded-[34px] bg-rose-300/60" />
      <div className="absolute inset-0 -z-10 -translate-x-1 translate-y-1 rotate-[-4deg] rounded-[34px] bg-rose-200/80" />

      {/* main card */}
      <div
        className={[
          "relative overflow-hidden rounded-[34px] bg-white",
          "shadow-[0_22px_55px_rgba(0,0,0,0.14)] ring-1 ring-black/5",
          "touch-none", // helps pointer swiping on mobile
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
        <div className="relative h-[190px] bg-gray-200 flex items-center justify-center">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <ImageIcon className="h-14 w-14 text-gray-400" />
          )}

          {/* heart */}
          <button
            type="button"
            className={`absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 active:scale-95 transition ${
              saved ? "border-2 border-rose-400" : ""
            }`}
            aria-label={saved ? "saved" : "favorite"}
            onClick={handleHeartClick}
          >
            <Heart
              className={`h-5 w-5 ${
                saved ? "text-rose-500 fill-rose-500" : "text-black"
              }`}
              fill={saved ? "currentColor" : "none"}
            />
          </button>

          {/* rating pill */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-black/5">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-black">
              <Star className="h-4 w-4 text-green-500 fill-green-500" />
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">(328)</span>
          </div>
        </div>

        {/* content */}
        <div className="px-5 pt-5 pb-6">
          <div className="leading-tight">
            <div className="text-xl font-extrabold text-black">
              {restaurant.name}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-500">
              {restaurant.cuisine}
            </div>
          </div>

          {/* meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-black">
            <div className="flex items-center gap-2">
              <IconBubble>
                <DollarSign className="h-4 w-4 text-black" />
              </IconBubble>
              <span className="font-semibold text-black">$$</span>
            </div>
            <div className="flex items-center gap-2">
              <IconBubble>
                <MapPin className="h-4 w-4 text-black" />
              </IconBubble>
              <span className="font-semibold text-black">
                {restaurant.distance}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconBubble>
                <Clock className="h-4 w-4 text-black" />
              </IconBubble>
              <span className="font-semibold text-black">
                {restaurant.time}
              </span>
            </div>
          </div>

          {/* vibes */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(restaurant.vibes ?? []).slice(0, 3).map((v) => (
              <span
                key={v}
                className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900"
              >
                {v}
              </span>
            ))}
          </div>

          {/* summary box */}
          <div className="mt-5 rounded-[22px] border-2 border-rose-400 px-4 py-5 text-center text-sm font-medium text-gray-700">
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

function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-100 ring-1 ring-black/5">
      {children}
    </span>
  );
}
