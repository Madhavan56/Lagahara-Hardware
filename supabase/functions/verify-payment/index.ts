import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "npm:@supabase/supabase-js@2";

type RequestBody = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

function badRequest(message: string, details?: unknown) {
  return Response.json({ error: message, details }, { status: 400 });
}

/**
 * Constant-time HMAC-SHA256 comparison of Razorpay's checkout signature:
 * HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret).
 * Rejects forged payment confirmations before any order is marked paid.
 */
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!secret) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const payload = `${orderId}|${paymentId}`;
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Authenticated caller only — the client's JWT scopes the lookup below.
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
      return badRequest("Invalid JSON body");
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return badRequest("razorpayOrderId, razorpayPaymentId and razorpaySignature are required");
    }

    const signatureValid = await verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (!signatureValid) {
      return Response.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    const admin = ctx.supabaseAdmin;

    // Ownership + state check happens in the RLS-scoped query: the caller can
    // only confirm their own order, and only while it is still pending.
    const { data: order, error: orderError } = await callerClient
      .from("orders")
      .select("id, order_number, status, payment_status, razorpay_order_id")
      .eq("razorpay_order_id", razorpayOrderId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (orderError) {
      return Response.json({ error: "Order lookup failed" }, { status: 500 });
    }
    if (!order) {
      return badRequest("Order not found for this payment");
    }
    if (order.payment_status !== "pending" || order.status !== "pending") {
      return badRequest("Order is not awaiting payment");
    }

    const now = new Date().toISOString();
    const { error: updateError } = await admin
      .from("orders")
      .update({
        razorpay_payment_id: razorpayPaymentId,
        payment_status: "paid",
        status: "confirmed",
        placed_at: now,
      })
      .eq("id", order.id);

    if (updateError) {
      return Response.json({ error: "Could not confirm order" }, { status: 500 });
    }

    return Response.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  }),
};
