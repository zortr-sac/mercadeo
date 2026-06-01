import { Brand } from "@/components/layout/brand";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Cabecera superior. En escritorio el branding vive en el sidebar. */
export function Header({ title }: { title?: string }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-6"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <div className="flex h-16 items-center">
        <span className="lg:hidden">
          <Brand />
        </span>
        {title && (
          <h1 className="hidden font-display text-lg font-semibold lg:block">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
