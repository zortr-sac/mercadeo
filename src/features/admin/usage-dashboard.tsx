"use client";
// Panel "Consumo" — dashboard ejecutivo del gasto de IA por negocio. KPIs con
// comparativos, gasto acumulado + proyección a fin de mes, desglose por función,
// tendencia mensual, top de miembros y gestión de límites. Gráficos con recharts.
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity,
  BarChart3,
  Coins,
  Gauge,
  PieChart as PieIcon,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { ManagerCard, ManagerHeader, NoticePanel } from "./admin-ui";
import type { PricingDisplay } from "@/lib/ai/pricing";
import type { UsageMetrics } from "./usage-metrics";
import { setUserLimitAction } from "./usage-actions";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;
const solesFine = (n: number) => `S/ ${n.toFixed(n > 0 && n < 1 ? 3 : 2)}`;

const BRAND = "#1D4ED8";
const PALETTE = ["#1D4ED8", "#EA580C", "#16A34A", "#9333EA", "#0891B2", "#DB2777"];

type Member = { id: string; name: string; phone: string | null };

/* ── Tarjeta KPI ──────────────────────────────────────────────────── */
function Kpi({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {children && <div className="mt-1 text-xs">{children}</div>}
    </div>
  );
}

/* ── Comparativo vs mes anterior (para costos: subir = malo) ──────── */
function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev <= 0) {
    return <span className="text-muted-foreground">sin mes anterior para comparar</span>;
  }
  const pct = ((now - prev) / prev) * 100;
  const up = pct >= 0;
  const Cls = up ? "text-destructive" : "text-emerald-600";
  const Ico = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${Cls}`}>
      <Ico className="size-3" />
      {Math.abs(pct).toFixed(0)}% vs mes anterior
    </span>
  );
}

/* ── Marco de gráfico con skeleton (evita mismatch SSR/recharts) ──── */
function ChartFrame({
  mounted,
  height,
  children,
}: {
  mounted: boolean;
  height: number;
  children: React.ReactNode;
}) {
  if (!mounted) {
    return <div className="animate-pulse rounded-[var(--radius-md)] bg-muted" style={{ height }} />;
  }
  return <div style={{ height }}>{children}</div>;
}

export function UsageDashboard({
  businessId,
  metrics,
  members,
  overrides,
  defaultLimitPen,
  pricing,
}: {
  businessId: string;
  metrics: UsageMetrics;
  members: Member[];
  overrides: Record<string, number>;
  defaultLimitPen: number;
  pricing: PricingDisplay;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dark = resolvedTheme === "dark";
  const axisColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "#1e293b" : "#e2e8f0";
  const tooltipStyle = {
    background: dark ? "#0f172a" : "#ffffff",
    border: `1px solid ${gridColor}`,
    borderRadius: 12,
    fontSize: 13,
    color: dark ? "#e2e8f0" : "#0f172a",
    boxShadow: "0 8px 24px rgba(15,23,42,.12)",
  };

  const limitOf = (id: string) => overrides[id] ?? defaultLimitPen;

  // Gasto acumulado del mes + línea de proyección a fin de mes.
  const cumulative = useMemo(() => {
    const daily = metrics.business.daily;
    const denom = Math.max(1, metrics.daysInMonth - metrics.dayOfMonth);
    return daily.map((_, i) => {
      const day = i + 1;
      const past = day <= metrics.dayOfMonth;
      const real = past ? daily.slice(0, i + 1).reduce((s, x) => s + x.costPen, 0) : null;
      const proj =
        day >= metrics.dayOfMonth
          ? metrics.totalPen + (metrics.projectedPen - metrics.totalPen) * ((day - metrics.dayOfMonth) / denom)
          : null;
      return { day, real, proj };
    });
  }, [metrics]);

  const topMembers = useMemo(
    () =>
      members
        .map((m) => ({ name: m.name, costPen: metrics.byUser[m.id]?.costPen ?? 0 }))
        .filter((m) => m.costPen > 0)
        .sort((a, b) => b.costPen - a.costPen)
        .slice(0, 7),
    [members, metrics],
  );

  const rows = [...members].sort((a, b) => {
    const sa = metrics.byUser[a.id]?.costPen ?? 0;
    const sb = metrics.byUser[b.id]?.costPen ?? 0;
    return sb - sa || a.name.localeCompare(b.name);
  });

  const topEndpoint = metrics.byEndpoint[0];
  const topEndpointPct =
    topEndpoint && metrics.totalPen > 0 ? Math.round((topEndpoint.costPen / metrics.totalPen) * 100) : 0;
  const overBudgetMembers = rows.filter((m) => (metrics.byUser[m.id]?.costPen ?? 0) >= limitOf(m.id)).length;

  function openEdit(id: string) {
    setEditingId(id);
    setLimitInput(String(limitOf(id)));
  }

  function saveLimit(id: string) {
    const value = Number(limitInput.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Escribe un monto válido en soles.");
      return;
    }
    startTransition(async () => {
      const res = await setUserLimitAction({ businessId, userId: id, limitPen: value });
      if (res.ok) {
        toast.success("Límite actualizado para este mes.");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Coins} label={`Gasto · ${metrics.monthLabel}`} value={soles(metrics.totalPen)}>
          <Delta now={metrics.totalPen} prev={metrics.prevMonthTotalPen} />
        </Kpi>
        <Kpi icon={TrendingUp} label="Proyección a fin de mes" value={soles(metrics.projectedPen)}>
          <span className="text-muted-foreground">si sigue el ritmo actual</span>
        </Kpi>
        <Kpi icon={Activity} label="Generaciones" value={String(metrics.totalCount)}>
          <span className="text-muted-foreground">
            {metrics.activeUsers} de {members.length} miembros activos
          </span>
        </Kpi>
        <Kpi
          icon={PieIcon}
          label="Mayor gasto por función"
          value={topEndpoint ? topEndpoint.label : "—"}
        >
          <span className="text-muted-foreground">
            {topEndpoint ? `${soles(topEndpoint.costPen)} · ${topEndpointPct}% del total` : "sin datos aún"}
          </span>
        </Kpi>
      </div>

      {overBudgetMembers > 0 && (
        <NoticePanel tone="warn">
          <span className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="size-5" aria-hidden />
            {overBudgetMembers} miembro{overBudgetMembers > 1 ? "s" : ""} llegó a su límite este mes
          </span>
          <p className="mt-1">Revísalos abajo para ampliar su límite si lo necesitan.</p>
        </NoticePanel>
      )}

      {/* Acumulado + proyección, y donut por función */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ManagerCard>
            <ManagerHeader
              icon={BarChart3}
              title="Gasto acumulado del mes"
              description="Lo gastado hasta hoy (área) y la proyección a fin de mes (línea punteada)."
            />
            <ChartFrame mounted={mounted} height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cumulative} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="ns-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v: number) => `S/${v.toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => solesFine(Number(value))}
                    labelFormatter={(l) => `Día ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="real"
                    name="Acumulado"
                    stroke={BRAND}
                    strokeWidth={2.5}
                    fill="url(#ns-fill)"
                    connectNulls
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proj"
                    name="Proyección"
                    stroke={BRAND}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartFrame>
          </ManagerCard>
        </div>

        <div className="lg:col-span-2">
          <ManagerCard>
            <ManagerHeader
              icon={PieIcon}
              title="Gasto por función"
              description="Dónde se va el dinero este mes."
            />
            {metrics.byEndpoint.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos aún este mes.</p>
            ) : (
              <>
                <ChartFrame mounted={mounted} height={170}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.byEndpoint}
                        dataKey="costPen"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={75}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {metrics.byEndpoint.map((e, i) => (
                          <Cell key={e.key} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => solesFine(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartFrame>
                <ul className="mt-3 space-y-1.5">
                  {metrics.byEndpoint.map((e, i) => {
                    const pct = metrics.totalPen > 0 ? Math.round((e.costPen / metrics.totalPen) * 100) : 0;
                    return (
                      <li key={e.key} className="flex items-center gap-2 text-sm">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        <span className="flex-1 truncate">{e.label}</span>
                        <span className="font-medium">{soles(e.costPen)}</span>
                        <span className="w-9 text-right text-muted-foreground">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </ManagerCard>
        </div>
      </div>

      {/* Tendencia mensual + Top miembros */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ManagerCard>
          <ManagerHeader
            icon={BarChart3}
            title="Tendencia mensual"
            description="Gasto total de IA por mes (últimos 6)."
          />
          <ChartFrame mounted={mounted} height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.business.monthly} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v: number) => `S/${v.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(148,163,184,.12)" }}
                  formatter={(value) => solesFine(Number(value))}
                />
                <Bar dataKey="costPen" name="Gasto" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ManagerCard>

        <ManagerCard>
          <ManagerHeader
            icon={Users}
            title="Top miembros por gasto"
            description="Quién consume más inteligencia artificial este mes."
          />
          {topMembers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay consumo este mes.</p>
          ) : (
            <ChartFrame mounted={mounted} height={Math.max(120, topMembers.length * 38)}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMembers}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `S/${v.toFixed(2)}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: axisColor, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(148,163,184,.12)" }}
                    formatter={(value) => solesFine(Number(value))}
                  />
                  <Bar dataKey="costPen" name="Gasto" fill={BRAND} radius={[0, 6, 6, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          )}
        </ManagerCard>
      </div>

      {/* Gestión por miembro */}
      <ManagerCard>
        <ManagerHeader
          icon={Gauge}
          title="Consumo y límites por miembro"
          description="Gasto del mes, límite y tendencia de cada miembro. Puedes ampliar el límite solo para este mes."
        />
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aún no hay miembros"
            description="Agrega miembros en la pestaña Líderes para ver su consumo."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((m) => {
              const metric = metrics.byUser[m.id];
              const spent = metric?.costPen ?? 0;
              const count = metric?.count ?? 0;
              const limit = limitOf(m.id);
              const custom = overrides[m.id] != null;
              const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 100;
              const over = spent >= limit;
              const expanded = expandedId === m.id;
              const editing = editingId === m.id;
              return (
                <div key={m.id} className="rounded-[var(--radius-md)] border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{m.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {m.phone || "—"} · {count} generaciones
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${over ? "text-destructive" : ""}`}>
                        {soles(spent)} <span className="text-muted-foreground">/ {soles(limit)}</span>
                      </p>
                      {custom && <p className="text-xs text-muted-foreground">límite personalizado</p>}
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${over ? "bg-destructive" : "bg-brand-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(m.id)}>
                      <SlidersHorizontal className="size-4" aria-hidden />
                      Ampliar límite
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expanded ? null : m.id)}
                    >
                      <Activity className="size-4" aria-hidden />
                      {expanded ? "Ocultar tendencia" : "Ver tendencia"}
                    </Button>
                  </div>

                  {editing && (
                    <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-muted/40 p-3">
                      <Field label="Nuevo límite para este mes (soles)" htmlFor={`limit-${m.id}`}>
                        <Input
                          id={`limit-${m.id}`}
                          value={limitInput}
                          onChange={(e) => setLimitInput(e.target.value)}
                          inputMode="decimal"
                          placeholder="Ej. 40"
                        />
                      </Field>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" loading={pending} onClick={() => saveLimit(m.id)}>
                          Guardar
                        </Button>
                        <Button variant="ghost" size="sm" disabled={pending} onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        El mes siguiente vuelve automáticamente a {soles(defaultLimitPen)}.
                      </p>
                    </div>
                  )}

                  {expanded && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Por día (mes actual)</p>
                        <ChartFrame mounted={mounted} height={90}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metric?.daily ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                              <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value) => solesFine(Number(value))}
                                labelFormatter={(l) => `Día ${l}`}
                              />
                              <Area type="monotone" dataKey="costPen" stroke={BRAND} strokeWidth={2} fill={BRAND} fillOpacity={0.16} dot={false} />
                              <XAxis dataKey="label" hide />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartFrame>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Por mes</p>
                        <ChartFrame mounted={mounted} height={90}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metric?.monthly ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,.12)" }} formatter={(value) => solesFine(Number(value))} />
                              <Bar dataKey="costPen" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={26} />
                              <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartFrame>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ManagerCard>

      {/* Costos de referencia (solo lectura) */}
      <ManagerCard>
        <ManagerHeader
          icon={SlidersHorizontal}
          title="Costos de referencia"
          description="Precios oficiales con los que se calcula el costo. Se actualizan en el código."
        />
        <NoticePanel>
          <ul className="space-y-1 text-sm">
            <li>Modelo: <span className="font-mono">{pricing.model}</span></li>
            <li>Texto — entrada: ${pricing.inputPerM.toFixed(2)} / 1M tokens</li>
            <li>Texto — salida: ${pricing.outputPerM.toFixed(2)} / 1M tokens</li>
            <li>Imagen: ${pricing.imagePerImage.toFixed(3)} por imagen ({pricing.imageTokens} tokens)</li>
            <li>Tipo de cambio: S/ {pricing.usdToPen.toFixed(2)} por dólar</li>
            <li>Colchón de seguridad: ×{pricing.safetyMultiplier.toFixed(2)}</li>
            <li>Presupuesto por miembro/mes: {soles(pricing.monthlyBudgetPen)}</li>
          </ul>
        </NoticePanel>
      </ManagerCard>
    </div>
  );
}
