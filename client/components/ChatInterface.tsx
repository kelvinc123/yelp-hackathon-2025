"use client";

import { useState } from "react";
import ChatMessage from "./ChatMessage";
import ModeToggle from "./ModeToggle";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
}

interface ChatInterfaceProps {
  onBack?: () => void;
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi, what would you like to eat?",
      sender: "ai",
    },
    {
      id: "2",
      text: "Hi, I would like a japanese fusion restaurant near me",
      sender: "user",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [activeMode, setActiveMode] = useState<"chat" | "talk">("chat");

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: inputValue,
          sender: "user",
        },
      ]);
      setInputValue("");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="mb-6">
          <p className="mb-2 text-lg font-bold text-black">
            Let&apos;s get started!
          </p>
          <p className="text-base text-black">What would you like eat?</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-grey-200 bg-white p-4">
        {/* Input Field */}
        <div className="mb-3 flex items-center gap-2 rounded-full border border-grey-300 bg-white px-4 py-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-black outline-none placeholder:text-grey-500"
          />
          <button
            onClick={handleSend}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
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
                d="M5 10l7-7m0 0l7 7m-7-7v18"
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
              if (mode === "talk" && onBack) {
                onBack();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
