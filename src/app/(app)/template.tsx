/**
 * Per-navigation wrapper: re-mounts on each screen change to replay the
 * NetScale screen-in animation (ported from the prototype's `.ns-screen`).
 * Provides the flex column that holds each screen's TopBar + `.ns-scroll`.
 */
export default function ScreenTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ns-screen"
      style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      {children}
    </div>
  );
}
