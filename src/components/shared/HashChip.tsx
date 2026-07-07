import { useState } from "react";

export function HashChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  }

  return (
    <button className="sb-hash" onClick={copy} title="Copy">
      <span className="sb-hash-label">{label}</span>
      <code>{value}</code>
      {copied && <span className="sb-hash-copied">✓</span>}
    </button>
  );
}
