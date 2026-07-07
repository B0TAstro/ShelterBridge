import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/** Types `text` out character by character. Shows it instantly if the user
 * prefers reduced motion. To retype when the text changes, give it a `key`. */
export function Typewriter({
  text,
  speed = 22,
  className,
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  // Start full when reduced-motion is on; otherwise start empty and type in.
  const [shown, setShown] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i)); // runs in a timer callback, not synchronously
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, reduced]);

  return <span className={className}>{shown}</span>;
}
