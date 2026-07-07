import { useEffect } from "react";
import type { ReactNode } from "react";
import { CloseIcon } from "./icons";

/** A centered modal dialog. Closes on overlay click, the X, or Escape. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sb-modal-overlay" onClick={onClose}>
      <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sb-modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <CloseIcon />
          </button>
        </div>
        <div className="sb-modal-body">{children}</div>
      </div>
    </div>
  );
}
