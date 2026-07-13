import { type ReactNode, type ElementType } from "react";
import { X, Package, MapPin, CreditCard, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Order } from "@/store/orderStore";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-600",
  Confirmed: "bg-blue-500/20 text-blue-600",
  Shipped: "bg-purple-500/20 text-purple-600",
  Delivered: "bg-green-500/20 text-green-700",
  Cancelled: "bg-red-500/20 text-red-600",
};

function Section({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-foreground/50">
        <Icon size={14} />
        <span className="text-xs tracking-widest uppercase">{title}</span>
      </div>
      <div className="bg-foreground/5 border border-foreground/10 p-4 space-y-1.5 text-sm">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-foreground/40 shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default function OrderDetailsModal({ order, onClose }: Props) {
  if (!order) return null;

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-background border border-foreground/10 w-full max-w-lg relative">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/10">
                <div>
                  <p className="text-xs text-foreground/40 tracking-widest uppercase mb-1">Order</p>
                  <h2 className="text-lg font-medium tracking-wider">{order.id}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${STATUS_COLORS[order.status] || "bg-foreground/10 text-foreground"}`}>
                    {order.status}
                  </span>
                  <button onClick={onClose} className="text-foreground/30 hover:text-foreground/60 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Customer */}
                <Section title="Customer" icon={Package}>
                  <Row label="Name" value={order.customerName} />
                  <Row label="Email" value={order.email} />
                  <Row label="Phone" value={order.phone} />
                  <Row label="Date" value={new Date(order.date).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })} />
                </Section>

                {/* Shipping */}
                <Section title="Shipping Address" icon={MapPin}>
                  <Row label="House / Apt" value={order.house} />
                  <Row label="Street" value={order.street} />
                  <Row label="City" value={order.city} />
                  <Row label="Postal Code" value={order.postalCode} />
                  <Row label="Country" value={order.country} />
                  <Row label="Method" value={order.shippingMethod} />
                </Section>

                {/* Payment */}
                <Section title="Payment" icon={CreditCard}>
                  <Row label="Method" value={order.paymentMethod} />
                  {order.receiptImage && (
                    <div className="pt-2">
                      <p className="text-foreground/40 text-xs mb-1.5">Payment Receipt</p>
                      <a href={order.receiptImage} target="_blank" rel="noopener noreferrer">
                        <img src={order.receiptImage} alt="Payment receipt" className="max-w-full max-h-64 border border-foreground/10 object-contain" />
                      </a>
                    </div>
                  )}
                  {!order.sameAsBilling && (
                    <>
                      <div className="text-foreground/30 text-xs pt-1">Billing Address</div>
                      <Row label="House / Apt" value={order.billingHouse} />
                      <Row label="Street" value={order.billingStreet} />
                      <Row label="City" value={order.billingCity} />
                      <Row label="Postal Code" value={order.billingPostalCode} />
                      <Row label="Country" value={order.billingCountry} />
                    </>
                  )}
                </Section>

                {/* Products */}
                <Section title="Items" icon={Package}>
                  {order.products.map((p, i) => (
                    <div key={i} className="flex justify-between gap-4 py-1 border-b border-foreground/5 last:border-0">
                      <div>
                        <p>{p.name}</p>
                        <p className="text-xs text-foreground/40 mt-0.5">
                          Size: {p.size}{p.color ? ` · ${p.color}` : ""} · Qty: {p.quantity}
                        </p>
                      </div>
                      <p className="shrink-0">{p.price}</p>
                    </div>
                  ))}
                </Section>

                {/* Totals */}
                <Section title="Summary" icon={Tag}>
                  <Row label="Subtotal" value={`PKR ${order.subtotal.toLocaleString()}`} />
                  {order.couponCode && <Row label={`Coupon (${order.couponCode})`} value={`-PKR ${order.discount.toLocaleString()}`} />}
                  <div className="flex justify-between gap-4 pt-2 border-t border-foreground/10 font-medium">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                </Section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
