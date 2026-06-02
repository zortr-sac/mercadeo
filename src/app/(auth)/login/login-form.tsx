"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { login } from "./actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 1) {
      toast.error("Escribe tu correo y contraseña.");
      return;
    }
    startTransition(async () => {
      try {
        await login(email, password);
      } catch {
        toast.error("Correo o contraseña incorrectos.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Correo" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tucorreo@ejemplo.com"
          className="h-12"
          required
        />
      </Field>

      <Field label="Contraseña" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            className="h-12 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </Field>

      <Button type="submit" loading={pending} className="w-full" size="lg">
        <LogIn className="size-5" />
        Entrar
      </Button>
    </form>
  );
}
