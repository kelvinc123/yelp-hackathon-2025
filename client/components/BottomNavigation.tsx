"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, History, User } from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: "History",
      icon: History,
      path: "/history",
      active: isActive("/history"),
    },
    {
      label: "Home",
      icon: Home,
      path: "/",
      active: isActive("/") || pathname === "/chat" || pathname === "/talk" || pathname === "/option",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
      active: isActive("/profile"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
              aria-label={item.label}
            >
              <Icon
                className={`h-6 w-6 ${
                  item.active ? "text-primary" : "text-black"
                }`}
              />
              <span
                className={`text-xs ${
                  item.active ? "text-primary font-semibold" : "text-black"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

