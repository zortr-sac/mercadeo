import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

/**
 * NetScale mobile shell: gray outer canvas + centered mobile app column + fixed
 * bottom nav. Each screen renders its own TopBar + `.ns-scroll` area inside
 * `children` (typically wrapped by a `template.tsx` for the screen-in animation).
 */
export function NetScaleShell({
  children,
  nav = true,
  topBar,
}: {
  children: ReactNode;
  nav?: boolean;
  topBar?: ReactNode;
}) {
  return (
    <div className="ns-shell">
      <div className="ns-app ns-app-fixed">
        {topBar}
        {children}
        {nav && <BottomNav />}
      </div>
    </div>
  );
}
