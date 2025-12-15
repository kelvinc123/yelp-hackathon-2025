interface ChatMessageProps {
  message: string;
  sender: "ai" | "user";
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  if (sender === "ai") {
    return (
      <div className="flex items-start gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="rounded-lg bg-primary px-4 py-3 text-white max-w-[80%]">
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-end gap-2">
      <div className="rounded-lg bg-grey-200 px-4 py-3 text-black max-w-[80%]">
        <p>{message}</p>
      </div>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grey-300">
        <svg
          className="h-4 w-4 text-black"
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
