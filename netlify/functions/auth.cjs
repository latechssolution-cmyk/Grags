const { getDb } = require("./utils/db.cjs");
const crypto = require("crypto");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "graggs2025";

  try {
    const db = await getDb();
    const sessions = db.collection("admin_sessions");

    // POST — login: validate credentials, create session
    if (event.httpMethod === "POST") {
      const { username, password } = JSON.parse(event.body || "{}");

      // Constant-time comparison — pad both buffers to equal length to prevent
      // timingSafeEqual throwing ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH
      function safeCompare(a, b) {
        const aBuf = Buffer.from(a);
        const bBuf = Buffer.from(b);
        const len = Math.max(aBuf.length, bBuf.length);
        const aPad = Buffer.alloc(len); aBuf.copy(aPad);
        const bPad = Buffer.alloc(len); bBuf.copy(bPad);
        return crypto.timingSafeEqual(aPad, bPad);
      }
      const userMatch = safeCompare(username || "", ADMIN_USER);
      const passMatch = safeCompare(password || "", ADMIN_PASS);

      if (!userMatch || !passMatch) {
        await new Promise((r) => setTimeout(r, 600)); // brute-force delay
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Invalid credentials" }),
        };
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      await sessions.insertOne({ token, expiresAt, createdAt: new Date() });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token }),
      };
    }

    // GET — validate session token
    if (event.httpMethod === "GET") {
      const token = event.queryStringParameters?.token;
      if (!token) {
        return { statusCode: 401, headers, body: JSON.stringify({ valid: false }) };
      }

      // Purge expired sessions opportunistically
      await sessions.deleteMany({ expiresAt: { $lt: new Date() } });

      const session = await sessions.findOne({ token });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: !!session }),
      };
    }

    // DELETE — logout: remove session
    if (event.httpMethod === "DELETE") {
      const token = event.queryStringParameters?.token;
      if (token) await sessions.deleteOne({ token });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
