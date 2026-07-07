import type { ReactNode } from "react";
import "./TerminalPanel.css";

export function TerminalPanel({ children }: { children: ReactNode }) {
  return <section className="sb-panel">{children}</section>;
}
