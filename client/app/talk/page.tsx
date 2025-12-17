"use client";

import { useRouter } from "next/navigation";
import TalkInterface from "@/components/TalkInterface";

type Restaurant = {
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
  url?: string;
};

type TalkResult = {
  sessionId: string;
  transcript: string;
  yelpChatId: string;
  message: string;
  restaurants?: Restaurant[];
  restaurant?: Restaurant;
};

export default function TalkPage() {
  const router = useRouter();

  return (
    <TalkInterface
      onModeChange={(newMode: "chat" | "talk") => {
        if (newMode === "chat") router.push("/chat");
      }}
      onVoiceComplete={async (audioBlob: Blob) => {
        // get location (Yelp AI chat user_context)
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          })
        );

        // send to backend directly
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://my-service-prod-84243174586.us-west1.run.app";
        const fd = new FormData();
        fd.append(
          "file",
          new File([audioBlob], "speech.webm", { type: "audio/webm" })
        );
        fd.append("latitude", String(pos.coords.latitude));
        fd.append("longitude", String(pos.coords.longitude));
        fd.append("locale", "en_US");

        const res = await fetch(`${backendUrl}/api/talk`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          let error: any;
          try {
            error = await res.json();
          } catch {
            const errorText = await res.text();
            error = { error: errorText };
          }

          // Handle rate limit errors gracefully
          const errorMessage =
            error.detail || error.error || "Backend request failed";
          if (
            errorMessage.includes("429") ||
            errorMessage.includes("rate limit")
          ) {
            alert(
              "Yelp API rate limit reached. Please wait a moment and try again."
            );
            throw new Error("Rate limit exceeded");
          }

          throw new Error(errorMessage);
        }

        const data: TalkResult = await res.json();

        // store result with restaurants array
        const storedData = {
          ...data,
          restaurants:
            data.restaurants || (data.restaurant ? [data.restaurant] : []),
        };
        sessionStorage.setItem(
          `yon:${data.sessionId}`,
          JSON.stringify(storedData)
        );
        sessionStorage.setItem(
          `yon-talk:${data.sessionId}`,
          JSON.stringify({
            yelpChatId: data.yelpChatId,
            sessionId: data.sessionId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        );

        router.push(`/option?sessionId=${data.sessionId}&mode=talk`);
      }}
    />
  );
}
