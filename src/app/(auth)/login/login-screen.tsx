"use client";
// Pantalla 2 — Acceso (login). Ported 1:1 from prototipo/screens-entry.jsx,
// wired to the real Supabase `login` server action.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, TextInput, Btn, TopBarSub } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import { login } from "./actions";

export function LoginScreen() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    if (!email.includes("@") || pass.length < 1) {
      toast.error("Escribe tu correo y contraseña.");
      return;
    }
    start(async () => {
      try {
        await login(email, pass);
      } catch {
        toast.error("Correo o contraseña incorrectos.");
      }
    });
  };

  return (
    <>
      <TopBarSub title="" onBack={() => router.push(ROUTES.bienvenida)} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Hola, qué bueno verte</h1>
          <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: 6 }}>Entra para continuar</p>
        </div>
        <Field label="Correo">
          <TextInput value={email} onChange={setEmail} type="email" placeholder="tucorreo@ejemplo.com" />
        </Field>
        <Field label="Contraseña">
          <TextInput
            value={pass} onChange={setPass} type={show ? "text" : "password"} placeholder="••••••••"
            right={
              <button className="ns-press" onClick={() => setShow((s) => !s)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 12px",
                color: "var(--blue)", fontWeight: 600, fontSize: 16,
              }}>
                <Icon name={show ? "eyeOff" : "eye"} size={22} color="var(--blue)" />
                {show ? "Ocultar" : "Mostrar"}
              </button>
            }
          />
        </Field>
        <div style={{ height: 4 }} />
        <Btn size="xl" onClick={submit}>{pending ? "Entrando…" : "Entrar"}</Btn>
        <button
          className="ns-press"
          onClick={() => toast("Pide ayuda a tu líder para recuperar tu contraseña.")}
          style={{ color: "var(--blue)", fontSize: 18, fontWeight: 600, padding: 10, alignSelf: "center" }}
        >¿Olvidaste tu contraseña?</button>
      </div>
    </>
  );
}
