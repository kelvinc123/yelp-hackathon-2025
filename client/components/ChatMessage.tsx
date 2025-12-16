import Image from "next/image";

interface ChatMessageProps {
  message: string;
  sender: "ai" | "user";
  timestamp?: Date;
}

export default function ChatMessage({
  message,
  sender,
  timestamp,
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
          />
        </div>
        <div className="flex flex-col gap-1 max-w-[75%]">
          <div className="rounded-2xl rounded-tl-sm bg-primary px-4 py-3 shadow-sm animate-bubble-appear">
            <p className="text-white text-sm leading-relaxed">{message}</p>
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
