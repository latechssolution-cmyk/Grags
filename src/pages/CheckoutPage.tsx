import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingBag, Tag, CheckCircle } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { useOrders } from "@/store/orderStore";
import { useSettings } from "@/store/settingsStore";

type PaymentMethod = "COD" | "Bank Transfer" | "EasyPaisa" | "JazzCash";
type ShippingMethod = "Standard" | "Express";

interface FormData {
  customerName: string;
  email: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  sameAsBilling: boolean;
  billingHouse: string;
  billingStreet: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
}

const SHIPPING_COST: Record<ShippingMethod, number> = { Standard: 250, Express: 500 };

function Field({
  label, value, onChange, type = "text", required = true,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 tracking-widest uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { addOrder } = useOrders();
  const { settings, applyCoupon } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    customerName: "", email: "", phone: "", house: "", street: "", city: "", postalCode: "", country: "Pakistan",
    shippingMethod: "Standard", paymentMethod: "COD", sameAsBilling: true,
    billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "Pakistan",
  });
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const set = (key: keyof FormData) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [key]: v }));

  const shippingCost = SHIPPING_COST[form.shippingMethod];
  const discount = couponResult?.valid ? couponResult.discount : 0;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput.trim(), subtotal, items);
    setCouponResult(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const id = `GRG-${Date.now().toString().slice(-6)}`;
    const order = {
      id,
      ...form,
      products: items.map((i) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
      subtotal,
      discount,
      couponCode: couponResult?.valid ? couponInput.trim().toUpperCase() : "",
      total: `PKR ${total.toLocaleString()}`,
      date: new Date().toISOString().split("T")[0],
      status: "Pending" as const,
    };

    addOrder(order);
    clear();
    setOrderId(id);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <CheckCircle size={48} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest uppercase mb-3">Order Placed</h1>
          <p className="text-white/50 text-sm mb-2">Thank you for your order.</p>
          <p className="text-xs text-white/30 mb-8">Order ID: {orderId}</p>
          {settings.contactEmail && (
            <p className="text-xs text-white/30 mb-6">
              Questions? Email us at{" "}
              <a href={`mailto:${settings.contactEmail}`} className="underline hover:text-white/60">
                {settings.contactEmail}
              </a>
            </p>
          )}
          <Link
            to="/"
            className="inline-block bg-white text-black text-xs tracking-widest uppercase font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm tracking-widest uppercase mb-6">Your cart is empty</p>
          <Link to="/" className="text-xs tracking-widest underline hover:text-white/60 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white/40 hover:text-white/80 transition-colors mb-10"
        >
          <ChevronLeft size={14} />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-light tracking-widest uppercase mb-10">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Left — Form */}
            <div className="space-y-10">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-white/50 pb-2 border-b border-white/10">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" value={form.customerName} onChange={set("customerName")} />
                  <Field label="Phone" value={form.phone} onChange={set("phone")} type="tel" />
                </div>
                <Field label="Email" value={form.email} onChange={set("email")} type="email" required={false} />
              </section>

              {/* Shipping Address */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-white/50 pb-2 border-b border-white/10">
                  Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="House / Apt" value={form.house} onChange={set("house")} />
                  <Field label="Street" value={form.street} onChange={set("street")} />
                  <Field label="City" value={form.city} onChange={set("city")} />
                  <Field label="Postal Code" value={form.postalCode} onChange={set("postalCode")} />
                  <Field label="Country" value={form.country} onChange={set("country")} />
                </div>
              </section>

              {/* Shipping Method */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-white/50 pb-2 border-b border-white/10">
                  Shipping Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["Standard", "Express"] as ShippingMethod[]).map((m) => (
                    <label
                      key={m}
                      className={`flex items-center justify-between border px-4 py-3.5 cursor-pointer transition-colors ${
                        form.shippingMethod === m ? "border-white" : "border-white/15 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.shippingMethod === m ? "border-white" : "border-white/30"}`}>
                          {form.shippingMethod === m && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm">{m}</span>
                      </div>
                      <span className="text-sm text-white/60">PKR {SHIPPING_COST[m].toLocaleString()}</span>
                      <input type="radio" className="sr-only" checked={form.shippingMethod === m} onChange={() => set("shippingMethod")(m)} />
                    </label>
                  ))}
                </div>
              </section>

              {/* Payment */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-white/50 pb-2 border-b border-white/10">
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["COD", "Bank Transfer", "EasyPaisa", "JazzCash"] as PaymentMethod[]).map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer transition-colors ${
                        form.paymentMethod === m ? "border-white" : "border-white/15 hover:border-white/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentMethod === m ? "border-white" : "border-white/30"}`}>
                        {form.paymentMethod === m && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm">{m}</span>
                      <input type="radio" className="sr-only" checked={form.paymentMethod === m} onChange={() => set("paymentMethod")(m)} />
                    </label>
                  ))}
                </div>

                {/* Billing Address */}
                <label className="flex items-center gap-3 cursor-pointer mt-2">
                  <div
                    onClick={() => set("sameAsBilling")(!form.sameAsBilling)}
                    className={`w-4 h-4 border flex items-center justify-center transition-colors cursor-pointer ${form.sameAsBilling ? "bg-white border-white" : "border-white/30"}`}
                  >
                    {form.sameAsBilling && <svg viewBox="0 0 12 10" className="w-3 h-2.5 fill-black"><polyline points="1,5 4,9 11,1" strokeWidth="1.5" stroke="black" fill="none" /></svg>}
                  </div>
                  <span className="text-sm text-white/60">Billing address same as shipping</span>
                </label>

                {!form.sameAsBilling && (
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <Field label="Billing House / Apt" value={form.billingHouse} onChange={set("billingHouse")} />
                    <Field label="Billing Street" value={form.billingStreet} onChange={set("billingStreet")} />
                    <Field label="Billing City" value={form.billingCity} onChange={set("billingCity")} />
                    <Field label="Billing Postal Code" value={form.billingPostalCode} onChange={set("billingPostalCode")} />
                    <Field label="Billing Country" value={form.billingCountry} onChange={set("billingCountry")} />
                  </div>
                )}
              </section>
            </div>

            {/* Right — Summary */}
            <div className="space-y-6">
              <div className="border border-white/10 p-6 space-y-5 sticky top-24">
                <h2 className="text-xs tracking-widest uppercase text-white/50">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-20 object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug truncate">{item.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {item.color && `${item.color} · `}Size {item.size} · ×{item.quantity}
                        </p>
                        <p className="text-sm mt-1">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponResult(null); }}
                      className="flex-1 bg-white/5 border border-white/15 px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 border border-white/20 text-xs tracking-widest uppercase hover:border-white/50 transition-colors"
                    >
                      <Tag size={14} />
                    </button>
                  </div>
                  {couponResult && (
                    <p className={`text-xs ${couponResult.valid ? "text-green-400" : "text-red-400"}`}>
                      {couponResult.message}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Shipping</span>
                    <span>PKR {shippingCost.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount</span>
                      <span>-PKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black text-xs tracking-widest uppercase font-semibold py-4 hover:bg-white/90 transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
