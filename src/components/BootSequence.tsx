import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Typewriter } from "./Typewriter";

// Original stylised terminal boot text — no game assets or wording.
const LINES = [
  "SHELTERBRIDGE TERMINAL",
  "> initializing local vault interface…",
  "> local-first · no network required",
  "> ready.",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    if (step >= LINES.length) {
      const id = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), 450);
    return () => window.clearTimeout(id);
  }, [step, reduced, onDone]);

  return (
    <div className="sb-boot" onClick={onDone}>
      <div className="sb-boot-inner">
        {LINES.slice(0, step).map((line) => (
          <div key={line} className="sb-boot-line">
            <Typewriter text={line} />
          </div>
        ))}
        <p className="sb-boot-hint">click to skip</p>
      </div>
    </div>
  );
}
