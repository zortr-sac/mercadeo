import type { ComplianceIssue, ComplianceResult } from "@/data/types";

const RULES: {
  code: ComplianceIssue["code"];
  label: string;
  severity: ComplianceIssue["severity"];
  patterns: RegExp[];
}[] = [
  {
    code: "income_promise",
    label: "Promesa o insinuacion de ingresos",
    severity: "block",
    patterns: [
      /ingresos?\s+(garantizados?|seguros?)/i,
      /ganar[a-z]*\s+(dinero|s\/|soles|\$)/i,
      /libertad\s+financiera/i,
      /deja(r)?\s+tu\s+trabajo/i,
      /resultados?\s+garantizados?/i,
      /seis\s+cifras/i,
    ],
  },
  {
    code: "recruiting_commission",
    label: "Pago o beneficio por reclutar",
    severity: "block",
    patterns: [
      /reclut(a|e|ar).*(gan(a|as|ar)|comision|bono)/i,
      /trae\s+\d+\s+personas/i,
      /por\s+cada\s+persona\s+que\s+(entra|ingresa|se\s+una)/i,
      /downline/i,
    ],
  },
  {
    code: "health_claim",
    label: "Afirmacion de salud no sustentada",
    severity: "review",
    patterns: [
      /cura(r)?\s+/i,
      /elimina(r)?\s+(diabetes|cancer|ansiedad|depresion)/i,
      /tratamiento\s+garantizado/i,
    ],
  },
  {
    code: "pressure",
    label: "Presion o urgencia artificial",
    severity: "review",
    patterns: [/ultima\s+oportunidad/i, /te\s+vas\s+a\s+arrepentir/i, /solo\s+hoy/i],
  },
];

export function checkCompliance(text: string): ComplianceResult {
  const issues = RULES.flatMap((rule) =>
    rule.patterns.some((pattern) => pattern.test(text))
      ? [{ code: rule.code, label: rule.label, severity: rule.severity }]
      : [],
  );

  if (issues.length === 0) {
    return { status: "safe", issues: [], suggestedText: null };
  }

  const status = issues.some((issue) => issue.severity === "block")
    ? "blocked"
    : "needs_review";

  return {
    status,
    issues,
    suggestedText: makeSafeAlternative(text),
  };
}

export function makeSafeAlternative(text: string) {
  return text
    .replace(/te\s+prometo\s+/gi, "te comparto ")
    .replace(/ingresos?\s+(garantizados?|seguros?)/gi, "informacion clara")
    .replace(/libertad\s+financiera/gi, "un metodo de aprendizaje y ventas")
    .replace(/deja(r)?\s+tu\s+trabajo/gi, "revisalo con calma")
    .replace(/resultados?\s+garantizados?/gi, "resultados que dependen de cada persona")
    .replace(/trae\s+\d+\s+personas/gi, "comparte esto con personas a quienes pueda servir")
    .replace(/reclut(a|e|ar)[^.!?]*/gi, "compartir la formacion con personas a quienes pueda servir")
    .replace(/si\s+compartir\s+la\s+formacion/gi, "si quieres revisar la formacion")
    .replace(/cura(r)?\s+/gi, "puede apoyar ")
    .replace(/solo\s+hoy/gi, "cuando tengas tiempo")
    .trim();
}

export function buildResponsibleMessage(input: {
  prospectName: string;
  context: string;
  templateTitle: string;
  templateBase: string;
  tone: string;
}) {
  const name = input.prospectName.trim() || "Hola";
  const context = input.context.trim();
  const toneLine =
    input.tone === "direct"
      ? "voy directo al punto"
      : input.tone === "calm"
        ? "te escribo con calma"
        : input.tone === "reactivation"
          ? "retomo esta conversacion con respeto"
          : "pense en ti por lo que conversamos";

  const contextLine = context
    ? `Me acorde de lo que me comentaste sobre ${context}.`
    : "Queria compartirte una informacion breve y facil de revisar.";

  return [
    `Hola ${name}, ${toneLine}.`,
    contextLine,
    input.templateBase,
    "Si te parece, te envio la informacion y la revisas sin compromiso. Si no es buen momento, no hay problema.",
  ].join("\n\n");
}
