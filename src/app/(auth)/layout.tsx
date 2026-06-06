import { NetScaleShell } from "@/components/netscale/shell";

/** Public auth screens (welcome, login) — NetScale mobile shell, no bottom nav. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <NetScaleShell nav={false}>{children}</NetScaleShell>;
}
