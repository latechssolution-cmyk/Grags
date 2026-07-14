import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingBag, Tag, CheckCircle, Upload } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { useOrders } from "@/store/orderStore";
import { useSettings } from "@/store/settingsStore";
import { useProducts } from "@/store/productStore";

type PaymentMethod = "COD" | "Bank Transfer";
type ShippingMethod = "Standard" | "Express";

// COD ships free above this subtotal; at/below it, a flat delivery charge applies.
// Bank Transfer always ships free (Standard), regardless of order value.
const COD_FREE_SHIPPING_THRESHOLD = 2999;
const COD_SHIPPING_FEE = 200;
const EXPRESS_SHIPPING_COST = 250;

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

function Field({
  label, value, onChange, type = "text", required = true,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-foreground/50 tracking-widest uppercase">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-foreground/5 border border-foreground/15 px-4 py-3 text-sm placeholder:text-foreground/20 focus:outline-none focus:border-foreground/40 transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { addOrder } = useOrders();
  const { decrementStock } = useProducts();
  const { settings, applyCoupon } = useSettings();

  const [form, setForm] = useState<FormData>({
    customerName: "", email: "", phone: "", house: "", street: "", city: "", postalCode: "", country: "Pakistan",
    shippingMethod: "Standard", paymentMethod: "COD", sameAsBilling: true,
    billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "Pakistan",
  });
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [receiptImage, setReceiptImage] = useState("");

  const set = (key: keyof FormData) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [key]: v }));

  const setPaymentMethod = (m: PaymentMethod) => {
    setForm((f) => ({
      ...f,
      paymentMethod: m,
      // Express is Bank Transfer only — fall back to Standard for every other method
      shippingMethod: m !== "Bank Transfer" && f.shippingMethod === "Express" ? "Standard" : f.shippingMethod,
    }));
    if (m !== "Bank Transfer") setReceiptImage("");
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Meta Pixel — InitiateCheckout
  useEffect(() => {
    if (items.length > 0 && typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        content_ids: items.map((i) => i.productId),
        content_type: "product",
        value: subtotal,
        currency: "PKR",
        num_items: items.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBankTransfer = form.paymentMethod === "Bank Transfer";
  const shippingCost =
    form.shippingMethod === "Express"
      ? EXPRESS_SHIPPING_COST
      : isBankTransfer
      ? 0
      : subtotal > COD_FREE_SHIPPING_THRESHOLD
      ? 0
      : COD_SHIPPING_FEE;
  const discount = couponResult?.valid ? couponResult.discount : 0;
  const total = Math.max(0, subtotal + shippingCost - discount);
  const receiptRequired = isBankTransfer && !receiptImage;

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput.trim(), subtotal, items);
    setCouponResult(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || receiptRequired) return;

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
      ...(isBankTransfer && receiptImage ? { receiptImage } : {}),
    };

    addOrder(order);
    decrementStock(items.map((i) => ({ id: i.productId, size: i.size, color: i.color, quantity: i.quantity })));

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase", {
        transaction_id: id,
        value: total,
        currency: "PKR",
        items: items.map((i) => ({
          item_id: i.productId,
          item_name: i.name,
          price: parseInt(i.price.replace(/[^0-9]/g, "")) || 0,
          quantity: i.quantity,
          item_size: i.size,
        })),
      });
    }

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Purchase", {
        value: total,
        currency: "PKR",
        content_type: "product",
        content_ids: items.map((i) => i.productId),
        contents: items.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: parseInt(i.price.replace(/[^0-9]/g, "")) || 0,
        })),
      });
    }

    clear();
    setOrderId(id);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <CheckCircle size={48} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest uppercase mb-3">Order Placed</h1>
          <p className="text-foreground/50 text-sm mb-2">Thank you for your order.</p>
          <p className="text-xs text-foreground/30 mb-8">Order ID: {orderId}</p>
          {settings.contactEmail && (
            <p className="text-xs text-foreground/30 mb-6">
              Questions? Email us at{" "}
              <a href={`mailto:${settings.contactEmail}`} className="underline hover:text-foreground/60">
                {settings.contactEmail}
              </a>
            </p>
          )}
          <Link
            to="/"
            className="inline-block bg-foreground text-background text-xs tracking-widest uppercase font-semibold px-8 py-3.5 hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/40 text-sm tracking-widest uppercase mb-6">Your cart is empty</p>
          <Link to="/" className="text-xs tracking-widest underline hover:text-foreground/60 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-foreground/40 hover:text-foreground/80 transition-colors mb-10"
        >
          <ChevronLeft size={14} />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-light tracking-widest uppercase mb-2">Checkout</h1>
        <p className="text-xs text-foreground/40 mb-8">
          <span className="text-destructive">*</span> Required fields
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Left — Form */}
            <div className="space-y-10">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-foreground/50 pb-2 border-b border-foreground/10">
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
                <h2 className="text-xs tracking-widest uppercase text-foreground/50 pb-2 border-b border-foreground/10">
                  Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="House / Apt" value={form.house} onChange={set("house")} />
                  <Field label="Street" value={form.street} onChange={set("street")} />
                  <Field label="City" value={form.city} onChange={set("city")} />
                  <Field label="Postal Code" value={form.postalCode} onChange={set("postalCode")} required={false} />
                  <Field label="Country" value={form.country} onChange={set("country")} />
                </div>
              </section>

              {/* Shipping Method */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-foreground/50 pb-2 border-b border-foreground/10">
                  Shipping Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["Standard", "Express"] as ShippingMethod[]).map((m) => {
                    const disabled = m === "Express" && !isBankTransfer;
                    const cost =
                      m === "Express"
                        ? EXPRESS_SHIPPING_COST
                        : isBankTransfer
                        ? 0
                        : subtotal > COD_FREE_SHIPPING_THRESHOLD
                        ? 0
                        : COD_SHIPPING_FEE;
                    return (
                      <label
                        key={m}
                        className={`flex items-center justify-between border px-4 py-3.5 transition-colors ${
                          disabled
                            ? "border-foreground/10 opacity-40 cursor-not-allowed"
                            : `cursor-pointer ${form.shippingMethod === m ? "border-foreground" : "border-foreground/15 hover:border-foreground/30"}`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.shippingMethod === m ? "border-foreground" : "border-foreground/30"}`}>
                            {form.shippingMethod === m && <div className="w-2 h-2 rounded-full bg-foreground" />}
                          </div>
                          <div>
                            <span className="text-sm block">{m}</span>
                            {disabled && <span className="text-[10px] text-foreground/40">Bank Transfer only</span>}
                          </div>
                        </div>
                        <span className="text-sm text-foreground/60">{cost > 0 ? `+PKR ${cost.toLocaleString()}` : "Free"}</span>
                        <input
                          type="radio"
                          className="sr-only"
                          disabled={disabled}
                          checked={form.shippingMethod === m}
                          onChange={() => set("shippingMethod")(m)}
                        />
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Payment */}
              <section className="space-y-4">
                <h2 className="text-xs tracking-widest uppercase text-foreground/50 pb-2 border-b border-foreground/10">
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["COD", "Bank Transfer"] as PaymentMethod[]).map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer transition-colors ${
                        form.paymentMethod === m ? "border-foreground" : "border-foreground/15 hover:border-foreground/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentMethod === m ? "border-foreground" : "border-foreground/30"}`}>
                        {form.paymentMethod === m && <div className="w-2 h-2 rounded-full bg-foreground" />}
                      </div>
                      <span className="text-sm">{m}</span>
                      {m === "Bank Transfer" && (
                        <span className="ml-auto text-[10px] tracking-wide uppercase text-green-600 border border-green-600/30 px-1.5 py-0.5">
                          Free Delivery
                        </span>
                      )}
                      <input type="radio" className="sr-only" checked={form.paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                    </label>
                  ))}
                </div>

                <p className="text-xs text-foreground/40">
                  Cash on Delivery orders above PKR {COD_FREE_SHIPPING_THRESHOLD.toLocaleString()} ship free — a PKR {COD_SHIPPING_FEE} delivery charge applies at or below that amount. Bank Transfer always ships free.
                </p>

                {/* Bank Transfer details + receipt upload */}
                {isBankTransfer && (
                  <div className="border border-foreground/15 p-4 space-y-4">
                    {settings.bankAccountDetails && (
                      <div>
                        <p className="text-xs text-foreground/50 tracking-widest uppercase mb-1.5">Transfer To</p>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{settings.bankAccountDetails}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-foreground/50 tracking-widest uppercase mb-1.5">
                        Payment Receipt<span className="text-destructive"> *</span>
                      </p>
                      <p className="text-xs text-foreground/40 mb-2">Attach a screenshot of your transfer — required before you can place the order.</p>
                      <label className="flex items-center gap-2 border border-foreground/20 px-4 py-3 cursor-pointer hover:border-foreground/40 transition-colors w-fit">
                        <Upload size={14} />
                        <span className="text-xs tracking-widest uppercase">{receiptImage ? "Replace Receipt" : "Upload Receipt"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                      </label>
                      {receiptImage && (
                        <img src={receiptImage} alt="Receipt preview" className="mt-3 max-h-40 border border-foreground/10 object-contain" />
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <label className="flex items-center gap-3 cursor-pointer mt-2">
                  <div
                    onClick={() => set("sameAsBilling")(!form.sameAsBilling)}
                    className={`w-4 h-4 border flex items-center justify-center transition-colors cursor-pointer ${form.sameAsBilling ? "bg-foreground border-foreground" : "border-foreground/30"}`}
                  >
                    {form.sameAsBilling && (
                      <svg viewBox="0 0 12 10" className="w-3 h-2.5 text-background">
                        <polyline points="1,5 4,9 11,1" strokeWidth="1.5" stroke="currentColor" fill="none" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground/60">Billing address same as shipping</span>
                </label>

                {!form.sameAsBilling && (
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <Field label="Billing House / Apt" value={form.billingHouse} onChange={set("billingHouse")} />
                    <Field label="Billing Street" value={form.billingStreet} onChange={set("billingStreet")} />
                    <Field label="Billing City" value={form.billingCity} onChange={set("billingCity")} />
                    <Field label="Billing Postal Code" value={form.billingPostalCode} onChange={set("billingPostalCode")} required={false} />
                    <Field label="Billing Country" value={form.billingCountry} onChange={set("billingCountry")} />
                  </div>
                )}
              </section>
            </div>

            {/* Right — Summary */}
            <div className="space-y-6">
              <div className="border border-foreground/10 p-6 space-y-5 sticky top-24">
                <h2 className="text-xs tracking-widest uppercase text-foreground/50">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-20 object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug truncate">{item.name}</p>
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {item.color && `${item.color} · `}Size {item.size} · ×{item.quantity}
                        </p>
                        <p className="text-sm mt-1">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-3 border-t border-foreground/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponResult(null); }}
                      className="flex-1 bg-foreground/5 border border-foreground/15 px-3 py-2 text-sm placeholder:text-foreground/20 focus:outline-none focus:border-foreground/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 border border-foreground/20 text-xs tracking-widest uppercase hover:border-foreground/50 transition-colors"
                    >
                      <Tag size={14} />
                    </button>
                  </div>
                  {couponResult && (
                    <p className={`text-xs ${couponResult.valid ? "text-green-600" : "text-destructive"}`}>
                      {couponResult.message}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-3 border-t border-foreground/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Shipping</span>
                    <span>{shippingCost > 0 ? `PKR ${shippingCost.toLocaleString()}` : "Free"}</span>
                  </div>
                  {couponResult?.valid && couponResult.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span>-PKR {couponResult.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t border-foreground/10">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={receiptRequired}
                  className="w-full bg-foreground text-background text-xs tracking-widest uppercase font-semibold py-4 hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Place Order
                </button>
                {receiptRequired && (
                  <p className="text-xs text-destructive text-center">Attach your payment receipt to continue.</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
