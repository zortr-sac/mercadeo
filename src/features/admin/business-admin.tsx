"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Copy,
  Globe2,
  LinkIcon,
  Palette,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { DEFAULT_SUBSCRIPTION_PRICE_PEN } from "@/lib/constants";
import {
  BUSINESS_CONTENT_TYPE_LABELS,
  type Business,
  type BusinessContent,
  type BusinessContentType,
} from "@/data/types";
import {
  createBusinessAction,
  createBusinessContentAction,
  updateBusinessDomainAction,
} from "./business-actions";

function origin() {
  if (typeof window === "undefined") return "http://localhost:3000";
  return window.location.origin;
}

export function BusinessAdmin({
  businesses: initialBusinesses,
  contentByBusiness: initialContent,
}: {
  businesses: Business[];
  contentByBusiness: Record<string, BusinessContent[]>;
}) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [contentMap, setContentMap] =
    useState<Record<string, BusinessContent[]>>(initialContent);
  const [selectedId, setSelectedId] = useState(initialBusinesses[0]?.id ?? "");
  const selected = useMemo(
    () => businesses.find((business) => business.id === selectedId) ?? businesses[0],
    [businesses, selectedId],
  );
  const selectedContent = selected ? contentMap[selected.id] ?? [] : [];

  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [domain, setDomain] = useState("");

  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentCategory, setContentCategory] = useState("Inicio");
  const [contentType, setContentType] = useState<BusinessContentType>("video");
  const [pendingBusiness, startBusinessTransition] = useTransition();
  const [pendingContent, startContentTransition] = useTransition();

  function createBusiness(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || !adminEmail.includes("@")) {
      toast.error("Completa nombre y correo del admin.");
      return;
    }
    startBusinessTransition(async () => {
      try {
        const business = await createBusinessAction({
          name,
          adminEmail,
          primaryColor,
          accentColor,
          customDomain: domain || null,
        });
        setBusinesses((prev) => [business, ...prev]);
        setContentMap((prev) => ({ ...prev, [business.id]: [] }));
        setSelectedId(business.id);
        setName("");
        setAdminEmail("");
        setDomain("");
        toast.success("Negocio creado.");
      } catch {
        toast.error("No se pudo crear el negocio.");
      }
    });
  }

  function copyRegistrationLink(business: Business) {
    const url = business.customDomain
      ? `https://${business.customDomain}${business.registrationPath}`
      : `${origin()}${business.registrationPath}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de registro copiado.");
  }

  function setSelectedDomain(value: string) {
    if (!selected) return;
    const next = value || null;
    setBusinesses((prev) =>
      prev.map((business) =>
        business.id === selected.id ? { ...business, customDomain: next } : business,
      ),
    );
  }

  function saveDomain() {
    if (!selected) return;
    const hostname = selected.customDomain;
    startBusinessTransition(async () => {
      try {
        await updateBusinessDomainAction(selected.id, hostname);
      } catch {
        toast.error("No se pudo guardar el dominio.");
      }
    });
  }

  function publishContent(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    if (contentTitle.trim().length < 3 || contentUrl.trim().length < 1) {
      toast.error("Completa titulo y URL del contenido.");
      return;
    }
    const business = selected;
    startContentTransition(async () => {
      try {
        const item = await createBusinessContentAction({
          businessId: business.id,
          title: contentTitle,
          description: contentDescription,
          type: contentType,
          url: contentUrl,
          category: contentCategory,
          isPublished: true,
        });
        setContentMap((prev) => ({
          ...prev,
          [business.id]: [item, ...(prev[business.id] ?? [])],
        }));
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === business.id ? { ...b, contentCount: b.contentCount + 1 } : b,
          ),
        );
        setContentTitle("");
        setContentDescription("");
        setContentUrl("");
        toast.success("Contenido agregado.");
      } catch {
        toast.error("No se pudo publicar el contenido.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="space-y-5 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="font-display text-2xl font-semibold">Crear negocio</h2>
          <p className="mt-1 text-muted-foreground">
            Define marca, colores y el administrador inicial del negocio.
          </p>
        </div>

        <form onSubmit={createBusiness} className="space-y-4">
          <Field label="Nombre del negocio" htmlFor="businessName">
            <Input
              id="businessName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Bienestar Andino"
            />
          </Field>
          <Field label="Correo del admin" htmlFor="adminEmail">
            <Input
              id="adminEmail"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              type="email"
              placeholder="admin@negocio.com"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Color principal" htmlFor="primaryColor">
              <Input
                id="primaryColor"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                type="color"
                className="h-12 p-1"
              />
            </Field>
            <Field label="Color acento" htmlFor="accentColor">
              <Input
                id="accentColor"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                type="color"
                className="h-12 p-1"
              />
            </Field>
          </div>
          <Field label="Dominio propio" htmlFor="domain" hint="Opcional. Ej. academia.marca.com">
            <Input
              id="domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="academia.marca.com"
            />
          </Field>
          <Button type="submit" className="w-full" loading={pendingBusiness}>
            <Plus className="size-5" />
            Crear negocio
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-display text-xl font-semibold">Negocios</h3>
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => setSelectedId(business.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                selected?.id === business.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{business.name}</p>
                  <p className="mt-1 text-muted-foreground">{business.adminEmail}</p>
                </div>
                <Badge variant={business.status === "active" ? "success" : "muted"}>
                  {business.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1"
                  style={{ color: business.primaryColor }}
                >
                  <Palette className="size-4" />
                  Marca
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1">
                  <Globe2 className="size-4" />
                  {business.customDomain ?? "Sin dominio"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <section className="space-y-5 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {selected.name}
              </h2>
              <p className="mt-1 text-muted-foreground">
                S/ {DEFAULT_SUBSCRIPTION_PRICE_PEN} mensual · {selected.memberCount} clientes ·{" "}
                {selectedContent.length} contenidos
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => copyRegistrationLink(selected)}
            >
              <Copy className="size-5" />
              Copiar registro
            </Button>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Globe2 className="size-5 text-brand-700" />
              <h3 className="font-display text-xl font-semibold">Dominio</h3>
            </div>
            <Field label="Dominio conectado" htmlFor="selectedDomain">
              <Input
                id="selectedDomain"
                value={selected.customDomain ?? ""}
                onChange={(event) => setSelectedDomain(event.target.value)}
                onBlur={saveDomain}
              />
            </Field>
            <p className="mt-3 text-muted-foreground">
              En produccion, este dominio debe apuntar a Vercel y guardarse en
              Supabase para resolver el tenant por host.
            </p>
          </div>

          <form onSubmit={publishContent} className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Upload className="size-5 text-brand-700" />
              <h3 className="font-display text-xl font-semibold">Subir contenido</h3>
            </div>
            <Field label="Titulo" htmlFor="contentTitle">
              <Input
                id="contentTitle"
                value={contentTitle}
                onChange={(event) => setContentTitle(event.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo" htmlFor="contentType">
                <Select
                  id="contentType"
                  value={contentType}
                  onChange={(event) =>
                    setContentType(event.target.value as BusinessContentType)
                  }
                >
                  {Object.entries(BUSINESS_CONTENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Categoria" htmlFor="contentCategory">
                <Input
                  id="contentCategory"
                  value={contentCategory}
                  onChange={(event) => setContentCategory(event.target.value)}
                />
              </Field>
            </div>
            <Field label="URL del recurso" htmlFor="contentUrl">
              <Input
                id="contentUrl"
                value={contentUrl}
                onChange={(event) => setContentUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Descripcion" htmlFor="contentDescription">
              <Textarea
                id="contentDescription"
                value={contentDescription}
                onChange={(event) => setContentDescription(event.target.value)}
                rows={3}
              />
            </Field>
            <Button type="submit" loading={pendingContent}>
              <Upload className="size-5" />
              Publicar
            </Button>
          </form>

          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Contenido publicado</h3>
            {selectedContent.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge variant={item.isPublished ? "success" : "muted"}>
                    {BUSINESS_CONTENT_TYPE_LABELS[item.type]}
                  </Badge>
                </div>
                <a
                  href={item.url}
                  className="mt-3 inline-flex items-center gap-2 text-brand-700 hover:underline"
                >
                  <LinkIcon className="size-4" />
                  Abrir recurso
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
