import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse time to decimal hours. Accepts "1:30", "1ч 30мин", "1h 30min", "0.5", "1" etc. */
export function parseTimeToHours(s: string): number {
  const t = (s ?? "").trim();
  if (!t) return 0;

  // H:MM format (e.g., "1:30", "0:10")
  if (t.includes(":")) {
    const parts = t.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + minutes / 60;
  }

  // "1ч 30мин" / "1ч30мин" / "1h 30min" - check BEFORE decimal (parseFloat("1ч30мин") returns 1!)
  const hMatch = t.match(/(\d+)\s*ч/) || t.match(/(\d+)\s*h/i);
  const mMatch = t.match(/(\d+)\s*мин/) || t.match(/(\d+)\s*min/i);
  if (hMatch || mMatch) {
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
    return hours + minutes / 60;
  }

  // Decimal format (e.g., "0.5", "1.5") - only if no letters
  const n = parseFloat(t.replace(",", "."));
  if (!Number.isNaN(n) && n >= 0 && /^[\d.,\s]+$/.test(t)) return n;

  return 0;
}
