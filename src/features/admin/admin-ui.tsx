import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Encabezado de una sección de gestión del panel admin.
 * Más denso que el de la app cliente: título + descripción + acción a la derecha.
 */
export function ManagerHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

/**
 * Tarjeta contenedora de una sección de gestión.
 * Reproduce el lenguaje visual del repo (card + borde + sombra suave).
 */
export function ManagerCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "space-y-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Fila de un listado de gestión (denso): contenido a la izquierda,
 * acciones a la derecha. Pensada para tablas/listas administrativas.
 */
export function ManagerRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Aviso destacado (cálido) para notas e información contextual. */
export function NoticePanel({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-4 text-base leading-relaxed",
        tone === "warn"
          ? "border-gold-200 bg-gold-50 text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-200"
          : "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-100",
      )}
    >
      {children}
    </div>
  );
}
