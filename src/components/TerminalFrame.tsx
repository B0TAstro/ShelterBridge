import type { ReactNode } from "react";
import "./TerminalFrame.css";

/** Dashboard-style bezel: a title bar with a status dot, a body, and a footer. */
export function TerminalFrame({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sb-frame">
      <div className="sb-frame-bar">
        <span className="sb-frame-dot" aria-hidden="true" />
        <span className="sb-frame-title">{title}</span>
      </div>
      <div className="sb-frame-body">{children}</div>
      {footer && <div className="sb-frame-footer">{footer}</div>}
    </div>
  );
}
