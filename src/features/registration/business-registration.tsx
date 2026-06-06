"use client";

import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import {
  Btn,
  Card,
  Chip,
  Field,
  IconCircle,
  Logo,
  Note,
  TextInput,
  type Tone,
} from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { LEGAL_DISCLAIMERS, PAYMENT } from "@/lib/constants";
import { brandThemeVars } from "@/lib/brand-theme";
import type { Business } from "@/data/types";

const YAPE_PLAIN = PAYMENT.yapeDisplay.replace(/\s/g, "");

/** Todo lo que la persona obtiene dentro de la plataforma. */
const INCLUDED_FEATURES: { icon: IconName; tone: Tone; title: string; desc: string }[] = [
  { icon: "cap", tone: "blue", title: "Academia completa", desc: "Cursos y videos por nivel." },
  { icon: "headphones", tone: "orange", title: "Audiolibros", desc: "Aprende mientras haces otras cosas." },
  { icon: "megaphone", tone: "blue", title: "Anuncios listos", desc: "Cópialos y compártelos en tus redes." },
  { icon: "slides", tone: "orange", title: "Presentaciones", desc: "Muéstralas a tus clientes y descárgalas." },
  { icon: "heart", tone: "blue", title: "Tus favoritos", desc: "Guarda el contenido que más te gusta." },
  { icon: "bell", tone: "orange", title: "Recordatorios", desc: "Mantén tu ritmo cada día." },
  { icon: "download", tone: "blue", title: "App en tu celular", desc: "Rápida, hasta sin internet." },
  { icon: "refresh", tone: "orange", title: "Mejoras constantes", desc: "Contenido nuevo, sin costo extra." },
];

/** Qué sostiene el aporte mensual (costos operativos de la plataforma). */
const CONTRIBUTION_COVERS = [
  "Las plantillas de anuncios y presentaciones que usas cada día.",
  "Los servidores, la seguridad y el soporte de tu cuenta.",
  "La academia, los audiolibros y todo el contenido formativo.",
  "Las mejoras y actualizaciones constantes de la plataforma.",
];

export function BusinessRegistration({
  initialBusiness,
}: {
  slug: string;
  initialBusiness: Business | null;
}) {
  const business = initialBusiness;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  function buildWhatsappUrl(): string {
    const message = [
      `¡Hola! Quiero unirme a ${business?.name ?? "la academia"}.`,
      "",
      "Mis datos:",
      `• Nombre: ${name.trim()}`,
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
      <div className="ns-shell">
        <div className="ns-app" style={{ justifyContent: "center", padding: 24 }}>
          <Card pad={24} style={{ textAlign: "center", margin: "auto" }}>
            <div style={{ margin: "0 auto", width: 64 }}>
              <IconCircle icon="help" tone="gray" size={64} />
            </div>
            <h1 style={{ fontSize: 22, marginTop: 14 }}>Link de registro no encontrado</h1>
            <p style={{ fontSize: 17, color: "var(--text-2)", marginTop: 8 }}>
              Revisa que el link del negocio esté escrito correctamente.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const tenant = business.primaryColor || "var(--blue)";

  return (
    <div className="ns-shell">
      <div className="ns-app ns-screen" style={brandThemeVars(business.primaryColor) as CSSProperties}>
        {/* Brand header del negocio */}
        <header
          style={{
            padding: "calc(24px + var(--safe-top, 0px)) 20px 6px",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <span
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: tenant,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: 17,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              business.name.slice(0, 2).toUpperCase()
            )}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 18, lineHeight: 1.1 }}>
              {business.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>Plataforma NetScale</div>
          </div>
        </header>

        <div
          className="ns-pad"
          style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 10, paddingBottom: 36 }}
        >
          {done ? (
            <RegistrationDone businessName={business.name} waUrl={waUrl} />
          ) : (
            <>
              {/* Hero */}
              <div>
                <Chip tone="blue" icon="sparkles">Desde tu celular</Chip>
                <h1 style={{ fontSize: 27, lineHeight: 1.18, marginTop: 12 }}>
                  La herramienta que transforma tu forma de hacer redes de mercadeo
                </h1>
                <p style={{ fontSize: 17, color: "var(--text-2)", marginTop: 10, lineHeight: 1.5 }}>
                  Todo para aprender, organizarte y comunicarte mejor con tus clientes, en un solo lugar.
                </p>
              </div>

              {/* Formulario de registro */}
              <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <h2 style={{ fontSize: 23 }}>Crea tu cuenta</h2>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 34, color: "var(--blue)" }}>
                      S/ {PAYMENT.pricePen}
                    </span>
                    <span style={{ fontSize: 17, color: "var(--text-2)" }}>al mes</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 2 }}>
                    Aporte de operación y mantenimiento
                  </p>
                </div>

                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Step n={1} title="Escribe tus datos">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Field label="Nombre completo">
                        <TextInput value={name} onChange={setName} placeholder="Ej. Rosa Martínez" />
                      </Field>
                      <Field label="Tu número de WhatsApp">
                        <TextInput value={phone} onChange={setPhone} type="tel" placeholder="Ej. 987 654 321" />
                      </Field>
                    </div>
                  </Step>

                  <Step n={2} title={`Paga S/ ${PAYMENT.pricePen} con Yape`}>
                    <p style={{ fontSize: 16, color: "var(--text-2)" }}>
                      Abre tu app de Yape y envía el pago a este número:
                    </p>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        border: "2px dashed var(--border-strong)",
                        background: "var(--blue-soft)",
                        borderRadius: 14,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 22, letterSpacing: ".02em" }}>
                          {PAYMENT.yapeDisplay}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-2)" }}>Número para Yape</div>
                      </div>
                      <button
                        type="button"
                        className="ns-press"
                        onClick={copyYape}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "var(--surface)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: 10,
                          padding: "10px 13px",
                          color: "var(--blue)",
                          fontWeight: 600,
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="copy" size={18} color="var(--blue)" />
                        Copiar
                      </button>
                    </div>
                  </Step>

                  <Step n={3} title="Envía tu comprobante" last>
                    <p style={{ fontSize: 16, color: "var(--text-2)" }}>
                      Toca el botón verde: se abrirá WhatsApp con tus datos ya escritos. Solo adjunta la captura de tu
                      pago y envíalo.
                    </p>
                  </Step>

                  <label
                    className="ns-press"
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: 14,
                      fontSize: 15,
                      color: "var(--text-2)",
                      lineHeight: 1.4,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      style={{ width: 22, height: 22, marginTop: 1, accentColor: "var(--blue)", flexShrink: 0 }}
                    />
                    <span>
                      {LEGAL_DISCLAIMERS.signup}{" "}
                      <a href="/terminos" target="_blank" style={{ color: "var(--blue)", fontWeight: 600 }}>
                        Términos
                      </a>{" "}
                      y{" "}
                      <a href="/privacidad" target="_blank" style={{ color: "var(--blue)", fontWeight: 600 }}>
                        Privacidad
                      </a>
                      .
                    </span>
                  </label>

                  <Btn
                    type="submit"
                    size="xl"
                    variant="success"
                    icon="whatsapp"
                    style={{ background: "#25D366", boxShadow: "0 4px 14px rgba(37,211,102,.32)" }}
                  >
                    Enviar mis datos por WhatsApp
                  </Btn>
                  <p style={{ fontSize: 14, color: "var(--text-2)", textAlign: "center", lineHeight: 1.45 }}>
                    Apenas confirmemos tu aporte, creamos tu cuenta y te enviamos tu acceso por WhatsApp.
                  </p>
                </form>
              </Card>

              {/* Beneficios */}
              <div>
                <h2 style={{ fontSize: 21, marginBottom: 2 }}>Todo lo que tendrás incluido</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 12 }}>
                  {INCLUDED_FEATURES.map((f) => (
                    <Card key={f.title} pad={14} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <IconCircle icon={f.icon} tone={f.tone} size={44} />
                      <div>
                        <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
                          {f.title}
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 3, lineHeight: 1.35 }}>{f.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Qué cubre el aporte */}
              <Card pad={18} style={{ background: "var(--blue-soft)", border: "1px solid var(--blue-tint)" }}>
                <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="sparkles" size={22} color="var(--blue)" />
                  Tu aporte de S/ {PAYMENT.pricePen} al mes
                </h3>
                <p style={{ fontSize: 15, color: "var(--text-2)", marginTop: 8, lineHeight: 1.5 }}>
                  No es un cobro por usar la plataforma: es lo que la mantiene viva y al día. Tu aporte sostiene:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
                  {CONTRIBUTION_COVERS.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 15, lineHeight: 1.4 }}>
                      <Icon name="checkCircle" size={20} color="var(--blue)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Avisos legales */}
              <Note tone="orange" icon="shield">{LEGAL_DISCLAIMERS.sales}</Note>
              <Note tone="gray" icon="shield">
                NetScale es una plataforma independiente. No somos {business.name} ni su
                representante; cada negocio es responsable de su propia actividad. No buscamos
                suplantar al negocio ni apropiarnos de su nombre, logo o identidad: los mostramos
                solo para indicar a qué comunidad te unes.
              </Note>

              {/* Footer NetScale */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
                <Logo size={17} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  last,
  children,
}: {
  n: number;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            background: "var(--blue)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        {!last && <span style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: last ? 0 : 2 }}>
        <h3 style={{ fontSize: 17, marginBottom: 8 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function RegistrationDone({ businessName, waUrl }: { businessName: string; waUrl: string }) {
  const steps = [
    `Paga S/ ${PAYMENT.pricePen} por Yape al ${PAYMENT.yapeDisplay}.`,
    "Envíanos la captura por WhatsApp.",
    "Creamos tu cuenta y te enviamos tu acceso.",
  ];
  return (
    <Card pad={22} style={{ textAlign: "center" }}>
      <span
        style={{
          width: 68,
          height: 68,
          borderRadius: 999,
          background: "#25D366",
          display: "grid",
          placeItems: "center",
          margin: "0 auto",
          boxShadow: "0 6px 18px rgba(37,211,102,.32)",
        }}
      >
        <Icon name="whatsapp" size={34} />
      </span>
      <h2 style={{ fontSize: 24, marginTop: 16 }}>¡Ya casi terminas!</h2>
      <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 10, lineHeight: 1.5 }}>
        Te abrimos WhatsApp para enviar tu mensaje a {businessName}. Ahí solo{" "}
        <strong style={{ color: "var(--text)" }}>adjunta la captura de tu pago por Yape</strong> y envíalo.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18, textAlign: "left" }}>
        {steps.map((t) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16, lineHeight: 1.4 }}>
            <Icon name="checkCircle" size={22} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ns-press"
          style={{
            marginTop: 20,
            height: 60,
            borderRadius: "var(--r-btn)",
            background: "#25D366",
            color: "#fff",
            display: "inline-flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          <Icon name="whatsapp" size={24} />
          ¿No se abrió? Abrir WhatsApp
        </a>
      ) : null}
    </Card>
  );
}
