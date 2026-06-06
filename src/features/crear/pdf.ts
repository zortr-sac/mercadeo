import { jsPDF } from "jspdf";

export type Slide = { title: string; bullets: string[] };

/** Compose a simple, clean slide deck PDF from a title + slides (client-side). */
function buildPdf(title: string, slides: Slide[]): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Cover (NetScale blue)
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, W, H, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text(title || "Presentación", W / 2, H / 2, { align: "center", maxWidth: W - 100 });

  for (const s of slides) {
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, W, H, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text(s.title || "", 56, 84, { maxWidth: W - 112 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(51, 65, 85);
    let y = 150;
    for (const b of s.bullets) {
      const lines = doc.splitTextToSize(`-  ${b}`, W - 130) as string[];
      doc.text(lines, 64, y);
      y += lines.length * 26 + 10;
    }
  }
  return doc;
}

export function downloadPresentationPdf(title: string, slides: Slide[]) {
  buildPdf(title, slides).save(`${title || "presentacion"}.pdf`);
}

export async function sharePresentationPdf(title: string, slides: Slide[]): Promise<"shared" | "downloaded"> {
  const blob = buildPdf(title, slides).output("blob");
  const file = new File([blob], `${title || "presentacion"}.pdf`, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch {
      // user cancelled -> fall through to download
    }
  }
  downloadPresentationPdf(title, slides);
  return "downloaded";
}
