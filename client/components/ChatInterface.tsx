"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, X } from "lucide-react";
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
  const [savedRestaurants, setSavedRestaurants] = useState<Set<string>>(
    new Set()
  );
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  // Load saved restaurants from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedRestaurants");
    if (saved) {
      try {
        const savedArray = JSON.parse(saved);
        setSavedRestaurants(new Set(savedArray));
      } catch (e) {
        console.error("Error loading saved restaurants:", e);
      }
    }
  }, []);

  const handleHeartToggle = (restaurantId: string, isSaved: boolean) => {
    const newSaved = new Set(savedRestaurants);
    if (isSaved) {
      newSaved.add(restaurantId);
    } else {
      newSaved.delete(restaurantId);
    }
    setSavedRestaurants(newSaved);

    // Save to localStorage
    const savedArray = Array.from(newSaved);
    localStorage.setItem("savedRestaurants", JSON.stringify(savedArray));

    // Update full restaurant data in localStorage
    const savedRestaurantsData = JSON.parse(
      localStorage.getItem("savedRestaurantsData") || "[]"
    );

    if (isSaved) {
      // Add restaurant if saving
      const restaurant = messages
        .map((m) => m.restaurant)
        .find((r) => r?.id === restaurantId);
      if (restaurant) {
        const existingIndex = savedRestaurantsData.findIndex(
          (r: Restaurant) => r.id === restaurantId
        );
        if (existingIndex === -1) {
          savedRestaurantsData.push({
            ...restaurant,
            savedDate: new Date().toISOString(),
          });
        }
      }
    } else {
      // Remove restaurant if unsaving
      const indexToRemove = savedRestaurantsData.findIndex(
        (r: Restaurant) => r.id === restaurantId
      );
      if (indexToRemove !== -1) {
        savedRestaurantsData.splice(indexToRemove, 1);
      }
    }

    localStorage.setItem(
      "savedRestaurantsData",
      JSON.stringify(savedRestaurantsData)
    );
  };

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

      // When user confirms "Yes", keep details internally but don't show the card yet
      if (action === "yes") {
        if (data.restaurant) {
          setSelectedRestaurant(data.restaurant);
        }
        setAwaitingChoice(true);
      }

      // Add AI response message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.message || "",
        sender: "ai",
        timestamp: new Date(),
        // Hide the card while we're asking what they want to do (reserve, directions, etc.)
        restaurant: action === "yes" ? undefined : data.restaurant || undefined,
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

  const handleChoice = (choice: "reserve" | "directions" | "somethingElse") => {
    if (!selectedRestaurant) return;

    const choiceText =
      choice === "reserve"
        ? "I'd like to make a reservation."
        : choice === "directions"
        ? "I'd like to get directions."
        : "I'd like something else.";

    const userMessage: Message = {
      id: Date.now().toString(),
      text: choiceText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setAwaitingChoice(false);

    // For main actions, go straight to result page with the chosen restaurant
    if (choice === "reserve" || choice === "directions") {
      const payload = {
        restaurant: selectedRestaurant,
        choice,
      };
      // Persist minimal data for result page
      if (sessionId) {
        sessionStorage.setItem(
          `yon-result:${sessionId}`,
          JSON.stringify(payload)
        );
        router.push(`/result?sessionId=${sessionId}`);
      } else {
        sessionStorage.setItem(`yon-result:temp`, JSON.stringify(payload));
        router.push("/result");
      }
      return;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const saveChatState = () => {
    const chatState = {
      messages,
      chatId,
      sessionId,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("chatState", JSON.stringify(chatState));
  };

  const handleNavigation = (path: string) => {
    // Check if chat is active (more than just the initial greeting)
    if (messages.length > 1) {
      // If navigating to Home, save state and navigate immediately
      if (path === "/") {
        saveChatState();
        router.push(path);
      } else {
        // For other paths, show warning
        setPendingNavigation(path);
        setShowWarning(true);
      }
    } else {
      router.push(path);
    }
  };

  const handleConfirmLeave = () => {
    if (pendingNavigation) {
      // Save state before leaving (except for Home which is already saved)
      if (pendingNavigation !== "/") {
        saveChatState();
      }
      router.push(pendingNavigation);
    }
    setShowWarning(false);
    setPendingNavigation(null);
  };

  const handleCancelLeave = () => {
    setShowWarning(false);
    setPendingNavigation(null);
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
          {messages.map((message) => {
            const restaurantId = message.restaurant?.id;
            return (
              <ChatMessage
                key={message.id}
                message={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
                restaurant={message.restaurant}
                onRestaurantAction={handleRestaurantAction}
                saved={
                  restaurantId ? savedRestaurants.has(restaurantId) : false
                }
                onHeartToggle={
                  restaurantId
                    ? (isSaved) => handleHeartToggle(restaurantId, isSaved)
                    : undefined
                }
              />
            );
          })}
          {isLoading && (
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-primary px-4 py-3">
                <p className="text-white text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed left-0 right-0 bottom-[80px] bg-white border-t border-grey-200 z-40">
        {/* Quick choice buttons after user says "Yes" */}
        {awaitingChoice && selectedRestaurant && (
          <div className="px-6 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto max-w-4xl mx-auto">
              <button
                onClick={() => handleChoice("reserve")}
                className="flex-shrink-0 rounded-full bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-colors whitespace-nowrap"
              >
                Make reservation
              </button>
              <button
                onClick={() => handleChoice("directions")}
                className="flex-shrink-0 rounded-full bg-white border border-grey-300 px-4 py-2 text-sm text-black hover:bg-grey-50 transition-colors whitespace-nowrap"
              >
                Get directions
              </button>
              <button
                onClick={() => handleChoice("somethingElse")}
                className="flex-shrink-0 rounded-full bg-white border border-grey-300 px-4 py-2 text-sm text-black hover:bg-grey-50 transition-colors whitespace-nowrap"
              >
                Something else
              </button>
            </div>
          </div>
        )}

        {/* Suggestions */}
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

      <BottomNavigation onNavigate={handleNavigation} />

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-black">Leave Chat?</h3>
              <button
                onClick={handleCancelLeave}
                className="text-grey-500 hover:text-black transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-base text-black mb-6">
              You have an active chat session. Are you sure you want to leave?
              {pendingNavigation === "/"
                ? " Your conversation will be saved and you can return to it later."
                : " Your conversation will be lost."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLeave}
                className="flex-1 rounded-full border-2 border-grey-300 text-black px-4 py-2 font-semibold hover:bg-grey-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 rounded-full bg-primary text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
