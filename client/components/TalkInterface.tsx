"use client";

import { useState } from "react";
import ModeToggle from "./ModeToggle";
import CircularAvatar from "./CircularAvatar";

interface TalkInterfaceProps {
    onBack?: () => void;
    onModeChange?: (mode: "chat" | "talk") => void;
    onVoiceComplete?: () => void;
}

export default function TalkInterface({
    onModeChange,
    onVoiceComplete,
    }: TalkInterfaceProps) {
    const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const handleStartListening = () => {
        setIsListening(true);
        // TODO: Implement actual voice recognition API call
        // Example: Start recording and send to backend API
    };

    const handleStopListening = () => {
        setIsListening(false);
        // TODO: Stop recording and process the voice input
        // Example: Send audio to backend, get restaurant recommendations
        // After processing, call onVoiceComplete()
        
        // Simulate voice input completion - replace with actual API call
        setTimeout(() => {
            if (onVoiceComplete) {
                onVoiceComplete();
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-100 relative">

        {/* Centered card */}
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div
            className="
                    w-full max-w-md
                    rounded-3xl bg-grey-100
                    px-8 py-10
                    flex flex-col items-center
                    min-h-[560px]
                "
            >
            {/* Header (fixed to top) */}
            <div className="absolute left-0 top-0 w-full pt-10 flex justify-center pointer-events-none">
                <div className="pointer-events-auto text-center">
                    <p className="mb-2 text-xl font-bold text-black">
                        Let&apos;s get started!
                    </p>
                    <p className="text-sm text-gray-500">What would you like to eat?</p>
                </div>
            </div>

            {/* Center (takes remaining space so it never overlaps header/footer) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
                <CircularAvatar variant="microphone" />
                
                {/* Status Text */}
                {isListening ? (
                    <div className="text-center">
                        <p className="text-lg font-semibold text-black mb-2">
                            Listening...
                        </p>
                        {transcript && (
                            <p className="text-sm text-grey-500">{transcript}</p>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-grey-500">
                            Tap the microphone to start
                        </p>
                    </div>
                )}

                {/* Microphone Button */}
                <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                        isListening
                            ? "bg-primary text-white animate-pulse"
                            : "bg-grey-200 text-black hover:bg-grey-300"
                    }`}
                >
                    <svg
                        className="h-10 w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>
                </button>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-center absolute left-0 bottom-0 pb-10">
                <ModeToggle
                    activeMode={activeMode}
                    onModeChange={(mode) => {
                        setActiveMode(mode);
                        if (mode === "chat") {
                            onModeChange?.("chat");
                        }
                    }}
                />
            </div>
            </div>
        </div>
        </div>
    );
}
