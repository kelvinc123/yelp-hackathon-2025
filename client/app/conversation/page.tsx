"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import CircularAvatar from "@/components/CircularAvatar";
import Image from "next/image";

export default function ConversationPage() {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(true);

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-black">
            Let&apos;s get into the details!
          </h1>
        </div>

        {/* Image Placeholder */}
        <div className="px-6 pb-4">
          <div className="w-full h-48 bg-grey-200 rounded-2xl flex items-center justify-center">
            <div className="text-grey-400 text-sm">Image</div>
          </div>
        </div>

        {/* Transcript Section */}
        {showTranscript ? (
          <div className="px-6 pb-6 space-y-4">
            {/* User Audio Transcript */}
            <div className="bg-white rounded-2xl p-4">
              <div className="text-sm font-semibold text-black mb-2">
                Audio Transcript
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-primary/20 rounded flex items-center gap-1 px-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                      }}
                    />
                  ))}
                </div>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Audio Transcript */}
            <div className="bg-white rounded-2xl p-4">
              <div className="text-sm font-semibold text-black mb-2">
                Audio Transcript
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-grey-300 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/yon.png"
                    alt="Agent"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 h-8 bg-grey-200 rounded flex items-center gap-1 px-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-grey-400 rounded-full"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-base text-black mb-2">
                Would you like to get the direction there?
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-8 bg-grey-200 rounded flex items-center gap-1 px-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-grey-400 rounded-full"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Microphone Button */}
        <div className="px-6 pb-6 flex justify-center">
          <button
            onClick={() => {
              // TODO: Handle voice input
              console.log("Start listening");
            }}
            className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform"
            aria-label="Start listening"
          >
            <CircularAvatar variant="microphone" />
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

