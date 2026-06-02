import { cn } from "@/lib/utils";

/**
 * Renderizador de markdown minimalista y seguro (sin dependencias externas).
 * Soporta: encabezados (##, ###), listas (-, 1.), tablas simples, negrita (**),
 * citas (>), y párrafos. Escapa HTML para prevenir XSS.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Aplica negrita inline **texto** (sobre texto ya escapado). */
function inline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

type Block =
  | { kind: "h2" | "h3" | "p" | "quote"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

/** Parsea markdown a bloques estructurados. */
function parse(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ kind: "h3", text: trimmed.slice(4) });
      i++;
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ kind: "h2", text: trimmed.slice(3) });
      i++;
    } else if (trimmed.startsWith("> ")) {
      blocks.push({ kind: "quote", text: trimmed.slice(2) });
      i++;
    } else if (trimmed.startsWith("|") && lines[i + 1]?.includes("---")) {
      const head = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i].split("|").map((c) => c.trim()).filter(Boolean),
        );
        i++;
      }
      blocks.push({ kind: "table", head, rows });
    } else if (/^[-*] /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ kind: "ul", items });
    } else if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
    } else {
      blocks.push({ kind: "p", text: trimmed });
      i++;
    }
  }
  return blocks;
}

/** Componente que renderiza markdown como JSX seguro. */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parse(content);
  const html = (s: string) => ({ __html: inline(escapeHtml(s)) });

  return (
    <div className={cn("space-y-3 leading-relaxed", className)}>
      {blocks.map((b, idx) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2
                key={idx}
                className="font-display text-xl font-bold tracking-tight"
                dangerouslySetInnerHTML={html(b.text)}
              />
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="font-display text-base font-semibold"
                dangerouslySetInnerHTML={html(b.text)}
              />
            );
          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-brand-500 bg-brand-50 py-2 pl-4 pr-3 text-muted-foreground dark:bg-brand-900/20"
                dangerouslySetInnerHTML={html(b.text)}
              />
            );
          case "ul":
            return (
              <ul key={idx} className="list-disc space-y-1 pl-5">
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={html(it)} />
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="list-decimal space-y-1 pl-5">
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={html(it)} />
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={idx} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {b.head.map((h, j) => (
                        <th
                          key={j}
                          className="px-3 py-2 text-left font-semibold"
                          dangerouslySetInnerHTML={html(h)}
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="border-b border-border/50">
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-3 py-2"
                            dangerouslySetInnerHTML={html(cell)}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <p key={idx} dangerouslySetInnerHTML={html(b.text)} />
            );
        }
      })}
    </div>
  );
}
