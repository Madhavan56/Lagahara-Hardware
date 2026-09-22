import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "npm:@supabase/supabase-js@2";

type OrderItemInput = { productId: string; quantity: number };
type RequestBody = {
  addressId: string;
  shippingMethodCode: string;
  items: OrderItemInput[];
  customerNote?: string;
};

function badRequest(message: string, details?: unknown) {
  return Response.json({ error: message, details }, { status: 400 });
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // ctx.supabase is not bound to the caller's JWT (verified by hand before
    // writing this) — build a client from the incoming Authorization header
    // so RLS applies as this specific user, not the function's own identity.
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
    const userId = userData.user.id;

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    if (!body.addressId || !body.shippingMethodCode || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("addressId, shippingMethodCode and a non-empty items array are required");
    }
    for (const item of body.items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return badRequest("Each item needs a productId and a positive integer quantity");
      }
    }

    // Ownership of the address is enforced by RLS on this RLS-scoped query,
    // not by trusting the client — a foreign address id simply returns no rows.
    const { data: address, error: addressError } = await callerClient
      .from("addresses")
      .select("id, full_name, phone, line1, line2, city, state, postal_code, country")
      .eq("id", body.addressId)
      .single();

    if (addressError || !address) {
      return badRequest("Address not found or does not belong to you");
    }

    // Everything from here reads authoritative server-side state — prices,
    // stock and shipping cost never come from the client.
    const admin = ctx.supabaseAdmin;

    const { data: shippingMethod, error: shippingError } = await admin
      .from("shipping_methods")
      .select("id, code, name, description, price, eta_days_min, eta_days_max")
      .eq("code", body.shippingMethodCode)
      .eq("is_active", true)
      .single();

    if (shippingError || !shippingMethod) {
      return badRequest("Selected shipping method is not available");
    }

    const productIds = body.items.map((item) => item.productId);
    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id, slug, sku, name, price, gst_rate, unit_label, stock_quantity, is_active, product_images(storage_path, is_primary)")
      .in("id", productIds);

    if (productsError) {
      return Response.json({ error: "Could not load products" }, { status: 500 });
    }

    const productById = new Map((products ?? []).map((p) => [p.id, p]));
    const stockIssues: { productId: string; available: number; requested: number }[] = [];

    for (const item of body.items) {
      const product = productById.get(item.productId);
      if (!product || !product.is_active) {
        return badRequest(`Product ${item.productId} is not available`);
      }
      if (product.stock_quantity < item.quantity) {
        stockIssues.push({
          productId: item.productId,
          available: product.stock_quantity,
          requested: item.quantity,
        });
      }
    }

    if (stockIssues.length > 0) {
      return badRequest("Insufficient stock for one or more items", stockIssues);
    }

    const subtotal = body.items.reduce((sum, item) => {
      const product = productById.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);
    const shippingAmount = shippingMethod.price;
    const total = subtotal + shippingAmount;

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: userData.user.email ?? null,
        customer_name: profile?.full_name ?? null,
        status: "pending",
        payment_status: "pending",
        subtotal,
        shipping_amount: shippingAmount,
        tax_amount: 0,
        discount_amount: 0,
        total,
        currency: "INR",
        shipping_method_id: shippingMethod.id,
        shipping_method_code: shippingMethod.code,
        shipping_method_name: shippingMethod.name,
        shipping_method_description: shippingMethod.description,
        shipping_eta_days_min: shippingMethod.eta_days_min,
        shipping_eta_days_max: shippingMethod.eta_days_max,
        shipping_address: address,
        customer_note: body.customerNote ?? null,
        placed_at: new Date().toISOString(),
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return Response.json({ error: "Could not create order", details: orderError?.message }, { status: 500 });
    }

    const orderItems = body.items.map((item) => {
      const product = productById.get(item.productId)!;
      const images = (product.product_images ?? []) as { storage_path: string; is_primary: boolean }[];
      const primaryImage = images.find((img) => img.is_primary) ?? images[0];
      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_sku: product.sku,
        product_image_path: primaryImage?.storage_path ?? null,
        unit_label: product.unit_label,
        unit_price: product.price,
        gst_rate: product.gst_rate,
        quantity: item.quantity,
        line_total: product.price * item.quantity,
      };
    });

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);

    if (itemsError) {
      // Best-effort rollback: an orphaned pending order with no items is
      // useless and would confuse admin/order-history views.
      await admin.from("orders").delete().eq("id", order.id);
      return Response.json({ error: "Could not create order items", details: itemsError.message }, { status: 500 });
    }

    return Response.json({
      orderId: order.id,
      orderNumber: order.order_number,
      subtotal,
      shippingAmount,
      total,
    });
  }),
};
