"use client";
// Popup simple (para adultos mayores) cuando el miembro agota su presupuesto de IA
// del mes. Sin tokens ni números: solo invita a escribir por WhatsApp. Montado una
// sola vez en el layout (app); se abre vía useAiLimitStore.
import { Btn } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { PAYMENT } from "@/lib/constants";
import { useAiLimitStore } from "@/store/ai-limit-store";

export function AiLimitModal() {
  const open = useAiLimitStore((s) => s.open);
  const hide = useAiLimitStore((s) => s.hide);
  if (!open) return null;

  const message = encodeURIComponent(
    "Hola, llegué a mi límite de creaciones con inteligencia artificial y quiero habilitar más, por favor.",
  );
  const waUrl = `https://wa.me/${PAYMENT.whatsappIntl}?text=${message}`;
  const openWhatsApp = () => {
    window.open(waUrl, "_blank");
    hide();
  };

  return (
    <div
      onClick={hide}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(15,23,42,.55)",
        animation: "ns-fade-in .2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface)",
          borderRadius: 24,
          padding: "28px 22px",
          boxShadow: "var(--shadow-pop)",
          textAlign: "center",
          animation: "ns-sheet-up .28s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            margin: "0 auto 16px",
            width: 70,
            height: 70,
            borderRadius: 999,
            background: "var(--blue-soft)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name="sparkles" size={34} color="var(--blue)" />
        </div>
        <h2 style={{ fontSize: 23, lineHeight: 1.25 }}>Llegaste a tu límite de creaciones</h2>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: 10, lineHeight: 1.5 }}>
          Usaste todas tus creaciones con inteligencia artificial de este mes. Para habilitar
          más, escríbenos por WhatsApp y te ayudamos enseguida.
        </p>
        <p style={{ fontSize: 17, color: "var(--text)", marginTop: 8, fontWeight: 600 }}>
          WhatsApp: {PAYMENT.whatsappDisplay}
        </p>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn size="xl" variant="success" icon="whatsapp" onClick={openWhatsApp}>
            Escribir por WhatsApp
          </Btn>
          <button
            className="ns-press"
            onClick={hide}
            style={{
              color: "var(--text-2)",
              fontSize: 17,
              fontWeight: 600,
              padding: 10,
              background: "none",
              border: "none",
            }}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
