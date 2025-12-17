"use client";

import { useEffect, useRef, useState } from "react";
import ModeToggle from "./ModeToggle";
import CircularAvatar from "./CircularAvatar";

interface TalkInterfaceProps {
    onModeChange?: (mode: "chat" | "talk") => void;
    onVoiceComplete?: (audioBlob: Blob) => Promise<void> | void;
}

export default function TalkInterface({ onModeChange, onVoiceComplete }: TalkInterfaceProps) {
    const [activeMode, setActiveMode] = useState<"chat" | "talk">("talk");
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState<"idle" | "listening" | "processing">("idle");

    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    useEffect(() => {
        return () => {
        // cleanup on unmount
        recorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        setStatus("processing");
        await onVoiceComplete?.(blob);
        // parent will usually navigate; if it doesn’t, you can setStatus("idle") here
        };

        recorder.start();
        setIsListening(true);
        setStatus("listening");
    };

    const stopRecording = () => {
        setIsListening(false);
        recorderRef.current?.stop();
    };

    return (
        <div className="min-h-screen bg-grey-100 relative">
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white px-8 py-10 flex flex-col items-center relative">
            <div className="w-full pt-8 pb-8 text-center">
                <p className="mb-2 text-xl font-bold text-black">Let&apos;s get started!</p>
                <p className="text-sm text-grey-500">What would you like to eat?</p>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 py-8">
                <button
                onClick={isListening ? stopRecording : startRecording}
                className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform"
                aria-label={isListening ? "Stop listening" : "Start listening"}
                disabled={status === "processing"}
                >
                <CircularAvatar variant="microphone" />
                </button>

                {status === "listening" && (
                <p className="text-lg font-semibold text-black">Listening...</p>
                )}
                {status === "processing" && (
                <p className="text-sm text-grey-500 text-center">Thinking…</p>
                )}
                {status === "idle" && (
                <p className="text-sm text-grey-500 text-center">Tap the microphone to start</p>
                )}
            </div>

            <div className="w-full flex justify-center pt-8 pb-6">
                <ModeToggle
                activeMode={activeMode}
                onModeChange={(mode) => {
                    setActiveMode(mode);
                    if (mode === "chat") onModeChange?.("chat");
                }}
                />
            </div>
            </div>
        </div>
        </div>
    );
}
