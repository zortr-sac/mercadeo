import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SessionProvider } from "@/components/session-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { requireSession } from "@/lib/session";

/** Layout del área autenticada: shell con sidebar (desktop) y bottom nav (móvil). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 pb-24 lg:pb-8">{children}</main>
        </div>
      </div>
      <BottomNav />
      <InstallPrompt />
    </SessionProvider>
  );
}
