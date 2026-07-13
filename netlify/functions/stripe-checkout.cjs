const Stripe = require("stripe");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY environment variable is not set");
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Stripe is not configured" }) };
  }

  try {
    const { orderId, email, items, shippingCost, currency } = JSON.parse(event.body);
    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing orderId or items" }) };
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const cur = (currency || "pkr").toLowerCase();

    const line_items = items.map((i) => ({
      price_data: {
        currency: cur,
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }));

    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: cur,
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const origin = event.headers.origin || `https://${event.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email || undefined,
      success_url: `${origin}/checkout/success?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      metadata: { orderId },
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("stripe-checkout error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
