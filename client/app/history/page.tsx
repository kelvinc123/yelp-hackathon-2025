"use client";

import { useEffect, useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";

interface ChatHistoryItem {
  id: string;
  chat_id?: string | null;
  created_at: string;
  last_message?: string | null;
}

export default function HistoryPage() {
  const [items, setItems] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://my-service-prod-84243174586.us-west1.run.app";
    async function load() {
      try {
        const res = await fetch(`${backendUrl}/api/chat/history`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-2">
          <h1 className="text-2xl font-bold text-black mb-1">Your History</h1>
          <p className="text-base text-grey-500">
            Recent conversations with YonTheBot.
          </p>
        </div>

        {/* History List */}
        <div className="px-6 pb-6 space-y-3 mt-2">
          {loading ? (
            <div className="text-center text-grey-400 text-sm py-12">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-grey-400 text-sm py-12">
              No conversations yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-black truncate">
                    {item.last_message || "Chat with YonTheBot"}
                  </p>
                  <span className="text-[11px] text-grey-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString([], {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {item.chat_id && (
                  <p className="text-[11px] text-grey-400 truncate">
                    Chat ID: {item.chat_id}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
