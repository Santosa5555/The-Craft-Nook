import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'All Products', href: '/products' },
      { label: 'New Arrivals', href: '/products?filter=new' },
      { label: 'Best Sellers', href: '/products?filter=bestsellers' },
      { label: 'Gift Ideas', href: '/products?filter=gifts' },
    ],
    about: [
      { label: 'Our Story', href: '/about' },
      { label: 'Artisans', href: '/artisans' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
    ],
    support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'FAQ', href: '/faq' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="relative border-t border-primary/20 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90">
      {/* Gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary via-50% to-transparent" />
      
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block group">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text font-serif text-2xl font-bold text-transparent transition-transform group-hover:scale-105">
                Handmade Haven
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-background/80">
              Discover unique, handcrafted treasures made with love and care by
              talented artisans. Each piece tells a story and brings warmth to
              your home.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="group rounded-lg border border-primary/20 bg-background/10 p-2.5 text-background/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
              <a
                href="#"
                className="group rounded-lg border border-primary/20 bg-background/10 p-2.5 text-background/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
              <a
                href="#"
                className="group rounded-lg border border-primary/20 bg-background/10 p-2.5 text-background/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
              <a
                href="mailto:hello@handmadehaven.com"
                className="group rounded-lg border border-primary/20 bg-background/10 p-2.5 text-background/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-sm font-semibold text-background">
              <Sparkles className="h-4 w-4 text-primary" />
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-all hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-sm font-semibold text-background">
              <Sparkles className="h-4 w-4 text-secondary" />
              About
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-all hover:text-secondary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-sm font-semibold text-background">
              <Sparkles className="h-4 w-4 text-accent" />
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-all hover:text-accent hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-primary/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-background/60">
              © {currentYear} Handmade Haven. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-background/60 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-background/60">
              Made with{' '}
              <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />{' '}
              by artisans
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
