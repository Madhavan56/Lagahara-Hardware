import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "npm:@supabase/supabase-js@2";

type RequestBody = { orderId: string };

/**
 * Customer cancellation:
 *   • pending + unpaid  → the order row is deleted (order_items cascade), so it
 *     disappears from order history — the checkout-dismissal path.
 *   • pending + paid    → marked 'cancelled' (kept for refund/audit trail).
 * Ownership is enforced by the RLS-scoped lookup; the admin client only runs
 * after the caller is proven to own a pending order.
 */
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
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
    if (!body.orderId) {
      return Response.json({ error: "orderId is required" }, { status: 400 });
    }

    const { data: order, error: orderError } = await callerClient
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", body.orderId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (orderError) {
      return Response.json({ error: "Order lookup failed" }, { status: 500 });
    }
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return Response.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
    }

    const admin = ctx.supabaseAdmin;

    if (order.payment_status === "pending") {
      const { error: deleteError } = await admin
        .from("orders")
        .delete()
        .eq("id", order.id);
      if (deleteError) {
        return Response.json({ error: "Could not remove order" }, { status: 500 });
      }
      return Response.json({ ok: true, removed: true });
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    if (updateError) {
      return Response.json({ error: "Could not cancel order" }, { status: 500 });
    }
    return Response.json({ ok: true, removed: false });
  }),
};
