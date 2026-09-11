import { useRef, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import type { BusinessInfo } from "../lib/api";
import { DEFAULT_BUSINESS_INFO } from "../data/defaults";
import { fadeUp, staggerContainer } from "../lib/motion";

type Props = { business?: BusinessInfo | null };

type Channel = {
  id: string;
  label: string;
  value: string;
  hint: string;
  href: string;
  external?: boolean;
  Icon: LucideIcon;
  tone: "orange" | "green";
  className: string;
  floatY: number;
  duration: number;
  delay: number;
};

export function Contact({ business }: Props) {
  const b = business || DEFAULT_BUSINESS_INFO;
  const reduceMotion = useReducedMotion();
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${b.address.village}, ${b.address.mandal}, ${b.address.district} ${b.address.pincode}`,
  )}`;

  const channels: Channel[] = [
    {
      id: "call",
      label: "Call",
      value: b.phones.callDisplay,
      hint: "Call the studio",
      href: `tel:${b.phones.call}`,
      Icon: Phone,
      tone: "orange",
      className: "left-1 top-[7%] sm:left-2",
      floatY: 10,
      duration: 5.4,
      delay: 0,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: b.phones.whatsappDisplay,
      hint: "Message on WhatsApp",
      href: `https://wa.me/91${b.phones.whatsapp}`,
      external: true,
      Icon: MessageCircle,
      tone: "green",
      className: "right-1 top-[14%] sm:right-2",
      floatY: 12,
      duration: 6.2,
      delay: 0.4,
    },
    {
      id: "email",
      label: "Email",
      value: "Write us",
      hint: "Send an email",
      href: `mailto:${b.email}`,
      Icon: Mail,
      tone: "orange",
      className: "bottom-[18%] left-[4%]",
      floatY: 8,
      duration: 7,
      delay: 0.15,
    },
    {
      id: "pin",
      label: "Visit",
      value: b.address.village,
      hint: "Open in maps",
      href: mapsHref,
      external: true,
      Icon: MapPin,
      tone: "orange",
      className: "bottom-[22%] right-[6%]",
      floatY: 11,
      duration: 5.8,
      delay: 0.55,
    },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-navy py-20 text-white md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-orange/20 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-72 rounded-full bg-[#F37021]/25 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-brand-orange"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange/70 motion-reduce:animate-none" />
              <span className="relative h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            Get in touch
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl font-bold tracking-tight md:text-5xl"
          >
            Visit or message us
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-md text-white/70">
            Proprietor{" "}
            <span className="font-medium text-white">{b.proprietor}</span> — ready to print,
            design, and deliver from Macherla.
          </motion.p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            <motion.li variants={fadeUp} className="sm:col-span-1">
              <ContactLink
                href={`tel:${b.phones.call}`}
                label="Call"
                value={b.phones.callDisplay}
                Icon={Phone}
              />
            </motion.li>
            <motion.li variants={fadeUp}>
              <ContactLink
                href={`https://wa.me/91${b.phones.whatsapp}`}
                external
                label="WhatsApp"
                value={b.phones.whatsappDisplay}
                Icon={MessageCircle}
                tone="green"
              />
            </motion.li>
            <motion.li variants={fadeUp} className="sm:col-span-2">
              <ContactLink
                href={`mailto:${b.email}`}
                label="Email"
                value={b.email}
                Icon={Mail}
              />
            </motion.li>
            <motion.li variants={fadeUp} className="sm:col-span-2">
              <ContactLink
                href={mapsHref}
                external
                label="Address"
                value={b.address.full}
                Icon={MapPin}
              />
            </motion.li>
          </ul>

          <motion.a
            variants={fadeUp}
            href={`https://wa.me/91${b.phones.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/30 transition hover:bg-white hover:text-navy"
          >
            <MessageCircle className="h-4 w-4" />
            Message the studio
          </motion.a>
        </motion.div>

        <ContactScene channels={channels} address={b.address} reduceMotion={!!reduceMotion} />
      </div>
    </section>
  );
}

function ContactLink({
  href,
  external,
  label,
  value,
  Icon,
  tone = "orange",
}: {
  href: string;
  external?: boolean;
  label: string;
  value: string;
  Icon: LucideIcon;
  tone?: "orange" | "green";
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3.5 backdrop-blur-sm transition hover:border-brand-orange/40 hover:bg-white/[0.08]"
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          tone === "green"
            ? "bg-emerald-500/15 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white"
            : "bg-brand-orange/15 text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          {label}
        </span>
        <span className="mt-0.5 block font-medium leading-snug text-white/95 break-words">{value}</span>
      </span>
    </a>
  );
}

function ContactScene({
  channels,
  address,
  reduceMotion,
}: {
  channels: Channel[];
  address: BusinessInfo["address"];
  reduceMotion: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-14, 14]), {
    stiffness: 140,
    damping: 22,
  });
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], reduceMotion ? [0, 0] : [-10, 10]), {
    stiffness: 140,
    damping: 22,
  });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={stageRef}
      className="relative mx-auto h-[460px] w-full max-w-xl overflow-hidden sm:h-[500px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[2.4rem] bg-brand-orange/30 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.62, 0.35] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-[7%] rounded-[2.2rem] border border-dashed border-white/20"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-[14%] rounded-[2rem] border border-brand-orange/25"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />

      <motion.div
        className="absolute inset-x-8 top-10 bottom-16 overflow-hidden rounded-[1.7rem] shadow-[0_30px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
        style={{ x: imgX, y: imgY }}
      >
        <motion.img
          src="/images/contact-scene.png"
          alt="Fusion Print studio at dusk — a navy storefront glowing orange on a quiet Macherla lane"
          className="h-full w-full object-cover"
          animate={reduceMotion ? undefined : { scale: [1.02, 1.08, 1.02] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-navy/25" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy/40 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="rounded-2xl border border-white/15 bg-navy/55 px-3 py-2 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Studio
            </p>
            <p className="font-display text-sm font-semibold">
              {address.village} · {address.mandal}
            </p>
            <p className="text-xs text-white/70">
              {address.district} {address.pincode}
            </p>
          </div>
          <span className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-md sm:inline">
            Walk in or write
          </span>
        </div>
      </motion.div>

      {channels.map((channel, index) => (
        <ContactOrb
          key={channel.id}
          channel={channel}
          index={index}
          reduceMotion={reduceMotion}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}

      <motion.div
        className="absolute bottom-2 left-1/2 w-[min(100%,22rem)] -translate-x-1/2 rounded-full bg-brand-orange px-4 py-2.5 text-center font-display text-xs font-bold tracking-[0.16em] shadow-lg shadow-brand-orange/30 sm:text-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      >
        QUALITY PRINTS. TRUSTED SERVICES.
      </motion.div>
    </motion.div>
  );
}

function ContactOrb({
  channel,
  index,
  reduceMotion,
  mouseX,
  mouseY,
}: {
  channel: Channel;
  index: number;
  reduceMotion: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const depth = 16 + index * 6;
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-depth, depth]), {
    stiffness: 120,
    damping: 18,
  });
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], reduceMotion ? [0, 0] : [-8, 8]), {
    stiffness: 120,
    damping: 18,
  });
  const glow =
    channel.tone === "green"
      ? "shadow-[0_0_28px_rgba(52,211,153,0.45)]"
      : "shadow-[0_0_28px_rgba(243,112,33,0.5)]";

  return (
    <motion.a
      href={channel.href}
      target={channel.external ? "_blank" : undefined}
      rel={channel.external ? "noreferrer" : undefined}
      aria-label={channel.hint}
      className={`absolute z-10 ${channel.className}`}
      style={{ x, y }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.18 + index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { scale: 1.06 }}
    >
      <motion.span
        className={`flex items-center gap-2 rounded-full border border-white/15 bg-navy/80 py-1.5 pl-1.5 pr-3 backdrop-blur-md ${glow}`}
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -channel.floatY, 0], x: [0, index % 2 === 0 ? 6 : -6, 0] }
        }
        transition={{
          duration: channel.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: channel.delay,
        }}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
            channel.tone === "green" ? "bg-emerald-500 text-white" : "bg-brand-orange text-white"
          }`}
        >
          <span
            className={`absolute inset-0 rounded-full ${
              channel.tone === "green" ? "bg-emerald-400/40" : "bg-brand-orange/50"
            } blur-md`}
            aria-hidden
          />
          <channel.Icon className="relative h-4 w-4" />
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {channel.label}
          </span>
          <span className="block text-xs font-semibold text-white">{channel.value}</span>
        </span>
      </motion.span>
    </motion.a>
  );
}
