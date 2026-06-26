import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, Package, ChevronRight, Mail, Phone, Send, ShoppingBag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/store/settingsStore";
import { useCart } from "@/store/cartStore";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "New In", href: "/new-in" },
  { label: "Tops", href: "/tops" },
  { label: "Bottoms", href: "/bottoms" },
  { label: "Essentials", href: "/essentials" },
  { label: "Heritage", href: "/heritage" },
  { label: "Journals", href: null, modal: "journals" },
  { label: "About Us", href: null, modal: "about" },
];

// ─── Journals Modal ───────────────────────────────────────────────────────────
const JournalsModal = ({ onClose }) => (
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
      className="relative z-10 w-full max-w-md bg-background border border-border rounded-sm p-10 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-foreground/50 hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-10 bg-foreground/20" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 font-sans">Grags</span>
        <div className="h-px w-10 bg-foreground/20" />
      </div>

      <h2 className="text-2xl font-serif tracking-wide text-foreground mb-3">Journals</h2>
      <p className="text-xs tracking-[0.15em] uppercase text-foreground/40 font-sans mb-8">
        Something is being written
      </p>

      <div className="w-10 h-px bg-foreground/20 mx-auto mb-8" />

      <p className="text-sm font-sans text-foreground/60 leading-relaxed">
        Our journal is on its way — stories of craft, culture, and the people behind Grags.
        <br /><br />
        <span className="text-foreground/40 text-xs tracking-widest uppercase">Coming Soon</span>
      </p>
    </motion.div>
  </motion.div>
);

// ─── About Us Modal ───────────────────────────────────────────────────────────
const AboutModal = ({ onClose }) => {
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
                  href="mailto:contact@grags.com"
                  className="flex items-center gap-3 text-sm font-sans text-foreground/70 hover:text-foreground transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground transition-colors" />
                  contact@grags.com
                </a>

                <a
                  href="tel:+923166734811"
                  className="flex items-center gap-3 text-sm font-sans text-foreground/70 hover:text-foreground transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground transition-colors" />
                  0316 673 4811
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
                  body: "All Grags products are genuine and produced under our direct supervision. We do not authorise third-party resellers. If in doubt, purchase only through grags.com."
                },
                {
                  title: "Privacy",
                  body: "We collect only the information necessary to process your order. Your personal data is never sold or shared with third parties for marketing purposes."
                },
                {
                  title: "Contact",
                  body: "For any queries regarding these terms, reach us at contact@grags.com or call 0316 673 4811."
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
                <a href="mailto:contact@grags.com" className="text-foreground underline underline-offset-2">
                  contact@grags.com
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
                    Sent to contact@grags.com
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
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { settings } = useSettings();
  const { count } = useCart();

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
              alt="GRAGS"
              className="h-5 md:h-6 w-auto object-contain"
            />
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Desktop Navigation */}
            {!transparent && (
              <div className="hidden lg:flex items-center gap-8 mr-4">
                {navLinks.map((link) =>
                  link.modal ? (
                    <button
                      key={link.label}
                      onClick={() => openModal(link.modal)}
                      className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-2px] after:left-0 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-xs tracking-ultra-wide uppercase font-sans text-foreground/80 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-2px] after:left-0 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                    >
                      {link.label}
                    </Link>
                  )
                )}
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
              onClick={() => setCartOpen(true)}
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/40 z-50"
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
                {navLinks.map((link, i) =>
                  link.modal ? (
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
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 + 0.2 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-lg font-serif tracking-wide text-foreground"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}

                <div className="border-t border-border pt-6 mt-4 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <a
                      href="https://www.tcs.com.pk/tracking"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-sans text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Track Your Order
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
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-sans text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Us
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
        {activeModal === "journals" && (
          <JournalsModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "about" && (
          <AboutModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;