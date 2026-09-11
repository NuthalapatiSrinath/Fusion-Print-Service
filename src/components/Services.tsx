import { motion, useReducedMotion } from "framer-motion";
import type { Service } from "../lib/api";
import { DEFAULT_SERVICES } from "../data/defaults";
import {
  Shirt,
  Printer,
  Layers,
  Camera,
  CreditCard,
  BookOpen,
  Laptop,
  ScanLine,
  BadgeCheck,
  PenTool,
  BookMarked,
  PaintBucket,
  type LucideIcon,
} from "lucide-react";
import { fadeUp, staggerContainer } from "../lib/motion";

const iconMap: Record<string, LucideIcon> = {
  shirt: Shirt,
  printer: Printer,
  layers: Layers,
  camera: Camera,
  "id-card": CreditCard,
  passport: BookOpen,
  laptop: Laptop,
  scan: ScanLine,
  badge: BadgeCheck,
  "pen-tool": PenTool,
  book: BookMarked,
  banner: PaintBucket,
};

type Props = { services?: Service[] };

export function Services({ services }: Props) {
  const list = services?.length ? services : DEFAULT_SERVICES;
  const reduceMotion = useReducedMotion();

  return (
    <section id="services" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="max-w-xl mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <p className="text-brand-orange font-semibold text-sm tracking-wider uppercase mb-2">
            What we offer
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">Our Services</h2>
          <p className="mt-3 text-navy/60">
            Print. Online services. Designing. Delivering trust — all in one place.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {list.map((s) => {
            const Icon = iconMap[s.icon] || Shirt;
            return (
              <motion.div
                key={s.id}
                variants={fadeUp}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, boxShadow: "0 12px 30px rgba(26,42,71,0.08)" }
                }
                className="group relative p-4 md:p-5 rounded-2xl border border-navy/8 hover:border-brand-orange/40 hover:bg-navy/[0.02] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-navy text-white flex items-center justify-center mb-3 group-hover:bg-brand-orange transition-colors">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-semibold text-navy text-sm md:text-base leading-snug">
                  {s.name}
                </h3>
                <p className="mt-1.5 text-xs text-navy/50 leading-relaxed hidden sm:block">
                  {s.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
