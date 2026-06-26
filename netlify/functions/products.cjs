const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Seed data
const defaultProducts = [
  {
    id: "1",
    name: "Textured Polo",
    price: "PKR 3,490",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop",
    tag: "Best Seller",
    tags: ["NEW IN", "TOPS"],
    collections: ["MENS POLO"],
    description: "Premium textured polo crafted from finest cotton.",
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    colorVariants: [],
    sku: "f123-337d",
    fit: "Regular Fit",
    gender: "Men",
    fabric: "100% Pique Cotton",
    careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on low heat", "Do not dry clean"],
    discountPercent: 0,
    reviews: [],
  },
  {
    id: "2",
    name: "Signature Dual-Tone Polo",
    price: "PKR 3,990",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
    tag: "New",
    tags: ["NEW IN", "TOPS"],
    collections: ["MENS POLO", "SIGNATURE COLLECTION"],
    description: "Signature dual-tone polo with contrast detailing.",
    sizes: ["S", "M", "L", "XL"],
    stock: 18,
    colorVariants: [],
    sku: "e456-992a",
    fit: "Relaxed Fit",
    gender: "Men",
    fabric: "100% Cotton Interlock",
    careInstructions: ["Hand wash or machine wash cold", "Wash separately first few washes", "Do not bleach", "Dry flat in shade", "Warm iron if needed"],
    discountPercent: 0,
    reviews: [],
  },
  {
    id: "3",
    name: "Linen Half Sleeve",
    price: "PKR 3,290",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    tag: null,
    tags: ["TOPS", "ESSENTIALS"],
    collections: ["SIGNATURE COLLECTION"],
    description: "Relaxed linen half sleeve for summer elegance.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 30,
    colorVariants: [],
    sku: "a789-55bc",
    fit: "Relaxed Fit",
    gender: "Men",
    fabric: "55% Linen, 45% Cotton",
    careInstructions: ["Hand wash recommended", "Use mild detergent", "Do not wring", "Dry flat in shade", "Iron while slightly damp for best results"],
    discountPercent: 0,
    reviews: [],
  },
  {
    id: "4",
    name: "Gurkha Pants",
    price: "PKR 4,490",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
    tag: "Limited",
    tags: ["BOTTOMS", "HERITAGE"],
    collections: ["WINTER COLLECTION"],
    description: "Classic Gurkha pants with heritage-inspired detailing.",
    sizes: ["30", "32", "34", "36"],
    stock: 12,
    colorVariants: [],
    sku: "d012-88ef",
    fit: "Tapered Fit",
    gender: "Men",
    fabric: "98% Cotton, 2% Elastane",
    careInstructions: ["Machine wash cold with similar colours", "Do not bleach", "Tumble dry low", "Iron on medium heat", "Dry clean if needed"],
    discountPercent: 0,
    reviews: [],
  },
];

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("products");

    // GET: List all products (with auto-seeding if empty)
    if (event.httpMethod === "GET") {
      let products = await collection.find({}).toArray();
      if (products.length === 0) {
        console.log("Seeding products database with default products...");
        await collection.insertMany(defaultProducts);
        products = defaultProducts;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(products),
      };
    }

    // POST: Add new product
    if (event.httpMethod === "POST") {
      const product = JSON.parse(event.body);
      if (!product.id) {
        product.id = String(Date.now());
      }
      await collection.insertOne(product);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(product),
      };
    }

    // PUT: Update product
    if (event.httpMethod === "PUT") {
      const { id } = event.queryStringParameters || {};
      const updates = JSON.parse(event.body);
      
      if (!id) {
        return { statusCode: 400, headers, body: "Missing product id in query parameter" };
      }

      // Remove _id from updates if present to avoid Mongo immutable field error
      delete updates._id;

      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updates },
        { returnDocument: "after" }
      );

      // Support mongodb driver v4/v5/v6 returned document format variations
      const updatedProduct = result.value || result;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedProduct),
      };
    }

    // DELETE: Delete product
    if (event.httpMethod === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) {
        return { statusCode: 400, headers, body: "Missing product id in query parameter" };
      }

      await collection.deleteOne({ id: id });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id }),
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Database error in products function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
