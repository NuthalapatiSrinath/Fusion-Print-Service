import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  QrCode,
  Navigation,
  Shirt,
  Printer,
  PenTool,
} from "lucide-react";
import { fadeUp, staggerContainer } from "../lib/motion";

const serviceLinks = [
  { href: "#services", label: "T-Shirt Printing", icon: Shirt },
  { href: "#customize", label: "Live Customize", icon: PenTool },
  { href: "#pricing", label: "Price List", icon: Printer },
  { href: "#services", label: "Passport & PAN Help" },
  { href: "#services", label: "Flex & Banner" },
  { href: "#contact", label: "Design Services" },
];

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-16 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ background: "#F37021" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-24 w-56 h-56 rounded-full blur-3xl opacity-15"
        style={{ background: "#00AEEF" }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 pt-14 pb-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={fadeUp} className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-fp.png"
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-orange/55 shadow-lg"
              />
              <div>
                <p className="font-display font-bold tracking-wide text-sm leading-tight">
                  FUSION PRINT
                  <br />
                  &amp; SERVICES
                </p>
                <p className="text-[11px] text-brand-orange font-semibold tracking-wider uppercase mt-1">
                  Print. Design. Deliver.
                </p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Your one-stop print &amp; digital hub in Macherla — apparel, docs, design, and online
              services under one roof.
            </p>
            <p className="font-script text-xl text-brand-orange">Printing today, solutions for tomorrow.</p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h3 className="font-display font-semibold text-sm tracking-wide mb-4 text-white">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/55 hover:text-brand-orange transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand-orange/70 group-hover:scale-125 transition-transform" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h3 className="font-display font-semibold text-sm tracking-wide mb-4 text-white">
              Contact
            </h3>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Proprietor</p>
            <p className="font-semibold text-white mb-4">AARE BHAGAVAN</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:9494197969"
                  className="inline-flex items-center gap-2.5 text-white/70 hover:text-brand-orange transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                  94941 97969
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/917995572200"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 text-white/70 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  79955 72200
                </a>
              </li>
              <li>
                <a
                  href="mailto:fusionprintservices@gmail.com"
                  className="inline-flex items-start gap-2.5 text-white/70 hover:text-brand-cyan transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                  fusionprintservices@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">
              Visit us
            </h3>
            <div className="flex items-start gap-2.5 text-sm text-white/65">
              <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <p>
                Village: Macherla
                <br />
                Mandal: Armoor
                <br />
                District: Nizamabad
                <br />
                Pincode: 503224
              </p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Macherla+Armoor+Nizamabad+503224"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange hover:text-white transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Open in Maps
            </a>
            <div className="flex items-start gap-2.5 text-sm text-white/55">
              <Clock className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
              <p>
                Mon–Sat · 9:00 AM – 8:00 PM
                <br />
                <span className="text-white/40 text-xs">Sunday by appointment</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-navy flex items-center justify-center ring-1 ring-brand-orange/40">
                <QrCode className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Scan &amp; Pay (UPI)</p>
                <p className="text-[11px] text-white/45 leading-snug">
                  Ask in-store for QR / UPI payment after your order.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <a
            href="https://wa.me/917995572200?text=Hi%20Fusion%20Print%2C%20I%20need%20a%20quote"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/30"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp us for a quote
          </a>
          <a
            href="tel:9494197969"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-brand-orange hover:text-brand-orange transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call now
          </a>
          <a
            href="mailto:fusionprintservices@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-brand-cyan hover:text-brand-cyan transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        </motion.div>
      </motion.div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="font-display font-semibold text-sm tracking-wide text-white/90">
            Everything You Need, Under One Roof
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-orange font-semibold">
            Fast Service | Best Quality | Reasonable Prices
          </p>
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Fusion Print &amp; Services
          </p>
        </div>
      </div>
    </footer>
  );
}
