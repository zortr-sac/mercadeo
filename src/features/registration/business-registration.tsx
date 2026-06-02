"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import type { Business } from "@/data/types";

export function BusinessRegistration({
  initialBusiness,
}: {
  slug: string;
  initialBusiness: Business | null;
}) {
  const business = initialBusiness;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);

  const style = useMemo(
    () =>
      ({
        "--tenant-primary": business?.primaryColor ?? "#0f766e",
        "--tenant-accent": business?.accentColor ?? "#f59e0b",
      }) as React.CSSProperties,
    [business],
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted) {
      toast.error("Acepta los terminos para continuar.");
      return;
    }
    if (name.trim().length < 2 || !email.includes("@")) {
      toast.error("Completa nombre y correo.");
      return;
    }
    setDone(true);
  }

  if (!business) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl items-center px-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="font-display text-2xl font-semibold">
            Link de registro no encontrado
          </h1>
          <p className="mt-2 text-muted-foreground">
            Revisa que el link del negocio este escrito correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-background" style={style}>
      <section className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <div
            className="mb-6 flex size-16 items-center justify-center rounded-lg font-display text-2xl font-bold text-white"
            style={{ background: "var(--tenant-primary)" }}
          >
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="" className="size-full rounded-lg object-cover" />
            ) : (
              business.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <p className="font-semibold" style={{ color: "var(--tenant-primary)" }}>
            {business.name}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Academia y herramientas para comunicar mejor cada dia
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Accede a tutoriales, plantillas, CRM simple, recordatorios y mensajes
            con IA responsable para organizar tu trabajo comercial.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Academia y videos del negocio.",
              "Plantillas para prospectos y objeciones.",
              "Recordatorios de seguimiento y PWA instalable.",
              "IA con Modo Cumplimiento para evitar promesas riesgosas.",
            ].map((item) => (
              <p key={item} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-1 size-5 shrink-0"
                  style={{ color: "var(--tenant-primary)" }}
                />
                <span>{item}</span>
              </p>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-gold-200 bg-gold-50 p-4 text-gold-900">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 size-5 shrink-0" />
              <p>{LEGAL_DISCLAIMERS.sales}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-lg">
          {done ? (
            <div className="py-8 text-center">
              <CheckCircle2
                className="mx-auto size-14"
                style={{ color: "var(--tenant-primary)" }}
              />
              <h2 className="mt-4 font-display text-2xl font-semibold">
                Registro recibido
              </h2>
              <p className="mt-2 text-muted-foreground">
                La pasarela de pagos se conectara en la siguiente fase. Por ahora
                este flujo deja listo el alta del cliente.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Crear cuenta
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Suscripcion mensual: S/ {business.subscriptionPricePen}.
                </p>
              </div>
              <Field label="Nombre completo" htmlFor="signupName">
                <Input
                  id="signupName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label="Correo" htmlFor="signupEmail">
                <Input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field label="WhatsApp" htmlFor="signupPhone">
                <Input
                  id="signupPhone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                />
              </Field>

              <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-1 size-5"
                />
                <span>
                  {LEGAL_DISCLAIMERS.signup}{" "}
                  <a href="/terminos" target="_blank" className="font-medium underline" style={{ color: "var(--tenant-primary)" }}>
                    Términos
                  </a>{" "}
                  y{" "}
                  <a href="/privacidad" target="_blank" className="font-medium underline" style={{ color: "var(--tenant-primary)" }}>
                    Privacidad
                  </a>
                  .
                </span>
              </label>

              <Button type="submit" className="w-full" size="lg">
                <CreditCard className="size-5" />
                Continuar a pago
              </Button>
              <p className="text-muted-foreground">
                Pago: pendiente de integrar. La arquitectura reserva el punto para
                pasarela e idempotencia por intento de suscripcion.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
