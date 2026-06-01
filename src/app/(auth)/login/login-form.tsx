"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile } from "@/data/types";
import { loginAs } from "./actions";

/** Formulario de login demo: elige un perfil para entrar (mock, sin contraseña). */
export function LoginForm({ users }: { users: Profile[] }) {
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleLogin(id: string) {
    setSelectedId(id);
    startTransition(async () => {
      try {
        await loginAs(id);
      } catch {
        toast.error("No se pudo iniciar sesión. Intenta de nuevo.");
        setSelectedId(null);
      }
    });
  }

  return (
    <div className="w-full space-y-2.5">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => handleLogin(user.id)}
          disabled={pending}
          className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-3 text-left transition-colors hover:border-brand-400 hover:bg-muted disabled:opacity-60"
        >
          <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Badge variant={user.role === "admin" ? "gold" : "default"}>
            {ROLE_LABELS[user.role]}
          </Badge>
        </button>
      ))}
      {pending && selectedId && (
        <Button loading className="w-full" disabled>
          Entrando…
        </Button>
      )}
    </div>
  );
}
