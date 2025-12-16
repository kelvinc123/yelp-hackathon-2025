interface ModeToggleProps {
  activeMode: "chat" | "talk";
  onModeChange: (mode: "chat" | "talk") => void;
}

export default function ModeToggle({
  activeMode,
  onModeChange,
}: ModeToggleProps) {
  const handleClick = (mode: "chat" | "talk") => {
    // Only call onModeChange if clicking a different mode
    if (mode !== activeMode) {
      onModeChange(mode);
    }
  };

  return (
    <div className="relative inline-flex rounded-full border border-black bg-grey-100 p-1 gap-1">
      <button
        onClick={() => handleClick("chat")}
        className={`relative z-10 rounded-full border px-6 py-1.5 font-semibold transition-all ${
          activeMode === "chat"
            ? "border-black bg-depth text-black shadow-sm"
            : "border-grey-300 bg-transparent text-black"
        }`}
      >
        Chat
      </button>
      <button
        onClick={() => handleClick("talk")}
        className={`relative z-10 rounded-full border px-6 py-1.5 font-semibold transition-all ${
          activeMode === "talk"
            ? "border-black bg-depth text-black shadow-sm"
            : "border-grey-300 bg-transparent text-black"
        }`}
      >
        Talk
      </button>
    </div>
  );
}
