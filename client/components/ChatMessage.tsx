import Image from "next/image";
import RestaurantCardDisplay from "./RestaurantCardDisplay";

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

interface ChatMessageProps {
  message: string;
  sender: "ai" | "user";
  timestamp?: Date;
  restaurant?: Restaurant;
  onRestaurantAction?: (action: "yes" | "next", restaurantId: string) => void;
}

export default function ChatMessage({
  message,
  sender,
  timestamp,
  restaurant,
  onRestaurantAction,
}: ChatMessageProps) {
  if (sender === "ai") {
    return (
      <div className="flex items-start gap-3 mb-4 animate-chat-bubble-in">
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
        <div className="flex flex-col gap-1 max-w-[85%]">
          {message && (
            <div className="rounded-2xl rounded-tl-sm bg-primary px-4 py-3 shadow-sm animate-bubble-appear">
              <p className="text-white text-sm leading-relaxed">{message}</p>
            </div>
          )}
          {restaurant && (
            <div className="mt-2 animate-bubble-appear">
              <RestaurantCardDisplay
                restaurant={restaurant}
                onYes={() => {
                  if (onRestaurantAction) {
                    onRestaurantAction("yes", restaurant.id);
                  }
                }}
                onNext={() => {
                  if (onRestaurantAction) {
                    onRestaurantAction("next", restaurant.id);
                  }
                }}
                saved={false}
              />
            </div>
          )}
          {timestamp && (
            <span className="text-xs text-grey-500 px-1 animate-fade-in">
              {timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-end gap-3 mb-4 animate-chat-bubble-in">
      <div className="flex flex-col gap-1 items-end max-w-[75%]">
        <div className="rounded-2xl rounded-tr-sm bg-grey-200 px-4 py-3 shadow-sm animate-bubble-appear">
          <p className="text-black text-sm leading-relaxed">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-grey-500 px-1 animate-fade-in">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grey-300 shadow-sm">
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
    </div>
  );
}
