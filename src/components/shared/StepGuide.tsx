import { useState } from "react";

/** A step list where each row is itself the toggle (no visible checkbox).
 * Shows a completed/total counter. */
export function StepGuide({ steps }: { steps: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));
  const completed = done.filter(Boolean).length;

  function toggle(i: number) {
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div className="step-guide">
      <div className="step-progress">
        {completed}/{steps.length}
      </div>
      <ol className="step-list">
        {steps.map((step, i) => (
          <li key={i}>
            <button
              type="button"
              className={`step-row ${done[i] ? "done" : ""}`}
              onClick={() => toggle(i)}
              aria-pressed={done[i]}
            >
              <span className="step-badge">{done[i] ? "✓" : i + 1}</span>
              <span className="step-text">{step}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
