import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={Logo}
                alt="MaurMart logo"
                className="h-[60px] w-auto object-contain"
              />
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Your one-stop shop for daily essentials and electronics. Quality products at the best prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "FAQ", to: "/faq" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-primary-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>📧 support@maurmart.com</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 India</li>
            </ul>
          </div>

          {/* Social + Admin */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3 mb-6">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs px-4 py-2 rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors"
            >
              Admin Panel →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} MaurMart. All rights reserved.
          </p>
          <p className="text-primary-foreground/50 text-sm mt-2 font-medium">
            Digital Experience by{" "}
            <a
              href="https://www.linkedin.com/in/yash-trivedi-contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Yash
            </a>
            {" & "}
            <a
              href="https://www.linkedin.com/in/shalu-kumari-contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Shalu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
