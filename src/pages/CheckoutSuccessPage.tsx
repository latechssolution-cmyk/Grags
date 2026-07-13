import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useSettings } from "@/store/settingsStore";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const [status, setStatus] = useState<"verifying" | "paid" | "unpaid">("verifying");

  const orderId = searchParams.get("order") ?? "";
  const sessionId = searchParams.get("session_id") ?? "";

  useEffect(() => {
    if (!orderId || !sessionId) {
      setStatus("unpaid");
      return;
    }
    fetch(`/.netlify/functions/stripe-verify?order=${encodeURIComponent(orderId)}&session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.paid ? "paid" : "unpaid"))
      .catch(() => setStatus("unpaid"));
  }, [orderId, sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        {status === "verifying" && (
          <>
            <Loader2 size={48} className="text-foreground/40 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-light tracking-widest uppercase mb-3">Confirming Payment</h1>
            <p className="text-foreground/50 text-sm">Please wait a moment...</p>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-light tracking-widest uppercase mb-3">Payment Confirmed</h1>
            <p className="text-foreground/50 text-sm mb-2">Thank you for your order.</p>
            <p className="text-xs text-foreground/30 mb-8">Order ID: {orderId}</p>
          </>
        )}
        {status === "unpaid" && (
          <>
            <AlertTriangle size={48} className="text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-light tracking-widest uppercase mb-3">Payment Not Confirmed</h1>
            <p className="text-foreground/50 text-sm mb-2">
              We couldn't verify your payment yet. If you were charged, your order will still be processed shortly.
            </p>
            <p className="text-xs text-foreground/30 mb-8">Order ID: {orderId}</p>
          </>
        )}
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
