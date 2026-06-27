const { Resend } = require("resend");

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
    const { to, subject, html } = JSON.parse(event.body);
    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "GRAGS <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { statusCode: 400, headers, body: JSON.stringify({ error }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: data.id }) };
  } catch (err) {
    console.error("send-email error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
