import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react";
import { useSettings } from "@/store/settingsStore";

function PageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-foreground/40 hover:text-foreground/80 transition-colors mb-10"
        >
          <ChevronLeft size={14} />
          Back
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-10">{title}</h1>
          <div className="prose prose-sm max-w-none space-y-6 text-foreground/70 leading-relaxed">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm tracking-widest uppercase text-foreground mt-8 mb-3">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-7 text-foreground/60">{children}</p>;
}

export function PrivacyPage() {
  const { settings } = useSettings();
  return (
    <PageLayout title="Privacy Policy">
      <P>Last updated: {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</P>
      <H2>Information We Collect</H2>
      <P>When you place an order, we collect your name, email address, phone number, and shipping address. This information is used solely to fulfil your order and communicate with you about it.</P>
      <H2>How We Use Your Information</H2>
      <P>We use your personal information to process and deliver your orders, send order confirmations and shipping updates, and respond to your enquiries. We do not sell, trade, or rent your personal information to third parties.</P>
      <H2>Data Security</H2>
      <P>We implement appropriate technical and organisational measures to protect your personal information. All data is transmitted securely and stored on encrypted servers.</P>
      <H2>Cookies</H2>
      <P>Our website uses cookies to improve your browsing experience. These are essential cookies required for the website to function. We do not use tracking or advertising cookies.</P>
      <H2>Your Rights</H2>
      <P>You have the right to access, update, or delete your personal information. To exercise these rights, please contact us at the details below.</P>
      <H2>Contact</H2>
      <P>For privacy-related enquiries, email us at {settings.contactEmail || "support@grags.shop"}.</P>
    </PageLayout>
  );
}

export function TermsPage() {
  return (
    <PageLayout title="Terms of Service">
      <P>Please read these terms carefully before using our website or placing an order.</P>
      <H2>Orders and Payments</H2>
      <P>All orders are subject to availability. We accept Cash on Delivery (COD) and Bank Transfer. Prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes.</P>
      <H2>Shipping Policy</H2>
      <P>Standard delivery typically takes 5–7 business days. Express delivery takes 2–3 business days. Shipping charges are calculated at checkout. We currently ship within Pakistan only.</P>
      <H2>Returns and Exchanges</H2>
      <P>We accept returns within 7 days of delivery for unworn, unwashed items with tags attached. Exchanges are subject to stock availability. Sale items are final sale and cannot be returned.</P>
      <H2>Product Descriptions</H2>
      <P>We make every effort to display our products accurately. Colours may vary slightly due to monitor settings. Measurements are approximate and may vary by up to 1–2 cm.</P>
      <H2>Intellectual Property</H2>
      <P>All content on this website, including images, text, and design, is the property of GRAGS and may not be reproduced without written permission.</P>
      <H2>Limitation of Liability</H2>
      <P>GRAGS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</P>
      <H2>Changes to Terms</H2>
      <P>We reserve the right to update these terms at any time. Continued use of the website constitutes acceptance of the revised terms.</P>
    </PageLayout>
  );
}

export function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://formspree.io/f/mjgqwpbq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Contact");
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-foreground/40 hover:text-foreground/80 transition-colors mb-10"
        >
          <ChevronLeft size={14} />
          Back
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-10">Contact Us</h1>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <p className="text-sm text-foreground/60 leading-7">
                We'd love to hear from you. Reach out with any questions, feedback, or enquiries.
              </p>
              <div className="space-y-5">
                {settings.contactEmail && (
                  <div className="flex items-start gap-4">
                    <Mail size={16} className="text-foreground/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs tracking-widest uppercase text-foreground/30 mb-1">Email</p>
                      <a href={`mailto:${settings.contactEmail}`} className="text-sm hover:text-foreground/80 transition-colors">
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {settings.whatsappNumber && (
                  <div className="flex items-start gap-4">
                    <Phone size={16} className="text-foreground/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs tracking-widest uppercase text-foreground/30 mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${settings.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-foreground/80 transition-colors"
                      >
                        +{settings.whatsappNumber}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <MapPin size={16} className="text-foreground/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs tracking-widest uppercase text-foreground/30 mb-1">Location</p>
                    <p className="text-sm">Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs tracking-widest uppercase text-foreground/40 block mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-foreground/5 border border-foreground/15 px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-foreground/40 block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-foreground/5 border border-foreground/15 px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-foreground/40 block mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full bg-foreground/5 border border-foreground/15 px-4 py-3 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                />
              </div>
              {status === "success" && (
                <p className="text-green-600 text-xs">Message sent successfully. We'll be in touch soon.</p>
              )}
              {status === "error" && (
                <p className="text-destructive text-xs">Failed to send. Please try again or email us directly.</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-foreground text-background text-xs tracking-widest uppercase font-semibold py-3.5 hover:bg-foreground/90 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// JournalPage moved to src/pages/JournalPage.tsx
