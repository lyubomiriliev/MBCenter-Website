import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse time to decimal hours. Accepts "1:30" (1h 30min), "0:10" (10min), "1" (1h), or legacy formats. */
export function parseTimeToHours(s: string): number {
  const t = (s ?? "").trim();
  if (!t) return 0;
  
  // Try H:MM format first (e.g., "1:30" or "0:10")
  if (t.includes(':')) {
    const parts = t.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + minutes / 60;
  }
  
  // Try decimal format (e.g., "0.5", "1.5")
  const n = parseFloat(t.replace(",", "."));
  if (!Number.isNaN(n) && n >= 0) return n;
  
  // Legacy format (e.g., "1h 30min")
  const h = t.match(/(\d+)h/);
  const m = t.match(/(\d+)min/);
  return (h ? parseInt(h[1], 10) : 0) + (m ? parseInt(m[1], 10) : 0) / 60;
}
