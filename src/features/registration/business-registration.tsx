"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Copy,
  GraduationCap,
  Headphones,
  Image as ImageIcon,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { LEGAL_DISCLAIMERS, PAYMENT } from "@/lib/constants";
import type { Business } from "@/data/types";

const YAPE_PLAIN = PAYMENT.yapeDisplay.replace(/\s/g, "");

/** Todo lo que la persona obtiene dentro de la plataforma. */
const INCLUDED_FEATURES = [
  { icon: GraduationCap, title: "Academia completa", desc: "Cursos, videos y lecciones por nivel." },
  { icon: Headphones, title: "Audiolibros", desc: "Aprende mientras haces otras cosas." },
  { icon: Bot, title: "Asistente con IA", desc: "Redacta tus mensajes por ti." },
  { icon: MessagesSquare, title: "Copiloto de chats", desc: "Pega una captura y te dice qué responder." },
  { icon: ImageIcon, title: "Imágenes con IA", desc: "Materiales listos para compartir." },
  { icon: Users, title: "CRM de prospectos", desc: "Haz seguimiento sin olvidar a nadie." },
  { icon: Bell, title: "Recordatorios", desc: "Mantén tu ritmo todos los días." },
  { icon: Newspaper, title: "Novedades", desc: "Anuncios y logros de tu negocio." },
  { icon: Smartphone, title: "App en tu celular", desc: "Rápida y disponible sin internet." },
  { icon: RefreshCw, title: "Mejoras constantes", desc: "Contenido nuevo, sin costo extra." },
] as const;

/** Qué sostiene el aporte mensual (costos operativos de la plataforma). */
const CONTRIBUTION_COVERS = [
  "La inteligencia artificial que escribe tus mensajes y crea imágenes y videos.",
  "Los servidores, la seguridad y el soporte de tu cuenta.",
  "El contenido, la información y los materiales que usas cada día.",
  "Las mejoras y actualizaciones constantes de la plataforma.",
] as const;

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
  const [waUrl, setWaUrl] = useState("");

  const style = useMemo(
    () =>
      ({
        "--tenant-primary": business?.primaryColor ?? "#0f766e",
        "--tenant-accent": business?.accentColor ?? "#f59e0b",
      }) as React.CSSProperties,
    [business],
  );

  function buildWhatsappUrl(): string {
    const message = [
      `¡Hola! Quiero unirme a ${business?.name ?? "la academia"}.`,
      "",
      "Mis datos:",
      `• Nombre: ${name.trim()}`,
      `• Correo: ${email.trim()}`,
      `• WhatsApp: ${phone.trim()}`,
      "",
      `Voy a realizar mi aporte de S/ ${PAYMENT.pricePen} por Yape al ${PAYMENT.yapeDisplay} y enviaré mi comprobante. ¡Gracias!`,
    ].join("\n");
    return `https://wa.me/${PAYMENT.whatsappIntl}?text=${encodeURIComponent(message)}`;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Escribe tu nombre completo.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Escribe un correo válido (ejemplo: nombre@correo.com).");
      return;
    }
    if (phone.trim().length < 6) {
      toast.error("Escribe tu número de WhatsApp.");
      return;
    }
    if (!accepted) {
      toast.error("Acepta los términos para continuar.");
      return;
    }
    const url = buildWhatsappUrl();
    setWaUrl(url);
    setDone(true);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyYape() {
    try {
      await navigator.clipboard.writeText(YAPE_PLAIN);
      toast.success("Número copiado. Pégalo en Yape.");
    } catch {
      toast.error(`Anota el número de Yape: ${PAYMENT.yapeDisplay}`);
    }
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
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
            style={{ background: "var(--tenant-primary)" }}
          >
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="" className="size-full rounded-xl object-cover" />
            ) : (
              business.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="text-lg font-semibold" style={{ color: "var(--tenant-primary)" }}>
            {business.name}
          </span>
        </div>
        <h1 className="mt-6 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          La herramienta que transformará tu forma de hacer redes de mercadeo
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Todo lo que necesitas para aprender, organizarte y comunicarte mejor
          con tus clientes, en un solo lugar y desde tu celular.
        </p>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-12">
        {/* Beneficios — debajo del formulario en móvil */}
        <div className="order-2 space-y-6 lg:order-1">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Todo lo que tendrás incluido
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {INCLUDED_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in srgb, var(--tenant-primary) 12%, transparent)" }}
                  >
                    <Icon className="size-5" style={{ color: "var(--tenant-primary)" }} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qué cubre el aporte */}
          <div className="rounded-2xl border border-border bg-muted/50 p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Sparkles className="size-5" style={{ color: "var(--tenant-primary)" }} />
              Tu aporte de S/ {PAYMENT.pricePen} al mes
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              No es un cobro por usar la plataforma: es lo que la mantiene viva y
              al día. Tu aporte sostiene:
            </p>
            <ul className="mt-3 space-y-2">
              {CONTRIBUTION_COVERS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 leading-snug">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0"
                    style={{ color: "var(--tenant-primary)" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <p>{LEGAL_DISCLAIMERS.sales}</p>
          </div>
        </div>

        {/* Registro — primero en móvil */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7">
            {done ? (
              <RegistrationDone businessName={business.name} waUrl={waUrl} />
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <header>
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">
                    Crea tu cuenta
                  </h2>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-4xl font-bold" style={{ color: "var(--tenant-primary)" }}>
                      S/ {PAYMENT.pricePen}
                    </span>
                    <span className="text-lg text-muted-foreground">al mes</span>
                    <span className="w-full text-sm font-medium text-muted-foreground">
                      Aporte de operación y mantenimiento
                    </span>
                  </div>
                </header>

                {/* Paso 1 */}
                <Step number={1} title="Escribe tus datos">
                  <div className="space-y-3">
                    <Field label="Nombre completo" htmlFor="signupName">
                      <Input
                        id="signupName"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Ej. Rosa Martínez"
                        className="h-12 text-base"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Correo" htmlFor="signupEmail">
                      <Input
                        id="signupEmail"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="nombre@correo.com"
                        className="h-12 text-base"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Tu número de WhatsApp" htmlFor="signupPhone">
                      <Input
                        id="signupPhone"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Ej. 987 654 321"
                        className="h-12 text-base"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                </Step>

                {/* Paso 2 */}
                <Step number={2} title={`Paga S/ ${PAYMENT.pricePen} con Yape`}>
                  <p className="text-muted-foreground">
                    Abre tu app de Yape y envía el pago a este número:
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-border bg-muted px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Smartphone
                        className="size-7 shrink-0"
                        style={{ color: "var(--tenant-primary)" }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xl font-bold tracking-wide sm:text-2xl">
                          {PAYMENT.yapeDisplay}
                        </p>
                        <p className="text-sm text-muted-foreground">Número para Yape</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={copyYape}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Copy className="size-4" />
                      Copiar
                    </button>
                  </div>
                </Step>

                {/* Paso 3 */}
                <Step number={3} title="Envía tu comprobante por WhatsApp" last>
                  <p className="text-muted-foreground">
                    Toca el botón verde. Se abrirá WhatsApp con tus datos ya
                    escritos: solo adjunta la captura de tu pago y envíalo.
                  </p>
                </Step>

                <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    className="mt-0.5 size-5 shrink-0"
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

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full bg-[#25D366] text-base font-semibold text-white hover:bg-[#1ebe5b]"
                >
                  <MessageCircle className="size-6" />
                  Enviar mis datos por WhatsApp
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Apenas confirmemos tu aporte, creamos tu cuenta y te enviamos tu
                  usuario y contraseña por WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
  last,
  children,
}: {
  number: number;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ background: "var(--tenant-primary)" }}
        >
          {number}
        </div>
        {!last ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>
      <div className="flex-1 pb-1">
        <h3 className="mb-2 text-lg font-semibold leading-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function RegistrationDone({
  businessName,
  waUrl,
}: {
  businessName: string;
  waUrl: string;
}) {
  return (
    <div className="py-4 text-center">
      <div
        className="mx-auto flex size-16 items-center justify-center rounded-full text-white"
        style={{ background: "#25D366" }}
      >
        <MessageCircle className="size-9" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
        ¡Ya casi terminas!
      </h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Te abrimos WhatsApp para enviar tu mensaje a {businessName}. Ahí solo
        debes <span className="font-semibold text-foreground">adjuntar la captura de tu pago por Yape</span> y enviarlo.
      </p>

      <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left">
        <li className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" style={{ color: "var(--tenant-primary)" }} />
          <span>Paga S/ {PAYMENT.pricePen} por Yape al {PAYMENT.yapeDisplay}.</span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" style={{ color: "var(--tenant-primary)" }} />
          <span>Envíanos la captura por WhatsApp.</span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" style={{ color: "var(--tenant-primary)" }} />
          <span>Creamos tu cuenta y te enviamos tu acceso por WhatsApp.</span>
        </li>
      </ol>

      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25D366] text-base font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
        >
          <MessageCircle className="size-6" />
          ¿No se abrió? Abrir WhatsApp
          <ArrowRight className="size-5" />
        </a>
      ) : null}
    </div>
  );
}
