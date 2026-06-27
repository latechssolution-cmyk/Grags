import { Link } from "react-router-dom";
import { useSettings } from "@/store/settingsStore";

const shopLinks = [
  { label: "New In", href: "/new-in" },
  { label: "Summer", href: "/summer" },
  { label: "Winter", href: "/winter" },
  { label: "Tops", href: "/tops" },
  { label: "Bottoms", href: "/bottoms" },
  { label: "Essentials", href: "/essentials" },
  { label: "Heritage", href: "/heritage" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const Footer = () => {
  const { settings } = useSettings();

  const helpLinks = [
    { label: "Track Order", href: "https://www.tcs.com.pk/tracking", external: true },
    { label: "WhatsApp", href: `https://wa.me/${settings.whatsappNumber}`, external: true },
    { label: "Contact Us", href: "/contact" },
    { label: "Journal", href: "/journal" },
  ];

  const collectionLinks = (settings.collections ?? []).map((c) => ({
    label: c.title,
    href: `/collections/${c.slug}`,
  }));

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-roman font-bold tracking-ultra-wide text-foreground mb-4">
              GRAGS
            </h3>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed max-w-xs">
              Heritage menswear for the modern gentleman. Crafted in Pakistan,
              designed for the world.
            </p>
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-block mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {settings.contactEmail}
              </a>
            )}
            {settings.storeLocation && (
              settings.googleMapsUrl ? (
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors leading-relaxed"
                >
                  📍 {settings.storeLocation}
                </a>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  📍 {settings.storeLocation}
                </p>
              )
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-ultra-wide uppercase font-sans text-foreground mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections — dynamic from store */}
          <div>
            <h4 className="text-xs tracking-ultra-wide uppercase font-sans text-foreground mb-5">
              Collections
            </h4>
            <ul className="space-y-3">
              {collectionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-ultra-wide uppercase font-sans text-foreground mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs tracking-ultra-wide uppercase font-sans text-foreground mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-muted-foreground">
            © {new Date().getFullYear()} GRAGS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              Instagram
            </a>
            <a href="#" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              Facebook
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
