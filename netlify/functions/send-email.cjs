const RESEND_API_URL = "https://api.resend.com/emails";
const SENDER_EMAIL = "noreply@grags.shop";

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

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY environment variable is not set");
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Email service not configured" }) };
  }

  try {
    const { to, subject, html, from } = JSON.parse(event.body);

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Grags <${from || SENDER_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return { statusCode: res.status, headers, body: JSON.stringify({ error: data }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: data.id }) };
  } catch (err) {
    console.error("send-email error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
