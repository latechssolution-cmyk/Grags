const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Seed data
const defaultSettings = {
  key: "site_settings",
  whatsappNumber: "923049172098",
  contactEmail: "support@grags.shop",
  senderEmail: "",
  storeLocation: "",
  googleMapsUrl: "",
  storeLocations: [],
  trackOrderUrl: "https://www.tcs.com.pk/tracking",
  instagramUrl: "",
  facebookUrl: "",
  bankAccountDetails: "",
  couponCodes: [
    { id: "1", code: "GRAGS10", discount: 10, type: "percentage", active: true },
    { id: "2", code: "WELCOME500", discount: 500, type: "fixed", active: true },
  ],
  collections: [
    { id: "1", name: "MENS POLO", title: "Men's Polos", subtitle: "Classic Collection", slug: "mens-polo" },
    { id: "2", name: "SIGNATURE COLLECTION", title: "Signature Collection", subtitle: "Exclusive Designs", slug: "signature-collection" },
    { id: "3", name: "WINTER COLLECTION", title: "Winter Collection", subtitle: "Cold Weather Essentials", slug: "winter-collection" },
  ],
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("settings");

    // GET: Retrieve settings
    if (event.httpMethod === "GET") {
      let settings = await collection.findOne({ key: "site_settings" });
      if (!settings) {
        console.log("Seeding settings database with default settings...");
        await collection.insertOne(defaultSettings);
        settings = defaultSettings;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settings),
      };
    }

    // POST: Update settings
    if (event.httpMethod === "POST") {
      const updates = JSON.parse(event.body);
      
      // Remove _id from updates to avoid Mongo immutable field error
      delete updates._id;
      updates.key = "site_settings";

      const result = await collection.findOneAndUpdate(
        { key: "site_settings" },
        { $set: updates },
        { upsert: true, returnDocument: "after" }
      );

      const updatedSettings = result.value || result;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedSettings),
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Database error in settings function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
