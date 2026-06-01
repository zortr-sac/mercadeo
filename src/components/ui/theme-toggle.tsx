"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "system", icon: Monitor, label: "Sistema" },
  { value: "dark", icon: Moon, label: "Oscuro" },
] as const;

/** Conmutador de tema claro/sistema/oscuro. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-[7.5rem] rounded-full bg-muted" />;
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5"
      role="group"
      aria-label="Tema"
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            aria-label={opt.label}
            aria-pressed={active}
            className={cn(
              "rounded-full p-1.5 transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
