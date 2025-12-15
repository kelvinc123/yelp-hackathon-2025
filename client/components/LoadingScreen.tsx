"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
    onComplete: () => void;
    duration?: number;
}

export default function LoadingScreen({
    onComplete,
    duration = 2000,
    }: LoadingScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Start fade out after duration
        const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
        }, duration);

        // Complete transition after fade out
        const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
        }, duration + 300); // 300ms for fade out animation

        return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(completeTimer);
        };
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ${
            isFadingOut ? "opacity-0" : "opacity-100"
        }`}
        >
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 animate-pulse">
            <Image
                src="/logo.png"
                alt="YesorNext Logo"
                fill
                className="object-contain"
                priority
            />
            </div>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-grey-200">
            <div className="h-full w-full animate-[loading_2s_ease-in-out_infinite] bg-primary origin-left"></div>
            </div>
        </div>
        </div>
    );
}
