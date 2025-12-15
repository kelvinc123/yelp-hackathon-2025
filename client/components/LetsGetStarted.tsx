interface LetsGetStartedProps {
  className?: string;
}

export default function LetsGetStarted({
  className = "",
}: LetsGetStartedProps) {
  return (
    <p
      className={`font-semibold text-[22px] leading-normal text-black ${className}`}
      data-node-id="26:411"
    >
      Let&apos;s get started!
    </p>
  );
}
