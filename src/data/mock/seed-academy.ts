import type { CourseWithContent } from "../types";

/**
 * Cursos demo de la Academia HGW (con módulos y lecciones embebidos).
 * Las lecciones de tipo "article" tienen contenido markdown real (funciona offline).
 */
export const SEED_COURSES: CourseWithContent[] = [
  {
    id: "c-onboarding",
    slug: "bienvenido-a-hgw",
    title: "Bienvenido a HGW",
    description:
      "Tu punto de partida. Conoce la empresa, la visión y los primeros pasos para arrancar tu negocio con el pie derecho.",
    coverUrl: null,
    level: "beginner",
    category: "Inicio",
    estimatedMinutes: 45,
    isPublished: true,
    sortOrder: 1,
    lessonCount: 3,
    modules: [
      {
        id: "m-onb-1",
        courseId: "c-onboarding",
        title: "Primeros pasos",
        sortOrder: 1,
        lessons: [
          {
            id: "l-onb-1",
            moduleId: "m-onb-1",
            courseId: "c-onboarding",
            slug: "que-es-hgw",
            title: "¿Qué es HGW y por qué estás aquí?",
            contentType: "article",
            videoUrl: null,
            resourceUrl: null,
            durationMinutes: 8,
            sortOrder: 1,
            content:
              "## Bienvenido a la familia HGW\n\nHGW es más que una empresa: es una comunidad de personas que decidieron tomar el control de su tiempo y sus ingresos.\n\n### Tu oportunidad\n\n- **Ingreso por esfuerzo, no por horas.** Construyes una red que trabaja contigo.\n- **Formación constante.** Aquí aprendes habilidades que valen para toda la vida.\n- **Comunidad.** Nunca estás solo: tu línea de patrocinio está para apoyarte.\n\n### Tu compromiso\n\nEl éxito en HGW se basa en tres acciones simples y duplicables:\n\n1. **Consumir** los productos y creer en ellos.\n2. **Compartir** la oportunidad y los productos.\n3. **Formar** a quienes invitas para que hagan lo mismo.\n\n> La duplicación es el corazón del negocio. Lo que tú haces, tu equipo lo repetirá.",
          },
          {
            id: "l-onb-2",
            moduleId: "m-onb-1",
            courseId: "c-onboarding",
            slug: "configura-tu-perfil",
            title: "Configura tu mentalidad de empresario",
            contentType: "video",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resourceUrl: null,
            content: null,
            durationMinutes: 12,
            sortOrder: 2,
          },
        ],
      },
      {
        id: "m-onb-2",
        courseId: "c-onboarding",
        title: "Tu plan de acción",
        sortOrder: 2,
        lessons: [
          {
            id: "l-onb-3",
            moduleId: "m-onb-2",
            courseId: "c-onboarding",
            slug: "primeras-48-horas",
            title: "Tus primeras 48 horas",
            contentType: "article",
            videoUrl: null,
            resourceUrl: null,
            durationMinutes: 10,
            sortOrder: 1,
            content:
              "## Las primeras 48 horas son decisivas\n\nLo que hagas en tus primeros dos días marca el ritmo de tu negocio.\n\n### Checklist de arranque\n\n1. **Haz tu lista de prospectos.** Escribe al menos 20 nombres sin prejuzgar.\n2. **Define tu porqué.** ¿Para qué quieres este negocio? Escríbelo.\n3. **Agenda tu primera presentación** con tu líder.\n4. **Consume tu producto** y registra tu experiencia.\n5. **Completa el curso de Presentación de Negocio.**\n\n> No tienes que saberlo todo para empezar. Tienes que empezar para aprenderlo todo.",
          },
        ],
      },
    ],
  },
  {
    id: "c-negocio",
    slug: "presentacion-de-negocio",
    title: "Domina la Presentación de Negocio",
    description:
      "Aprende a presentar la oportunidad HGW de forma clara, profesional y 100% duplicable. El sistema exacto, paso a paso.",
    coverUrl: null,
    level: "intermediate",
    category: "Duplicación",
    estimatedMinutes: 60,
    isPublished: true,
    sortOrder: 2,
    lessonCount: 2,
    modules: [
      {
        id: "m-neg-1",
        courseId: "c-negocio",
        title: "La estructura ganadora",
        sortOrder: 1,
        lessons: [
          {
            id: "l-neg-1",
            moduleId: "m-neg-1",
            courseId: "c-negocio",
            slug: "anatomia-presentacion",
            title: "Anatomía de una presentación que duplica",
            contentType: "article",
            videoUrl: null,
            resourceUrl: null,
            durationMinutes: 15,
            sortOrder: 1,
            content:
              "## La presentación perfecta dura 20 minutos\n\nUna presentación demasiado larga o complicada **no se duplica**. La clave es la simplicidad.\n\n### Las 5 partes\n\n1. **Tu historia (2 min).** Conecta desde la emoción, no desde los datos.\n2. **El problema (3 min).** ¿Qué dolor resuelve esta oportunidad?\n3. **La solución: HGW (8 min).** Empresa, producto y plan, en mensajes simples.\n4. **El plan de acción (4 min).** Cómo empezar hoy.\n5. **El cierre (3 min).** Invita a tomar una decisión.\n\n> Recuerda: presentas para duplicar. Si tu prospecto piensa \"yo también puedo hacer esto\", ganaste.",
          },
          {
            id: "l-neg-2",
            moduleId: "m-neg-1",
            courseId: "c-negocio",
            slug: "presentacion-en-vivo",
            title: "Presentación en vivo comentada",
            contentType: "video",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resourceUrl: null,
            content: null,
            durationMinutes: 25,
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  {
    id: "c-producto",
    slug: "conoce-los-productos",
    title: "Conoce los Productos HGW",
    description:
      "Domina los beneficios, el uso y la historia de cada producto para presentarlo con seguridad y generar ventas reales.",
    coverUrl: null,
    level: "beginner",
    category: "Producto",
    estimatedMinutes: 50,
    isPublished: true,
    sortOrder: 3,
    lessonCount: 1,
    modules: [
      {
        id: "m-prod-1",
        courseId: "c-producto",
        title: "Línea de productos",
        sortOrder: 1,
        lessons: [
          {
            id: "l-prod-1",
            moduleId: "m-prod-1",
            courseId: "c-producto",
            slug: "beneficios-clave",
            title: "Beneficios clave y cómo comunicarlos",
            contentType: "article",
            videoUrl: null,
            resourceUrl: null,
            durationMinutes: 12,
            sortOrder: 1,
            content:
              "## Vende beneficios, no características\n\nA nadie le importa el ingrediente X. A todos les importa **cómo se van a sentir**.\n\n### Traduce características en beneficios\n\n| Característica | Beneficio |\n| --- | --- |\n| Fórmula natural | Cuidas tu salud sin químicos |\n| Absorción rápida | Sientes resultados antes |\n| Certificación de calidad | Compras con total confianza |\n\n> Tu testimonio personal vale más que mil datos técnicos. Usa el producto, vive el resultado y cuéntalo.",
          },
        ],
      },
    ],
  },
  {
    id: "c-liderazgo",
    slug: "liderazgo-y-duplicacion",
    title: "Liderazgo y Duplicación",
    description:
      "Pasa de vendedor a líder. Aprende a formar equipos que crecen solos mediante un sistema de duplicación sólido.",
    coverUrl: null,
    level: "advanced",
    category: "Liderazgo",
    estimatedMinutes: 75,
    isPublished: true,
    sortOrder: 4,
    lessonCount: 1,
    modules: [
      {
        id: "m-lid-1",
        courseId: "c-liderazgo",
        title: "El líder duplicador",
        sortOrder: 1,
        lessons: [
          {
            id: "l-lid-1",
            moduleId: "m-lid-1",
            courseId: "c-liderazgo",
            slug: "edificar-y-delegar",
            title: "Edificar, formar y delegar",
            contentType: "article",
            videoUrl: null,
            resourceUrl: null,
            durationMinutes: 18,
            sortOrder: 1,
            content:
              "## Tu trabajo es hacerte innecesario\n\nUn gran líder construye otros líderes, no seguidores.\n\n### Las 3 E del líder duplicador\n\n- **Edificar.** Habla bien de tu equipo y de tu línea de patrocinio. La edificación crea confianza.\n- **Enseñar con el ejemplo.** Tu equipo hace lo que te ve hacer, no lo que dices.\n- **Entregar el sistema.** No improvises: entrega herramientas, guiones y procesos repetibles.\n\n> Si tu negocio depende de ti para funcionar, no tienes un negocio: tienes un empleo. Duplica el sistema.",
          },
        ],
      },
    ],
  },
];
