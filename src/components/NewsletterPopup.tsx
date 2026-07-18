import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// New-visitor email capture: exit-intent on desktop, scroll-depth on mobile.
// Shown at most once per 30 days per browser (tracked via a localStorage
// timestamp only — no personal data, no cookie-consent banner needed).
const STORAGE_KEY = "grags_newsletter_dismissed";
const EXPIRY_DAYS = 30;
const BREVO_FORM_URL =
  "https://8637a099.sibforms.com/serve/MUIFAF08VO4Uu6gQUpA3jFzXWG8SrwAC8Ky8HEeszz_QrElnboIboCnJ6S6FeeZh9XnhXGBmcyR_AlJqEA7hCY7zbtYKqvOtnYISYSzS8fB15ISexsG2QGL1zvek_HeXr4ybEuU1EPLlYd_hWS3HFHIOuCyTAn0Ses3pe5AEGN5jC3CXqPYrfe2TS0at1efDQXbMRxsPl4Mz_P-DgA==";

function hasSeenRecently(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  const daysPassed = (Date.now() - parseInt(stored, 10)) / 86400000;
  return daysPassed < EXPIRY_DAYS;
}

function markSeen() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin || hasSeenRecently()) return;

    let shown = false;
    let scrollScheduled = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

    // Single source of truth — safe to call from any trigger, only the first
    // one to actually fire opens it.
    const show = () => {
      if (shown || hasSeenRecently()) return;
      shown = true;
      markSeen();
      setOpen(true);
    };

    // Desktop: exit-intent. `mouseleave` on document fires cleanly once when the
    // cursor actually exits the viewport (toward the tab/address bar), unlike the
    // older `mouseout` + relatedTarget-checking approach, which is noisier and
    // less consistent across browsers.
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    // Mobile: scrolled past ~50% of the page, then a short delay.
    const handleScroll = () => {
      if (scrollScheduled || shown) return;
      const scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrolled > 0.5) {
        scrollScheduled = true;
        scrollTimeout = setTimeout(show, 1500);
      }
    };

    // Safety net: exit-intent is an inherently unreliable signal (depends on
    // exact cursor behavior, varies by browser) and plenty of visitors never
    // scroll past 50%. If neither trigger has fired after 25s of active
    // browsing, show it anyway rather than silently never capturing that visitor.
    const fallbackTimer = setTimeout(show, 25000);

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(fallbackTimer);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isAdmin]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-[560px] rounded bg-[#F2F0EC] p-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-2 text-2xl leading-none text-[#111] hover:opacity-60 transition-opacity"
        >
          &times;
        </button>
        <iframe
          src={BREVO_FORM_URL}
          width="100%"
          height="480"
          frameBorder={0}
          scrolling="no"
          allowFullScreen
          className="block w-full border-0"
          title="Grags Newsletter Signup"
        />
      </div>
    </div>
  );
};

export default NewsletterPopup;
