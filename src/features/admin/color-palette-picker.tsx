"use client";
// Selector de color de marca (unicolor): grilla de swatches de la paleta curada.
import { Check } from "lucide-react";
import { BUSINESS_PALETTE } from "@/lib/brand-theme";

export function ColorPalettePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const current = BUSINESS_PALETTE.find((c) => c.value.toLowerCase() === value.toLowerCase());
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {BUSINESS_PALETTE.map((c) => {
          const selected = value.toLowerCase() === c.value.toLowerCase();
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              title={c.name}
              aria-label={c.name}
              aria-pressed={selected}
              className={`grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-background transition-transform ${
                selected ? "scale-110 ring-2 ring-foreground" : "hover:scale-105"
              }`}
              style={{ background: c.value }}
            >
              {selected && <Check className="size-5 text-white" strokeWidth={3} aria-hidden />}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Color elegido:{" "}
        <span className="font-medium text-foreground">{current ? current.name : "Personalizado"}</span>{" "}
        <span className="font-mono uppercase">{value}</span>
      </p>
    </div>
  );
}
