"use client";

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
    address?: string;
    phone?: string;
}

interface RestaurantCardDisplayProps {
    restaurant: Restaurant;
    onYes?: () => void;
    onNext?: () => void;
    saved?: boolean;
    onHeartToggle?: (newValue: boolean) => void;
}

export default function RestaurantCardDisplay({
    restaurant,
    onYes,
    onNext,
    saved = false,
    onHeartToggle,
    }: RestaurantCardDisplayProps) {
    function handleHeartClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (onHeartToggle) {
        onHeartToggle(!saved);
        }
    }

    return (
        <div className="relative w-full max-w-[340px] select-none">
        {/* main card */}
        <div className="relative overflow-hidden rounded-[34px] bg-white shadow-[0_22px_55px_rgba(0,0,0,0.14)] ring-1 ring-black/5">
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
            <div className="mt-5 rounded-[22px] border-2 border-rose-400 px-4 py-5 text-center text-sm font-medium text-black">
                {restaurant.summary}
            </div>

            {/* Action buttons */}
            {(onYes || onNext) && (
                <div className="mt-4 flex gap-3">
                {onNext && (
                    <button
                    onClick={onNext}
                    className="flex-1 rounded-full border-2 border-black text-black px-4 py-2 font-semibold hover:bg-grey-100 transition-colors"
                    >
                    Next
                    </button>
                )}
                {onYes && (
                    <button
                    onClick={onYes}
                    className="flex-1 rounded-full bg-primary text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity"
                    >
                    Yes
                    </button>
                )}
                </div>
            )}

            {/* Address and Phone (shown after Yes) */}
            {(restaurant.address || restaurant.phone) && (
                <div className="mt-4 space-y-2 pt-4 border-t border-grey-200">
                {restaurant.address && (
                    <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-black mt-0.5 shrink-0" />
                    <span className="text-black">{restaurant.address}</span>
                    </div>
                )}
                {restaurant.phone && (
                    <div className="flex items-center gap-2 text-sm">
                    <svg
                        className="h-4 w-4 text-black shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                    <a
                        href={`tel:${restaurant.phone}`}
                        className="text-primary hover:underline"
                    >
                        {restaurant.phone}
                    </a>
                    </div>
                )}
                {/* Share button */}
                <button
                    onClick={() => {
                    const shareText = `Check out ${restaurant.name}!\n${
                        restaurant.address || ""
                    }\n${restaurant.phone || ""}`;
                    if (navigator.share) {
                        navigator.share({
                        title: restaurant.name,
                        text: shareText,
                        });
                    } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(shareText);
                        alert("Restaurant info copied to clipboard!");
                    }
                    }}
                    className="w-full mt-2 rounded-full bg-primary text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity text-sm"
                >
                    Share with Friends
                </button>
                </div>
            )}
            </div>
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
