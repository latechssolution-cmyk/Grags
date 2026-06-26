import { Link } from "react-router-dom";

const footerLinks = {
  Shop: [
    { label: "New In", href: "/new-in" },
    { label: "Tops", href: "/tops" },
    { label: "Bottoms", href: "/bottoms" },
    { label: "Essentials", href: "/essentials" },
    { label: "Heritage", href: "/heritage" },
  ],
  Collections: [
    { label: "Men's Polos", href: "/collections/mens-polo" },
    { label: "Signature Collection", href: "/collections/signature-collection" },
    { label: "Winter Collection", href: "/collections/winter-collection" },
  ],
  Help: [
    { label: "Track Order", href: "https://www.tcs.com.pk/tracking", external: true },
    { label: "WhatsApp", href: "https://wa.me/923049172098", external: true },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-roman font-bold tracking-ultra-wide text-foreground mb-4">
              GRAGGS
            </h3>
            <p className="text-sm font-sans text-muted-foreground leading-relaxed max-w-xs">
              Heritage menswear for the modern gentleman. Crafted in Pakistan,
              designed for the world.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-ultra-wide uppercase font-sans text-foreground mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
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
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-muted-foreground">
            © 2025 GRAGGS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              Instagram
            </a>
            <a href="#" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              Facebook
            </a>
            <a href="https://wa.me/923049172098" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
