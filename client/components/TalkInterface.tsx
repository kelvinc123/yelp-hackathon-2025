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
        <div className="min-h-screen bg-grey-100 relative">
            {/* Centered card */}
            <div className="min-h-screen flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md rounded-3xl bg-white px-8 py-10 flex flex-col items-center relative">
                    {/* Header */}
                    <div className="w-full pt-8 pb-8 text-center">
                        <p className="mb-2 text-xl font-bold text-black">
                            Let&apos;s get started!
                        </p>
                        <p className="text-sm text-grey-500">What would you like to eat?</p>
                    </div>

                    {/* Center Content */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 py-8">
                        {/* Large Circular Avatar - Clickable */}
                        <button
                            onClick={isListening ? handleStopListening : handleStartListening}
                            className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform"
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                        >
                            <CircularAvatar variant="microphone" />
                        </button>
                        
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
                            <p className="text-sm text-grey-500 text-center">
                                Tap the microphone to start
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="w-full flex justify-center pt-8 pb-6">
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
