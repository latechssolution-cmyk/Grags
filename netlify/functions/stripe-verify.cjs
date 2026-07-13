const Stripe = require("stripe");
const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Stripe is not configured" }) };
  }

  const { session_id, order } = event.queryStringParameters || {};
  if (!session_id || !order) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing session_id or order" }) };
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const paid = session.payment_status === "paid" && session.metadata?.orderId === order;

    if (paid) {
      const db = await getDb();
      await db.collection("orders").updateOne(
        { id: order },
        { $set: { status: "Confirmed", paid: true } }
      );
    }

    return { statusCode: 200, headers, body: JSON.stringify({ paid }) };
  } catch (err) {
    console.error("stripe-verify error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
