"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

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

interface RestaurantCardProps {
    restaurant: Restaurant;
    onSwipe: (direction: "left" | "right") => void;
    onSwipeComplete?: () => void;
}

export default function RestaurantCard({
    restaurant,
    onSwipe,
    onSwipeComplete,
    }: RestaurantCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const SWIPE_THRESHOLD = 100;

    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        startPosRef.current = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
        const deltaX = clientX - startPosRef.current.x;
        const deltaY = clientY - startPosRef.current.y;
        setDragOffset({ x: deltaX, y: deltaY });

        // Add rotation based on drag
        const rotation = deltaX * 0.1;
        if (cardRef.current) {
        cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        }
    };

    const handleEnd = () => {
        const absX = Math.abs(dragOffset.x);
        const absY = Math.abs(dragOffset.y);

        if (absX > SWIPE_THRESHOLD && absX > absY) {
        const direction = dragOffset.x > 0 ? "right" : "left";
        onSwipe(direction);
        onSwipeComplete?.();
        } else {
        // Snap back
        if (cardRef.current) {
            cardRef.current.style.transform = "translate(0, 0) rotate(0deg)";
        }
        }

        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    useEffect(() => {
        if (isDragging) {
        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX, e.clientY);
        };

        const handleMouseUp = () => {
            handleEnd();
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
        }
    }, [isDragging]);

    const getOpacity = () => {
        const absX = Math.abs(dragOffset.x);
        return Math.max(0.3, 1 - absX / 300);
    };

    return (
        <div
        ref={cardRef}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-200"
        style={{
            opacity: isDragging ? getOpacity() : 1,
            userSelect: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        >
        {/* Image */}
        <div className="relative w-full h-64 bg-grey-200">
            {restaurant.imageUrl ? (
            <Image
                src={restaurant.imageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
            />
            ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-500">
                <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
                </svg>
            </div>
            )}
        </div>

        {/* Content */}
        <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-1">
                {restaurant.name}
                </h3>
                <p className="text-base text-grey-500">{restaurant.cuisine}</p>
            </div>
            <div className="flex items-center gap-1">
                <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
                >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-lg font-semibold text-black">
                {restaurant.rating}
                </span>
            </div>
            </div>

            {/* Vibes */}
            <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.vibes.map((vibe, index) => (
                <span
                key={index}
                className="px-3 py-1 rounded-full bg-grey-100 text-sm text-black"
                >
                {vibe}
                </span>
            ))}
            </div>

            {/* Distance and Time */}
            <div className="flex items-center gap-4 mb-4 text-sm text-grey-500">
            <div className="flex items-center gap-1">
                <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
                </svg>
                <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center gap-1">
                <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                </svg>
                <span>{restaurant.time}</span>
            </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-black leading-relaxed">
            {restaurant.summary}
            </p>
        </div>

        {/* Swipe indicators */}
        {isDragging && (
            <>
            {dragOffset.x > 50 && (
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-accent text-4xl font-bold">
                YES
                </div>
            )}
            {dragOffset.x < -50 && (
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-primary text-4xl font-bold">
                NEXT
                </div>
            )}
            </>
        )}
        </div>
    );
}
