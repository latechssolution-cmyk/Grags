import { useState, useEffect, useCallback } from "react";

export interface JournalArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  date: string;
  published: boolean;
  createdAt: string;
}

const defaultArticles: JournalArticle[] = [
  {
    id: "j1",
    title: "The Anatomy of a Perfect Polo",
    excerpt: "Every stitch tells a story. We break down what separates a mediocre polo from one that becomes a wardrobe staple — from collar construction to placket finish.",
    content: `A polo shirt seems deceptively simple. Two buttons, a collar, a hem. Yet the difference between a polo that pills after three washes and one that holds its shape for a decade lies in decisions made before a single stitch is sewn.

**The Collar**
The collar is the first thing that makes contact with the face. A quality polo uses a rib-knit collar with sufficient weight to hold its shape without curling — typically a 2×2 or 3×3 rib. Cheaper versions use flat-knit collars that soften and curl within weeks of regular washing.

**The Placket**
A clean placket lies flat and stays flat. This requires interfacing — a hidden layer that provides structure — and careful alignment of the button holes to prevent the placket from twisting over time. Look for buttons sewn with a shank (a small raised loop beneath) rather than flat to the fabric; they open and close more smoothly and last longer.

**The Fabric**
Piqué cotton is the traditional choice and for good reason. The textured weave is more breathable than jersey, holds its shape under stress, and develops character as it softens. The weight matters too — a fabric weight of 200–240gsm strikes the right balance between structure and comfort in warmer months.

**The Finish**
At GRAGS, every polo is finished with a side-split hem at the correct length — long enough to tuck but short enough to wear untucked without looking sloppy. The sleeve hem is double-stitched to prevent unravelling, and the back yoke is cut with minimal seam bulk.

These details are invisible until you notice their absence.`,
    tag: "Craft",
    date: "June 2025",
    published: true,
    createdAt: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "j2",
    title: "How to Dress for Pakistan's Summer",
    excerpt: "Dressing well in 40°C heat is an art form. Our style guide covers the fabrics, cuts, and colours that keep you cool without compromising on refinement.",
    content: `Summer in Pakistan is not for the faint-hearted — or the poorly dressed. Between 38°C afternoons and the social obligations that don't pause for the heat, the ability to look composed while staying cool is a genuine skill.

**Fabric First**
Linen is the obvious answer and the correct one. Its loose weave allows air to circulate freely, and it absorbs moisture without holding it against the skin. The wrinkles? Embrace them. A slightly rumpled linen shirt reads as cultivated ease, not carelessness.

Cotton remains a close second — particularly chambray and lightweight poplin. Both breathe well and press cleanly if you need to maintain a sharper appearance for formal settings.

Avoid synthetics entirely. Polyester may look crisp on a hanger, but it traps heat and moisture in a way that becomes visibly uncomfortable within an hour outdoors.

**Colour and Pattern**
Lighter tones reflect heat rather than absorbing it — whites, creams, stone, and pale blue are both practical and visually cool. Earth tones in the mid-range work well too. Navy is acceptable in the morning; save darker colours for evenings when the temperature drops.

Patterns — particularly fine stripes and subtle checks — add interest without weight.

**Fit**
Contrary to instinct, extremely loose clothing is not always cooler. Fabric that clings to the body through sweat is worse than a well-fitted shirt that allows a small amount of air movement around the body. A relaxed fit (not oversized) in a breathable fabric is the optimal combination.

**The Essentials**
One well-chosen linen half-sleeve, two cotton polo shirts in neutral tones, and a pair of lightweight trousers with a clean waistband. This is a summer wardrobe that requires no compromise.`,
    tag: "Style",
    date: "May 2025",
    published: true,
    createdAt: "2025-05-01T00:00:00.000Z",
  },
  {
    id: "j3",
    title: "The Gurkha Trouser: A Brief History",
    excerpt: "Originally designed for military officers, the Gurkha trouser has found its way into contemporary menswear as a symbol of understated elegance. Here's how it happened.",
    content: `The Gurkha trouser takes its name from the elite soldiers of Nepal who served under the British Army, renowned for their discipline, skill, and quiet confidence — qualities that translate, rather elegantly, to the garment itself.

**The Origin**
The original design was functional: high-waisted, with a distinctive double-tab front closure instead of a traditional waistband button or belt loops. This allowed the trouser to be adjusted precisely at the waist for comfort during long marches and rigorous activity. The side adjusters — two small fabric tabs that cinch the waist — meant no belt was required.

**The Design Language**
What makes the Gurkha trouser distinctive is the exposed waistband and the twin-tab front. The waist sits higher than a standard trouser — typically an inch or two above the natural waist — which creates a long, clean line through the hip and thigh. This is flattering on almost every build.

The pleats at the front — usually two forward-facing box pleats — provide ease of movement while maintaining a sharp silhouette when standing still. The taper toward the ankle keeps the whole line modern rather than vintage-costume.

**Contemporary Wear**
The Gurkha has been adopted across fashion's more considered end for the past decade. It works particularly well with a tucked polo or a plain white shirt — the high waist emphasising the length of the torso. Worn with loafers or derbies and no belt (as originally intended), it reads as someone who understands clothing without announcing it.

At GRAGS, our Gurkha trouser follows the original proportions closely: a genuine high rise, real forward-facing pleats, and the signature twin tabs in a lightweight cotton-elastane blend suited to the Pakistani climate.`,
    tag: "Heritage",
    date: "April 2025",
    published: true,
    createdAt: "2025-04-01T00:00:00.000Z",
  },
];

const STORAGE_KEY = "graggs_journal";

function loadArticles(): JournalArticle[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return defaultArticles;
}

function saveArticles(articles: JournalArticle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export function useJournal() {
  const [articles, setArticles] = useState<JournalArticle[]>(loadArticles);

  useEffect(() => {
    const handler = () => setArticles(loadArticles());
    listeners.add(handler);

    fetch("/.netlify/functions/journal")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          saveArticles(data);
          setArticles(data);
        }
      })
      .catch((err) => console.error("Error fetching journal articles:", err));

    return () => { listeners.delete(handler); };
  }, []);

  const addArticle = useCallback((article: JournalArticle) => {
    const current = loadArticles();
    const next = [article, ...current];
    saveArticles(next);
    setArticles(next);
    notify();

    fetch("/.netlify/functions/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    }).catch((err) => console.error("Error adding article to MongoDB:", err));
  }, []);

  const updateArticle = useCallback((id: string, data: Partial<JournalArticle>) => {
    const current = loadArticles();
    const next = current.map((a) => (a.id === id ? { ...a, ...data } : a));
    saveArticles(next);
    setArticles(next);
    notify();

    fetch(`/.netlify/functions/journal?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch((err) => console.error("Error updating article in MongoDB:", err));
  }, []);

  const deleteArticle = useCallback((id: string) => {
    const current = loadArticles();
    const next = current.filter((a) => a.id !== id);
    saveArticles(next);
    setArticles(next);
    notify();

    fetch(`/.netlify/functions/journal?id=${id}`, {
      method: "DELETE",
    }).catch((err) => console.error("Error deleting article from MongoDB:", err));
  }, []);

  return { articles, addArticle, updateArticle, deleteArticle };
}
