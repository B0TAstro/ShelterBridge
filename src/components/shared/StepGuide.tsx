import { useState } from "react";

/** A numbered, checkable step list (e.g. the guided iPhone transfer). */
export function StepGuide({ steps }: { steps: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));

  function toggle(i: number) {
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <ol className="step-guide">
      {steps.map((step, i) => (
        <li key={i} className={done[i] ? "done" : ""}>
          <label>
            <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
            <span>{step}</span>
          </label>
        </li>
      ))}
    </ol>
  );
}
