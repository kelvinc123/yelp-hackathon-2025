"use client";

import { useState } from "react";
import ModeToggle from "./ModeToggle";
import CircularAvatar from "./CircularAvatar";

interface TalkInterfaceProps {
    onBack?: () => void;
    onModeChange?: (mode: "chat" | "talk") => void;
}

export default function TalkInterface({
    onModeChange,
    }: TalkInterfaceProps) {
    const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");

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
            <div className="flex-1 w-full flex items-center justify-center">
                <CircularAvatar variant="microphone" />
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
