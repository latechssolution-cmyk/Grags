const { getDb } = require("./utils/db");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Seed data
const defaultHero = {
  image: "", // Fallback will use the frontend import defaultImage
  videoUrl: "/hero-video.mp4",
  useVideo: true,
  heading: "Redefining\nElegance",
  subheading: "Summer 2025 Collection",
  buttonText: "Shop the Drop",
  buttonLink: "#products",
};

const defaultFabric = {
  image: "", // Fallback will use the frontend import defaultImage
  heading: "Every Thread\nTells a Story",
  subheading: "Crafted With Intention",
  buttonText: "Discover Fabrics",
  buttonLink: "#",
};

const defaultData = {
  key: "hero_fabric_data",
  hero: defaultHero,
  fabric: defaultFabric,
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("hero");

    // GET: Retrieve hero and fabric data
    if (event.httpMethod === "GET") {
      let data = await collection.findOne({ key: "hero_fabric_data" });
      if (!data) {
        console.log("Seeding hero/fabric database with defaults...");
        await collection.insertOne(defaultData);
        data = defaultData;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // POST: Update hero or fabric data
    if (event.httpMethod === "POST") {
      const updates = JSON.parse(event.body);
      
      // Remove _id from updates to avoid Mongo immutable field error
      delete updates._id;
      updates.key = "hero_fabric_data";

      const result = await collection.findOneAndUpdate(
        { key: "hero_fabric_data" },
        { $set: updates },
        { upsert: true, returnDocument: "after" }
      );

      const updatedData = result.value || result;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedData),
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Database error in hero function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
