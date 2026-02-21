"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <ThemeToggle />
    </div>
  );
}
