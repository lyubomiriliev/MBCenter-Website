/**
 * Bulgarian working-day helpers.
 *
 * Mirrors the SQL functions in supabase/migration_leave.sql so the UI can show
 * a live day count while a leave range is being picked. The database recomputes
 * the stored value on write, so the SQL side stays authoritative.
 */

/** Orthodox Easter Sunday (Meeus/Julian algorithm, shifted to Gregorian). */
export function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April
  const day = ((d + e + 114) % 31) + 1;
  // Julian date -> Gregorian: +13 days for 1900-2099
  return new Date(year, month - 1, day + 13);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local-date key (YYYY-MM-DD) — avoids the UTC shift of toISOString(). */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse a YYYY-MM-DD string as a local date (not UTC). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

/**
 * Extra non-working days declared per year by the Council of Ministers
 * ("мостове" / bridge days). These are announced each year and cannot be
 * derived from a rule, so new years must be added here as they are published.
 * Mirrors the bg_extra_holidays table.
 */
export const BG_EXTRA_HOLIDAYS: Record<number, Holiday[]> = {
  2026: [{ date: "2026-01-02", name: "Обявен за почивен ден" }],
};

/**
 * All Bulgarian non-working days for a year.
 *
 * Implements the Labour Code art. 154(2) rule: a fixed public holiday falling
 * on a Saturday or Sunday pushes the following working day(s) to non-working.
 * The Easter days are excluded from that rule by law.
 *
 * Verified against the official 2026 calendar (248 working days).
 */
export function bgPublicHolidays(year: number): Holiday[] {
  const easter = orthodoxEaster(year);
  const shift = (days: number) => {
    const d = new Date(easter);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Fixed-date holidays — eligible for weekend compensation
  const fixed: { date: Date; name: string }[] = [
    { date: new Date(year, 0, 1), name: "Нова година" },
    { date: new Date(year, 2, 3), name: "Ден на Освобождението" },
    { date: new Date(year, 4, 1), name: "Ден на труда" },
    { date: new Date(year, 4, 6), name: "Гергьовден" },
    { date: new Date(year, 4, 24), name: "Ден на светите братя Кирил и Методий" },
    { date: new Date(year, 8, 6), name: "Ден на Съединението" },
    { date: new Date(year, 8, 22), name: "Ден на Независимостта" },
    { date: new Date(year, 11, 24), name: "Бъдни вечер" },
    { date: new Date(year, 11, 25), name: "Рождество Христово" },
    { date: new Date(year, 11, 26), name: "Рождество Христово" },
  ];

  // Easter days are NOT compensated when they fall on a weekend
  const movable: { date: Date; name: string }[] = [
    { date: shift(-2), name: "Разпети петък" },
    { date: shift(-1), name: "Велика събота" },
    { date: easter, name: "Великден" },
    { date: shift(1), name: "Велики понеделник" },
  ];

  const result: Holiday[] = [...fixed, ...movable].map((h) => ({
    date: dateKey(h.date),
    name: h.name,
  }));
  const taken = new Set(result.map((h) => h.date));

  // Compensate each fixed holiday that lands on a weekend
  for (const h of fixed) {
    const dow = h.date.getDay();
    if (dow !== 0 && dow !== 6) continue;
    const next = new Date(h.date);
    do {
      next.setDate(next.getDate() + 1);
    } while (
      next.getDay() === 0 ||
      next.getDay() === 6 ||
      taken.has(dateKey(next))
    );
    const key = dateKey(next);
    taken.add(key);
    result.push({ date: key, name: `${h.name} (почивен ден)` });
  }

  for (const extra of BG_EXTRA_HOLIDAYS[year] ?? []) {
    if (taken.has(extra.date)) continue;
    taken.add(extra.date);
    result.push(extra);
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** Holiday lookup covering every year the range touches. */
export function holidayMap(from: Date, to: Date): Map<string, string> {
  const map = new Map<string, string>();
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    for (const h of bgPublicHolidays(y)) map.set(h.date, h.name);
  }
  return map;
}

/** True when the date is Mon-Fri and not a public holiday. */
export function isWorkingDay(d: Date, holidays?: Map<string, string>): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const map = holidays ?? holidayMap(d, d);
  return !map.has(dateKey(d));
}

/** Working days in an inclusive range: Mon-Fri minus Bulgarian holidays. */
export function countWorkingDays(start: Date, end: Date): number {
  if (end < start) return 0;
  const holidays = holidayMap(start, end);
  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    if (isWorkingDay(cursor, holidays)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/** Every calendar day in an inclusive range. */
export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
