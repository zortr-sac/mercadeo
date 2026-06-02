"use client";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos dias";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardGreeting({ name }: { name: string }) {
  const firstName = name.split(" ")[0];

  return (
    <div>
      <p className="text-muted-foreground">{getGreeting()},</p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {firstName}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Revisa tus seguimientos y usa mensajes responsables.
      </p>
    </div>
  );
}
