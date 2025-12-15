interface ModeToggleProps {
  activeMode: "chat" | "talk";
  onModeChange: (mode: "chat" | "talk") => void;
}

export default function ModeToggle({
  activeMode,
  onModeChange,
}: ModeToggleProps) {
  return (
    <div className="relative inline-flex rounded-full border border-black bg-grey-100 p-1 gap-1">
      <button
        onClick={() => onModeChange("chat")}
        className={`relative z-10 rounded-full border px-6 py-1.5 font-semibold transition-all ${
          activeMode === "chat"
            ? "border-black bg-depth text-black shadow-sm"
            : "border-grey-300 bg-transparent text-black"
        }`}
      >
        Chat
      </button>
      <button
        onClick={() => onModeChange("talk")}
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
