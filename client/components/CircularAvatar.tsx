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
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-primary p-4">
            <svg
              className="w-full h-full text-white"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Spoon */}
              <path
                d="M25 20 L25 50 Q25 60 30 60 L35 60 Q40 60 40 50 L40 20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="30" cy="15" r="3" fill="white" />

              {/* Robot Face */}
              <circle cx="70" cy="35" r="8" fill="white" />
              <circle cx="66" cy="32" r="2" fill="currentColor" />
              <circle cx="74" cy="32" r="2" fill="currentColor" />
              <path
                d="M66 42 Q70 46 74 42"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Robot Head Outline */}
              <circle
                cx="70"
                cy="35"
                r="15"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />

              {/* Small circles on sides (ears/sensors) */}
              <circle cx="55" cy="30" r="3" fill="white" />
              <circle cx="85" cy="30" r="3" fill="white" />
            </svg>
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
