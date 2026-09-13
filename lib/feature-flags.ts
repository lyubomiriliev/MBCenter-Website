/**
 * Temporary rollout gate for the Дневен оборот (turnover) and Отпуски (leave)
 * sections.
 *
 * These are hidden from everyone except the testing account until they are
 * confirmed working in production.
 *
 * ---------------------------------------------------------------------------
 * TO RELEASE TO EVERYONE: set BETA_SECTIONS_ENABLED_FOR_ALL to true.
 * That is the only change required — every gate in the app reads this file.
 * The whole file can then be deleted along with its imports.
 * ---------------------------------------------------------------------------
 *
 * Note: this is a UI-level gate only. It hides navigation, routes and tabs; it
 * is not a security boundary. Row-level security in Supabase still governs who
 * may read and write the underlying tables.
 */

/** Flip to true to enable the new sections for all admin/reception users. */
export const BETA_SECTIONS_ENABLED_FOR_ALL = false;

/** Accounts allowed to see the new sections while they are in testing. */
const BETA_TESTER_EMAILS = [
  "oliverqueeneb@gmail.com",
  "admin@mbcenter.bg",
  // Приемна fills in the daily turnover, so they need the section while it is
  // in testing. Role checks still apply on top of this: they get read-only
  // turnover with no profit, and no access to Отпуски at all.
  "reception@mbcenter.bg",
];

/**
 * Whether the given signed-in user may see the turnover and leave sections.
 * Email comparison is case-insensitive and whitespace-tolerant.
 */
export function canSeeBetaSections(email: string | null | undefined): boolean {
  if (BETA_SECTIONS_ENABLED_FOR_ALL) return true;
  if (!email) return false;
  return BETA_TESTER_EMAILS.includes(email.trim().toLowerCase());
}
