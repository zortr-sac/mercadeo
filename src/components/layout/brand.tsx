import { APP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-10 items-center justify-center rounded-lg gradient-brand font-display text-base font-extrabold text-white shadow-sm">
        NX
      </span>
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-bold tracking-tight">
            {APP.shortName}
          </span>
          <span className="font-medium uppercase tracking-wide text-muted-foreground">
            Mentor
          </span>
        </span>
      )}
    </span>
  );
}
