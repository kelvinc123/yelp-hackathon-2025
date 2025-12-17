"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import ChatMessage from "./ChatMessage";
import BottomNavigation from "./BottomNavigation";

interface Restaurant {
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
}

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
  timestamp?: Date;
  restaurant?: Restaurant;
}

interface ChatInterfaceProps {
  onBack?: () => void;
  onModeChange?: (mode: "chat" | "talk") => void;
}

const suggestions = [
  "Japanese fusion",
  "Italian near me",
  "Vegetarian options",
];

export default function ChatInterface({}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi, what would you like to eat?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
        }
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToYelpAI = async (
    message: string,
    action?: "yes" | "next",
    businessId?: string
  ) => {
    setIsLoading(true);
    try {
      // Call backend API instead of Next.js API route
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          chatId,
          sessionId,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          locale: "en_US",
          action,
          businessId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        throw new Error(
          error.error || error.detail || "Failed to get response"
        );
      }

      const data = await response.json();

      // Update chatId and sessionId
      if (data.chatId) setChatId(data.chatId);
      if (data.sessionId) setSessionId(data.sessionId);

      // Add AI response message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.message || "",
        sender: "ai",
        timestamp: new Date(),
        restaurant: data.restaurant || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error calling Yelp AI:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      const messageText = inputValue;
      setInputValue("");
      inputRef.current?.focus();

      // Send to Yelp AI
      await sendToYelpAI(messageText);
    }
  };

  const handleRestaurantAction = async (
    action: "yes" | "next",
    restaurantId: string
  ) => {
    // Add user action message
    const actionMessage: Message = {
      id: Date.now().toString(),
      text: action === "yes" ? "Yes" : "Next",
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);

    // Send action to Yelp AI
    await sendToYelpAI("", action, restaurantId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen flex-col bg-white relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-grey-200 bg-white z-10">
        <div>
          <p className="mb-1 text-xl font-bold text-black">
            Let&apos;s get started!
          </p>
          <p className="text-sm text-grey-500">What would you like to eat?</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-56">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
              restaurant={message.restaurant}
              onRestaurantAction={handleRestaurantAction}
            />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-grey-200 px-4 py-3">
                <p className="text-grey-500 text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed above bottom navigation */}
      <div className="fixed left-0 right-0 bottom-[80px] bg-white border-t border-grey-200 z-40">
        {/* Suggestions - Above input */}
        {messages.length <= 1 && (
          <div className="px-6 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto max-w-4xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex-shrink-0 rounded-full bg-white border border-grey-300 px-4 py-2 text-sm text-black hover:bg-grey-50 transition-colors whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 rounded-full border-2 border-grey-300 bg-white px-4 py-3 focus-within:border-primary transition-colors max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-black outline-none placeholder:text-grey-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                inputValue.trim() && !isLoading
                  ? "bg-primary text-white hover:opacity-90 shadow-sm"
                  : "bg-grey-200 text-grey-400 cursor-not-allowed"
              }`}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* BottomNavigation - Already fixed in component itself */}
      <BottomNavigation />
    </div>
  );
}
