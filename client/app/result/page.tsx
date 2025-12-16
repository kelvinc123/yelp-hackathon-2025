"use client";

import { useRouter } from "next/navigation";
import AppLogo from "@/components/AppLogo";

export default function ResultPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-grey-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl px-8 py-12 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <AppLogo />
        </div>

        {/* Placeholder Content */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
            Your reservation has been made!
          </h1>
          <p className="text-base text-grey-500 mb-8">
            Thank you for using YesorNext
          </p>

          {/* Placeholder for restaurant details */}
          <div className="w-full bg-grey-100 rounded-2xl p-6 mb-6">
            <p className="text-sm text-grey-500">Restaurant details will appear here</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-full bg-primary text-white py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Start Over
            </button>
            <button
              onClick={() => router.push("/option")}
              className="w-full rounded-full border border-black bg-white text-black py-3 font-semibold hover:bg-grey-50 transition-colors"
            >
              View More Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

