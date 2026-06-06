"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Btn, Card, Field, TextInput } from "@/components/netscale/ui";
import { loginWithPinAction } from "./pin-login-action";

/** Login por negocio: teléfono + PIN de 4 dígitos. Identidad NetScale. */
export function BusinessLoginScreen({
  slug,
  businessName,
  primaryColor,
  logoUrl,
}: {
  slug: string;
  businessName: string;
  primaryColor: string | null;
  logoUrl: string | null;
}) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pending, start] = useTransition();
  const tenant = primaryColor || "var(--blue)";

  function submit() {
    if (phone.replace(/\D+/g, "").length < 6) {
      toast.error("Escribe tu número de teléfono.");
      return;
    }
    if (pin.length !== 4) {
      toast.error("Tu PIN son 4 números.");
      return;
    }
    start(async () => {
      const res = await loginWithPinAction(slug, phone, pin);
      if (res && !res.ok) toast.error(res.error);
    });
  }

  return (
    <div className="ns-shell">
      <div className="ns-app ns-screen" style={{ justifyContent: "center" }}>
        <div
          className="ns-pad"
          style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 40, paddingBottom: 40 }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <span
              style={{
                width: 78,
                height: 78,
                borderRadius: 20,
                background: tenant,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: 30,
                overflow: "hidden",
              }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                businessName.slice(0, 2).toUpperCase()
              )}
            </span>
            <div>
              <h1 style={{ fontSize: 26, lineHeight: 1.15 }}>{businessName}</h1>
              <p style={{ fontSize: 17, color: "var(--text-2)", marginTop: 4 }}>
                Entra con tu teléfono y tu PIN
              </p>
            </div>
          </div>

          <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Tu número de teléfono">
              <TextInput value={phone} onChange={setPhone} type="tel" placeholder="Ej. 987 654 321" />
            </Field>
            <Field label="Tu PIN (4 números)">
              <TextInput
                value={pin}
                onChange={(v) => setPin(v.replace(/\D+/g, "").slice(0, 4))}
                type="tel"
                placeholder="••••"
              />
            </Field>
            <Btn size="xl" onClick={submit}>
              {pending ? "Entrando…" : "Entrar"}
            </Btn>
          </Card>

          <p style={{ fontSize: 16, color: "var(--text-2)", textAlign: "center" }}>
            ¿Aún no tienes cuenta?{" "}
            <a href={`/registro/${slug}`} style={{ color: "var(--blue)", fontWeight: 600 }}>
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
