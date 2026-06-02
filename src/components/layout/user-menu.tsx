"use client";

import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/(auth)/login/actions";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/components/session-provider";
import { ROLE_LABELS, ROUTES } from "@/lib/constants";

/** Menú del usuario actual: perfil y cierre de sesión. */
export function UserMenu() {
  const user = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menú de ${user.fullName}`}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border p-3">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]} · {user.email}
            </p>
          </div>
          <Link
            href={ROUTES.perfil}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            role="menuitem"
          >
            <UserIcon className="size-4" /> Mi perfil
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-muted"
              role="menuitem"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
