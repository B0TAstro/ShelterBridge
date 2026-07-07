import { useEffect, useState } from "react";

function now(): string {
  return new Date().toLocaleTimeString([], { hour12: false });
}

/** A live HH:MM:SS clock for the dashboard footer. */
export function Clock() {
  const [time, setTime] = useState(now());

  useEffect(() => {
    const id = window.setInterval(() => setTime(now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span>{time}</span>;
}
