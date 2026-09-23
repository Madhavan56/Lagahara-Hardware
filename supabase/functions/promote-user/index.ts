import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "npm:@supabase/supabase-js@2";

type RequestBody = { userId: string };

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.userId || !/^[0-9a-f-]{36}$/i.test(body.userId)) {
      return Response.json({ error: "userId must be a valid UUID" }, { status: 400 });
    }

    const { error: promotionError } = await callerClient.rpc("promote_user_to_admin", {
      target_user_id: body.userId,
    });

    if (promotionError) {
      if (promotionError.code === "42501") {
        return Response.json({ error: promotionError.message }, { status: 403 });
      }
      if (promotionError.code === "23514") {
        return Response.json({ error: promotionError.message }, { status: 409 });
      }
      if (promotionError.code === "P0002") {
        return Response.json({ error: promotionError.message }, { status: 404 });
      }
      return Response.json({ error: "Could not promote user" }, { status: 500 });
    }

    return Response.json({ ok: true });
  }),
};
