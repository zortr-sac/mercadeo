"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "dark", icon: Moon, label: "Oscuro" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-muted p-1"
      role="group"
      aria-label="Tema"
    >
      {OPTIONS.map((option) => {
        const active = (theme ?? "light") === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "rounded-full p-2 transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
          </button>
        );
      })}
    </div>
  );
}
