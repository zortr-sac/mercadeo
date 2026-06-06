# NetScale — Prompts de Diseño UI/UX para Google Stitch

> **Qué es este documento.** Un conjunto de prompts listos para copiar/pegar en
> [Google Stitch](https://stitch.withgoogle.com) (Google Labs) y generar el diseño
> visual de **NetScale**, una app móvil de network marketing rediseñada para
> **adultos de ~60 años sin experiencia con tecnología**.
>
> **Cómo usarlo (orden recomendado):**
> 1. Abre Stitch y crea un proyecto nuevo en modo **Mobile**.
> 2. Pega PRIMERO el bloque **"Sistema de Diseño NetScale"** (Sección 1). Esto fija
>    colores, tipografía y reglas para todas las pantallas.
> 3. Genera **una pantalla a la vez**, en orden. Pega el prompt de la pantalla, revisa
>    el resultado y, si hace falta, refínalo con un mensaje de seguimiento
>    (ej. *"hazlo más simple"*, *"botones más grandes"*, *"muéstrame 3 variantes"*).
> 4. Para mantener consistencia, antes de la pantalla 2 selecciona la pantalla 1 ya
>    aprobada y dile a Stitch *"keep this exact visual system for the next screens"*.
> 5. Los **prompts están en inglés** (Stitch rinde mejor así), pero **todo el texto
>    visible de la interfaz va en español** — está especificado en cada prompt en el
>    bloque `UI text (Spanish, exact)`. No traduzcas esos textos.
>
> **Público y principio rector:** una sola acción clara por pantalla, texto y botones
> grandes, máximo contraste, cero jerga, cero gestos complejos. Si una abuela de 65
> años no lo entiende en 3 segundos, está mal diseñado.

---

## Sección 1 — Sistema de Diseño NetScale (pegar PRIMERO en Stitch)

```
You are designing "NetScale", a mobile-first PWA for network-marketing distributors.
PRIMARY USERS: adults aged 60+ with very low digital literacy and some low vision.
The whole product must feel calm, warm, trustworthy and effortless — like a patient
helper, never a flashy startup app.

Use this design system on EVERY screen:

BRAND
- Name shown in UI: "NetScale".
- Logo: the word "NetScale" in Poppins SemiBold, dark blue, next to a small simple
  icon of three ascending connected dots/nodes (a small rising network) in blue.
- Tone of voice in all copy: warm, encouraging, plain Spanish. Short sentences.

COLOR PALETTE (high contrast, accessible)
- Primary blue:      #1D4ED8  (buttons, active states, progress bars, logo)
- Dark blue:         #1E40AF  (pressed/active text on light)
- Accent orange:     #EA580C  (guiding icons, badges, highlights)
- Light orange:      #FB923C  (soft icon backgrounds, small details)
- Background:        #F8FAFC  (app canvas)
- Card surface:      #FFFFFF  (cards, with 1px #E2E8F0 border)
- Text primary:      #0F172A  (titles, main text — ~17:1 contrast on white)
- Text secondary:    #475569  (subtitles, descriptions)
- Success green:     #16A34A  (completed, confirmations)
- Locked/disabled:   #94A3B8  (locks, disabled states)

TYPOGRAPHY
- Headings: Poppins SemiBold (friendly, rounded).
- Body: Inter (highly legible).
- Minimum sizes (critical for 60+): body text ≥ 18px, screen titles 28–32px,
  buttons 18–20px, nav labels 14–16px. NEVER use text below 16px.
- Generous line-height (1.5). No thin/light font weights.

ACCESSIBILITY RULES (apply to every screen)
- One single primary action per screen, visually dominant.
- Buttons ≥ 56px tall (primary actions 60–64px). Bottom-nav touch targets ≥ 64px.
- Every icon ALWAYS paired with a text label. Never icon-only controls.
- No swipe, no drag-and-drop, no long-press. Everything works with a single tap.
- Clear visible feedback after each action (large confirmation toasts / checkmarks).
- Consistent, persistent bottom navigation on all main screens.
- Big, obvious "Volver" (back) button with a left arrow + word when not a main tab.
- No horizontal scrolling. Generous spacing: 20px screen padding, 16px between cards.
- Rounded corners: 16px on cards, 14px on buttons. Soft, subtle shadows only.

PLATFORM
- Mobile portrait, 393px wide. PWA, standalone. Fixed bottom navigation bar.

BOTTOM NAVIGATION (5 items, identical on every main screen)
- Order: Inicio (home icon) · Academia (graduation-cap icon) · Crear (sparkles icon) ·
  Vender (chat-bubble icon) · Perfil (person icon).
- Active item: icon + label in primary blue #1D4ED8. Inactive: #475569.
- Bar: white background, 1px top border #E2E8F0, soft shadow, ≥64px tall + safe area.
- Labels in Spanish, exactly: "Inicio", "Academia", "Crear", "Vender", "Perfil".
```

### Mapa de navegación (los 5 hubs)

| Hub (bottom-nav) | Pantallas que agrupa |
|---|---|
| **Inicio** | 3. Inicio |
| **Academia** | 4. Academia · 5. Lecciones de un bloque · 6. Lección de video · 7. Plan de Compensación · 8. Programas Comerciales |
| **Crear** | 9. Crear (hub) · 10. Presentaciones · 11. Presentación con IA · 12. Publicidad/Flyers |
| **Vender** | 13. Mensajes IA · 14. Resultado de mensaje · 15. Prospectos · 16. Conversación con IA |
| **Perfil** | 17. Mi Perfil · 18. Mi Progreso · 19. Audiolibros |
| _(fuera de nav)_ | 1. Bienvenida · 2. Acceso (flujo de entrada) |

---

# Sección 2 — Los 19 prompts

> Recordatorio: cada prompt ya incluye los colores y reglas clave para que funcione
> aunque lo pegues suelto. Aun así, ten cargado el Sistema de Diseño de la Sección 1.

---

## Pantalla 1 — Bienvenida (Splash)   ·   ruta: `/bienvenida`
**Objetivo:** dar la bienvenida y entrar con un solo botón, sin abrumar.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system (blue #1D4ED8, orange #EA580C, Poppins/Inter, 60+
accessibility). Design the WELCOME / SPLASH screen.

Context: First screen older, non-technical adults see when opening the app. It must feel
warm and safe, with a single obvious action.

Layout (top → bottom):
- Generous top spacing.
- Centered NetScale logo, large: the word "NetScale" in Poppins SemiBold dark blue with
  the small ascending-nodes icon above or beside it.
- A friendly tagline under the logo, 20px, #475569: "Tu negocio, paso a paso."
- A warm, simple illustration in the middle: a calm older adult smiling at a phone, flat
  modern style, soft blue and orange tones (not corporate, not childish).
- Large vertical spacing.
- One single full-width primary button, 64px tall, blue #1D4ED8, white text 20px,
  14px radius: "Entrar".
- Below it, smaller plain-text link, 18px, blue: "¿Necesitas ayuda?".

Style: Background #F8FAFC. Lots of whitespace. Calm, reassuring, premium-but-friendly.
No bottom navigation on this screen.

Platform: Mobile 393px. Button ≥64px, text ≥18px, maximum contrast.

UI text (Spanish, exact): "NetScale", "Tu negocio, paso a paso.", "Entrar",
"¿Necesitas ayuda?".
```
**Notas:** sin bottom-nav. Una sola decisión: entrar. La ilustración debe mostrar
personas mayores reales para que el usuario se identifique.

---

## Pantalla 2 — Acceso (Login)   ·   ruta: `/login`
**Objetivo:** iniciar sesión con el mínimo esfuerzo posible.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the LOGIN screen for older, non-technical users.

Context: Sign-in must be effortless and unintimidating. Large labels, large fields,
clear show/hide password, no clutter.

Layout (top → bottom):
- Small back arrow + "Volver" at top-left (48px touch area).
- Big friendly heading, Poppins SemiBold 28px, #0F172A: "Hola, qué bueno verte".
- Subtitle 18px #475569: "Entra para continuar".
- Field group 1: label "Correo" (18px, above the field), then a large input 60px tall,
  white, 1px #CBD5E1 border, 14px radius, placeholder "tucorreo@ejemplo.com".
- Field group 2: label "Contraseña", large input 60px tall with an eye icon + the word
  "Mostrar" on the right to toggle visibility.
- Primary full-width button 64px, blue #1D4ED8, white 20px text: "Entrar".
- Centered plain link 18px blue: "¿Olvidaste tu contraseña?".
- Generous spacing between every element (20px+).

Style: Background #F8FAFC. White card-like fields. High contrast. Nothing else on screen —
no social logins, no decorative noise.

Platform: Mobile 393px. Inputs 60px, button 64px, text ≥18px.

UI text (Spanish, exact): "Volver", "Hola, qué bueno verte", "Entra para continuar",
"Correo", "tucorreo@ejemplo.com", "Contraseña", "Mostrar", "Entrar",
"¿Olvidaste tu contraseña?".
```
**Notas:** el toggle de contraseña usa la palabra "Mostrar/Ocultar", no solo el icono
del ojo. Solo email+contraseña; nada de logins sociales que confundan.

---

## Pantalla 3 — Inicio (Home)   ·   ruta: `/`
**Objetivo:** ofrecer 1 acción sugerida del día + accesos grandes a los 4 hubs.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the HOME screen (main tab "Inicio").

Context: The daily landing screen for an older distributor. It should greet them warmly,
suggest ONE thing to do today, and give big, calm shortcuts. Avoid dashboards full of
numbers and charts.

Layout (top → bottom):
- Top bar: small NetScale logo left; on the right a person avatar circle (tappable, goes
  to profile) with the word "Hola" hidden — keep it simple.
- Big personal greeting, Poppins SemiBold 28px, #0F172A: "Hola, María".
- "Tu enfoque de hoy" card: white, 16px radius, soft shadow, with an orange lightbulb
  icon, a one-line suggestion 18px ("Escríbele a un contacto nuevo hoy") and a single
  blue button 56px "Empezar". This is the visually dominant element.
- Section label 20px semibold "¿Qué quieres hacer?".
- A 2x2 grid of 4 large square shortcut cards (each ≥150px tall, 16px gap), each with a
  big icon in a soft colored circle, a 20px label below, white card:
    1. graduation-cap icon (blue) → "Aprender"
    2. sparkles icon (orange) → "Crear"
    3. chat-bubble icon (blue) → "Vender"
    4. trophy icon (orange) → "Mi progreso"
- Fixed bottom navigation (Inicio active, blue).

Style: Background #F8FAFC. White cards, soft shadows, generous spacing. Warm and calm.
The "Tu enfoque de hoy" card clearly stands out as the primary action.

Platform: Mobile 393px. Cards big and tappable, text ≥18px, button ≥56px.

UI text (Spanish, exact): "Hola, María", "Tu enfoque de hoy",
"Escríbele a un contacto nuevo hoy", "Empezar", "¿Qué quieres hacer?",
"Aprender", "Crear", "Vender", "Mi progreso",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** el "enfoque de hoy" reduce la parálisis de decisión. Solo 4 atajos grandes +
la sugerencia. Sin métricas de dinero (cumplimiento MLN + simplicidad).

---

## Pantalla 4 — Academia (Inicio)   ·   ruta: `/academia`
**Objetivo:** elegir uno de los 4 bloques progresivos de aprendizaje.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the ACADEMIA (Academy) home screen (main tab).

Context: The learning hub for older distributors. Four learning blocks unlock in order so
the user is never overwhelmed. Locked blocks are clearly shown but not frustrating.

Layout (top → bottom):
- Top bar: small NetScale logo left, bold centered title "Academia" (28px), no back button.
- Friendly subtitle 18px #475569: "Aprende paso a paso, a tu ritmo.".
- Vertical list of 4 large cards (≥96px tall, 16px gap), white, 1px #E2E8F0 border, 16px
  radius, soft shadow:
    1. UNLOCKED — left: book icon in an orange circle. Title 20px semibold "Primeros pasos
       en redes de mercadeo". Under it a thin blue progress bar + "2 de 5 videos" (16px
       #475569). Right: blue chevron.
    2. UNLOCKED — left: coins icon in a blue circle. Title "Cómo se gana dinero (Plan HGW)".
       Subtext "Empieza aquí". Right: blue chevron.
    3. LOCKED — left: shopping-bag icon in a gray circle. Title "Programas para vender".
       Right: gray lock icon + small text "Bloqueado". Card dimmed to 90%.
    4. LOCKED — left: camera icon in a gray circle. Title "Fotos y redes sociales".
       Right: gray lock + "Bloqueado". Card dimmed.
- Fixed bottom navigation (Academia active, blue).

Style: Background #F8FAFC. Orange icon circles for guidance, blue for progress. Locked
cards use #94A3B8 and slight dim. Calm, encouraging.

Platform: Mobile 393px. Cards ≥96px, text ≥18px, full-card tap targets.

UI text (Spanish, exact): "Academia", "Aprende paso a paso, a tu ritmo.",
"Primeros pasos en redes de mercadeo", "2 de 5 videos", "Cómo se gana dinero (Plan HGW)",
"Empieza aquí", "Programas para vender", "Bloqueado", "Fotos y redes sociales",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** el candado comunica progresión sin castigar. El bloque ② (Plan HGW) se marca
"Empieza aquí" para guiar el primer paso.

---

## Pantalla 5 — Lecciones de un bloque   ·   ruta: `/academia/[bloque]`
**Objetivo:** ver la lista de videos cortos de un bloque y elegir cuál ver.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the BLOCK LESSON LIST screen (generic, reused for
"Primeros pasos" and "Fotos y redes sociales").

Context: Inside a learning block. A simple vertical list of short videos. Completed ones
show a green check; the next available one is highlighted; later ones are locked.

Layout (top → bottom):
- Top bar: back arrow + "Volver" left; centered title 24px "Primeros pasos".
- A slim progress summary card: blue progress bar + "Has visto 2 de 5 videos" (18px).
- Vertical list of lesson rows (each ≥80px, 12px gap), white cards:
    • Row 1: green circle check (left), title 18px "¿Qué es el mercadeo en red?",
      duration "3 min" #475569 (right). Completed look.
    • Row 2: green check, "Mitos y verdades", "4 min".
    • Row 3: HIGHLIGHTED — blue play icon in a blue circle, title in dark blue semibold
      "Tu primer contacto", "5 min", a small blue label "Continuar aquí". Slight blue tint.
    • Row 4: gray lock, "Cómo invitar sin presionar", "Bloqueado".
    • Row 5: gray lock, "Resumen del módulo", "Bloqueado".
- Fixed bottom navigation (Academia active).

Style: Background #F8FAFC. Green #16A34A for done, blue #1D4ED8 for the current lesson,
gray #94A3B8 for locked. One clearly highlighted "next" lesson.

Platform: Mobile 393px. Rows ≥80px, text ≥18px, tap whole row.

UI text (Spanish, exact): "Volver", "Primeros pasos", "Has visto 2 de 5 videos",
"¿Qué es el mercadeo en red?", "3 min", "Mitos y verdades", "4 min", "Tu primer contacto",
"5 min", "Continuar aquí", "Cómo invitar sin presionar", "Bloqueado", "Resumen del módulo",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** siempre hay UNA lección resaltada ("Continuar aquí") para que el usuario no
tenga que decidir. Las duraciones cortas (3–5 min) refuerzan que no abruma.

---

## Pantalla 6 — Lección de video   ·   ruta: `/academia/[bloque]/[leccion]`
**Objetivo:** ver un video y marcarlo como visto con un botón gigante.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the VIDEO LESSON / PLAYER screen.

Context: The user watches one short induction video, then confirms they watched it. Keep
controls huge and obvious. No distractions.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered small title "Primeros pasos".
- Large video player at the top, full width, 16:9, rounded 16px, with a big centered
  white play button over a thumbnail. Simple progress bar under the video.
- Lesson title, Poppins SemiBold 24px #0F172A: "¿Qué es el mercadeo en red?".
- Short 2-line description, 18px #475569.
- A big primary button, full width, 64px, green #16A34A, white text 20px with a check
  icon: "Ya lo vi". (This marks the lesson complete.)
- A secondary outlined button 56px, blue border + blue text: "Siguiente video".
- Fixed bottom navigation (Academia active).

Style: Background #F8FAFC. The video is the hero; the green "Ya lo vi" button is the clear
primary action. Lots of breathing room.

Platform: Mobile 393px. Buttons ≥56–64px, text ≥18px. Tap-only controls, no gestures.

UI text (Spanish, exact): "Volver", "Primeros pasos", "¿Qué es el mercadeo en red?",
"Ya lo vi", "Siguiente video",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** "Ya lo vi" en verde = avance/logro. El video embebido será YouTube en la app
real; aquí solo importa el reproductor visual.

---

## Pantalla 7 — Plan de Compensación (Bloque ②)   ·   ruta: `/academia/plan-compensacion`
**Objetivo:** explicar de forma simple y visual los 4 bonos diarios, sin matemáticas que asusten.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the COMPENSATION PLAN explainer screen.

Context: Teaches older distributors, in the simplest possible way, the 4 daily bonuses of
the HGW plan. NOT a spreadsheet. Each bonus is one friendly card with an icon, a one-line
plain explanation, and a tiny illustrative example. Educational tone, no income promises.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered title 24px "Cómo se gana dinero".
- Intro line 18px #475569: "Hay 4 formas de ganar cada día. Así de simple:".
- A vertical list of 4 large cards (≥110px, 16px gap), white, 16px radius, each with a big
  colored icon-circle on the left, a bold 20px title, a plain 16–18px explanation, and a
  small light-gray "ejemplo" chip:
    1. handshake icon (orange) — "Bono de Patrocinio" — "Ganas cuando ayudas a alguien a
       empezar." — chip "Ejemplo: invitas a un amigo".
    2. trending-up icon (blue) — "Bono de Desarrollo" — "Ganas mientras tu gente aprende y
       avanza." — chip "Ejemplo: tu equipo completa la Academia".
    3. users icon (orange) — "Bono de Equipo" — "Ganas por el trabajo de todo tu grupo." —
       chip "Ejemplo: tu grupo vende en la semana".
    4. crown icon (blue) — "Bono Élite" — "Una recompensa extra cuando creces mucho." —
       chip "Ejemplo: alcanzas una meta grande".
- A soft info note at the bottom, 16px #475569 inside a light-blue rounded box:
  "Los ejemplos son solo para explicar. Tus resultados dependen de tu esfuerzo.".
- A primary button 60px blue: "Entendido".
- Fixed bottom navigation (Academia active).

Style: Background #F8FAFC. Alternate orange/blue icon circles. Friendly, reassuring, very
readable. Absolutely no dense tables or formulas.

Platform: Mobile 393px. Cards ≥110px, text ≥16px (titles ≥20px).

UI text (Spanish, exact): "Volver", "Cómo se gana dinero",
"Hay 4 formas de ganar cada día. Así de simple:",
"Bono de Patrocinio", "Ganas cuando ayudas a alguien a empezar.", "Ejemplo: invitas a un amigo",
"Bono de Desarrollo", "Ganas mientras tu gente aprende y avanza.", "Ejemplo: tu equipo completa la Academia",
"Bono de Equipo", "Ganas por el trabajo de todo tu grupo.", "Ejemplo: tu grupo vende en la semana",
"Bono Élite", "Una recompensa extra cuando creces mucho.", "Ejemplo: alcanzas una meta grande",
"Los ejemplos son solo para explicar. Tus resultados dependen de tu esfuerzo.", "Entendido",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** la nota legal ("los ejemplos son solo para explicar…") respeta el motor de
cumplimiento MLN del sistema (no prometer ingresos). Los 4 bonos = Patrocinio, Desarrollo,
Equipo, Élite, tal como pediste.

---

## Pantalla 8 — Programas Comerciales (Bloque ③)   ·   ruta: `/academia/programas`
**Objetivo:** elegir el programa de venta que encaja con el usuario (peso, estética, salud).

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the COMMERCIAL PROGRAMS selector screen.

Context: Instead of generic company training, the user picks the specific sales program
that matches their world (e.g. a hairdresser picks Aesthetics). Each program is a big,
photo-led card that opens its own lessons.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered title 24px "Programas para vender".
- Subtitle 18px #475569: "Elige lo que vas a vender. Te enseñamos solo eso.".
- Vertical list of 3 large cards (≥140px, 16px gap), white, 16px radius, soft shadow.
  Each card: a real warm photo on top or left, a bold 20px title, a one-line plain
  description 16–18px, and a blue "Ver programa" button-row with a chevron:
    1. Photo of fresh healthy food / measuring tape — "Control de Peso" —
       "Ayuda a personas a sentirse mejor con su cuerpo.".
    2. Photo of skincare / cosmetics — "Estética y Cosmética" —
       "Productos de belleza y cuidado de la piel.".
    3. Photo of smiling older people / wellness — "Amigos de la Salud" —
       "Bienestar y vitalidad para el día a día.".
- Fixed bottom navigation (Academia active).

Style: Background #F8FAFC. Photos make each program instantly recognizable. Warm, human,
aspirational but calm. Big tap targets on the whole card.

Platform: Mobile 393px. Cards ≥140px, titles ≥20px, body ≥16px.

UI text (Spanish, exact): "Volver", "Programas para vender",
"Elige lo que vas a vender. Te enseñamos solo eso.",
"Control de Peso", "Ayuda a personas a sentirse mejor con su cuerpo.",
"Estética y Cosmética", "Productos de belleza y cuidado de la piel.",
"Amigos de la Salud", "Bienestar y vitalidad para el día a día.", "Ver programa",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** las fotos hacen la elección obvia sin leer. Al abrir un programa se reutiliza la
Pantalla 5 (lista de lecciones) con el contenido de ese programa.

---

## Pantalla 9 — Crear con IA (Hub)   ·   ruta: `/crear`
**Objetivo:** elegir entre crear una presentación o un anuncio/flyer, con IA.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "CREAR" (Create with AI) hub screen (main tab).

Context: Two creative tools powered by AI. The user picks one with a single tap. Make AI
feel magical and easy, not technical.

Layout (top → bottom):
- Top bar: small logo; centered title 28px "Crear".
- Subtitle 18px #475569: "La inteligencia artificial lo hace por ti.".
- Two big stacked choice cards (each ≥160px, 16px gap), white, 16px radius, soft shadow,
  each with a large icon in a colored circle, a 22px bold title, a one-line description,
  and a blue "Empezar" pill:
    1. presentation/slideshow icon (blue circle) — "Hacer una Presentación" —
       "Para mostrar tu producto con láminas bonitas.".
    2. image/megaphone icon (orange circle) — "Hacer un Anuncio" —
       "Crea una imagen para compartir en redes.".
- A small reassuring line at the bottom 16px #475569 with a sparkles icon:
  "Tú escribes una idea, la IA hace el diseño.".
- Fixed bottom navigation (Crear active, blue).

Style: Background #F8FAFC. Big friendly cards, lots of space, a touch of "magic" via the
sparkles motif. Calm and confident.

Platform: Mobile 393px. Cards ≥160px, titles ≥20px, buttons ≥56px.

UI text (Spanish, exact): "Crear", "La inteligencia artificial lo hace por ti.",
"Hacer una Presentación", "Para mostrar tu producto con láminas bonitas.",
"Hacer un Anuncio", "Crea una imagen para compartir en redes.", "Empezar",
"Tú escribes una idea, la IA hace el diseño.",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** dos caminos, nada más. "Anuncio" es más claro que "flyer" para el público.

---

## Pantalla 10 — Presentaciones (Plantillas)   ·   ruta: `/crear/presentaciones`
**Objetivo:** elegir una plantilla lista o crear una nueva con IA.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the PRESENTATIONS TEMPLATES gallery screen.

Context: The user can either download a ready-made presentation template or create a new
one with AI. Templates are shown as friendly preview cards.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered title 24px "Presentaciones".
- A prominent primary banner-button at the top, full width, 64px, blue #1D4ED8, white text
  20px with a sparkles icon: "Crear una nueva con IA".
- Section label 20px semibold: "O usa una plantilla lista".
- A vertical list (or 1-column of large cards) of template cards (≥120px, 16px gap), white,
  each with a slide-thumbnail preview image, a 18px title, a small tag, and a blue
  "Descargar" row with a download icon:
    • "Presenta el producto" — tag "5 láminas".
    • "Cuenta tu historia" — tag "4 láminas".
    • "Invita a una reunión" — tag "3 láminas".
- Fixed bottom navigation (Crear active).

Style: Background #F8FAFC. The blue "Crear con IA" button is clearly the primary, modern
option; templates are the safe fallback. Preview thumbnails make each option concrete.

Platform: Mobile 393px. Button ≥64px, cards ≥120px, text ≥18px.

UI text (Spanish, exact): "Volver", "Presentaciones", "Crear una nueva con IA",
"O usa una plantilla lista", "Presenta el producto", "5 láminas", "Cuenta tu historia",
"4 láminas", "Invita a una reunión", "3 láminas", "Descargar",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** plantillas descargables + atajo IA, como pediste. Las miniaturas evitan tener
que imaginar el resultado.

---

## Pantalla 11 — Presentación con IA (Generar y resultado)   ·   ruta: `/crear/presentaciones/nueva`
**Objetivo:** describir el tema en 1 campo, generar y luego descargar/compartir.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "PRESENTATION WITH AI" generate+result screen.

Context: The simplest possible AI generator. One short question, one big button, then the
result. Show it as a single scrollable screen with two clear states stacked: the input on
top, the generated preview below.

Layout (top → bottom):
INPUT AREA
- Top bar: back arrow + "Volver"; centered title 24px "Nueva presentación".
- A friendly question, Poppins 22px #0F172A: "¿De qué quieres hablar?".
- One large multiline text field, ≥96px tall, white, 1px #CBD5E1 border, 14px radius,
  placeholder "Ejemplo: los beneficios del programa de control de peso".
- A primary full-width button 64px, blue, white 20px, sparkles icon: "Crear con IA".
RESULT AREA (shown after generating)
- A label 20px semibold "Tu presentación está lista":
- A horizontal row of 3–4 generated slide thumbnails (small preview cards) — this is the
  ONLY allowed horizontal element, clearly a preview strip.
- Two big stacked buttons: green 60px "Descargar" (download icon) and blue-outline 56px
  "Compartir" (share icon).
- A small text link 18px blue: "Volver a intentar".
- Fixed bottom navigation (Crear active).

Style: Background #F8FAFC. Make the AI step feel effortless: one question, one button. The
result feels rewarding with a "lista" confirmation and clear next steps.

Platform: Mobile 393px. Field ≥96px, buttons ≥56–64px, text ≥18px.

UI text (Spanish, exact): "Volver", "Nueva presentación", "¿De qué quieres hablar?",
"Ejemplo: los beneficios del programa de control de peso", "Crear con IA",
"Tu presentación está lista", "Descargar", "Compartir", "Volver a intentar",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** un solo campo + un botón. El resultado confirma con "está lista" (feedback
positivo) y ofrece descargar/compartir/reintentar. Es el patrón input→resultado reutilizable.

---

## Pantalla 12 — Publicidad / Flyers con IA   ·   ruta: `/crear/publicidad`
**Objetivo:** generar un flyer/imagen con IA y compartirlo directo a redes sociales.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "ADVERTISING / FLYER WITH AI" screen.

Context: The user describes a product, AI generates a marketing image (flyer), and they
share it straight to social networks. This is the headline new feature — make sharing
trivially easy with huge, recognizable buttons.

Layout (top → bottom):
INPUT AREA
- Top bar: back arrow + "Volver"; centered title 24px "Hacer un Anuncio".
- A small row of 3 ready template chips at the top (tappable presets): "Oferta",
  "Producto nuevo", "Testimonio".
- Question 22px: "¿Qué quieres anunciar?".
- One large text field ≥80px, placeholder "Ejemplo: crema facial con descuento esta semana".
- Optional secondary outline button 56px with a camera icon: "Agregar una foto".
- Primary full-width button 64px blue with sparkles: "Crear anuncio".
RESULT AREA (after generating)
- A large generated flyer image preview, full width, rounded 16px, with a subtle
  "Hecho con IA" badge.
- Label 20px semibold "Compártelo ahora":
- A row/grid of large share buttons (≥64px each), icon + label, brand-recognizable colors:
  "WhatsApp" (green), "Instagram" (gradient), "TikTok" (black), and "Descargar" (blue).
- A small link 18px blue: "Crear otro".
- Fixed bottom navigation (Crear active).

Style: Background #F8FAFC. The flyer preview is the hero. Share buttons are big and use
familiar social brand colors so older users instantly recognize them. Friendly, empowering.

Platform: Mobile 393px. Field ≥80px, buttons ≥64px, text ≥18px. No gestures.

UI text (Spanish, exact): "Volver", "Hacer un Anuncio", "Oferta", "Producto nuevo",
"Testimonio", "¿Qué quieres anunciar?",
"Ejemplo: crema facial con descuento esta semana", "Agregar una foto", "Crear anuncio",
"Hecho con IA", "Compártelo ahora", "WhatsApp", "Instagram", "TikTok", "Descargar",
"Crear otro",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** los botones de compartir usan los colores reconocibles de cada red para que el
adulto mayor los identifique de un vistazo. El badge "Hecho con IA" es buena práctica de
transparencia.

---

## Pantalla 13 — Mensajes con IA (Elegir situación)   ·   ruta: `/vender/mensajes`
**Objetivo:** elegir una situación y dejar que la IA redacte el mensaje de WhatsApp.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "AI MESSAGES — choose situation" screen (part
of the Vender tab).

Context: The user doesn't know what to write to a prospect. They pick a situation as a big
card and the AI writes a safe, friendly WhatsApp message. No typing required to start.

Layout (top → bottom):
- Top bar: small logo; centered title 24px "Escribir un mensaje".
- Subtitle 18px #475569: "Elige una situación y la IA escribe por ti.".
- A vertical list of large situation cards (≥88px, 16px gap), white, 16px radius, each with
  a friendly icon in a colored circle and a 20px label + a tiny helper line:
    • wave icon (blue) — "Saludar a alguien nuevo" — "Romper el hielo con calma".
    • clock icon (orange) — "Hacer seguimiento" — "Retomar una conversación".
    • question icon (blue) — "Responder una duda" — "Explicar sin presionar".
    • gift icon (orange) — "Invitar a conocer un producto" — "Compartir algo útil".
- Fixed bottom navigation (Vender active, blue).

Style: Background #F8FAFC. Tappable, reassuring cards. Each situation is plain-language and
non-pushy (aligned with no-pressure selling). Calm and supportive.

Platform: Mobile 393px. Cards ≥88px, labels ≥20px, helper ≥16px.

UI text (Spanish, exact): "Escribir un mensaje", "Elige una situación y la IA escribe por ti.",
"Saludar a alguien nuevo", "Romper el hielo con calma", "Hacer seguimiento",
"Retomar una conversación", "Responder una duda", "Explicar sin presionar",
"Invitar a conocer un producto", "Compartir algo útil",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** empezar por situación (no por un campo vacío) elimina la "página en blanco". El
lenguaje "sin presionar" refleja la filosofía anti-rechazo del sistema.

---

## Pantalla 14 — Resultado del mensaje   ·   ruta: `/vender/mensajes/resultado`
**Objetivo:** ver el mensaje generado y copiarlo o enviarlo por WhatsApp.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "AI MESSAGE RESULT" screen.

Context: Shows the AI-generated WhatsApp message in a big readable bubble, with two clear
actions: copy or send via WhatsApp. Optionally regenerate.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered title 24px "Tu mensaje".
- A short context line 18px #475569: "Para: contacto nuevo".
- A large chat-bubble card containing the generated message, 18–20px, dark text, light-blue
  bubble background, rounded 16px, comfortable padding. Easy to read fully.
- A small calm note row with a shield/check icon, 16px #16A34A: "Mensaje seguro y amable".
- Two big stacked buttons: green 64px with WhatsApp icon "Enviar por WhatsApp"; blue-outline
  56px with copy icon "Copiar".
- A text link 18px blue with refresh icon: "Escribir otro".
- Fixed bottom navigation (Vender active).

Style: Background #F8FAFC. The message bubble is the hero and must be very legible. Green
WhatsApp button is the primary action. The "Mensaje seguro" note reassures the user.

Platform: Mobile 393px. Buttons ≥56–64px, message text ≥18px.

UI text (Spanish, exact): "Volver", "Tu mensaje", "Para: contacto nuevo",
"Mensaje seguro y amable", "Enviar por WhatsApp", "Copiar", "Escribir otro",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** "Mensaje seguro y amable" expone el motor de compliance MLN de forma tranquila.
Enviar por WhatsApp es la acción principal (verde).

---

## Pantalla 15 — Prospectos (Mi lista)   ·   ruta: `/vender/prospectos`
**Objetivo:** ver mis contactos por estado y cambiar el estado por tap (sin arrastrar).

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "MY PROSPECTS" list screen (Vender tab).

Context: A simple personal CRM for older users. IMPORTANT: do NOT use a draggable kanban
board (dragging is too hard for this audience). Use a plain vertical list grouped by status,
where status is changed by TAPPING a button that opens a simple choice sheet.

Layout (top → bottom):
- Top bar: small logo; centered title 24px "Mis contactos".
- A primary full-width button 60px blue with a plus icon: "Agregar contacto".
- Simple status filter as large segmented pills (tap, not swipe): "Todos", "Nuevos",
  "En seguimiento", "Cerrados". Selected pill filled blue.
- A vertical list of contact rows (≥84px, 12px gap), white cards, each with: an avatar
  circle with initials (left), the contact name 20px semibold, a small colored status chip
  (e.g. green "Nuevo", orange "Seguimiento", gray "Cerrado"), and a right "Cambiar" text
  button that opens a simple status picker sheet.
    • "Rosa Martínez" — chip orange "Seguimiento".
    • "Juan Pérez" — chip green "Nuevo".
    • "Carmen Díaz" — chip gray "Cerrado".
- Fixed bottom navigation (Vender active).

Style: Background #F8FAFC. Calm, list-based, zero gestures. Status chips use color + word
(never color alone). Big tap targets. "Agregar contacto" is the clear primary action.

Platform: Mobile 393px. Rows ≥84px, buttons ≥56px, text ≥18px. Tap-only, no drag.

UI text (Spanish, exact): "Mis contactos", "Agregar contacto", "Todos", "Nuevos",
"En seguimiento", "Cerrados", "Rosa Martínez", "Seguimiento", "Juan Pérez", "Nuevo",
"Carmen Díaz", "Cerrado", "Cambiar",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** rediseño clave de accesibilidad — el Kanban arrastrable actual se reemplaza por
lista + cambio de estado por tap. Los chips usan color **y** palabra (no solo color).

---

## Pantalla 16 — Conversación con IA (Copiloto)   ·   ruta: `/vender/prospectos/[id]`
**Objetivo:** subir una captura de WhatsApp y recibir 3 respuestas sugeridas.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "AI CONVERSATION COPILOT" screen for one
prospect.

Context: The user pastes/uploads a WhatsApp screenshot; the AI reads it and proposes 3 safe
replies. This is a flagship AI feature — make uploading and choosing a reply extremely easy.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered the prospect name 22px "Rosa Martínez".
- A big primary action card at top: dashed-border upload zone with a camera/upload icon and
  text 20px "Subir captura de WhatsApp" + helper "Toma o elige una foto del chat".
- After upload — a small "Lo que entendí" card, light-blue, 18px, summarizing the situation
  in one friendly sentence.
- Section label 20px semibold "Respuestas sugeridas":
- Three stacked reply cards (≥96px, 12px gap), white, each containing the suggested reply
  text 18px and a blue "Usar esta" button (56px) with a copy/send icon. Number them 1, 2, 3
  with a small circle badge.
- A calm safety note 16px #16A34A with a shield icon: "Todas son seguras y amables".
- Fixed bottom navigation (Vender active).

Style: Background #F8FAFC. The upload zone and the 3 reply cards are the focus. Each reply
is fully readable with one obvious "Usar esta" action. Supportive, no pressure.

Platform: Mobile 393px. Upload zone ≥120px, reply cards ≥96px, buttons ≥56px, text ≥18px.

UI text (Spanish, exact): "Volver", "Rosa Martínez", "Subir captura de WhatsApp",
"Toma o elige una foto del chat", "Lo que entendí", "Respuestas sugeridas", "Usar esta",
"Todas son seguras y amables",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** refleja el copiloto de visión Gemini existente (lee capturas). Subir foto + 3
tarjetas con "Usar esta" = cero escritura, cero decisiones complejas.

---

## Pantalla 17 — Mi Perfil   ·   ruta: `/perfil`
**Objetivo:** ver mis datos, mi equipo (si soy líder) y cerrar sesión.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "MY PROFILE" screen (Perfil tab).

Context: A calm profile/account screen for older users. Big avatar, name, and a short list
of large, clearly labeled options. Logout must be easy to find.

Layout (top → bottom):
- Top bar: small logo; centered title 24px "Mi perfil".
- A centered profile header: large avatar circle (96px) with initials or photo, the user
  name Poppins 24px "María González", and a small role chip "Líder" (blue) or "Vendedor".
- A vertical list of large option rows (≥72px, 12px gap), white cards, each with a leading
  icon, a 20px label, and a right chevron:
    • people icon — "Mi equipo" (only if leader).
    • bell icon — "Notificaciones".
    • gear icon — "Ajustes".
    • help-circle icon — "Ayuda".
- A clearly separated, full-width button 60px, white with red text + logout icon:
  "Cerrar sesión".
- Fixed bottom navigation (Perfil active, blue).

Style: Background #F8FAFC. Spacious, calm, easy to scan. Each row is a big tap target.
Logout is visually separated at the bottom and obvious but not alarming.

Platform: Mobile 393px. Rows ≥72px, button ≥60px, text ≥18px.

UI text (Spanish, exact): "Mi perfil", "María González", "Líder", "Mi equipo",
"Notificaciones", "Ajustes", "Ayuda", "Cerrar sesión",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** "Mi equipo" solo aparece para líderes. Pocas opciones, todas grandes. Cerrar
sesión separado para evitar toques accidentales pero fácil de hallar.

---

## Pantalla 18 — Mi Progreso (Constancia)   ·   ruta: `/constancia`
**Objetivo:** celebrar la constancia (racha, logros) y reencuadrar el rechazo con IA.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "MY PROGRESS" (constancy & motivation) screen.

Context: Celebrates activity, not money. Shows a friendly streak, achievements earned by
doing healthy actions, and a small "anti-rejection" journal where the AI reframes a bad
moment into encouragement. Warm and emotionally supportive.

Layout (top → bottom):
- Top bar: small logo; centered title 24px "Mi progreso".
- A hero streak card, soft gradient blue→light, with a flame icon, a big number "7" and
  text 20px "días seguidos. ¡Muy bien!". Encouraging, celebratory.
- A row of 3 achievement badges (icon in a circle + tiny label), e.g. "Primer contacto",
  "5 videos", "1 semana". Earned ones in orange/blue, locked ones gray.
- A "Tu ánimo de hoy" card: a friendly prompt 18px "¿Te dijeron que no? Cuéntame." with a
  text field and a blue button 56px "Recibir ánimo" (this calls the AI reframe).
- After submitting — a warm AI reframe message in a light-orange card, 18px, supportive.
- Fixed bottom navigation (Perfil active).

Style: Background #F8FAFC. Celebratory but calm. Never shows income or money — only effort
and consistency. Emotionally warm, like a supportive coach.

Platform: Mobile 393px. Big numbers, text ≥18px, button ≥56px.

UI text (Spanish, exact): "Mi progreso", "7", "días seguidos. ¡Muy bien!",
"Primer contacto", "5 videos", "1 semana", "Tu ánimo de hoy",
"¿Te dijeron que no? Cuéntame.", "Recibir ánimo",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** gamificación por actividad (nunca por dinero) = cumplimiento MLN. El reencuadre
anti-rechazo usa el endpoint `/api/ai/reframe` existente.

---

## Pantalla 19 — Audiolibros   ·   ruta: `/audiolibros`
**Objetivo:** escuchar audiolibros con controles grandes y simples.

### Prompt para Stitch (copiar/pegar)

```
Apply the NetScale design system. Design the "AUDIOBOOKS" screen with an XL audio player.

Context: A catalog of motivational/educational audiobooks for older users who prefer
listening over reading. Controls must be huge and unmistakable.

Layout (top → bottom):
- Top bar: back arrow + "Volver"; centered title 24px "Audiolibros".
- A vertical list of audiobook rows (≥80px, 12px gap), white cards: cover thumbnail (left),
  title 18px semibold + author 16px #475569, and a big round blue play button (56px) on the
  right with the word "Oír" under it.
    • "El poder de la constancia" — "Autor invitado".
    • "Vende con el corazón" — "Autor invitado".
- A NOW-PLAYING bar pinned above the bottom nav (only when something plays): mini cover,
  title, and a large play/pause button. Tapping it expands a full player.
- FULL PLAYER (separate state to also generate): big cover image, title, a large progress
  bar with current time, and XL controls in a row — back-15s, big play/pause (72px), 
  forward-15s — each with a text label ("−15s", "Pausa", "+15s").
- Fixed bottom navigation (Perfil active).

Style: Background #F8FAFC. Oversized, friendly audio controls. Each control labeled with
text. Calm, focused listening experience.

Platform: Mobile 393px. Play buttons ≥56px (main play/pause 72px), text ≥18px.

UI text (Spanish, exact): "Volver", "Audiolibros", "El poder de la constancia",
"Autor invitado", "Vende con el corazón", "Oír", "−15s", "Pausa", "+15s",
nav: "Inicio / Academia / Crear / Vender / Perfil".
```
**Notas:** controles XL con etiqueta de texto ("Pausa", "+15s") en vez de solo iconos.
Genera dos estados en Stitch: la lista y el reproductor completo.

---

# Sección 3 — Anexo

## A. Glosario de strings reutilizables (español)

Mantén estas palabras EXACTAS en toda la app para que el usuario no se confunda con
sinónimos:

| Concepto | Palabra única a usar |
|---|---|
| Volver atrás | **Volver** |
| Acción de IA | **Crear con IA** / **Crear** |
| Confirmar visto | **Ya lo vi** |
| Avanzar | **Siguiente** |
| Bloqueado | **Bloqueado** |
| Compartir | **Compartir** |
| Enviar mensaje | **Enviar por WhatsApp** |
| Navegación | **Inicio / Academia / Crear / Vender / Perfil** |

## B. Checklist de accesibilidad 60+ (validar cada mockup que devuelva Stitch)

- [ ] ¿El texto de cuerpo es ≥ 18px y los títulos ≥ 28px?
- [ ] ¿Hay UNA sola acción primaria evidente en la pantalla?
- [ ] ¿Todos los botones/iconos tienen **etiqueta de texto** (no solo icono)?
- [ ] ¿Los botones miden ≥ 56px de alto (primarios 60–64px)?
- [ ] ¿El contraste texto/fondo es alto (texto oscuro #0F172A sobre claro)?
- [ ] ¿Se evita TODO gesto complejo (swipe, arrastrar, long-press)?
- [ ] ¿El bottom-nav es idéntico y está presente en las pantallas principales?
- [ ] ¿El lenguaje es simple, cálido y sin jerga de MLN ni tecnicismos?
- [ ] ¿Ninguna pantalla promete ingresos/ganancias (cumplimiento MLN)?
- [ ] ¿El color nunca es el único indicador (siempre color + texto/icono)?

## C. Frases útiles para iterar dentro de Stitch

- "Make the buttons bigger and the text larger, this is for elderly users."
- "Simplify this screen — remove secondary options, keep one main action."
- "Switch all screens to this exact color system and keep it consistent."
- "Show me 3 variations of this screen."
- "Increase contrast and use only the NetScale palette."
- "Export to Figma" / "Export the HTML + Tailwind code."

## D. Cómo se conecta con el sistema real (referencia para la fase de código)

Estas pantallas mapean a módulos existentes o nuevos del proyecto HGW (Next.js):

| Pantalla(s) | Estado en el código actual |
|---|---|
| 4–8 Academia | Existe (`/academia`) — **reestructurar** a 4 bloques progresivos |
| 7 Plan de Compensación | **Nuevo** dentro de Academia |
| 9–11 Presentaciones IA | **Nuevo** (hoy solo existe `visual-brief` textual) |
| 12 Publicidad/Flyers IA | **Nuevo** (requiere generación de imágenes) |
| 13–16 Vender | Existe (`/mensajes`, `/duplicacion/prospectos`) — simplificar |
| 18 Mi Progreso | Existe (`/constancia`) |
| 19 Audiolibros | Existe (`/audiolibros`) |
| Red Social / Feed | **Eliminar** (no se incluye en NetScale) |

> Nota: la implementación en código (rebrand a NetScale, eliminar Feed, construir los
> módulos de IA) es una fase posterior con su propio plan.
```
