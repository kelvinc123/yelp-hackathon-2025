interface CircularAvatarProps {
  variant?: "avatar" | "microphone";
}

export default function CircularAvatar({
  variant = "avatar",
}: CircularAvatarProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer red circle */}
      <div className="absolute h-64 w-64 rounded-full bg-primary opacity-80"></div>

      {/* Middle pink circle */}
      <div className="absolute h-56 w-56 rounded-full bg-depth opacity-90"></div>

      {/* Inner white circle */}
      <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full bg-white">
        {variant === "avatar" ? (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-accent">
            <span className="text-6xl font-bold text-white">A</span>
          </div>
        ) : (
          <svg
            className="h-16 w-16 text-black"
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
        )}
      </div>
    </div>
  );
}
