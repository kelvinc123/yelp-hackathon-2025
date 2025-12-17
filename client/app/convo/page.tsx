"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import Image from "next/image";
import { speakText, stopSpeaking } from "@/utils/tts";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
  timestamp: Date;
}

export default function ConvoPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("sessionId");
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "processing">(
    "idle"
  );
  const [hasGreeted, setHasGreeted] = useState(false);
  const [reservationUrl, setReservationUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      stopSpeaking();
    };
  }, []);

  // Load conversation history and show initial AI greeting
  useEffect(() => {
    if (!sessionId) return;

    // Check if we're coming from result page (after swipe right or need details)
    const resultChoiceData = sessionStorage.getItem(
      `yon-result-choice:${sessionId}`
    );
    const choiceData = resultChoiceData ? JSON.parse(resultChoiceData) : null;
    const comingFromResult = choiceData && choiceData.choice === "yes";
    const needDetails = choiceData && choiceData.choice === "need-details";

    // Check for reservation URL
    const reservationData = sessionStorage.getItem(
      `yon-reservation:${sessionId}`
    );
    if (reservationData) {
      const reservation = JSON.parse(reservationData);
      if (reservation.url) {
        setReservationUrl(reservation.url);
      }
    }

    // Load previous messages from session storage
    const storedMessages = sessionStorage.getItem(
      `yon-convo-messages:${sessionId}`
    );
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      setMessages(
        parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      );
      setHasGreeted(true); // Don't show greeting if we have messages
    } else if (needDetails) {
      // Coming from result page after 3 left swipes - ask for more details
      const timer = setTimeout(async () => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: "Would you want to describe more in details?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages([aiMessage]);
        try {
          await speakText(aiMessage.text, {
            voice: "coral",
            instructions: "Speak in a warm and friendly tone.",
          });
        } catch (error) {
          console.error("Error speaking AI response:", error);
        }
        setHasGreeted(true);
        // Clear the need-details flag
        sessionStorage.removeItem(`yon-result-choice:${sessionId}`);
      }, 500);
      return () => clearTimeout(timer);
    } else if (comingFromResult) {
      // Coming from result page - add user confirmation message
      const userMessage: Message = {
        id: "1",
        text: "Yes, I want this restaurant",
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([userMessage]);

      // Load restaurant data to check for reservation URL
      const resultData = sessionStorage.getItem(`yon-result:${sessionId}`);
      if (resultData) {
        const result = JSON.parse(resultData);
        if (result.restaurant && result.restaurant.url) {
          setReservationUrl(result.restaurant.url);
        }
      }

      // Show AI response asking what they want to do
      const timer = setTimeout(async () => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: "Great choice! What would you like to do? Would you like to make a reservation or get directions?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const updated = [...prev, aiMessage];
          // Save messages to session storage
          sessionStorage.setItem(
            `yon-convo-messages:${sessionId}`,
            JSON.stringify(updated)
          );
          return updated;
        });

        // Speak the AI response using OpenAI TTS
        try {
          await speakText(aiMessage.text, {
            voice: "coral",
            instructions: "Speak in a warm and friendly tone.",
          });
        } catch (error) {
          console.error("Error speaking AI response:", error);
        }

        setHasGreeted(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Add initial user message from transcript
      const talkData = sessionStorage.getItem(`yon:${sessionId}`);
      if (talkData) {
        const data = JSON.parse(talkData);
        if (data.transcript) {
          setMessages([
            {
              id: "1",
              text: data.transcript,
              sender: "user",
              timestamp: new Date(),
            },
          ]);
        }
      }
    }

    // Show AI greeting after a short delay (only if not coming from result)
    if (!hasGreeted && !comingFromResult) {
      const timer = setTimeout(async () => {
        const greetingMessage: Message = {
          id: Date.now().toString(),
          text: "Would you want to describe more in details?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, greetingMessage]);

        // Speak the greeting using OpenAI TTS
        try {
          await speakText(greetingMessage.text, {
            voice: "coral",
            instructions: "Speak in a warm and friendly tone.",
          });
        } catch (error) {
          console.error("Error speaking greeting:", error);
        }

        setHasGreeted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionId, hasGreeted]);

  const startRecording = async () => {
    // Stop any ongoing speech
    stopSpeaking();

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
      await handleVoiceComplete(blob);
    };

    recorder.start();
    setIsListening(true);
    setStatus("listening");
  };

  const stopRecording = () => {
    setIsListening(false);
    recorderRef.current?.stop();
  };

  const handleVoiceComplete = async (audioBlob: Blob) => {
    if (!sessionId) return;

    const talkData = sessionStorage.getItem(`yon-talk:${sessionId}`);
    if (!talkData) return;

    const { yelpChatId, latitude, longitude } = JSON.parse(talkData);
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://my-service-prod-84243174586.us-west1.run.app";
    const fd = new FormData();
    fd.append(
      "file",
      new File([audioBlob], "speech.webm", { type: "audio/webm" })
    );
    fd.append("latitude", String(latitude));
    fd.append("longitude", String(longitude));
    fd.append("locale", "en_US");
    fd.append("chatId", yelpChatId);
    fd.append("sessionId", sessionId);

    try {
      const res = await fetch(`${backendUrl}/api/talk`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Backend request failed");
      }

      const data = await res.json();

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: data.transcript,
        sender: "user",
        timestamp: new Date(),
      };

      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: "ai",
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMessage, aiMessage];
      setMessages(newMessages);

      // Save messages to session storage
      sessionStorage.setItem(
        `yon-convo-messages:${sessionId}`,
        JSON.stringify(newMessages)
      );

      // Speak AI response using OpenAI TTS
      try {
        await speakText(data.message, {
          voice: "coral",
          instructions: "Speak in a warm and friendly tone.",
        });
      } catch (error) {
        console.error("Error speaking AI response:", error);
      }

      // Update session storage with new chat ID if it changed
      if (data.yelpChatId && data.yelpChatId !== yelpChatId) {
        sessionStorage.setItem(
          `yon-talk:${data.sessionId}`,
          JSON.stringify({
            yelpChatId: data.yelpChatId,
            sessionId: data.sessionId,
            latitude,
            longitude,
          })
        );
      }

      // Check if user is asking about reservations or directions
      const userText = data.transcript.toLowerCase();
      const isReservationRequest =
        userText.includes("reservation") ||
        userText.includes("reserve") ||
        userText.includes("book");
      const isDirectionsRequest =
        userText.includes("direction") ||
        userText.includes("map") ||
        userText.includes("navigate");

      // Get restaurant data if available
      const resultData = sessionStorage.getItem(`yon-result:${data.sessionId}`);
      const restaurant = resultData ? JSON.parse(resultData).restaurant : null;

      // If user asks for reservation and we have restaurant URL, provide booking link
      if (isReservationRequest && restaurant && restaurant.url) {
        // Add a message with reservation link
        const reservationMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `You can make a reservation by visiting the restaurant's Yelp page. Would you like me to open it for you?`,
          sender: "ai",
          timestamp: new Date(),
        };
        const updatedMessages = [...newMessages, reservationMessage];
        setMessages(updatedMessages);
        sessionStorage.setItem(
          `yon-convo-messages:${data.sessionId}`,
          JSON.stringify(updatedMessages)
        );

        // Speak the message
        try {
          await speakText(reservationMessage.text, {
            voice: "coral",
            instructions: "Speak in a warm and friendly tone.",
          });
        } catch (error) {
          console.error("Error speaking reservation message:", error);
        }

        // Store reservation info for easy access
        sessionStorage.setItem(
          `yon-reservation:${data.sessionId}`,
          JSON.stringify({
            restaurant: restaurant,
            url: restaurant.url,
          })
        );

        // Set reservation URL to show button
        setReservationUrl(restaurant.url);

        setStatus("idle");
        return;
      }

      // If user asks for directions, provide directions info
      if (isDirectionsRequest && restaurant) {
        // Directions will be handled by the AI response, continue conversation
        setStatus("idle");
        return;
      }

      // If we have restaurants, go to option page
      if (data.restaurants && data.restaurants.length > 0) {
        const storedData = {
          ...data,
          restaurants: data.restaurants,
        };
        sessionStorage.setItem(
          `yon:${data.sessionId}`,
          JSON.stringify(storedData)
        );
        // Update talk data with new sessionId if it changed
        if (data.sessionId !== sessionId) {
          sessionStorage.setItem(
            `yon-talk:${data.sessionId}`,
            JSON.stringify({
              yelpChatId: data.yelpChatId,
              sessionId: data.sessionId,
              latitude,
              longitude,
            })
          );
        }
        router.push(`/option?sessionId=${data.sessionId}&mode=talk`);
      } else if (data.restaurant) {
        // Single restaurant - go to result page
        sessionStorage.setItem(
          `yon-result:${data.sessionId}`,
          JSON.stringify({
            restaurant: data.restaurant,
          })
        );
        router.push(`/result?sessionId=${data.sessionId}`);
      } else {
        // Continue conversation
        setStatus("idle");
      }
    } catch (error) {
      console.error("Error processing voice:", error);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8 pb-6">

        <div className="bg-white rounded-3xl mb-6">
          <h2 className="text-xl font-bold text-black mb-4">
            Let&apos;s get into the details!
          </h2>

          {reservationUrl ? (
            // Show image if a "slide yes" restaurant was chosen (i.e., reservationUrl exists)
            <div className="w-full h-48 bg-grey-200 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
              {/* Show image here, fall back to icon if image fails */}
              <img
                src={reservationUrl}
                alt="Restaurant"
                className="object-cover w-full h-full rounded-2xl"
                onError={(e) => {
                  // fallback to icon if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Optionally show a fallback icon overlay here if desired
                }}
              />
            </div>
          ) : null}

          {/* Messages */}
          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm overflow-hidden">
                    <Image
                      src="/yon.png"
                      alt="AI Assistant"
                      width={24}
                      height={24}
                      className="object-cover rounded-full"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    message.sender === "ai"
                      ? "bg-primary text-white"
                      : "bg-grey-200 text-black"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`h-4 w-4 ${
                        message.sender === "ai" ? "text-white" : "text-black"
                      }`}
                    >
                      {/* Audio waveform icon placeholder */}
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    </div>
                    <span
                      className={`text-xs ${
                        message.sender === "ai" ? "text-white" : "text-black"
                      }`}
                    >
                      Audio Transcript
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      message.sender === "ai" ? "text-white" : "text-black"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-grey-400 flex items-center justify-center shrink-0 bg-gray-200">
                    <svg
                      className="h-5 w-5 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reservation Button - Show when URL is available */}
          {reservationUrl && (
            <div className="mb-6">
              <a
                href={reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full bg-primary text-white py-3 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                📅 Book on Yelp
              </a>
            </div>
          )}

          {/* Microphone button - Red circle with mic icon */}
          <div className="flex justify-center">
            <button
              onClick={isListening ? stopRecording : startRecording}
              className="outline-none border-none bg-transparent cursor-pointer active:scale-95 transition-transform disabled:opacity-50"
              aria-label={isListening ? "Stop listening" : "Start listening"}
              disabled={status === "processing"}
            >
              <div className="relative">
                {/* Shadow */}
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30"></div>
                {/* Red circular button */}
                <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg bg-gray-200">
                  <svg
                    className="h-12 w-12 text-white"
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
                </div>
              </div>
            </button>
          </div>

          {status === "listening" && (
            <p className="text-center text-sm text-grey-500 mt-4">
              Listening...
            </p>
          )}
          {status === "processing" && (
            <p className="text-center text-sm text-grey-500 mt-4">Thinking…</p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
