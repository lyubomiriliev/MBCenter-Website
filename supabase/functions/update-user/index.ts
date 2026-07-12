// Supabase Edge Function: update-user
//
// Replaces the old Next.js API route (app/api/admin/update-user), which cannot
// run on a static export (cPanel shared hosting has no Node server). This runs
// on Supabase's infrastructure instead, so it works from the static site.
//
// It changes another user's email and/or password using the service-role key.
// The service-role key is stored as a Function secret and never reaches the
// browser. Unlike the old route, this one AUTHORIZES the caller: only a signed-in
// user whose profile role is 'admin' may perform the change.
//
// Request body: { email: string, newEmail?: string, newPassword?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: "Server not configured" }, 500);
  }

  // ── Authorize the caller: must be a signed-in admin ──────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json({ error: "Missing authorization" }, 401);
  }

  // Client scoped to the caller's token, used only to identify who they are.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return json({ error: "Invalid session" }, 401);
  }

  // Admin client (service role) for the privileged lookups and update.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerProfile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("auth_id", caller.id)
    .maybeSingle();

  if (profileError) {
    return json({ error: "Failed to verify permissions" }, 500);
  }
  if (!callerProfile || callerProfile.role !== "admin") {
    return json({ error: "Forbidden: admin role required" }, 403);
  }

  // ── Parse and validate the request ───────────────────────────────────────
  let body: { email?: string; newEmail?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { email, newEmail, newPassword } = body;
  if (!email) {
    return json({ error: "email is required" }, 400);
  }

  const updates: { email?: string; password?: string } = {};
  if (newEmail) updates.email = newEmail;
  if (newPassword) updates.password = newPassword;
  if (Object.keys(updates).length === 0) {
    return json({ error: "No updates provided" }, 400);
  }

  // ── Find the target user by email and apply the update ───────────────────
  // listUsers is paginated (default 50/page); page through to find the match.
  let target: { id: string } | undefined;
  for (let page = 1; page <= 100 && !target; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      return json({ error: error.message }, 500);
    }
    target = data.users.find((u) => u.email === email);
    if (data.users.length < 1000) break; // last page reached
  }

  if (!target) {
    return json({ error: "User not found" }, 404);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    target.id,
    updates,
  );
  if (updateError) {
    return json({ error: updateError.message }, 500);
  }

  return json({ success: true });
});
