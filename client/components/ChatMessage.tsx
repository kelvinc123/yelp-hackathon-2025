import Image from "next/image";
import RestaurantCardDisplay from "./RestaurantCardDisplay";
import RestaurantCardStack from "./RestaurantCardStack";

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
  url?: string;
}

interface ChatMessageProps {
  message: string;
  sender: "ai" | "user";
  timestamp?: Date;
  restaurant?: Restaurant;
  restaurants?: Restaurant[]; // For swipeable options
  onRestaurantAction?: (action: "yes" | "next", restaurantId: string) => void;
  saved?: boolean | Set<string>; // Can be single boolean or Set for multiple
  onHeartToggle?: (isSaved: boolean) => void;
  onHeartToggleMultiple?: (restaurantId: string, isSaved: boolean) => void; // For multiple restaurants
  onSwipeRight?: (restaurant: Restaurant) => void; // User agrees
  onSwipeLeft?: () => void; // Move to back
}

export default function ChatMessage({
  message,
  sender,
  timestamp,
  restaurant,
  restaurants,
  onRestaurantAction,
  saved = false,
  onHeartToggle,
  onHeartToggleMultiple,
  onSwipeRight,
  onSwipeLeft,
}: ChatMessageProps) {
  if (sender === "ai") {
    return (
      <div className="flex items-start gap-3 mb-6 animate-chat-bubble-in">
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
        <div className="flex flex-col gap-2 max-w-[85%]">
          {message && (
            <div className="rounded-2xl rounded-tl-sm bg-primary px-4 py-3 shadow-sm animate-bubble-appear">
              <p className="text-white text-sm leading-relaxed">{message}</p>
            </div>
          )}
          {/* Show swipeable stack if multiple restaurants */}
          {restaurants && restaurants.length > 0 && (
            <div className="mt-1 animate-bubble-appear">
              <RestaurantCardStack
                restaurants={restaurants}
                onSwipeRight={(rest) => {
                  if (onSwipeRight) {
                    onSwipeRight(rest);
                  } else if (onRestaurantAction) {
                    // Fallback to yes action
                    onRestaurantAction("yes", rest.id);
                  }
                }}
                onSwipeLeft={() => {
                  if (onSwipeLeft) {
                    onSwipeLeft();
                  } else if (onRestaurantAction && restaurants.length > 0) {
                    // Fallback to next action
                    const currentRest = restaurants[0];
                    onRestaurantAction("next", currentRest.id);
                  }
                }}
                saved={saved instanceof Set ? saved : new Set()}
                onHeartToggle={onHeartToggleMultiple}
              />
            </div>
          )}
          {/* Show single restaurant card if only one */}
          {restaurant && !restaurants && (
            <div className="mt-1 animate-bubble-appear">
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
                saved={
                  typeof saved === "boolean" ? saved : saved.has(restaurant.id)
                }
                onHeartToggle={onHeartToggle}
              />
            </div>
          )}
          {timestamp && (
            <span className="text-xs text-grey-500 px-1 mt-0.5 animate-fade-in">
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
    <div className="flex items-start justify-end gap-3 mb-6 animate-chat-bubble-in">
      <div className="flex flex-col gap-2 items-end max-w-[75%]">
        <div className="rounded-2xl rounded-tr-sm bg-grey-200 px-4 py-3 shadow-sm animate-bubble-appear">
          <p className="text-black text-sm leading-relaxed">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-grey-500 px-1 mt-0.5 animate-fade-in">
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
