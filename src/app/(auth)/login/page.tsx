import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { APP, LEGAL_DISCLAIMERS } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesion" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center text-white">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-white text-[#0f2f2c] font-display text-2xl font-extrabold">
          NX
        </div>
        <h1 className="font-display text-3xl font-bold">{APP.fullName}</h1>
        <p className="mt-3 text-white/85">
          Academia, CRM simple, mensajes con IA y recordatorios para vendedores.
        </p>
      </div>

      <div className="rounded-lg bg-card p-6 shadow-xl">
        <h2 className="mb-1 font-display text-xl font-semibold">Inicia sesión</h2>
        <p className="mb-5 text-muted-foreground">
          Ingresa con el correo y la contraseña de tu cuenta.
        </p>
        <LoginForm />

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-3 text-brand-900">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <p className="leading-relaxed">{LEGAL_DISCLAIMERS.sales}</p>
        </div>
      </div>

      <div className="mt-6 text-center text-white/75">
        <p>
          © {new Date().getFullYear()} {APP.name}. Producto educativo y de
          productividad.
        </p>
        <p className="mt-2 flex justify-center gap-4">
          <a href="/terminos" className="underline hover:text-white">
            Términos
          </a>
          <a href="/privacidad" className="underline hover:text-white">
            Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
