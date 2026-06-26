const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Seed data
const defaultOrders = [
  {
    id: "GRG-001",
    customerName: "Ahmed Khan",
    email: "ahmed@example.com",
    phone: "0301-1234567",
    house: "123", street: "Main Boulevard", city: "Lahore", postalCode: "54000", country: "Pakistan",
    shippingMethod: "Standard", paymentMethod: "COD",
    sameAsBilling: true, billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "",
    products: [{ id: "1", name: "Textured Polo", price: "PKR 3,490", size: "L", quantity: 1 }, { id: "4", name: "Gurkha Pants", price: "PKR 4,490", size: "32", quantity: 1 }],
    subtotal: 7980, discount: 0, couponCode: "",
    total: "PKR 7,980",
    date: "2025-06-01",
    status: "Pending",
  },
  {
    id: "GRG-002",
    customerName: "Usman Ali",
    email: "usman@example.com",
    phone: "0321-9876543",
    house: "45", street: "Gulberg III", city: "Lahore", postalCode: "54660", country: "Pakistan",
    shippingMethod: "Express", paymentMethod: "Bank Transfer",
    sameAsBilling: true, billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "",
    products: [{ id: "2", name: "Signature Dual-Tone Polo", price: "PKR 3,990", size: "M", quantity: 1 }],
    subtotal: 3990, discount: 0, couponCode: "",
    total: "PKR 3,990",
    date: "2025-06-02",
    status: "Confirmed",
  },
];

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("orders");

    // GET: List all orders
    if (event.httpMethod === "GET") {
      let orders = await collection.find({}).sort({ date: -1, id: -1 }).toArray();
      if (orders.length === 0) {
        console.log("Seeding orders database with default orders...");
        await collection.insertMany(defaultOrders);
        orders = defaultOrders;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(orders),
      };
    }

    // POST: Add new order
    if (event.httpMethod === "POST") {
      const order = JSON.parse(event.body);
      await collection.insertOne(order);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(order),
      };
    }

    // PUT: Update order status
    if (event.httpMethod === "PUT") {
      const { id } = event.queryStringParameters || {};
      const { status } = JSON.parse(event.body);

      if (!id) {
        return { statusCode: 400, headers, body: "Missing order id in query parameter" };
      }

      await collection.updateOne(
        { id: id },
        { $set: { status } }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id, status }),
      };
    }

    // DELETE: Remove an order
    if (event.httpMethod === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) {
        return { statusCode: 400, headers, body: "Missing order id in query parameter" };
      }
      await collection.deleteOne({ id });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Database error in orders function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
