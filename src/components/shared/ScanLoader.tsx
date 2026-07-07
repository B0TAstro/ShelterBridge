/** Indeterminate scan progress bar (respects prefers-reduced-motion via CSS). */
export function ScanLoader({ label }: { label: string }) {
  return (
    <div className="scan-loader">
      <div className="scan-loader-bar" />
      <p>{label}</p>
    </div>
  );
}
