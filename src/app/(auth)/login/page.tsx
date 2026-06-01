import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { APP } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const users = await getRepositories().users.listDemoUsers();

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center text-white">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 font-display text-2xl font-extrabold backdrop-blur">
          HG
        </div>
        <h1 className="font-display text-2xl font-bold">{APP.fullName}</h1>
        <p className="mt-1 text-sm text-white/80">
          Formación, información y duplicación para tu equipo.
        </p>
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-xl">
        <h2 className="mb-1 font-display text-lg font-semibold">
          Elige tu perfil
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Modo demostración: selecciona un usuario para explorar la plataforma.
        </p>
        <LoginForm users={users} />
      </div>

      <p className="mt-6 text-center text-xs text-white/70">
        © {new Date().getFullYear()} {APP.name}. Uso interno.
      </p>
    </div>
  );
}
