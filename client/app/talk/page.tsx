"use client";

import { useRouter } from "next/navigation";
import TalkInterface from "@/components/TalkInterface";

type TalkResult = {
  sessionId: string;
  transcript: string;
  yelpChatId: string;
  card: {
    yelp_business_id: string;
    name: string;
    rating?: number | null;
    price?: string | null;
    url?: string | null;
    address?: string | null;
    categories?: string[];
  };
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
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
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
          throw new Error(
            error.detail || error.error || "Backend request failed"
          );
        }

        const data: TalkResult = await res.json();

        // store result
        sessionStorage.setItem(`yon:${data.sessionId}`, JSON.stringify(data));

        router.push(`/option?sessionId=${data.sessionId}`);
      }}
    />
  );
}
