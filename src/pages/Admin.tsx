import { useState, useMemo, useEffect, useCallback, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Package, ShoppingCart, Image, Search, X, Save, Settings, Tag, Film, FolderOpen, LogOut, Eye, EyeOff, Lock, LayoutDashboard, TrendingUp, BarChart2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import logo from "@/assets/logo.png";
import { useProducts, Product, ColorVariant, generateProductCode } from "@/store/productStore";
import { useHero, useFabric } from "@/store/heroStore";
import { useOrders, OrderStatus } from "@/store/orderStore";
import { useSettings, CouponCode, Collection } from "@/store/settingsStore";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import { Order } from "@/store/orderStore";

const EMAILJS_SERVICE_ID  = "service_lzhp8t6";
const EMAILJS_TEMPLATE_ID = "template_mq2zq75";
const EMAILJS_PUBLIC_KEY  = "bNSf_ytdwdT2A38I8";

const ALL_TAGS = ["NEW IN", "TOPS", "BOTTOMS", "ESSENTIALS", "HERITAGE"];
const ORDER_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const PIE_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Shipped: "#8b5cf6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ElementType;
  accentColor?: string;
}) => (
  <div className="relative border border-border bg-card p-6 overflow-hidden hover:border-foreground/20 transition-colors duration-300 group">
    {accentColor && <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: accentColor }} />}
    <div className="flex items-start justify-between mb-3">
      <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans leading-none">{label}</p>
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/25 flex-shrink-0" />}
    </div>
    <p className="text-3xl font-serif font-bold text-foreground leading-none">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground/60 font-sans mt-2">{sub}</p>}
  </div>
);

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
    Pending:   `Your GRAGS Order #${order.id} is Pending`,
    Confirmed: `Your GRAGS Order #${order.id} Has Been Confirmed ✅`,
    Shipped:   `Your GRAGS Order #${order.id} Has Been Shipped 📦`,
    Delivered: `Your GRAGS Order #${order.id} Has Been Delivered 🎉`,
    Cancelled: `Your GRAGS Order #${order.id} Has Been Cancelled`,
  };

  const intros: Record<OrderStatus, string> = {
    Pending:   "We have received your order and it is currently pending review. We will notify you as soon as it is confirmed.",
    Confirmed: "Great news — your order has been confirmed! We are now carefully preparing your items for dispatch. You will receive another update once your order ships.",
    Shipped:   "Your order is on its way! Our delivery partner has collected your package and it is heading to you now. Please keep an eye on your doorstep.",
    Delivered: "Your GRAGS order has been delivered! We hope you love your new pieces. Thank you for choosing GRAGS.",
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
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:7px;color:#555;text-transform:uppercase;">GRAGS</p>
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
    <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#444;">© GRAGS · All Rights Reserved</p>
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
  availableCollections,
}: {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
  availableCollections: string[];
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
      showInstallments: true,
      installments: 4,
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
          {availableCollections.map((col) => (
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

        {/* Installments */}
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans font-semibold">Easy Installments</p>
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setForm((f) => ({ ...f, showInstallments: !f.showInstallments }))}>
            <div className={`w-4 h-4 border flex-shrink-0 ${form.showInstallments ? "bg-foreground border-foreground" : "border-border"} flex items-center justify-center`}>
              {form.showInstallments && <div className="w-2 h-2 bg-background" />}
            </div>
            <span className="text-sm font-sans text-foreground">Show installment badge on product page</span>
          </label>
          {form.showInstallments && (
            <div>
              <label className={labelCls}>Number of Installments</label>
              <select
                value={form.installments ?? 4}
                onChange={(e) => setForm((f) => ({ ...f, installments: Number(e.target.value) }))}
                className={inputCls}
              >
                {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n} installments</option>
                ))}
              </select>
            </div>
          )}
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

// ─── Auth helpers ─────────────────────────────────────────
const TOKEN_KEY = "graggs_admin_token";

async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`/.netlify/functions/auth?token=${token}`);
    const data = await res.json();
    return !!data.valid;
  } catch {
    return false;
  }
}

// ─── Admin Login Screen ───────────────────────────────────
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        onLogin();
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <img src={logo} alt="GRAGS" className="h-6 w-auto mx-auto mb-8 opacity-90" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans">Admin Access</p>
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full bg-secondary text-foreground border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-secondary text-foreground border border-border px-4 py-3 pr-11 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 font-sans"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:opacity-90 disabled:opacity-50 transition-all duration-300 mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground font-sans mt-8">
          GRAGS · Admin Panel
        </p>
      </motion.div>
    </div>
  );
};

// ─── Admin Panel (authenticated view) ────────────────────
const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { hero, updateHero, defaultImage } = useHero();
  const { fabric, updateFabric, defaultImage: fabricDefaultImage } = useFabric();
  const { orders, updateStatus } = useOrders();
  const { settings, updateSettings, addCoupon, deleteCoupon, toggleCoupon, addCollection, updateCollection, deleteCollection } = useSettings();

  const [tab, setTab] = useState<"dashboard" | "products" | "hero" | "fabric" | "orders" | "coupons" | "collections" | "settings">("dashboard");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [addingCollection, setAddingCollection] = useState(false);
  const [collectionForm, setCollectionForm] = useState<Collection>({ id: "", name: "", title: "", subtitle: "", slug: "", imageUrl: "" });
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [heroForm, setHeroForm] = useState(hero);
  const [fabricForm, setFabricForm] = useState(fabric);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 0, type: "percentage" as "percentage" | "fixed" });
  const [whatsappNum, setWhatsappNum] = useState(settings.whatsappNumber);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
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

  const availableCollections = (settings.collections ?? []).map((c) => c.name);

  const stats = useMemo(() => {
    const byStatus: Record<OrderStatus, number> = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    let revenue = 0;
    const productCounts: Record<string, number> = {};
    orders.forEach((o) => {
      byStatus[o.status as OrderStatus] = (byStatus[o.status as OrderStatus] || 0) + 1;
      if (o.status !== "Cancelled") revenue += (o.subtotal || 0) - (o.discount || 0);
      o.products.forEach((p) => {
        productCounts[p.name] = (productCounts[p.name] || 0) + p.quantity;
      });
    });
    const productChart = Object.entries(productCounts)
      .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
    const statusChart = ORDER_STATUSES.map((s) => ({ name: s, value: byStatus[s] }));
    const nonCancelled = orders.filter((o) => o.status !== "Cancelled");
    const aov = nonCancelled.length > 0 ? Math.round(revenue / nonCancelled.length) : 0;
    const itemsSold = nonCancelled.reduce((s, o) => s + o.products.reduce((a, p) => a + p.quantity, 0), 0);
    return { byStatus, revenue, total: orders.length, productChart, statusChart, aov, itemsSold };
  }, [orders]);

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "hero" as const, label: "Hero", icon: Film },
    { id: "fabric" as const, label: "Fabric", icon: Image },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "coupons" as const, label: "Coupons", icon: Tag },
    { id: "collections" as const, label: "Collections", icon: FolderOpen },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

  const openAddCollection = () => {
    setCollectionForm({ id: crypto.randomUUID(), name: "", title: "", subtitle: "", slug: "", imageUrl: "" });
    setEditingCollection(null);
    setAddingCollection(true);
  };

  const openEditCollection = (col: Collection) => {
    setCollectionForm({ ...col });
    setEditingCollection(col);
    setAddingCollection(false);
  };

  const saveCollectionForm = () => {
    if (!collectionForm.name.trim() || !collectionForm.slug.trim()) return;
    if (editingCollection) {
      updateCollection(editingCollection.id, collectionForm);
      setEditingCollection(null);
    } else {
      addCollection(collectionForm);
      setAddingCollection(false);
    }
  };

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
          <a href="/" className="text-2xl font-roman font-bold tracking-ultra-wide text-foreground">GRAGS</a>
          <div className="flex items-center gap-5">
            <span className="text-xs tracking-ultra-wide uppercase text-muted-foreground font-sans">Admin Panel</span>
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex items-center gap-1.5 text-xs tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
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

        {/* ─── Dashboard ─── */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-7">

            {/* Header */}
            <div className="flex items-end justify-between pb-5 border-b border-border">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight">Dashboard</h2>
                <p className="text-[11px] text-muted-foreground/70 font-sans mt-1 tracking-wide">
                  {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans">{stats.total} total orders</p>
                <p className="text-sm font-serif font-bold text-foreground mt-0.5">PKR {stats.revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Row 1: Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Orders" value={stats.total} sub={`${stats.byStatus.Pending} pending`} icon={ShoppingCart} accentColor="#3b82f6" />
              <StatCard label="Revenue" value={`PKR ${stats.revenue.toLocaleString()}`} sub="Excl. cancelled" icon={TrendingUp} accentColor="#10b981" />
              <StatCard label="Avg Order Value" value={`PKR ${stats.aov.toLocaleString()}`} sub="Per fulfilled order" icon={BarChart2} accentColor="#8b5cf6" />
              <StatCard label="Items Sold" value={stats.itemsSold} sub="Across all orders" icon={Package} accentColor="#f59e0b" />
            </div>

            {/* Row 2: Order status breakdown */}
            <div className="border border-border bg-card p-5">
              <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans mb-4">Orders by Status</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {ORDER_STATUSES.map((s) => {
                  const count = stats.byStatus[s];
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={s} className="relative p-4 bg-background border border-border overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: PIE_COLORS[s] }} />
                      <p className="text-[9px] tracking-ultra-wide uppercase font-sans pl-2 mb-2" style={{ color: PIE_COLORS[s] }}>{s}</p>
                      <p className="text-2xl font-serif font-bold text-foreground pl-2">{count}</p>
                      <div className="mt-3 h-[3px] bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[s], transition: "width 0.7s ease" }} />
                      </div>
                      <p className="text-[9px] text-muted-foreground/60 font-sans mt-1.5">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Inventory & coupons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard label="Total Products" value={products.length} sub="In catalogue" icon={Package} />
              <StatCard label="Active Coupons" value={settings.couponCodes.filter((c) => c.active).length} sub={`of ${settings.couponCodes.length} total`} icon={Tag} />
              <div className="relative border border-border bg-card p-6 overflow-hidden hover:border-foreground/20 transition-colors duration-300">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500" />
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans leading-none">Low Stock</p>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500/50 flex-shrink-0" />
                </div>
                <p className="text-3xl font-serif font-bold text-foreground leading-none">
                  {products.filter((p) => p.stock > 0 && p.stock <= 5).length}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-sans mt-2">≤ 5 units remaining</p>
                {products.filter((p) => p.stock > 0 && p.stock <= 5).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {products.filter((p) => p.stock > 0 && p.stock <= 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-sans text-foreground truncate">{p.name}</p>
                        <span className="text-[9px] font-sans text-amber-500 font-medium shrink-0">{p.stock} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans">Top Products</p>
                    <p className="text-xs font-sans text-foreground font-medium mt-0.5">Units sold per product</p>
                  </div>
                  <BarChart2 className="w-4 h-4 text-muted-foreground/25" />
                </div>
                <div className="p-5">
                  {stats.productChart.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-sans text-center py-16">No order data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.productChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} interval={0} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12, borderRadius: 0 }} cursor={{ fill: "hsl(var(--border))" }} />
                        <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <p className="text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-sans">Status Distribution</p>
                    <p className="text-xs font-sans text-foreground font-medium mt-0.5">Order fulfilment breakdown</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground/25" />
                </div>
                <div className="p-5">
                  {stats.total === 0 ? (
                    <p className="text-sm text-muted-foreground font-sans text-center py-16">No order data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={stats.statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={42} labelLine={false}>
                          {stats.statusChart.map((entry) => (
                            <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#888"} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12, borderRadius: 0 }} />
                        <Legend wrapperStyle={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
            {addingProduct && <div><h2 className="text-2xl font-serif font-bold text-foreground mb-6">Add Product</h2><ProductForm availableCollections={availableCollections} onSave={(p) => { addProduct(p); setAddingProduct(false); }} onCancel={() => setAddingProduct(false)} /></div>}
            {editingProduct && <div><h2 className="text-2xl font-serif font-bold text-foreground mb-6">Edit Product</h2><ProductForm availableCollections={availableCollections} initial={editingProduct} onSave={(p) => { updateProduct(p.id, p); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
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
                    {["", "ID", "Customer", "Email", "Phone", "Address", "Products", "Coupon", "Subtotal", "Discount", "Total", "Shipping", "Payment", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[9px] tracking-ultra-wide uppercase text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-3 py-3">
                        <button onClick={() => setSelectedOrder(o)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                      </td>
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
                  {filteredOrders.length === 0 && <tr><td colSpan={15} className="px-4 py-8 text-center text-muted-foreground">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

        {/* ─── Collections ─── */}
        {tab === "collections" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {!addingCollection && !editingCollection && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">Collections</h2>
                    <p className="text-xs text-muted-foreground font-sans mt-1">Collections group products and create browsable pages at /collections/slug</p>
                  </div>
                  <button onClick={openAddCollection} className="flex items-center gap-2 px-5 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity">
                    <Plus className="w-3 h-3" /> Add Collection
                  </button>
                </div>
                <div className="space-y-3">
                  {(settings.collections ?? []).map((col) => (
                    <div key={col.id} className="flex items-center gap-4 p-4 border border-border bg-card">
                      <div className="w-10 h-10 flex-shrink-0 bg-secondary border border-border overflow-hidden">
                        {col.imageUrl ? <img src={col.imageUrl} alt={col.title} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-sans font-medium text-foreground">{col.title}</h3>
                        <p className="text-xs text-muted-foreground font-sans">{col.subtitle} · <span className="font-mono">/collections/{col.slug}</span></p>
                        <p className="text-[10px] text-muted-foreground font-sans mt-0.5">Product tag: <span className="text-foreground font-medium">{col.name}</span></p>
                      </div>
                      <button onClick={() => openEditCollection(col)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteCollection(col.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {(settings.collections ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground font-sans text-sm py-10">No collections yet. Add one above.</p>
                  )}
                </div>
              </>
            )}

            {(addingCollection || editingCollection) && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  {editingCollection ? "Edit Collection" : "Add Collection"}
                </h2>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className={labelCls}>Collection Name <span className="text-muted-foreground normal-case">(used to tag products)</span></label>
                    <input
                      value={collectionForm.name}
                      onChange={(e) => setCollectionForm((f) => ({
                        ...f,
                        name: e.target.value.toUpperCase(),
                        slug: f.slug || slugify(e.target.value),
                      }))}
                      placeholder="e.g. SUMMER COLLECTION"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-muted-foreground font-sans mt-1">This is the exact value assigned to products. Keep it uppercase and consistent.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Display Title</label>
                    <input
                      value={collectionForm.title}
                      onChange={(e) => setCollectionForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Summer Collection"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Subtitle</label>
                    <input
                      value={collectionForm.subtitle}
                      onChange={(e) => setCollectionForm((f) => ({ ...f, subtitle: e.target.value }))}
                      placeholder="e.g. New Arrivals"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans text-muted-foreground whitespace-nowrap">/collections/</span>
                      <input
                        value={collectionForm.slug}
                        onChange={(e) => setCollectionForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="e.g. summer-collection"
                        className={`flex-1 ${inputCls}`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-sans mt-1">Auto-filled from name. Only lowercase letters, numbers and hyphens.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Cover Image URL <span className="text-muted-foreground normal-case">(optional)</span></label>
                    <input
                      value={collectionForm.imageUrl ?? ""}
                      onChange={(e) => setCollectionForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className={inputCls}
                    />
                    {collectionForm.imageUrl && (
                      <img src={collectionForm.imageUrl} alt="Preview" className="mt-2 w-24 h-28 object-cover border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveCollectionForm} className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity">
                      <Save className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => { setAddingCollection(false); setEditingCollection(null); }} className="px-6 py-2 border border-border text-foreground text-xs tracking-ultra-wide uppercase font-sans hover:bg-secondary transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              <p className="text-xs text-muted-foreground font-sans mb-2">Enter with country code, no + sign (e.g. 923049172098)</p>
              <input value={whatsappNum} onChange={(e) => setWhatsappNum(e.target.value)} className={inputCls} placeholder="923049172098" />
            </div>
            <div>
              <label className={labelCls}>Contact Email</label>
              <p className="text-xs text-muted-foreground font-sans mb-2">Shown on the Contact page and in the footer</p>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} placeholder="support@grags.com" />
            </div>
            <button onClick={() => updateSettings({ whatsappNumber: whatsappNum, contactEmail })}
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

// ─── Admin (auth wrapper) ─────────────────────────────────
const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) { setAuthChecked(true); return; }
    validateToken(token).then((valid) => {
      if (!valid) sessionStorage.removeItem(TOKEN_KEY);
      setAuthed(valid);
      setAuthChecked(true);
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      sessionStorage.removeItem(TOKEN_KEY);
      fetch(`/.netlify/functions/auth?token=${token}`, { method: "DELETE" }).catch(() => {});
    }
    setAuthed(false);
  }, []);

  if (!authChecked) return <div className="min-h-screen bg-background" />;
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminPanel onLogout={handleLogout} />;
};

export default Admin;