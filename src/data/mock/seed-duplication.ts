import type { Playbook, Resource, Script } from "../types";

/** Playbooks (sistemas paso a paso) de duplicación. */
export const SEED_PLAYBOOKS: Playbook[] = [
  {
    id: "pb-negocio",
    slug: "presentar-el-negocio",
    title: "Sistema para presentar el negocio",
    type: "business",
    description:
      "El flujo exacto, paso a paso, para invitar, presentar y cerrar la oportunidad de negocio de forma duplicable.",
    icon: "Briefcase",
    steps: [
      {
        id: "s-neg-1",
        sortOrder: 1,
        title: "Haz tu lista de prospectos",
        description:
          "Escribe al menos 20 nombres sin prejuzgar. Familia, amigos, conocidos, contactos del teléfono y redes.",
        tips: [
          "No decidas por el prospecto: tu trabajo es invitar, no suponer.",
          "Usa la memoria del teléfono y redes sociales para ampliar la lista.",
        ],
        durationMinutes: 30,
      },
      {
        id: "s-neg-2",
        sortOrder: 2,
        title: "Invita con un guion simple",
        description:
          "Contacta y despierta curiosidad sin explicar todo. El objetivo de la invitación es agendar la presentación, no vender.",
        tips: [
          "Sé breve y entusiasta.",
          "Ofrece dos opciones de horario para facilitar el sí.",
        ],
        durationMinutes: 10,
      },
      {
        id: "s-neg-3",
        sortOrder: 3,
        title: "Presenta el plan (20 min)",
        description:
          "Usa la estructura: tu historia, el problema, la solución HGW, el plan de acción y el cierre.",
        tips: [
          "Mantenla simple para que sea duplicable.",
          "Apóyate en la herramienta oficial (PDF/video), no improvises.",
        ],
        durationMinutes: 20,
      },
      {
        id: "s-neg-4",
        sortOrder: 4,
        title: "Maneja objeciones y cierra",
        description:
          "Escucha la objeción, valida, responde con una historia y vuelve a invitar a decidir.",
        tips: [
          "La objeción suele ser una duda, no un no.",
          "Pregunta: ¿qué fue lo que más te gustó de lo que viste?",
        ],
        durationMinutes: 10,
      },
      {
        id: "s-neg-5",
        sortOrder: 5,
        title: "Haz el seguimiento en 24-48h",
        description:
          "El dinero está en el seguimiento. Agenda la siguiente acción y registra al prospecto en tu CRM.",
        tips: [
          "El 80% de las decisiones ocurren tras varios contactos.",
          "Registra cada prospecto en la sección Prospectos.",
        ],
        durationMinutes: 10,
      },
    ],
  },
  {
    id: "pb-producto",
    slug: "presentar-el-producto",
    title: "Sistema para presentar el producto",
    type: "product",
    description:
      "Cómo generar deseo real por el producto y convertir una conversación en una venta y un cliente recurrente.",
    icon: "Package",
    steps: [
      {
        id: "s-prod-1",
        sortOrder: 1,
        title: "Identifica la necesidad",
        description:
          "Haz preguntas para descubrir qué problema o deseo tiene tu prospecto antes de hablar del producto.",
        tips: ["Escucha más de lo que hablas.", "Anota la necesidad concreta."],
        durationMinutes: 10,
      },
      {
        id: "s-prod-2",
        sortOrder: 2,
        title: "Comparte tu testimonio",
        description:
          "Conecta tu experiencia personal con el producto a la necesidad que detectaste.",
        tips: ["Tu historia vende más que los datos técnicos."],
        durationMinutes: 5,
      },
      {
        id: "s-prod-3",
        sortOrder: 3,
        title: "Presenta beneficios, no características",
        description:
          "Traduce cada característica en un beneficio sentido por el cliente.",
        tips: ["Usa el formato: característica → por lo tanto → beneficio."],
        durationMinutes: 10,
      },
      {
        id: "s-prod-4",
        sortOrder: 4,
        title: "Cierra y fideliza",
        description:
          "Ofrece el producto, cierra la venta y agenda un seguimiento para asegurar la recompra.",
        tips: [
          "Un cliente satisfecho es tu mejor prospecto de negocio.",
          "Agenda seguimiento a los 7 días.",
        ],
        durationMinutes: 10,
      },
    ],
  },
];

/** Guiones por categoría. */
export const SEED_SCRIPTS: Script[] = [
  {
    id: "sc-1",
    title: "Invitación directa (conocido)",
    category: "invitation",
    scenario: "Para invitar a alguien de confianza a ver el plan de negocio.",
    content:
      "Hola [nombre], ¿cómo estás? Te llamo porque estoy con un proyecto que me tiene muy entusiasmado y créeme que pensé en ti. No sé si sea para ti, pero quiero que lo veas y me des tu opinión. ¿Tienes 20 minutos el [día] a las [hora] o prefieres el [día] a las [hora]?",
    tags: ["invitación", "negocio", "conocidos"],
  },
  {
    id: "sc-2",
    title: "Invitación por mensaje (red social)",
    category: "invitation",
    scenario: "Mensaje breve para iniciar conversación por chat.",
    content:
      "¡Hola [nombre]! Vi tu perfil y me dio mucho gusto saludarte. Estoy ampliando un proyecto en [zona/país] y busco personas con buena actitud. ¿Te puedo compartir información sin compromiso para que la veas con calma?",
    tags: ["invitación", "redes"],
  },
  {
    id: "sc-3",
    title: "Apertura de la presentación",
    category: "presentation",
    scenario: "Primeros minutos para generar conexión antes del plan.",
    content:
      "Gracias por tu tiempo, [nombre]. Antes de mostrarte todo, déjame contarte rápidamente por qué yo empecé en esto y qué cambió para mí. Luego te muestro cómo funciona y al final tú decides si es para ti, ¿te parece?",
    tags: ["presentación", "apertura"],
  },
  {
    id: "sc-4",
    title: "Cierre con pregunta de compromiso",
    category: "closing",
    scenario: "Para invitar a tomar una decisión al final.",
    content:
      "[nombre], de todo lo que viste, ¿qué fue lo que más te gustó? … Perfecto. Tenemos dos formas de empezar: como cliente para disfrutar el producto, o como socio para construir el negocio conmigo. ¿Cuál se ajusta mejor a lo que buscas hoy?",
    tags: ["cierre", "compromiso"],
  },
  {
    id: "sc-5",
    title: "Objeción: \"No tengo tiempo\"",
    category: "objection",
    scenario: "Respuesta a la objeción de falta de tiempo.",
    content:
      "Te entiendo perfectamente, [nombre], precisamente por eso te lo muestro. La mayoría empezamos sin tiempo: este negocio se construye en los ratos libres y justamente busca darte más tiempo a futuro. ¿Qué te parece si vemos cómo otras personas ocupadas lo hicieron funcionar?",
    tags: ["objeción", "tiempo"],
  },
  {
    id: "sc-6",
    title: "Objeción: \"Eso es una pirámide\"",
    category: "objection",
    scenario: "Aclarar la diferencia con esquemas ilegales.",
    content:
      "Muy buena pregunta, [nombre]. Las pirámides son ilegales porque no hay un producto real, solo se paga por reclutar. Aquí es al revés: existe un producto de consumo que la gente compra y se gana por las ventas y por formar un equipo. Por eso es un negocio legal y sostenible. ¿Te muestro cómo funciona el plan?",
    tags: ["objeción", "legalidad"],
  },
  {
    id: "sc-7",
    title: "Seguimiento a las 24 horas",
    category: "followup",
    scenario: "Mensaje de seguimiento tras la presentación.",
    content:
      "Hola [nombre], fue un gusto mostrarte el proyecto ayer. Me quedé pensando en lo que comentaste sobre [necesidad]. Justo por eso creo que esto te puede servir. ¿Tienes alguna duda que pueda resolverte para que tomes tu decisión?",
    tags: ["seguimiento"],
  },
  {
    id: "sc-8",
    title: "Prospección en frío con valor",
    category: "prospecting",
    scenario: "Iniciar conversación aportando antes de invitar.",
    content:
      "Hola [nombre], me encantó tu publicación sobre [tema]. Yo también soy apasionado de eso. Por cierto, trabajo en un proyecto relacionado con [bienestar/emprendimiento]; si en algún momento te interesa, con gusto te cuento. ¡Un saludo!",
    tags: ["prospección", "frío"],
  },
];

/** Biblioteca de recursos descargables / enlaces. */
export const SEED_RESOURCES: Resource[] = [
  {
    id: "r-1",
    title: "Presentación oficial de negocio 2026",
    type: "slides",
    description: "Diapositivas oficiales para presentar la oportunidad.",
    url: "#",
    category: "Negocio",
    sizeLabel: "4.2 MB",
  },
  {
    id: "r-2",
    title: "Catálogo de productos HGW",
    type: "pdf",
    description: "Catálogo completo con beneficios y precios sugeridos.",
    url: "#",
    category: "Producto",
    sizeLabel: "8.1 MB",
  },
  {
    id: "r-3",
    title: "Plan de compensación explicado",
    type: "pdf",
    description: "Documento detallado del plan de compensación 2026.",
    url: "#",
    category: "Negocio",
    sizeLabel: "2.7 MB",
  },
  {
    id: "r-4",
    title: "Video: Testimonios de clientes",
    type: "video",
    description: "Recopilación de testimonios reales para compartir.",
    url: "#",
    category: "Producto",
    sizeLabel: "Video",
  },
  {
    id: "r-5",
    title: "Plantilla de lista de prospectos",
    type: "pdf",
    description: "Formato imprimible para construir tu lista de 100 nombres.",
    url: "#",
    category: "Herramientas",
    sizeLabel: "320 KB",
  },
  {
    id: "r-6",
    title: "Imágenes para redes sociales",
    type: "image",
    description: "Pack de gráficas para invitar por redes (historias y posts).",
    url: "#",
    category: "Herramientas",
    sizeLabel: "12 imágenes",
  },
  {
    id: "r-7",
    title: "Guía de inicio rápido (nuevo asociado)",
    type: "pdf",
    description: "Los primeros pasos para arrancar en las primeras 48 horas.",
    url: "#",
    category: "Inicio",
    sizeLabel: "1.1 MB",
  },
];
