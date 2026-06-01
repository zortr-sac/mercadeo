"use client";

import { createContext, useContext } from "react";
import type { Profile } from "@/data/types";

const SessionContext = createContext<Profile | null>(null);

/** Provee el usuario actual (hidratado desde el servidor) a los componentes cliente. */
export function SessionProvider({
  user,
  children,
}: {
  user: Profile;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

/** Devuelve el usuario actual. Debe usarse dentro de SessionProvider. */
export function useSession(): Profile {
  const user = useContext(SessionContext);
  if (!user) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return user;
}
