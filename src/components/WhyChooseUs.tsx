import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import { fadeUp } from "../lib/motion";

const SERVICES = [
  "Custom Apparel",
  "Polo & Caps",
  "QR Scan & Print",
  "Business Cards",
  "Banners & Signage",
  "ID Badges",
  "Mugs & Bags",
  "Bulk Orders",
  "Logo Design",
  "Same-Day Print",
  "Local Delivery",
  "3D Live Customize",
];

const FEATURES = [
  { title: "High Quality Printing", desc: "Crisp apparel, banners & cards" },
  { title: "Affordable Pricing", desc: "Transparent store & bulk rates" },
  { title: "Fast Turnaround", desc: "On-the-spot & same-day options" },
  { title: "Versatile Solutions", desc: "Print, design, QR & digital" },
  { title: "Eco-Minded Practices", desc: "Smart layouts, less waste" },
  { title: "Personal Support", desc: "Local help in Macherla & Armoor" },
];

function ServicesMarquee({ reduceMotion }: { reduceMotion: boolean | null }) {
  const row = [...SERVICES, ...SERVICES];
  return (
    <div className="relative overflow-hidden border-b border-navy/5 bg-[#F7F4EF]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 8%22 preserveAspectRatio=%22none%22><path d=%22M0 4 Q15 0 30 4 T60 4 T90 4 T120 4 V8 H0Z%22 fill=%22%23ffffff%22/></svg>')] bg-repeat-x bg-[length:120px_8px]" />
      <motion.div
        className="flex w-max gap-0 py-3.5 whitespace-nowrap"
        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 28, repeat: Infinity, ease: "linear" }
        }
      >
        {row.map((label, i) => {
          const tone =
            i % 3 === 0
              ? "text-brand-orange"
              : i % 3 === 1
                ? "text-navy"
                : "text-navy/70";
          return (
            <span
              key={`${label}-${i}`}
              className={`px-3 font-display text-sm font-bold tracking-wide md:text-base ${tone}`}
            >
              {label}
              <span className="mx-3 text-navy/25">|</span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

export function WhyChooseUs() {
  const reduceMotion = useReducedMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: artRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [36, -36]);

  return (
    <section id="why-choose-us" className="bg-white">
      <ServicesMarquee reduceMotion={reduceMotion} />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:gap-12 md:py-20 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <p className="font-script text-2xl text-brand-orange md:text-3xl">Why Choose Us</p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
            Why People Choose Fusion Print &amp; Services…?
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-navy/60">
            Competitive pricing, fast turnaround, and local delivery across Macherla, Armoor, and
            Nizamabad — with live 3D customize so you see the print before you order.
          </p>

          <ul className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="flex gap-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-sm shadow-brand-orange/30">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy">{f.title}</span>
                  <span className="block text-xs text-navy/50">{f.desc}</span>
                </span>
              </motion.li>
            ))}
          </ul>

          <Link
            to="/shop"
            className="mt-9 inline-flex rounded-lg bg-brand-orange px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition hover:bg-navy"
          >
            Know More
          </Link>
        </motion.div>

        <div ref={artRef} className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <motion.div
            className="pointer-events-none absolute inset-8 rounded-full bg-brand-orange/10 blur-3xl"
            animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{ y: parallaxY }}
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="/images/why-choose-illustration.webp"
              alt="Fusion Print shop team with printers and design workstation"
              className="relative z-10 w-full drop-shadow-xl"
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -14, 0] }
              }
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/images/why-choose-illustration-fallback.png";
              }}
            />
            {/* Soft leaf-like accent bob for depth */}
            <motion.div
              className="pointer-events-none absolute -left-3 bottom-[12%] h-24 w-24 rounded-full bg-emerald-600/15 blur-2xl md:h-32 md:w-32"
              animate={reduceMotion ? undefined : { y: [0, 10, 0], x: [0, 6, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.div
              className="pointer-events-none absolute -right-2 top-[18%] h-20 w-20 rounded-full bg-brand-orange/20 blur-2xl"
              animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
