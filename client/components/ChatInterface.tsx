"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ModeToggle from "./ModeToggle";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
  timestamp?: Date;
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

export default function ChatInterface({
  onBack,
  onModeChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi, what would you like to eat?",
      sender: "ai",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Hi, I would like a japanese fusion restaurant near me",
      sender: "user",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-grey-200 bg-white">
        <div>
          <p className="mb-1 text-xl font-bold text-black">
            Let&apos;s get started!
          </p>
          <p className="text-sm text-grey-500">What would you like eat?</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 py-3 border-t border-grey-200 bg-grey-100">
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

      {/* Input Area */}
      <div className="border-t border-grey-200 bg-white p-4 pb-6">
        {/* Input Field */}
        <div className="mb-4 flex items-center gap-2 rounded-full border-2 border-grey-300 bg-white px-4 py-3 focus-within:border-primary transition-colors max-w-4xl mx-auto">
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
            disabled={!inputValue.trim()}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              inputValue.trim()
                ? "bg-primary text-white hover:opacity-90 shadow-sm"
                : "bg-grey-200 text-grey-400 cursor-not-allowed"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <ModeToggle
            activeMode={activeMode}
            onModeChange={(mode) => {
              setActiveMode(mode);
              if (mode === "talk") {
                onModeChange?.("talk");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
