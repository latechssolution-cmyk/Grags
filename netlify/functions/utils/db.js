const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  // Return a dummy object during build or if environment variable is missing
  console.warn("WARNING: MONGODB_URI is not set. Database operations will fail.");
} else {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

async function getDb(dbName = "graggs") {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing. Please set it in Netlify or local .env file.");
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

module.exports = { getDb };
