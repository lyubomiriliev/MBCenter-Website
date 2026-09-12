import type { Page, Route } from "@playwright/test";

/**
 * Test harness for the admin sections.
 *
 * The app talks to Supabase directly from the browser, so these helpers
 * intercept those REST calls and serve in-memory fixtures. That makes runs
 * deterministic and removes any need for live credentials.
 */

export const SUPABASE_HOST = "hungfycufkzhcraotaub.supabase.co";
const STORAGE_KEY = "sb-hungfycufkzhcraotaub-auth-token";

export type Role = "admin" | "reception" | "mechanic";

export interface SeedUser {
  email: string;
  role: Role;
  fullName?: string;
}

/** An in-memory stand-in for the tables these sections read and write. */
export interface Db {
  mechanics: any[];
  receptionists: any[];
  leave_periods: any[];
  leave_entitlements: any[];
  daily_turnover: any[];
  daily_turnover_notes: any[];
  offer_items: any[];
}

export function emptyDb(): Db {
  return {
    mechanics: [],
    receptionists: [],
    leave_periods: [],
    leave_entitlements: [],
    daily_turnover: [],
    daily_turnover_notes: [],
    offer_items: [],
  };
}

/** Signs the browser in as `user` by planting a session before any script runs. */
export async function signIn(page: Page, user: SeedUser) {
  const session = {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: "test-user-id",
      aud: "authenticated",
      role: "authenticated",
      email: user.email,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  };

  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [STORAGE_KEY, JSON.stringify(session)],
  );
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify(body),
  });

/** Applies PostgREST-style `eq.`/`gte.`/`lte.` filters from the query string. */
function applyFilters(rows: any[], url: URL): any[] {
  let out = [...rows];
  const entries: [string, string][] = [];
  url.searchParams.forEach((v, k) => entries.push([k, v]));
  for (const [key, raw] of entries) {
    if (["select", "order", "limit", "offset"].includes(key)) continue;
    const [op, ...rest] = raw.split(".");
    const value = rest.join(".");
    out = out.filter((r) => {
      const actual = r[key];
      switch (op) {
        case "eq":
          return String(actual) === value;
        case "neq":
          return String(actual) !== value;
        case "gte":
          return String(actual) >= value;
        case "lte":
          return String(actual) <= value;
        case "gt":
          return String(actual) > value;
        case "lt":
          return String(actual) < value;
        case "is":
          return value === "null" ? actual == null : actual === value;
        case "in": {
          const set = value.replace(/^\(|\)$/g, "").split(",");
          return set.includes(String(actual));
        }
        default:
          return true;
      }
    });
  }
  return out;
}

function applyOrder(rows: any[], url: URL): any[] {
  const order = url.searchParams.get("order");
  if (!order) return rows;
  const clauses = order.split(",").map((c) => {
    const [col, dir] = c.split(".");
    return { col, desc: dir === "desc" };
  });
  return [...rows].sort((a, b) => {
    for (const { col, desc } of clauses) {
      const av = a[col];
      const bv = b[col];
      if (av === bv) continue;
      const cmp = av > bv ? 1 : -1;
      return desc ? -cmp : cmp;
    }
    return 0;
  });
}

export interface MockOptions {
  /** Tables that should reject writes, simulating an RLS denial. */
  readOnly?: string[];
  /** Force a failure on the next write to this table. */
  failWrite?: string | null;
}

/**
 * Routes every Supabase REST call to the in-memory `db`.
 * Returns a log of the writes performed, for assertions.
 */
export async function mockSupabase(
  page: Page,
  db: Db,
  profile: { role: Role; full_name?: string },
  options: MockOptions = {},
) {
  const writes: { table: string; method: string; body: any }[] = [];
  const readOnly = new Set(options.readOnly ?? []);

  await page.route(`https://${SUPABASE_HOST}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();

    if (method === "OPTIONS") {
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "*",
        },
      });
    }

    // Auth endpoints
    if (url.pathname.startsWith("/auth/v1")) {
      if (url.pathname.endsWith("/user")) {
        return json(route, {
          id: "test-user-id",
          email: "test@example.com",
          aud: "authenticated",
        });
      }
      return json(route, {});
    }

    // RPCs used by the offer flow
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const fn = url.pathname.split("/").pop();
      if (fn === "generate_service_card_number") return json(route, "00099999");
      if (fn === "generate_offer_number") return json(route, "1234567890");
      return json(route, null);
    }

    const table = url.pathname.replace("/rest/v1/", "").split("?")[0];

    // profiles drives role checks
    if (table === "profiles") {
      return json(route, [
        {
          id: "p1",
          auth_id: "test-user-id",
          role: profile.role,
          full_name: profile.full_name ?? "Test User",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    const rows: any[] = (db as any)[table] ?? [];

    if (method === "GET") {
      const result = applyOrder(applyFilters(rows, url), url);
      const limit = url.searchParams.get("limit");
      return json(route, limit ? result.slice(0, Number(limit)) : result);
    }

    if (method === "POST" || method === "PATCH" || method === "DELETE") {
      if (readOnly.has(table) || options.failWrite === table) {
        return json(
          route,
          {
            code: "42501",
            message: `new row violates row-level security policy for table "${table}"`,
          },
          403,
        );
      }

      const body = req.postDataJSON?.();
      writes.push({ table, method, body });

      if (method === "POST") {
        const incoming = Array.isArray(body) ? body : [body];
        const created = incoming.map((r: any, i: number) => ({
          id: `gen-${table}-${rows.length + i + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...r,
        }));
        rows.push(...created);
        return json(route, created, 201);
      }

      if (method === "PATCH") {
        const targets = applyFilters(rows, url);
        for (const t of targets) Object.assign(t, body);
        return json(route, targets);
      }

      const targets = applyFilters(rows, url);
      for (const t of targets) {
        const i = rows.indexOf(t);
        if (i >= 0) rows.splice(i, 1);
      }
      return json(route, targets);
    }

    return json(route, []);
  });

  return { writes };
}

/** Two mechanics and two приемна staff, matching the real setup. */
export function seedWorkers(db: Db) {
  db.mechanics = [
    { id: "m-50", name: "50:50", sort_order: 0 },
    { id: "m-georgi", name: "Георги Михайлов", sort_order: 1 },
    { id: "m-lyubo", name: "Любомир Киров", sort_order: 2 },
  ];
  db.receptionists = [
    { id: "r-ivan", name: "Иван Стоянов", sort_order: 1 },
    { id: "r-dani", name: "Дани", sort_order: 2 },
  ];
  const year = new Date().getFullYear();
  db.leave_entitlements = [
    ...db.mechanics
      .filter((m) => m.name !== "50:50")
      .map((m) => ({
        id: `e-${m.id}`,
        worker_id: m.id,
        worker_type: "mechanic",
        year,
        total_days: 20,
      })),
    ...db.receptionists.map((r) => ({
      id: `e-${r.id}`,
      worker_id: r.id,
      worker_type: "receptionist",
      year,
      total_days: 20,
    })),
  ];
  return db;
}

export const ADMIN_EMAIL = "oliverqueeneb@gmail.com";
