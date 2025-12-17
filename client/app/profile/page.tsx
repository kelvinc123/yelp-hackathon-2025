"use client";

import BottomNavigation from "@/components/BottomNavigation";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-grey-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-black">Profile</h1>
        </div>

        {/* Placeholder Content */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-2xl p-6">
            <p className="text-base text-grey-500 text-center">
              Profile settings will appear here
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}


