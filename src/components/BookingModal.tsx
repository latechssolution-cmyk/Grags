import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Truck, CreditCard } from "lucide-react";
import { Product } from "@/store/productStore";
import { useOrders, Order } from "@/store/orderStore";
import { useSettings } from "@/store/settingsStore";
import { toast } from "sonner";

interface BookingModalProps {
  product: Product;
  onClose: () => void;
  selectedVariantIdx?: number;
}

const SHIPPING_METHODS = ["Standard (3-5 days)", "Express (1-2 days)", "Same Day (Lahore Only)"];
const PAYMENT_METHODS = ["Cash on Delivery", "Bank Transfer", "JazzCash / EasyPaisa"];

const BookingModal = ({ product, onClose, selectedVariantIdx = 0 }: BookingModalProps) => {
  const { addOrder } = useOrders();
  const { applyCoupon } = useSettings();

  // Resolve display image: use selected color variant's image if available
  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const activeVariant = hasVariants ? product.colorVariants[selectedVariantIdx] : null;
  const displayImage = activeVariant?.image || product.image;

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"details" | "form">("details");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingHouse, setBillingHouse] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("Pakistan");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const priceNum = parseInt(product.price.replace(/[^0-9]/g, "")) || 0;
  const subtotal = priceNum * quantity;
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        content_ids: [product.id],
        content_type: "product",
        value: priceNum,
        currency: "PKR"
      });
    }
  }, [product, priceNum]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode, subtotal);
    setCouponMessage(result.message);
    if (result.valid) {
      setDiscount(result.discount);
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleSubmit = () => {
    if (!name || !email || !phone || !house || !street || !city || !country) {
      toast.error("Please fill in all required fields");
      return;
    }
    const order: Order = {
      id: `GRG-${String(Date.now()).slice(-6)}`,
      customerName: name,
      email,
      phone,
      house, street, city, postalCode, country,
      shippingMethod, paymentMethod,
      sameAsBilling,
      billingHouse: sameAsBilling ? house : billingHouse,
      billingStreet: sameAsBilling ? street : billingStreet,
      billingCity: sameAsBilling ? city : billingCity,
      billingPostalCode: sameAsBilling ? postalCode : billingPostalCode,
      billingCountry: sameAsBilling ? country : billingCountry,
      products: [{ id: product.id, name: product.name, price: product.price, size: selectedSize, quantity }],
      subtotal,
      discount,
      couponCode: couponApplied ? couponCode : "",
      total: `PKR ${total.toLocaleString()}`,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    addOrder(order);

    // Fire Google Ads / Google Analytics purchase event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase", {
        transaction_id: order.id,
        value: total,
        currency: "PKR",
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: priceNum,
            quantity: quantity,
            item_size: selectedSize
          }
        ]
      });
    }

    // Fire Meta Pixel purchase event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Purchase", {
        value: total,
        currency: "PKR",
        content_type: "product",
        content_ids: [product.id],
        contents: [
          {
            id: product.id,
            quantity: quantity,
            item_price: priceNum
          }
        ]
      });
    }

    toast.success("Order placed successfully!");
    onClose();
  };

  const inputCls = "w-full bg-secondary text-foreground border border-border px-3 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans block mb-1";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-serif font-bold text-foreground">
              {step === "details" ? "Product Details" : "Complete Your Order"}
            </h2>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "details" ? (
            <div className="p-5 space-y-6">
              {/* Product Info */}
              <div className="flex gap-5">
                <img src={displayImage} alt={product.name} className="w-32 h-40 object-cover" />
                <div className="flex-1 space-y-2">
                  <h3 className="text-base font-serif font-semibold text-foreground">{product.name}</h3>
                  <p className="text-lg font-sans font-medium text-foreground">{product.price}</p>
                  <p className="text-sm font-sans text-muted-foreground leading-relaxed">{product.description}</p>
                  {/* Show selected color */}
                  {activeVariant && (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: activeVariant.hex }}
                      />
                      <span className="text-xs font-sans text-muted-foreground">{activeVariant.name}</span>
                    </div>
                  )}
                  {product.tag && (
                    <span className="inline-block px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-secondary text-secondary-foreground">
                      {product.tag}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground font-sans">Stock: {product.stock} available</p>
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div>
                  <label className={labelCls}>Select Size</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-xs tracking-ultra-wide uppercase font-sans border transition-colors duration-200 ${
                          selectedSize === s
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className={labelCls}>Quantity</label>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-colors">−</button>
                  <span className="text-sm font-sans text-foreground w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-8 h-8 border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-colors">+</button>
                </div>
              </div>

              <button
                onClick={() => setStep("form")}
                className="w-full py-3.5 bg-primary text-primary-foreground text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-primary/90 transition-colors duration-300"
              >
                Proceed to Order — PKR {(priceNum * quantity).toLocaleString()}
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-xs tracking-ultra-wide uppercase text-foreground font-sans font-semibold flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" /> Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Full Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your full name" /></div>
                  <div><label className={labelCls}>Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="your@email.com" /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Phone Number *</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="03XX-XXXXXXX" /></div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-xs tracking-ultra-wide uppercase text-foreground font-sans font-semibold flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" /> Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>House / Apt *</label><input value={house} onChange={(e) => setHouse(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Street *</label><input value={street} onChange={(e) => setStreet(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>City *</label><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Postal Code</label><input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Country *</label><input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} /></div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="space-y-3">
                <label className={labelCls}>Shipping Method</label>
                {SHIPPING_METHODS.map((m) => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border ${shippingMethod === m ? "border-foreground bg-foreground" : "border-border"} flex items-center justify-center`}>
                      {shippingMethod === m && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                    <span className="text-sm font-sans text-foreground">{m}</span>
                  </label>
                ))}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className={labelCls}>Payment Method</label>
                {PAYMENT_METHODS.map((m) => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === m ? "border-foreground bg-foreground" : "border-border"} flex items-center justify-center`}>
                      {paymentMethod === m && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                    <span className="text-sm font-sans text-foreground">{m}</span>
                  </label>
                ))}
              </div>

              {/* Billing Address */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-4 h-4 border ${sameAsBilling ? "bg-foreground border-foreground" : "border-border"} flex items-center justify-center`}>
                    {sameAsBilling && <Check className="w-3 h-3 text-background" />}
                  </div>
                  <span className="text-sm font-sans text-foreground">Billing address same as shipping</span>
                </label>
                {!sameAsBilling && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div><label className={labelCls}>House / Apt</label><input value={billingHouse} onChange={(e) => setBillingHouse(e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Street</label><input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>City</label><input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Postal Code</label><input value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)} className={inputCls} /></div>
                    <div className="sm:col-span-2"><label className={labelCls}>Country</label><input value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className={inputCls} /></div>
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="space-y-2">
                <label className={labelCls}>Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); if (couponApplied) { setCouponApplied(false); setDiscount(0); setCouponMessage(""); } }}
                    placeholder="Enter coupon code"
                    className={`flex-1 ${inputCls}`}
                    disabled={couponApplied}
                  />
                  <button
                    onClick={couponApplied ? () => { setCouponApplied(false); setDiscount(0); setCouponCode(""); setCouponMessage(""); } : handleApplyCoupon}
                    className="px-4 py-2 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans hover:opacity-90 transition-opacity"
                  >
                    {couponApplied ? "Remove" : "Apply"}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-sans ${couponApplied ? "text-accent" : "text-destructive"}`}>{couponMessage}</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">PKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-accent">Discount</span>
                    <span className="text-accent">-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-sans font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="px-6 py-3 border border-border text-foreground text-xs tracking-ultra-wide uppercase font-sans hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-primary text-primary-foreground text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-primary/90 transition-colors duration-300"
                >
                  Place Order — PKR {total.toLocaleString()}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
