"use client";
// Pantalla 15 — Mis contactos (CRM). Ported 1:1 from prototipo/screens-vender.jsx,
// wired to real prospects. NO drag (hard for 60+): status changes by tap in a sheet.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, Card, Chip, Btn, Sheet, Field, TextInput, Toast, useToast } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import type { ProspectStage } from "@/data/types";
import { createProspectAction, moveProspectAction } from "@/features/duplication/prospect-actions";

export interface ProspectItem { id: string; name: string; stage: ProspectStage }

type Group = "nuevo" | "seguimiento" | "cerrado";
const STAGE_GROUP: Record<ProspectStage, Group> = {
  new: "nuevo", contacted: "nuevo", presented: "seguimiento", followup: "seguimiento", customer: "cerrado", lost: "cerrado",
};
const GROUPS: { key: Group; label: string; tone: Tone; filter: string; stage: ProspectStage }[] = [
  { key: "nuevo", label: "Nuevo", tone: "green", filter: "Nuevos", stage: "new" },
  { key: "seguimiento", label: "Seguimiento", tone: "orange", filter: "En seguimiento", stage: "followup" },
  { key: "cerrado", label: "Cerrado", tone: "gray", filter: "Cerrados", stage: "customer" },
];
const GROUP_BY_KEY: Record<Group, (typeof GROUPS)[number]> = Object.fromEntries(GROUPS.map((g) => [g.key, g])) as Record<Group, (typeof GROUPS)[number]>;
const FILTERS = ["Todos", "Nuevos", "En seguimiento", "Cerrados"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function ProspectosScreen({ prospects }: { prospects: ProspectItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("Todos");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [msg, flash] = useToast();
  const [, start] = useTransition();

  const shown = prospects.filter((p) => filter === "Todos" || GROUP_BY_KEY[STAGE_GROUP[p.stage]].filter === filter);
  const sheetProspect = prospects.find((p) => p.id === sheetId);
  const openCopiloto = (id: string) => router.push(`${ROUTES.vender}/prospectos/${id}`);

  const changeStage = (id: string, stage: ProspectStage) => {
    setSheetId(null);
    flash("Estado actualizado");
    start(async () => {
      try {
        await moveProspectAction(id, stage);
        router.refresh();
      } catch {
        flash("No se pudo actualizar");
      }
    });
  };
  const addContact = () => {
    if (newName.trim().length < 2) return;
    const name = newName.trim();
    const phone = newPhone.trim() || null;
    setAdding(false);
    setNewName("");
    setNewPhone("");
    flash("Contacto agregado");
    start(async () => {
      try {
        await createProspectAction({ name, phone, email: null, stage: "new", interest: "product", notes: "", nextActionAt: null });
        router.refresh();
      } catch {
        flash("No se pudo agregar");
      }
    });
  };

  return (
    <>
      <TopBarSub title="Mis contactos" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Btn size="lg" icon="plus" onClick={() => setAdding(true)}>Agregar contacto</Btn>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, margin: "0 -2px" }}>
          {FILTERS.map((f) => (
            <button key={f} className="ns-press" onClick={() => setFilter(f)} style={{
              flexShrink: 0, minHeight: 44, padding: "0 18px", borderRadius: 999, fontSize: 16, fontWeight: 600,
              background: filter === f ? "var(--blue)" : "var(--surface)",
              color: filter === f ? "#fff" : "var(--text-2)",
              border: filter === f ? "none" : "1.5px solid var(--border)",
            }}>{f}</button>
          ))}
        </div>
        {shown.length === 0 && (
          <p style={{ fontSize: 17, color: "var(--text-2)", textAlign: "center", marginTop: 12 }}>
            {prospects.length === 0 ? "Aún no tienes contactos. Toca «Agregar contacto»." : "No hay contactos en este grupo."}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((p) => {
            const g = GROUP_BY_KEY[STAGE_GROUP[p.stage]];
            return (
              <Card key={p.id} pad={14} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 84 }}>
                <button className="ns-press" onClick={() => openCopiloto(p.id)} style={{
                  width: 50, height: 50, borderRadius: 999, flexShrink: 0, border: "none",
                  background: "linear-gradient(135deg, var(--blue), var(--blue-dark))", color: "#fff",
                  fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 18,
                }}>{initials(p.name)}</button>
                <button className="ns-press" onClick={() => openCopiloto(p.id)} style={{
                  flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                  <div style={{ marginTop: 5 }}><Chip tone={g.tone}>{g.label}</Chip></div>
                </button>
                <button className="ns-press" onClick={() => setSheetId(p.id)} style={{
                  flexShrink: 0, padding: "10px 14px", borderRadius: 12, color: "var(--blue)",
                  fontWeight: 600, fontSize: 16, border: "1.5px solid var(--border)", background: "var(--surface)",
                }}>Cambiar</button>
              </Card>
            );
          })}
        </div>
      </div>

      <Sheet open={sheetId !== null} onClose={() => setSheetId(null)} title="Cambiar estado">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GROUPS.map((g) => {
            const isCurrent = sheetProspect ? STAGE_GROUP[sheetProspect.stage] === g.key : false;
            return (
              <button key={g.key} className="ns-press" onClick={() => sheetId && changeStage(sheetId, g.stage)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14,
                border: "1.5px solid var(--border)", background: "var(--surface)", textAlign: "left",
              }}>
                <Chip tone={g.tone}>{g.label}</Chip>
                <span style={{ flex: 1 }} />
                {isCurrent && <Icon name="check" size={24} color="var(--green)" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </Sheet>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Nuevo contacto">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Nombre"><TextInput value={newName} onChange={setNewName} placeholder="Ej. Rosa Martínez" /></Field>
          <Field label="Teléfono (opcional)"><TextInput value={newPhone} onChange={setNewPhone} type="tel" placeholder="Ej. 999 888 777" /></Field>
          <Btn size="lg" onClick={addContact}>Guardar</Btn>
        </div>
      </Sheet>

      <Toast show={!!msg}>{msg}</Toast>
    </>
  );
}
