import { useState } from "react";
import { Package, MessageCircle, MapPin, BookOpen, Info, X } from "lucide-react";
import { useSettings } from "@/store/settingsStore";

type PopupType = "location" | "journal" | "about" | null;

const AnnouncementBar = () => {
  const { settings } = useSettings();
  const [popup, setPopup] = useState<PopupType>(null);

  return (
    <>
      {/* Announcement Bar — intentionally always dark, acts as an accent stripe */}
      <div className="w-full bg-charcoal text-charcoal-foreground">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 py-2 text-[11px] uppercase tracking-ultra-wide font-sans">

          {/* Track Order */}
          <a
            href={settings.trackOrderUrl || "https://www.tcs.com.pk/tracking"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
          >
            <Package className="w-3.5 h-3.5" />
            Track Order
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>

          {/* Store Location */}
          <button
            onClick={() => {
              setPopup("location");
              if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("track", "FindLocation");
              }
            }}
            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
          >
            <MapPin className="w-3.5 h-3.5" />
            Store Location
          </button>

          {/* Journal */}
          {/* <button
            onClick={() => setPopup("journal")}
            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Journal
          </button> */}

          {/* About Us */}
          {/* <button
            onClick={() => setPopup("about")}
            className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
          >
            <Info className="w-3.5 h-3.5" />
            About Us
          </button> */}

        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          {/* Background */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPopup(null)}
          />

          {/* Popup Box */}
          <div className="relative bg-background border border-border shadow-xl rounded-lg px-6 py-5 w-[320px] text-center">

            <button
              onClick={() => setPopup(null)}
              className="absolute right-3 top-3"
            >
              <X className="w-4 h-4 text-foreground/60 hover:text-foreground" />
            </button>

            {/* Popup Content */}
            {popup === "location" && (
              <>
                <h3 className="text-sm font-semibold mb-3 tracking-wide">
                  Our Store
                </h3>
                {settings.storeLocation ? (
                  <>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                      {settings.storeLocation}
                    </p>
                    {settings.googleMapsUrl && (
                      <a
                        href={settings.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs tracking-ultra-wide uppercase font-sans border border-foreground/30 px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                      >
                        Open in Maps ↗
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Store location coming soon.
                  </p>
                )}
              </>
            )}

            {(popup === "journal" || popup === "about") && (
              <>
                <h3 className="text-sm font-semibold mb-3 tracking-wide">
                  Coming Soon
                </h3>

                <p className="text-sm text-foreground/80">
                  This section will be available soon.
                </p>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBar;