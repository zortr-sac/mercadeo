"use client";

import { useEffect, useState } from "react";

/** Saludo dinámico según la hora del día (cliente, evita desajuste SSR). */
export function DashboardGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Hola");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Buenos días");
    else if (h < 19) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  const firstName = name.split(" ")[0];

  return (
    <div>
      <p className="text-sm text-muted-foreground">{greeting},</p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {firstName} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ¿Listo para duplicar hoy? Tu equipo cuenta contigo.
      </p>
    </div>
  );
}
