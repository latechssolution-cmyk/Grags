const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("journal");

    if (event.httpMethod === "GET") {
      const articles = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return { statusCode: 200, headers, body: JSON.stringify(articles) };
    }

    if (event.httpMethod === "POST") {
      const article = JSON.parse(event.body);
      await collection.insertOne(article);
      return { statusCode: 201, headers, body: JSON.stringify(article) };
    }

    if (event.httpMethod === "PUT") {
      const { id } = event.queryStringParameters || {};
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing id" }) };
      const updates = JSON.parse(event.body);
      delete updates._id;
      await collection.updateOne({ id }, { $set: updates });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing id" }) };
      await collection.deleteOne({ id });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Error in journal function:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
