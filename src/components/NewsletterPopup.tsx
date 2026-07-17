import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// New-visitor email capture: exit-intent on desktop, scroll-depth on mobile.
// Shown at most once per 30 days per browser (tracked via a localStorage
// timestamp only — no personal data, no cookie-consent banner needed).
const STORAGE_KEY = "grags_newsletter_dismissed";
const EXPIRY_DAYS = 30;
const BREVO_FORM_URL =
  "https://8637a099.sibforms.com/v2/serve/MUIFAF08VO4Uu6gQUpA3jFzXWG8SrwAC8Ky8HEeszz_QrEInboIboCnJ6S6FeeZh9XnhXGBmcyR_AIJqEA7hCY7zbtYKqvOtnYISYSzS8fB15ISexsG2QGL1zvek_HeXr4ybEuU1EPLIYd_hWS3HFHIOuCyTAn0Ses3pe5AEGN5jC3CXqPYrfe2TS0at1efDQXbMRxsPI4Mz_P-DgA==";

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

    let triggered = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      if (triggered || hasSeenRecently()) return;
      triggered = true;
      markSeen();
      setOpen(true);
    };

    // Desktop: exit-intent — mouse leaves toward the browser's tab/address bar
    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY < 10) show();
    };

    // Mobile fallback: scrolled past ~50% of the page, then a short delay
    const handleScroll = () => {
      if (triggered) return;
      const scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrolled > 0.5) {
        triggered = true;
        scrollTimeout = setTimeout(show, 1500);
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
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
