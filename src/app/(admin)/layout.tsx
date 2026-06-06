import Link from "next/link";
import { SessionProvider } from "@/components/session-provider";
import { Brand } from "@/components/layout/brand";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROUTES } from "@/lib/constants";
import { requireRole } from "@/lib/session";

/**
 * Admin shell: clean top header (logo + user menu), full-width content. The
 * admin manages businesses and platform content here; to see the app they
 * "enter as a member" of a business.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("leader");

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-dvh flex-col bg-background">
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 backdrop-blur lg:px-8"
          style={{ paddingTop: "var(--safe-top)" }}
        >
          <Link href={ROUTES.admin} className="flex h-16 items-center">
            <Brand />
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SessionProvider>
  );
}
