"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="w-9 h-9"
      />
    );
  }

  const currentTheme = theme || "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-lg hover:bg-accent/10 transition-colors"
          title="Alternar tema"
        >
          {currentTheme === "light" && (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          {currentTheme === "dark" && (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
          {currentTheme === "system" && (
            <Monitor className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={currentTheme === "light" ? "bg-accent/10" : ""}
        >
          <Sun className="w-4 h-4 mr-2 text-amber-500" />
          <span>Claro</span>
          {currentTheme === "light" && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={currentTheme === "dark" ? "bg-accent/10" : ""}
        >
          <Moon className="w-4 h-4 mr-2 text-blue-400" />
          <span>Escuro</span>
          {currentTheme === "dark" && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={currentTheme === "system" ? "bg-accent/10" : ""}
        >
          <Monitor className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>Sistema</span>
          {currentTheme === "system" && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
