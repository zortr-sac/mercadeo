import type { MessageTemplate, Playbook, Resource, Script } from "../types";

export const SEED_PLAYBOOKS: Playbook[] = [
  {
    id: "pb-comunicacion",
    businessId: null,
    slug: "comunicacion-responsable",
    title: "Sistema de conversacion responsable",
    type: "business",
    description:
      "Un flujo simple para iniciar, escuchar, responder y dar seguimiento sin presionar.",
    icon: "MessageCircle",
    steps: [
      {
        id: "s-com-1",
        sortOrder: 1,
        title: "Registra el contexto",
        description:
          "Antes de escribir, anota quien es la persona, que le interesa y que objecion podria tener.",
        tips: [
          "No copies mensajes masivos.",
          "El mejor mensaje suena a conversacion real.",
        ],
        durationMinutes: 5,
      },
      {
        id: "s-com-2",
        sortOrder: 2,
        title: "Elige una plantilla",
        description:
          "Usa una plantilla por situacion: primer contacto, seguimiento, objecion o reactivacion.",
        tips: ["Mantén el mensaje corto.", "Evita promesas de ingresos o salud."],
        durationMinutes: 5,
      },
      {
        id: "s-com-3",
        sortOrder: 3,
        title: "Agenda el siguiente paso",
        description:
          "Cierra cada conversacion con una accion concreta: enviar informacion, llamar o revisar dudas.",
        tips: ["Si no hay siguiente paso, el prospecto se enfria."],
        durationMinutes: 3,
      },
    ],
  },
  {
    id: "pb-producto",
    businessId: null,
    slug: "presentar-producto",
    title: "Presentar productos con claridad",
    type: "product",
    description:
      "Como hablar de beneficios reales, experiencia personal y uso responsable del producto.",
    icon: "Package",
    steps: [
      {
        id: "s-prod-1",
        sortOrder: 1,
        title: "Pregunta antes de recomendar",
        description:
          "Identifica necesidad, rutina y expectativas antes de hablar de un producto.",
        tips: ["Escucha mas de lo que hablas."],
        durationMinutes: 5,
      },
      {
        id: "s-prod-2",
        sortOrder: 2,
        title: "Comparte informacion verificable",
        description:
          "Evita afirmaciones de salud no sustentadas. Usa materiales aprobados por el negocio.",
        tips: ["Cuando tengas duda, envia el recurso oficial."],
        durationMinutes: 8,
      },
    ],
  },
];

export const SEED_SCRIPTS: Script[] = [
  {
    id: "sc-1",
    businessId: null,
    title: "Primer contacto calido",
    category: "prospecting",
    scenario: "Para iniciar una conversacion con alguien conocido.",
    content:
      "Hola [nombre], ¿como estas? Vi que te interesa [tema] y pense en compartirte una informacion breve que podria servirte. Si te parece, te envio un resumen y lo revisas con calma.",
    tags: ["primer contacto", "calido"],
  },
  {
    id: "sc-2",
    businessId: null,
    title: "Invitacion sin presion",
    category: "invitation",
    scenario: "Para invitar a ver informacion sin sonar insistente.",
    content:
      "Hola [nombre], estoy aprendiendo una forma mas ordenada de compartir productos y formacion. No se si sea para ti, pero pense que podrias darme tu opinion. ¿Te puedo enviar un video corto?",
    tags: ["invitacion", "opinion"],
  },
  {
    id: "sc-3",
    businessId: null,
    title: "Objecion: parece piramide",
    category: "objection",
    scenario: "Para responder con calma y redirigir a informacion clara.",
    content:
      "Entiendo la duda, [nombre]. Por eso prefiero explicarlo con claridad: aqui hablamos de productos, formacion y una metodologia de ventas responsable. No se promete dinero ni se paga por reclutar. Si quieres, te comparto la informacion oficial para que lo revises.",
    tags: ["objecion", "cumplimiento"],
  },
  {
    id: "sc-4",
    businessId: null,
    title: "Seguimiento 24 horas",
    category: "followup",
    scenario: "Para dar seguimiento despues de enviar informacion.",
    content:
      "Hola [nombre], ¿pudiste revisar la informacion que te envie? Me gustaria saber que parte te llamo mas la atencion y si tienes alguna pregunta concreta.",
    tags: ["seguimiento"],
  },
  {
    id: "sc-5",
    businessId: null,
    title: "Reactivar contacto frio",
    category: "reactivation",
    scenario: "Para retomar una conversacion pausada.",
    content:
      "Hola [nombre], retomo este mensaje con calma. Hace unos dias hablamos de [tema]. Si aun te interesa, puedo enviarte un resumen actualizado; si no es buen momento, no hay problema.",
    tags: ["reactivacion", "respeto"],
  },
];

// Mensajes 100% por negocio: el contenido base se retiró. Cada negocio crea los suyos.
export const SEED_MESSAGE_TEMPLATES: MessageTemplate[] = [];

export const SEED_RESOURCES: Resource[] = [
  {
    id: "r-1",
    businessId: "b-bienestar",
    title: "Guia de conversacion responsable",
    type: "pdf",
    description: "Frases utiles, frases de riesgo y ejemplos seguros.",
    url: "#",
    category: "Cumplimiento",
    sizeLabel: "PDF",
  },
  {
    id: "r-2",
    businessId: "b-bienestar",
    title: "Video de introduccion al metodo",
    type: "video",
    description: "Explica como usar academia, CRM, IA y recordatorios.",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Inicio",
    sizeLabel: "Video",
  },
  {
    id: "r-3",
    businessId: "b-bienestar",
    title: "Plantilla imprimible de seguimiento",
    type: "pdf",
    description: "Para usuarios que prefieren trabajar con papel y luego registrar en la app.",
    url: "#",
    category: "Herramientas",
    sizeLabel: "1 pagina",
  },
];
