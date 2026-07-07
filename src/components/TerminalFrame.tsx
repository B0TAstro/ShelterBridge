import type { ReactNode } from "react";

/** Dashboard-style bezel: a title bar (with a status dot + optional toolbar),
 * a body, and a footer. */
export function TerminalFrame({
  title,
  toolbar,
  footer,
  children,
}: {
  title: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sb-frame">
      <div className="sb-frame-bar">
        <span className="sb-frame-dot" aria-hidden="true" />
        <span className="sb-frame-title">{title}</span>
        {toolbar && <div className="sb-frame-toolbar">{toolbar}</div>}
      </div>
      <div className="sb-frame-body">{children}</div>
      {footer && <div className="sb-frame-footer">{footer}</div>}
    </div>
  );
}
