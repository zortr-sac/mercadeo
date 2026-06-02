import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = { title: "Términos y Condiciones" };

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      updated="junio 2026"
      intro="Estos Términos regulan el uso de Nexo Mentor, una plataforma de formación y herramientas por suscripción. Al crear una cuenta y aceptar estos Términos con un clic, confirmas que los has leído y que estás de acuerdo."
      sections={[
        {
          heading: "1. Identificación y aceptación",
          paragraphs: [
            "El servicio es prestado por el titular de Nexo Mentor (datos de razón social, RUC y contacto disponibles a solicitud). El uso de la plataforma implica la aceptación plena de estos Términos, manifestada con el clic de aceptación durante el registro.",
            "Debes ser mayor de edad para registrarte y usar el servicio.",
          ],
        },
        {
          heading: "2. Descripción del servicio",
          paragraphs: [
            "Nexo Mentor es un servicio de formación (academia, tutoriales) y herramientas de organización y comunicación para vendedores, por suscripción.",
          ],
          bullets: [
            "NO es una oportunidad de negocio, inversión ni programa de afiliación.",
            "NO paga por reclutar usuarios ni gestiona comisiones por reclutamiento.",
            "NO vende productos físicos ni intermedia en su venta.",
          ],
        },
        {
          heading: "3. Suscripción, precios y pagos",
          paragraphs: [
            "La suscripción es mensual, de monto fijo (15 soles), y da acceso al contenido y a las herramientas. Puede renovarse de forma periódica.",
            "Podemos modificar el precio con aviso previo. La política de cancelación y, si aplica, de reembolsos, se informa en la plataforma.",
          ],
        },
        {
          heading: "4. Ausencia de garantía de resultados",
          paragraphs: [
            "La plataforma provee acceso a contenido formativo y herramientas, y no garantiza ingresos, ganancias ni resultados económicos de ningún tipo.",
            "Los resultados dependen exclusivamente del esfuerzo, las circunstancias y la actividad de cada usuario. El contenido es educativo y no constituye asesoría financiera, legal ni de inversión.",
          ],
        },
        {
          heading: "5. Uso aceptable y conductas prohibidas",
          bullets: [
            "Está prohibido usar la plataforma para operar o promover esquemas piramidales o de captación basados en reclutamiento.",
            "Está prohibido usar las herramientas (incluida la IA) para prometer ingresos, garantizar ganancias o hacer afirmaciones engañosas.",
            "Está prohibido usar la plataforma para actividades ilegales o que infrinjan derechos de terceros.",
            "El usuario es responsable del contenido que crea, edita y envía, incluso cuando parta de una sugerencia generada por IA.",
          ],
        },
        {
          heading: "6. Suspensión y cierre de cuentas",
          paragraphs: [
            "Podemos suspender o cerrar cuentas que violen el uso aceptable. Disponemos de un canal para reportar abusos o usos indebidos.",
            "El cierre implica la pérdida de acceso y el tratamiento de los datos conforme a la Política de Privacidad.",
          ],
        },
        {
          heading: "7. Contenido generado por inteligencia artificial",
          paragraphs: [
            "La IA ofrece sugerencias; la decisión y la responsabilidad del envío son del usuario.",
            "No garantizamos que las sugerencias sean adecuadas para cada caso ni que cumplan las leyes aplicables a tu actividad. Existe un Modo Cumplimiento que filtra frases de riesgo como ayuda, no como garantía absoluta.",
          ],
        },
        {
          heading: "8. Propiedad intelectual",
          paragraphs: [
            "El contenido educativo, la marca y el software son de su titular. Se te concede una licencia de uso limitada, personal e intransferible. Queda prohibido copiar, redistribuir o revender el contenido.",
          ],
        },
        {
          heading: "9. Protección de datos personales",
          paragraphs: [
            "El tratamiento de datos se rige por nuestra Política de Privacidad y la Ley N.° 29733. Allí se detalla qué datos se recogen, con qué finalidad y por cuánto tiempo, así como tus derechos de acceso, rectificación, cancelación y oposición.",
          ],
        },
        {
          heading: "10. Limitación de responsabilidad",
          paragraphs: [
            "Dentro de lo permitido por ley, no respondemos por las decisiones comerciales del usuario ni por su actividad de venta.",
          ],
        },
        {
          heading: "11. Modelo multiempresa",
          paragraphs: [
            "Cuando una empresa-cliente usa la plataforma para su propia gente, queda prohibido operar esquemas piramidales en ella, y nos reservamos el derecho de cerrar esa cuenta. La empresa-cliente es responsable de su actividad y de su gente; nosotros proveemos el software.",
          ],
        },
        {
          heading: "12. Disposiciones finales",
          paragraphs: [
            "Podemos modificar estos Términos notificándolo por los canales de la plataforma. Se aplica la ley peruana y su jurisdicción. Contamos con Libro de Reclamaciones y canales de atención al consumidor.",
          ],
        },
      ]}
    />
  );
}
