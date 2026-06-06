import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = { title: "Política de Privacidad" };

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      updated="junio 2026"
      intro="En NetScale cuidamos tus datos. Esta política explica qué información recogemos, para qué la usamos y qué derechos tienes, conforme a la Ley N.° 29733 de Protección de Datos Personales del Perú."
      sections={[
        {
          heading: "1. Qué datos recogemos",
          bullets: [
            "Datos de tu cuenta: nombre, correo electrónico y, si lo aportas, teléfono y país.",
            "Datos de tu actividad en la plataforma: prospectos que registras, notas, aprendizajes y progreso en la academia.",
            "Datos técnicos necesarios para que el servicio funcione (por ejemplo, la suscripción de notificaciones de tu dispositivo).",
          ],
        },
        {
          heading: "2. Para qué usamos tus datos",
          bullets: [
            "Darte acceso a la plataforma y a sus herramientas.",
            "Recordarte tus seguimientos y enviarte notificaciones que tú actives.",
            "Mejorar el servicio y darte soporte.",
          ],
        },
        {
          heading: "3. Inteligencia artificial",
          paragraphs: [
            "Cuando usas las funciones de IA, el texto o la imagen que envías (por ejemplo, una captura de una conversación) se procesa para generar sugerencias. No vendemos tus datos. Eres responsable de la información que decides compartir y enviar.",
          ],
        },
        {
          heading: "4. Conservación",
          paragraphs: [
            "Conservamos tus datos mientras tengas una cuenta activa y durante el tiempo necesario para cumplir obligaciones legales. Luego se eliminan o anonimizan.",
          ],
        },
        {
          heading: "5. Tus derechos",
          paragraphs: [
            "Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) escribiéndonos a nuestro canal de contacto.",
          ],
        },
        {
          heading: "6. Seguridad",
          paragraphs: [
            "Aplicamos medidas razonables para proteger tus datos. Las sesiones usan cookies seguras y el acceso a tu información está restringido por reglas de seguridad a nivel de base de datos.",
          ],
        },
        {
          heading: "7. Contacto",
          paragraphs: [
            "Para cualquier consulta sobre tus datos o esta política, escríbenos a soporte@nexomentor.app.",
          ],
        },
      ]}
    />
  );
}
