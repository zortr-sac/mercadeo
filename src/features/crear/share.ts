/** Share an image via the native share sheet (WhatsApp/Instagram/TikTok/…),
 *  falling back to a direct download when Web Share with files is unavailable. */
export async function shareOrDownloadImage(
  dataUri: string,
  mime: string,
  name: string,
): Promise<"shared" | "downloaded"> {
  const blob = await (await fetch(dataUri)).blob();
  const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
  const filename = `${name}.${ext}`;
  const file = new File([blob], filename, { type: mime });

  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Mi anuncio" });
      return "shared";
    } catch {
      // user cancelled -> fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
