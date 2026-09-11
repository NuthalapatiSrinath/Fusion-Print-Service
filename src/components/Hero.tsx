import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "../lib/motion";
import { HeroCinemaBackground } from "./HeroCinemaBackground";
import { HeroProductShowcase } from "./HeroProductShowcase";
import type { SiteSettings } from "../lib/api";

type Props = { settings?: SiteSettings | null };

export function Hero({ settings }: Props) {
  const reduceMotion = useReducedMotion();
  const tagline = settings?.heroTagline || "Your One-Stop Print & Digital Hub";
  const sub =
    settings?.heroSubline ||
    "Print. Design. Deliver. Custom apparel, QR print, and digital services in Macherla, Armoor.";

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-16">
      <HeroCinemaBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:gap-8 md:py-24 lg:grid-cols-2 lg:gap-6 lg:py-28">
        <motion.div
          className="max-w-2xl text-white lg:max-w-none"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
            <img
              src="/logo-fp.png"
              alt="Fusion Print & Services"
              className="h-16 w-16 drop-shadow-xl md:h-20 md:w-20"
            />
            <p className="font-script text-2xl text-brand-orange md:text-3xl">{tagline}</p>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl"
          >
            FUSI
            <span className="relative mx-0.5 inline-block">
              <span className="sr-only">O</span>
              <motion.span
                className="inline-grid h-[0.72em] w-[0.72em] grid-cols-2 overflow-hidden rounded-full border-2 border-white/30 align-middle"
                aria-hidden
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <span className="bg-brand-magenta" />
                <span className="bg-brand-cyan" />
                <span className="bg-brand-yellow" />
                <span className="bg-black" />
              </motion.span>
            </span>
            N
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-2 font-display text-xl font-semibold tracking-wide text-brand-orange md:text-2xl"
          >
            PRINT &amp; SERVICES
          </motion.p>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            {sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-brand-orange px-6 py-3 font-semibold text-white shadow-lg shadow-brand-orange/30 transition hover:bg-white hover:text-navy"
            >
              Shop Now
            </Link>
            <Link
              to="/customize"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Customize
            </Link>
            <Link
              to="/print/fusion"
              className="rounded-full border border-brand-cyan/50 bg-brand-cyan/10 px-6 py-3 font-semibold text-white transition hover:bg-brand-cyan/20"
            >
              Scan &amp; Print
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative lg:justify-self-end"
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroProductShowcase />
        </motion.div>
      </div>
    </section>
  );
}
