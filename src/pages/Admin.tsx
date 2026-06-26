import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Package, ShoppingCart, Image, Search, X, Save, Settings, Tag, Film } from "lucide-react";
import { useProducts, Product, ColorVariant, generateProductCode } from "@/store/productStore";
import { useHero, useFabric } from "@/store/heroStore";
import { useOrders, OrderStatus } from "@/store/orderStore";
import { useSettings, CouponCode } from "@/store/settingsStore";

const EMAILJS_SERVICE_ID  = "service_lzhp8t6";
const EMAILJS_TEMPLATE_ID = "template_mq2zq75";
const EMAILJS_PUBLIC_KEY  = "bNSf_ytdwdT2A38I8";

const ALL_TAGS = ["NEW IN", "TOPS", "BOTTOMS", "ESSENTIALS", "HERITAGE"];
const ALL_COLLECTIONS = ["MENS POLO", "SIGNATURE COLLECTION", "WINTER COLLECTION"];
const ORDER_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// ─── Inject EmailJS SDK once ──────────────────────────────
const initEmailJS = (): Promise<void> =>
  new Promise((resolve) => {
    if ((window as any).emailjs) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => { (window as any).emailjs.init(EMAILJS_PUBLIC_KEY); resolve(); };
    document.head.appendChild(s);
  });

// ─── Send Status Email via EmailJS ───────────────────────
const sendStatusEmail = async (status: OrderStatus, order: any): Promise<boolean> => {
  await initEmailJS();

  const subjects: Record<OrderStatus, string> = {
    Pending:   `Your GRAGGS Order #${order.id} is Pending`,
    Confirmed: `Your GRAGGS Order #${order.id} Has Been Confirmed ✅`,
    Shipped:   `Your GRAGGS Order #${order.id} Has Been Shipped 📦`,
    Delivered: `Your GRAGGS Order #${order.id} Has Been Delivered 🎉`,
    Cancelled: `Your GRAGGS Order #${order.id} Has Been Cancelled`,
  };

  const intros: Record<OrderStatus, string> = {
    Pending:   "We have received your order and it is currently pending review. We will notify you as soon as it is confirmed.",
    Confirmed: "Great news — your order has been confirmed! We are now carefully preparing your items for dispatch. You will receive another update once your order ships.",
    Shipped:   "Your order is on its way! Our delivery partner has collected your package and it is heading to you now. Please keep an eye on your doorstep.",
    Delivered: "Your GRAGGS order has been delivered! We hope you love your new pieces. Thank you for choosing GRAGGS.",
    Cancelled: "We regret to inform you that your order has been cancelled. If you believe this is a mistake or require any assistance, please contact us immediately.",
  };

  const address = `${order.house}, ${order.street}, ${order.city}, ${order.country}`;

  const itemsHtml = order.products.map((p: any) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:#0a0a0a;font-weight:500;border-bottom:1px solid #f0ede8;">${p.name}</td>
      <td style="padding:7px 0;font-size:12px;color:#888;text-align:right;border-bottom:1px solid #f0ede8;">Size: ${p.size} x ${p.quantity}</td>
    </tr>`).join("");

  const message = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
  <div style="background:#0a0a0a;padding:32px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:7px;color:#555;text-transform:uppercase;">GRAGGS</p>
    <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">${subjects[status]}</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 4px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;">Hello,</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0a0a0a;">${order.customerName}</p>
    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.7;">${intros[status]}</p>
    <div style="background:#f8f7f4;border:1px solid #e8e6e0;padding:24px;margin-bottom:20px;">
      <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;font-weight:700;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;padding:6px 0;border-bottom:1px solid #e8e6e0;">Order ID</td>
          <td style="font-size:12px;font-weight:700;color:#0a0a0a;text-align:right;padding:6px 0;border-bottom:1px solid #e8e6e0;">${order.id}</td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;padding:6px 0;border-bottom:1px solid #e8e6e0;">Date</td>
          <td style="font-size:12px;color:#555;text-align:right;padding:6px 0;border-bottom:1px solid #e8e6e0;">${order.date}</td>
        </tr>
        <tr><td colspan="2" style="padding-top:14px;">
          <p style="margin:0 0 8px;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Items</p>
          <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
        </td></tr>
        ${order.subtotal ? `<tr>
          <td style="font-size:11px;color:#aaa;text-transform:uppercase;padding:8px 0 0;border-top:1px solid #e8e6e0;">Subtotal</td>
          <td style="font-size:12px;color:#555;text-align:right;padding:8px 0 0;border-top:1px solid #e8e6e0;">PKR ${order.subtotal?.toLocaleString()}</td>
        </tr>` : ""}
        ${order.discount ? `<tr>
          <td style="font-size:11px;color:#aaa;text-transform:uppercase;padding:4px 0;">Discount</td>
          <td style="font-size:12px;color:#2d6a4f;text-align:right;padding:4px 0;">-PKR ${order.discount?.toLocaleString()}</td>
        </tr>` : ""}
        <tr>
          <td style="font-size:12px;font-weight:700;color:#0a0a0a;text-transform:uppercase;padding:12px 0 0;border-top:2px solid #0a0a0a;">Total</td>
          <td style="font-size:16px;font-weight:700;color:#0a0a0a;text-align:right;padding:12px 0 0;border-top:2px solid #0a0a0a;">${order.total}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f8f7f4;border:1px solid #e8e6e0;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;font-weight:700;">Shipping Address</p>
      <p style="margin:0 0 4px;font-size:13px;color:#444;line-height:1.6;">${address}</p>
      <p style="margin:0;font-size:11px;color:#aaa;">${order.shippingMethod} · ${order.paymentMethod}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">Questions? Simply reply to this email and we will help you out.</p>
  </div>
  <div style="background:#0a0a0a;padding:20px 40px;text-align:center;">
    <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#444;">© GRAGGS · All Rights Reserved</p>
  </div>
</div>`;

  try {
    const result = await (window as any).emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: order.email,
        to_name:  order.customerName,
        subject:  subjects[status],
        message,
      }
    );
    return result.status === 200;
  } catch (err: any) {
    console.error("EmailJS error:", err);
    return false;
  }
};

// ─── Product Form ─────────────────────────────────────────
const ProductForm = ({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Product>(
    initial ?? {
      id: crypto.randomUUID(),
      name: "",
      price: "",
      image: "",
      tag: null,
      tags: [],
      collections: [],
      description: "",
      sizes: [],
      stock: 0,
      colorVariants: [],
      sku: generateProductCode(),
      fit: "",
      gender: "Men",
      fabric: "",
      careInstructions: [],
    }
  );
  const [sizeInput, setSizeInput] = useState("");
  const [careInput, setCareInput] = useState((initial?.careInstructions ?? []).join("\n"));
  const [newVariant, setNewVariant] = useState<ColorVariant>({ name: "", hex: "#1a1a1a", image: "" });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }));

  const toggleCollection = (col: string) =>
    setForm((f) => ({ ...f, collections: f.collections.includes(col) ? f.collections.filter((c) => c !== col) : [...f.collections, col] }));

  const addSize = () => {
    if (!sizeInput.trim()) return;
    setForm((f) => ({ ...f, sizes: [...f.sizes, sizeInput.trim()] }));
    setSizeInput("");
  };

  const inputCls = "w-full bg-secondary text-foreground border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans block mb-1";

  return (
    <div className="space-y-4">
      <div><label className={labelCls}>Name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Price</label><input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} /></div>
        <div><label className={labelCls}>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Badge Label</label><input value={form.tag ?? ""} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value || null }))} placeholder="e.g. Best Seller, New, Limited" className={inputCls} /></div>
      <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} /></div>
      <div>
        <label className={labelCls}>Category Tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALL_TAGS.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans border transition-colors duration-200 ${form.tags.includes(tag) ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground"}`}>{tag}</button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Collections</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALL_COLLECTIONS.map((col) => (
            <button key={col} onClick={() => toggleCollection(col)} className={`px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans border transition-colors duration-200 ${form.collections.includes(col) ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground"}`}>{col}</button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Sizes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.sizes.map((s, i) => (
            <span key={i} className="px-2 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-secondary text-foreground border border-border flex items-center gap-1">
              {s}<button onClick={() => setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSize()} placeholder="Add size" className={`flex-1 ${inputCls}`} />
          <button onClick={addSize} className="px-3 py-1 bg-foreground text-background text-xs font-sans">Add</button>
        </div>
      </div>
      <div>
        <label className={labelCls}>Default Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm font-sans text-muted-foreground" />
        {form.image && <img src={form.image} alt="Preview" className="mt-2 w-20 h-20 object-cover border border-border" />}
      </div>

      {/* ── Product Details ─────────────────────────────────── */}
      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans font-semibold">Product Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>SKU / Design Code</label>
            <input value={form.sku ?? ""} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="e.g. f123-337d" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fit</label>
            <input value={form.fit ?? ""} onChange={(e) => setForm((f) => ({ ...f, fit: e.target.value }))} placeholder="e.g. Regular Fit" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Gender</label>
            <select value={form.gender ?? "Men"} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputCls}>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Fabric / Composition</label>
            <input value={form.fabric ?? ""} onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))} placeholder="e.g. 100% Cotton" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Care Instructions (one per line)</label>
          <textarea
            value={careInput}
            onChange={(e) => {
              setCareInput(e.target.value);
              setForm((f) => ({ ...f, careInstructions: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }));
            }}
            rows={4}
            placeholder={"Machine wash cold\nDo not bleach\nDry flat in shade"}
            className={`${inputCls} resize-none`}
          />
          <p className="text-[10px] text-muted-foreground font-sans mt-1">Each line becomes one bullet point on the product page.</p>
        </div>
      </div>

      {/* ── Color Variants ──────────────────────────────────── */}
      <div className="space-y-3">
        <label className={labelCls}>Color Variants</label>
        <p className="text-[10px] text-muted-foreground font-sans -mt-2">Link specific images to each color option. The first variant is the default shown on the card.</p>

        {/* Existing variants list */}
        {(form.colorVariants || []).length > 0 && (
          <div className="space-y-2">
            {(form.colorVariants || []).map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2 border border-border bg-secondary/40">
                <span
                  className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                  style={{ backgroundColor: v.hex }}
                />
                <span className="text-sm font-sans text-foreground flex-1">{v.name}</span>
                <span className="text-xs text-muted-foreground font-sans">{v.hex}</span>
                {v.image && <img src={v.image} alt={v.name} className="w-8 h-10 object-cover border border-border" />}
                <button
                  onClick={() => setForm((f) => ({ ...f, colorVariants: (f.colorVariants || []).filter((_, idx) => idx !== i) }))}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new variant form */}
        <div className="border border-dashed border-border p-4 space-y-3 bg-secondary/20">
          <p className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans font-semibold">Add Color Variant</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Color Name</label>
              <input
                value={newVariant.name}
                onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
                placeholder="e.g. Navy Blue"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newVariant.hex}
                  onChange={(e) => setNewVariant((v) => ({ ...v, hex: e.target.value }))}
                  className="w-10 h-10 border border-border cursor-pointer p-0.5 bg-secondary"
                />
                <span className="text-xs font-sans text-muted-foreground">{newVariant.hex}</span>
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Variant Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setNewVariant((v) => ({ ...v, image: reader.result as string }));
                reader.readAsDataURL(file);
              }}
              className="text-sm font-sans text-muted-foreground"
            />
            {newVariant.image && (
              <img src={newVariant.image} alt="preview" className="mt-2 w-14 h-16 object-cover border border-border" />
            )}
          </div>
          <button
            onClick={() => {
              if (!newVariant.name.trim()) return;
              setForm((f) => ({
                ...f,
                colorVariants: [...(f.colorVariants || []), { name: newVariant.name.trim(), hex: newVariant.hex, image: newVariant.image }],
              }));
              setNewVariant({ name: "", hex: "#1a1a1a", image: "" });
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3 h-3" /> Add Variant
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity"><Save className="w-3 h-3" /> Save</button>
        <button onClick={onCancel} className="px-6 py-2 border border-border text-foreground text-xs tracking-ultra-wide uppercase font-sans hover:bg-secondary transition-colors">Cancel</button>
      </div>
    </div>
  );
};

// ─── Admin Page ───────────────────────────────────────────
const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { hero, updateHero, defaultImage } = useHero();
  const { fabric, updateFabric, defaultImage: fabricDefaultImage } = useFabric();
  const { orders, updateStatus } = useOrders();
  const { settings, updateSettings, addCoupon, deleteCoupon, toggleCoupon } = useSettings();

  const [tab, setTab] = useState<"products" | "hero" | "fabric" | "orders" | "coupons" | "settings">("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [heroForm, setHeroForm] = useState(hero);
  const [fabricForm, setFabricForm] = useState(fabric);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 0, type: "percentage" as "percentage" | "fixed" });
  const [whatsappNum, setWhatsappNum] = useState(settings.whatsappNumber);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Pre-load EmailJS SDK on mount
  useEffect(() => { initEmailJS(); }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, order: any) => {
    updateStatus(orderId, newStatus);
    showToast("⏳ Sending email...");
    const success = await sendStatusEmail(newStatus, order);
    showToast(
      success ? `✅ Email sent to ${order.email}` : `❌ Email failed — check console for details`,
      success
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== "ALL" && o.status !== orderStatusFilter) return false;
      if (orderDateFilter && o.date !== orderDateFilter) return false;
      if (orderSearch) {
        const q = orderSearch.toLowerCase();
        const addressStr = `${o.house} ${o.street} ${o.city} ${o.country}`.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          addressStr.includes(q) ||
          o.phone.includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.products.some((p: any) => p.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter]);

  const handleHeroImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setHeroForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleHeroVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroForm((f) => ({ ...f, videoUrl: URL.createObjectURL(file) }));
  };

  const handleFabricImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFabricForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const inputCls = "w-full bg-secondary text-foreground border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans block mb-1";

  const tabs = [
    { id: "products" as const, label: "Products", icon: Package },
    { id: "hero" as const, label: "Hero", icon: Film },
    { id: "fabric" as const, label: "Fabric", icon: Image },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "coupons" as const, label: "Coupons", icon: Tag },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  const statusColors: Record<OrderStatus, string> = {
    Pending:   "text-yellow-500",
    Confirmed: "text-blue-500",
    Shipped:   "text-purple-500",
    Delivered: "text-green-500",
    Cancelled: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-5 right-5 z-[100] px-5 py-3 text-xs tracking-wide font-sans shadow-xl max-w-xs ${toast.ok ? "bg-foreground text-background" : "bg-red-600 text-white"}`}
        >
          {toast.msg}
        </motion.div>
      )}

      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-5 md:px-10 py-4">
          <a href="/" className="text-2xl font-roman font-bold tracking-ultra-wide text-foreground">GRAGGS</a>
          <span className="text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans">Admin Panel</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
        <div className="flex gap-1 mb-10 border-b border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 text-[10px] md:text-xs tracking-ultra-wide uppercase font-sans transition-colors duration-200 border-b-2 whitespace-nowrap ${tab === id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ─── Products ─── */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {!addingProduct && !editingProduct && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground">Products</h2>
                  <button onClick={() => setAddingProduct(true)} className="flex items-center gap-2 px-5 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity">
                    <Plus className="w-3 h-3" /> Add Product
                  </button>
                </div>
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 border border-border bg-card">
                      <img src={p.image} alt={p.name} className="w-14 h-14 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-sans font-medium text-foreground truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground font-sans">{p.price} · Stock: {p.stock}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.map((t) => <span key={t} className="text-[9px] px-2 py-0.5 bg-secondary text-secondary-foreground tracking-ultra-wide uppercase font-sans">{t}</span>)}
                          {p.collections?.map((c) => <span key={c} className="text-[9px] px-2 py-0.5 bg-accent text-accent-foreground tracking-ultra-wide uppercase font-sans">{c}</span>)}
                        </div>
                      </div>
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {addingProduct && <div><h2 className="text-2xl font-serif font-bold text-foreground mb-6">Add Product</h2><ProductForm onSave={(p) => { addProduct(p); setAddingProduct(false); }} onCancel={() => setAddingProduct(false)} /></div>}
            {editingProduct && <div><h2 className="text-2xl font-serif font-bold text-foreground mb-6">Edit Product</h2><ProductForm initial={editingProduct} onSave={(p) => { updateProduct(p.id, p); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
          </motion.div>
        )}

        {/* ─── Hero ─── */}
        {tab === "hero" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Hero Section</h2>
            <div><label className={labelCls}>Subheading</label><input value={heroForm.subheading} onChange={(e) => setHeroForm((f) => ({ ...f, subheading: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Heading (use \n for line break)</label><input value={heroForm.heading} onChange={(e) => setHeroForm((f) => ({ ...f, heading: e.target.value }))} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Button Text</label><input value={heroForm.buttonText} onChange={(e) => setHeroForm((f) => ({ ...f, buttonText: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Button Link</label><input value={heroForm.buttonLink} onChange={(e) => setHeroForm((f) => ({ ...f, buttonLink: e.target.value }))} className={inputCls} /></div>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => setHeroForm((f) => ({ ...f, useVideo: !f.useVideo }))}>
                <div className={`w-4 h-4 border ${heroForm.useVideo ? "bg-foreground border-foreground" : "border-border"} flex items-center justify-center`}>{heroForm.useVideo && <div className="w-2 h-2 bg-background" />}</div>
                <span className="text-sm font-sans text-foreground">Use Video instead of Image</span>
              </label>
            </div>
            {heroForm.useVideo ? (
              <div>
                <label className={labelCls}>Hero Video</label>
                <input type="file" accept="video/*" onChange={handleHeroVideo} className="text-sm font-sans text-muted-foreground" />
                <div><label className={labelCls + " mt-3"}>Or Video URL</label><input value={heroForm.videoUrl} onChange={(e) => setHeroForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." className={inputCls} /></div>
                {heroForm.videoUrl && <video src={heroForm.videoUrl} className="mt-3 w-full max-w-md h-48 object-cover border border-border" muted autoPlay loop />}
              </div>
            ) : (
              <div>
                <label className={labelCls}>Hero Image</label>
                <input type="file" accept="image/*" onChange={handleHeroImage} className="text-sm font-sans text-muted-foreground" />
                <img src={heroForm.image || defaultImage} alt="Hero preview" className="mt-3 w-full max-w-md h-48 object-cover border border-border" />
              </div>
            )}
            <button onClick={() => updateHero(heroForm)} className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity"><Save className="w-3 h-3" /> Save Hero</button>
          </motion.div>
        )}

        {/* ─── Fabric ─── */}
        {tab === "fabric" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Fabric Section</h2>
            <div><label className={labelCls}>Subheading</label><input value={fabricForm.subheading} onChange={(e) => setFabricForm((f) => ({ ...f, subheading: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Heading (use \n for line break)</label><input value={fabricForm.heading} onChange={(e) => setFabricForm((f) => ({ ...f, heading: e.target.value }))} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Button Text</label><input value={fabricForm.buttonText} onChange={(e) => setFabricForm((f) => ({ ...f, buttonText: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Button Link</label><input value={fabricForm.buttonLink} onChange={(e) => setFabricForm((f) => ({ ...f, buttonLink: e.target.value }))} className={inputCls} /></div>
            </div>
            <div>
              <label className={labelCls}>Background Image</label>
              <input type="file" accept="image/*" onChange={handleFabricImage} className="text-sm font-sans text-muted-foreground" />
              <img src={fabricForm.image || fabricDefaultImage} alt="Fabric preview" className="mt-3 w-full max-w-md h-48 object-cover border border-border" />
            </div>
            <button onClick={() => updateFabric(fabricForm)} className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity"><Save className="w-3 h-3" /> Save Fabric Section</button>
          </motion.div>
        )}

        {/* ─── Orders ─── */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">Orders</h2>
              <p className="text-[10px] text-muted-foreground font-sans text-right leading-5">Emails send automatically<br />when you change a status.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className={`${inputCls} pl-9`} />
              </div>
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className={inputCls}>
                <option value="ALL">All Statuses</option>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="date" value={orderDateFilter} onChange={(e) => setOrderDateFilter(e.target.value)} className={inputCls} />
            </div>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["ID", "Customer", "Email", "Phone", "Address", "Products", "Coupon", "Subtotal", "Discount", "Total", "Shipping", "Payment", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-3 py-3 text-foreground font-medium whitespace-nowrap">{o.id}</td>
                      <td className="px-3 py-3 text-foreground whitespace-nowrap">{o.customerName}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">{o.email}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{o.phone}</td>
                      <td className="px-3 py-3 text-muted-foreground max-w-[150px] truncate text-xs">{`${o.house}, ${o.street}, ${o.city}, ${o.country}`}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">{o.products.map((p: any) => `${p.name} (${p.size} x${p.quantity})`).join(", ")}</td>
                      <td className="px-3 py-3 text-xs">{o.couponCode ? <span className="text-accent">{o.couponCode}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">PKR {o.subtotal?.toLocaleString()}</td>
                      <td className="px-3 py-3 text-accent whitespace-nowrap">{o.discount ? `-PKR ${o.discount.toLocaleString()}` : "—"}</td>
                      <td className="px-3 py-3 text-foreground font-medium whitespace-nowrap">{o.total}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{o.shippingMethod}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{o.paymentMethod}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{o.date}</td>
                      <td className="px-3 py-3">
                        <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus, o)}
                          className={`bg-secondary border border-border px-2 py-1 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-ring font-medium ${statusColors[o.status as OrderStatus] ?? "text-foreground"}`}>
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan={14} className="px-4 py-8 text-center text-muted-foreground">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── Coupons ─── */}
        {tab === "coupons" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Coupon Codes</h2>
            <div className="border border-border p-5 mb-6 bg-card space-y-4">
              <h3 className="text-xs tracking-ultra-wide uppercase text-foreground font-sans font-semibold">Add New Coupon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={labelCls}>Code</label><input value={couponForm.code} onChange={(e) => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" className={inputCls} /></div>
                <div><label className={labelCls}>Discount Value</label><input type="number" value={couponForm.discount} onChange={(e) => setCouponForm(f => ({ ...f, discount: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className={labelCls}>Type</label>
                  <select value={couponForm.type} onChange={(e) => setCouponForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" }))} className={inputCls}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (PKR)</option>
                  </select>
                </div>
              </div>
              <button onClick={() => { if (!couponForm.code || !couponForm.discount) return; addCoupon({ id: crypto.randomUUID(), ...couponForm, active: true }); setCouponForm({ code: "", discount: 0, type: "percentage" }); }}
                className="flex items-center gap-2 px-5 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity">
                <Plus className="w-3 h-3" /> Add Coupon
              </button>
            </div>
            <div className="space-y-3">
              {settings.couponCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 border border-border bg-card">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-sans font-medium text-foreground tracking-wide">{c.code}</span>
                    <span className="text-xs text-muted-foreground font-sans">{c.type === "percentage" ? `${c.discount}% off` : `PKR ${c.discount} off`}</span>
                    <span className={`text-[9px] px-2 py-0.5 tracking-ultra-wide uppercase font-sans ${c.active ? "bg-accent text-accent-foreground" : "bg-destructive/20 text-destructive"}`}>{c.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleCoupon(c.id)} className="px-3 py-1 text-xs border border-border text-foreground font-sans hover:bg-secondary transition-colors">{c.active ? "Disable" : "Enable"}</button>
                    <button onClick={() => deleteCoupon(c.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Settings ─── */}
        {tab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Settings</h2>
            <div>
              <label className={labelCls}>WhatsApp Contact Number</label>
              <p className="text-xs text-muted-foreground font-sans mb-2">Enter the number with country code, no + sign (e.g. 923049172098)</p>
              <input value={whatsappNum} onChange={(e) => setWhatsappNum(e.target.value)} className={inputCls} placeholder="923049172098" />
            </div>
            <button onClick={() => updateSettings({ whatsappNumber: whatsappNum })}
              className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity">
              <Save className="w-3 h-3" /> Save Settings
            </button>
          </motion.div>
        )}
      </div>
      <div className="grain-overlay" />
    </div>
  );
};

export default Admin;