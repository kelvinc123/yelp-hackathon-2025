"use client";

import { useRouter } from "next/navigation";
import TalkInterface from "@/components/TalkInterface";

export default function TalkPage() {
  const router = useRouter();

  return (
    <TalkInterface
      onModeChange={(newMode: "chat" | "talk") => {
        if (newMode === "chat") {
          router.push("/chat");
        }
      }}
      onVoiceComplete={() => {
        // After voice input, navigate to option page (swiping)
        router.push("/option");
      }}
    />
  );
}

