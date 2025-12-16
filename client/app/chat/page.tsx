"use client";

import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const router = useRouter();

  return (
    <ChatInterface
      onBack={() => router.push("/")}
      onModeChange={(newMode: "chat" | "talk") => {
        if (newMode === "talk") {
          router.push("/talk");
        }
      }}
    />
  );
}
