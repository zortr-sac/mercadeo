import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200",
        gold: "bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-300",
        success:
          "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground",
        destructive:
          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
