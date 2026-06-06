import type { CSSProperties, ReactNode } from "react";
import { brandThemeVars } from "@/lib/brand-theme";
import { BottomNav } from "./bottom-nav";

/**
 * NetScale mobile shell: gray outer canvas + centered mobile app column + fixed
 * bottom nav. Each screen renders its own TopBar + `.ns-scroll` area inside
 * `children` (typically wrapped by a `template.tsx` for the screen-in animation).
 *
 * `brandColor` (color de marca del negocio) se inyecta como variables CSS en
 * `.ns-app` para que toda la app adopte ese color (unicolor). Sin color → azul.
 */
export function NetScaleShell({
  children,
  nav = true,
  topBar,
  brandColor,
}: {
  children: ReactNode;
  nav?: boolean;
  topBar?: ReactNode;
  brandColor?: string | null;
}) {
  return (
    <div className="ns-shell">
      <div className="ns-app ns-app-fixed" style={brandThemeVars(brandColor) as CSSProperties}>
        {topBar}
        {children}
        {nav && <BottomNav />}
      </div>
    </div>
  );
}
