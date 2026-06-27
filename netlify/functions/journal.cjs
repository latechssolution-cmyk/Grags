const { getDb } = require("./utils/db.cjs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const defaultArticles = [
  {
    id: "j1",
    title: "The Anatomy of a Perfect Polo",
    excerpt: "Every stitch tells a story. We break down what separates a mediocre polo from one that becomes a wardrobe staple — from collar construction to placket finish.",
    content: "**The Collar**\n\nThe collar is the first thing that makes contact with the face. A quality polo uses a rib-knit collar with sufficient weight to hold its shape without curling — typically a 2×2 or 3×3 rib. Cheaper versions use flat-knit collars that soften and curl within weeks of regular washing.\n\n**The Placket**\n\nA clean placket lies flat and stays flat. This requires interfacing — a hidden layer that provides structure — and careful alignment of the button holes to prevent the placket from twisting over time.\n\n**The Fabric**\n\nPiqué cotton is the traditional choice and for good reason. The textured weave is more breathable than jersey, holds its shape under stress, and develops character as it softens. The weight matters too — a fabric weight of 200–240gsm strikes the right balance between structure and comfort in warmer months.\n\n**The Finish**\n\nAt GRAGS, every polo is finished with a side-split hem at the correct length — long enough to tuck but short enough to wear untucked without looking sloppy. These details are invisible until you notice their absence.",
    tag: "Craft",
    date: "June 2025",
    published: true,
    createdAt: "2025-06-01T00:00:00.000Z",
    coverImage: "",
    link: "",
    keywords: ["polo", "craftsmanship", "fabric"],
  },
  {
    id: "j2",
    title: "How to Dress for Pakistan's Summer",
    excerpt: "Dressing well in 40°C heat is an art form. Our style guide covers the fabrics, cuts, and colours that keep you cool without compromising on refinement.",
    content: "**Fabric First**\n\nLinen is the obvious answer and the correct one. Its loose weave allows air to circulate freely, and it absorbs moisture without holding it against the skin. The wrinkles? Embrace them. A slightly rumpled linen shirt reads as cultivated ease, not carelessness.\n\nCotton remains a close second — particularly chambray and lightweight poplin. Both breathe well and press cleanly if you need to maintain a sharper appearance for formal settings.\n\n**Colour and Pattern**\n\nLighter tones reflect heat rather than absorbing it — whites, creams, stone, and pale blue are both practical and visually cool. Patterns — particularly fine stripes and subtle checks — add interest without weight.\n\n**Fit**\n\nContrary to instinct, extremely loose clothing is not always cooler. A relaxed fit (not oversized) in a breathable fabric is the optimal combination.\n\n**The Essentials**\n\nOne well-chosen linen half-sleeve, two cotton polo shirts in neutral tones, and a pair of lightweight trousers with a clean waistband. This is a summer wardrobe that requires no compromise.",
    tag: "Style",
    date: "May 2025",
    published: true,
    createdAt: "2025-05-01T00:00:00.000Z",
    coverImage: "",
    link: "",
    keywords: ["summer", "style", "linen", "pakistan"],
  },
  {
    id: "j3",
    title: "The Gurkha Trouser: A Brief History",
    excerpt: "Originally designed for military officers, the Gurkha trouser has found its way into contemporary menswear as a symbol of understated elegance. Here's how it happened.",
    content: "**The Origin**\n\nThe original design was functional: high-waisted, with a distinctive double-tab front closure instead of a traditional waistband button or belt loops. This allowed the trouser to be adjusted precisely at the waist for comfort during long marches and rigorous activity.\n\n**The Design Language**\n\nWhat makes the Gurkha trouser distinctive is the exposed waistband and the twin-tab front. The waist sits higher than a standard trouser — typically an inch or two above the natural waist — which creates a long, clean line through the hip and thigh. This is flattering on almost every build.\n\nThe pleats at the front — usually two forward-facing box pleats — provide ease of movement while maintaining a sharp silhouette when standing still.\n\n**Contemporary Wear**\n\nThe Gurkha has been adopted across fashion's more considered end for the past decade. It works particularly well with a tucked polo or a plain white shirt. At GRAGS, our Gurkha trouser follows the original proportions closely: a genuine high rise, real forward-facing pleats, and the signature twin tabs in a lightweight cotton-elastane blend suited to the Pakistani climate.",
    tag: "Heritage",
    date: "April 2025",
    published: true,
    createdAt: "2025-04-01T00:00:00.000Z",
    coverImage: "",
    link: "",
    keywords: ["gurkha", "heritage", "trousers", "history"],
  },
];

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("journal");

    if (event.httpMethod === "GET") {
      let articles = await collection.find({}).sort({ createdAt: -1 }).toArray();
      if (articles.length === 0) {
        console.log("Seeding journal collection with default articles...");
        await collection.insertMany(defaultArticles);
        articles = defaultArticles;
      }
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
