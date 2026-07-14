import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, Package, ChevronRight, ChevronDown, Mail, Phone, Send, ShoppingBag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings, Collection } from "@/store/settingsStore";
import { useCart } from "@/store/cartStore";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import logo from "@/assets/logo.png";

// Static dropdown groups — items that don't map to an admin Collection.
// "Shop By" filters products by the Gender field every product already has
// in the admin panel, so it stays consistent automatically: no separate
// section management needed, just set a product's Gender when adding it.
const navLinks: { label: string; href: string | null; modal?: string | null; dropdown?: { label: string; href: string }[] }[] = [
  {
    label: "Shop By", href: null, dropdown: [
      { label: "Men", href: "/men" },
      { label: "Women", href: "/women" },
      { label: "Kids", href: "/kids" },
    ],
  },
  { label: "New In", href: "/new-in" },
  { label: "Summer", href: "/summer" },
  { label: "Winter", href: "/winter" },
  { label: "Tops", href: "/tops" },
  { label: "Bottoms", href: "/bottoms" },
  { label: "Essentials", href: "/essentials" },
  { label: "Heritage", href: "/heritage" },
  { label: "Sale", href: "/sale" },
  { label: "Journals", href: "/journal", modal: null },
  { label: "About Us", href: null, modal: "about" },
];

// Match a static nav link to an admin-managed Collection so its Sections can
// show as a hover/tap dropdown — no dropdown if no matching collection exists.
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function findCollectionForLink(link: { label: string; href: string | null }, collections: Collection[]): Collection | null {
  if (!link.href) return null;
  const hrefKey = normalize(link.href.replace(/^\//, ""));
  const labelKey = normalize(link.label);
  return (
    collections.find((c) => normalize(c.slug) === hrefKey || normalize(c.slug) === labelKey || normalize(c.name) === labelKey) ?? null
  );
}

// ─── About Us Modal ───────────────────────────────────────────────────────────
const AboutModal = ({ onClose }) => {
  const { settings } = useSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [activeSection, setActiveSection] = useState("about"); // about | terms | faq

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");

    try {
      const res = await fetch("https://formspree.io/f/mjgqwpbq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message, _subject: `FAQ from ${name} — GRAGS` }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setMessage("");
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
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-background border border-border rounded-sm overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-foreground/20" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 font-sans">Grags</span>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-border">
          {[
            { id: "about", label: "About Us" },
            { id: "terms", label: "Terms" },
            { id: "faq", label: "FAQs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-3 text-[10px] tracking-[0.2em] uppercase font-sans transition-colors duration-200 ${
                activeSection === tab.id
                  ? "text-foreground border-b border-foreground -mb-px"
                  : "text-foreground/40 hover:text-foreground/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-8">
          {/* ── About Section ── */}
          {activeSection === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif tracking-wide text-foreground mb-1">About Grags</h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans mb-6">Est. Pakistan</p>

              <p className="text-sm font-sans text-foreground/70 leading-relaxed mb-4">
                Grags is a premium menswear label rooted in the idea that every garment should mean something. 
                We design for the deliberate — those who choose quality over quantity, and identity over trend.
              </p>
              <p className="text-sm font-sans text-foreground/70 leading-relaxed mb-4">
                Our collections draw from heritage tailoring traditions while speaking a contemporary language. 
                Each piece is considered: the weight of the fabric, the fall of the seam, the way a collar sits.
              </p>
              <p className="text-sm font-sans text-foreground/70 leading-relaxed mb-8">
                We are a small team with a singular focus — to build a wardrobe worth keeping.
              </p>

              {/* Contact info */}
              <div className="border-t border-border pt-6 space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans mb-4">Get in Touch</p>

                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-3 text-sm font-sans text-foreground/70 hover:text-foreground transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground transition-colors" />
                  {settings.contactEmail}
                </a>

                <a
                  href={`https://wa.me/${settings.whatsappNumber?.replace(/\D/g, "")}`}
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).fbq) {
                      (window as any).fbq("track", "Contact");
                    }
                  }}
                  className="flex items-center gap-3 text-sm font-sans text-foreground/70 hover:text-foreground transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground transition-colors" />
                  {settings.whatsappNumber}
                </a>
              </div>
            </motion.div>
          )}

          {/* ── Terms Section ── */}
          {activeSection === "terms" && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif tracking-wide text-foreground mb-1">Terms of Service</h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans mb-6">Last updated 2024</p>

              {[
                {
                  title: "Orders & Payments",
                  body: "All orders are subject to availability. Grags reserves the right to cancel any order and issue a full refund at our discretion. Payments are processed securely at checkout."
                },
                {
                  title: "Shipping & Delivery",
                  body: "We ship across Pakistan via TCS. Delivery times are estimated and not guaranteed. Grags is not responsible for delays caused by the courier or circumstances beyond our control."
                },
                {
                  title: "Returns & Exchanges",
                  body: "Items may be returned or exchanged within 7 days of delivery, provided they are unworn, unwashed, and in original condition with tags attached. Sale items are final sale."
                },
                {
                  title: "Product Authenticity",
                  body: "All Grags products are genuine and produced under our direct supervision. We do not authorise third-party resellers. If in doubt, purchase only through grags.shop."
                },
                {
                  title: "Privacy",
                  body: "We collect only the information necessary to process your order. Your personal data is never sold or shared with third parties for marketing purposes."
                },
                {
                  title: "Contact",
                  body: `For any queries regarding these terms, reach us at ${settings.contactEmail} or call ${settings.whatsappNumber}.`
                },
              ].map((item, i) => (
                <div key={i} className={`pb-5 mb-5 ${i < 5 ? "border-b border-border" : ""}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-foreground/30 shrink-0" />
                    <p className="text-xs tracking-[0.12em] uppercase font-sans text-foreground/80">{item.title}</p>
                  </div>
                  <p className="text-sm font-sans text-foreground/60 leading-relaxed pl-5">{item.body}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── FAQ / Contact Form Section ── */}
          {activeSection === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif tracking-wide text-foreground mb-1">FAQs</h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans mb-6">
                Send us your question
              </p>

              <p className="text-sm font-sans text-foreground/60 leading-relaxed mb-8">
                Have a question about sizing, orders, or anything else? Write to us below and we'll respond at{" "}
                <a href={`mailto:${settings.contactEmail}`} className="text-foreground underline underline-offset-2">
                  {settings.contactEmail}
                </a>{" "}
                within 24 hours.
              </p>

              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-3.5 h-3.5 text-foreground/60" />
                  </div>
                  <p className="text-sm font-sans text-foreground/70">Message sent successfully.</p>
                  <p className="text-xs font-sans text-foreground/40 mt-1">We'll get back to you shortly.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-xs tracking-[0.15em] uppercase font-sans text-foreground/50 hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-sans text-foreground/50 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full bg-transparent border border-border rounded-none px-4 py-3 text-sm font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-sans text-foreground/50 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full bg-transparent border border-border rounded-none px-4 py-3 text-sm font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-sans text-foreground/50 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Write your question here..."
                      className="w-full bg-transparent border border-border rounded-none px-4 py-3 text-sm font-sans text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3 bg-foreground text-background text-[10px] tracking-[0.25em] uppercase font-sans hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>

                  <p className="text-[10px] text-foreground/30 font-sans text-center">
                    Sent to {settings.contactEmail}
                  </p>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const { settings } = useSettings();
  const { count, isDrawerOpen, openDrawer, closeDrawer } = useCart();

  const openModal = (modal: string) => {
    setMenuOpen(false);
    setTimeout(() => setActiveModal(modal), menuOpen ? 300 : 0);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${transparent ? "bg-transparent border-b-0" : "bg-background/90 backdrop-blur-md border-b border-border"}`}>
        <div className="flex items-center justify-between px-5 md:px-10 py-4">

          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              alt="Grags"
              className="h-5 md:h-6 w-auto object-contain invert dark:invert-0"
            />
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Desktop Navigation */}
            {!transparent && (
              <div className="hidden lg:flex items-center gap-8 mr-4">
                {navLinks.map((link) => {
                  if (link.modal) {
                    return (
                      <button
                        key={link.label}
                        onClick={() => openModal(link.modal)}
                        className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-2px] after:left-0 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                      >
                        {link.label}
                      </button>
                    );
                  }

                  if (link.dropdown) {
                    return (
                      <div key={link.label} className="group relative py-2 -my-2">
                        <span className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 cursor-default flex items-center gap-1">
                          {link.label}
                          <ChevronDown className="w-3 h-3" />
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                          <div className="bg-background border border-border shadow-lg min-w-[140px] py-2">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className="block px-4 py-2 text-xs font-sans text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const collection = findCollectionForLink(link, settings.collections ?? []);
                  const sections = collection?.sections ?? [];

                  if (sections.length === 0) {
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-2px] after:left-0 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                      >
                        {link.label}
                      </Link>
                    );
                  }

                  return (
                    <div key={link.label} className="group relative py-2 -my-2">
                      <Link
                        to={link.href}
                        className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-2px] after:left-0 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                      >
                        {link.label}
                      </Link>

                      {/* Mega-menu dropdown — shows this collection's sections */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                        <div className="bg-background border border-border shadow-lg min-w-[180px] py-2">
                          {sections.map((s) => (
                            <Link
                              key={s.id}
                              to={`/collections/${collection.slug}#${s.slug}`}
                              className="block px-4 py-2 text-xs font-sans text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User */}
            <button
              onClick={() => setAuthOpen(true)}
              aria-label="Account"
              className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <User className="w-[18px] h-[18px] text-foreground" />
            </button>

            {/* Cart */}
            <button
              onClick={openDrawer}
              aria-label="Cart"
              className="relative p-2 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <ShoppingBag className="w-[18px] h-[18px] text-foreground" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className={transparent ? "block" : "lg:hidden"}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer open={isDrawerOpen} onClose={closeDrawer} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              className="fixed right-0 top-0 bottom-0 w-80 bg-background z-50 p-8 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end mb-10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => {
                  if (link.modal) {
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.2 }}
                      >
                        <button
                          onClick={() => openModal(link.modal)}
                          className="text-lg font-serif tracking-wide text-foreground"
                        >
                          {link.label}
                        </button>
                      </motion.div>
                    );
                  }

                  if (link.dropdown) {
                    const isOpen = openMobileDropdown === link.label;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.2 }}
                      >
                        <button
                          onClick={() => setOpenMobileDropdown(isOpen ? null : link.label)}
                          className="flex items-center gap-2 text-lg font-serif tracking-wide text-foreground"
                        >
                          {link.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="mt-3 ml-3 flex flex-col gap-3 border-l border-border pl-4">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="text-sm font-sans text-foreground/70"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  const collection = findCollectionForLink(link, settings.collections ?? []);
                  const sections = collection?.sections ?? [];
                  const isOpen = openMobileDropdown === link.label;

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 + 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          to={link.href}
                          onClick={() => setMenuOpen(false)}
                          className="text-lg font-serif tracking-wide text-foreground"
                        >
                          {link.label}
                        </Link>
                        {sections.length > 0 && (
                          <button
                            onClick={() => setOpenMobileDropdown(isOpen ? null : link.label)}
                            aria-label={`Toggle ${link.label} sections`}
                            className="p-1 text-foreground/60"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {sections.length > 0 && isOpen && (
                        <div className="mt-3 ml-3 flex flex-col gap-3 border-l border-border pl-4">
                          {sections.map((s) => (
                            <Link
                              key={s.id}
                              to={`/collections/${collection.slug}#${s.slug}`}
                              onClick={() => setMenuOpen(false)}
                              className="text-sm font-sans text-foreground/70"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                <div className="border-t border-border pt-6 mt-4 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <a
                      href={settings.trackOrderUrl || "https://www.tcs.com.pk/tracking"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-sans text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Track Order
                    </a>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.68 }}
                  >
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setMenuOpen(false);
                        if (typeof window !== "undefined" && (window as any).fbq) {
                          (window as any).fbq("track", "Contact");
                        }
                      }}
                      className="flex items-center gap-2 text-sm font-sans text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "about" && (
          <AboutModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;