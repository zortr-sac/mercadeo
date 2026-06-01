import { cn } from "@/lib/utils";

/** Isotipo + wordmark de HGW. */
export function Brand({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl gradient-brand font-display text-sm font-extrabold text-white shadow-sm">
        HG
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">
            HGW
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
            Líderes
          </span>
        </span>
      )}
    </span>
  );
}
