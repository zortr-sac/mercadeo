"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

/** Providers globales del lado cliente: tema (claro/oscuro) y toasts. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ className: "font-sans" }}
      />
      <ServiceWorkerRegister />
    </ThemeProvider>
  );
}
