import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Phone, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/cart";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/customize", label: "Customize" },
  { to: "/print/fusion", label: "QR Print" },
  { to: "/#contact", label: "Contact" },
];

const WA = "https://wa.me/917995572200";
const CALL = "tel:9494197969";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();
  const { count } = useCart();
  const location = useLocation();
  const home = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overDark = home && !scrolled && !open;
  const solid = scrolled || open || !home;

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-navy/8 bg-white/90 shadow-[0_8px_30px_rgba(26,42,71,0.12)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
      initial={reduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-[4.25rem]"
        }`}
      >
        <Link to="/" className="group relative flex items-center" aria-label="Fusion Print & Services home">
          <motion.img
            src="/logo-fp.png"
            alt="Fusion Print & Services"
            className={`object-contain drop-shadow-sm transition-all duration-300 ${
              scrolled ? "h-10 w-10" : "h-12 w-12"
            }`}
            whileHover={reduceMotion ? undefined : { rotate: 6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative px-3.5 py-2 text-sm font-medium transition-colors hover:text-brand-orange ${
                overDark ? "text-white/90" : "text-navy/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/cart"
            className={`relative ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              overDark
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-navy/15 text-navy hover:bg-navy/5"
            }`}
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className={`ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              overDark
                ? "border-white/30 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={CALL}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-orange ${
              overDark ? "bg-brand-orange shadow-brand-orange/30" : "bg-navy shadow-navy/20"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/cart"
            className={`relative p-2 ${overDark ? "text-white" : "text-navy"}`}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className={`rounded-lg p-2 ${
              overDark ? "text-white hover:bg-white/10" : "text-navy hover:bg-navy/5"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-navy/10 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-5">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-medium text-navy hover:bg-brand-orange/10 hover:text-brand-orange"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
