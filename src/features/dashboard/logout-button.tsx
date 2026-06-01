"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

/** Botón de cierre de sesión (envuelve la server action). */
export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className="w-full">
        <LogOut className="size-4" />
        Cerrar sesión
      </Button>
    </form>
  );
}
