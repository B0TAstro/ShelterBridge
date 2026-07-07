import type { ReactNode } from "react";

export function TerminalPanel({ children }: { children: ReactNode }) {
  return <section className="sb-panel">{children}</section>;
}
