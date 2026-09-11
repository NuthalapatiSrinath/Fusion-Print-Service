import { useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";

type ShowcaseItem = {
  id: string;
  src: string;
  alt: string;
  /** Desktop absolute placement — free merch composition, no cards */
  className: string;
  size: "hero" | "lg" | "md" | "sm";
  float: { y: number[]; rotate: number[]; duration: number; delay: number };
};

/** Real Fusion-branded product photos — images are the hero, not text labels */
const ITEMS: ShowcaseItem[] = [
  {
    id: "tee",
    src: "/images/hero-product-tshirt-navy.png",
    alt: "Navy Fusion Print t-shirt with full chest logo",
    className:
      "left-[1%] top-[0%] z-20 w-[58%] max-w-[360px] md:left-0 md:top-0 md:w-[60%]",
    size: "hero",
    float: { y: [0, -14, 0], rotate: [-1.4, 1.4, -1.4], duration: 6.5, delay: 0 },
  },
  {
    id: "polo",
    src: "/images/hero-product-polo-white.png",
    alt: "White Fusion Print polo with left-chest logo",
    className:
      "right-[0%] top-[2%] z-10 w-[34%] max-w-[200px] md:right-[-2%] md:top-[0%] md:w-[36%]",
    size: "lg",
    float: { y: [0, 12, 0], rotate: [1.6, -1.6, 1.6], duration: 7.2, delay: 0.3 },
  },
  {
    id: "banner",
    src: "/images/hero-product-banner.png",
    alt: "Fusion Print roll-up banner",
    className:
      "right-[-2%] top-[26%] z-[5] w-[16%] max-w-[100px] md:right-[-4%] md:top-[24%] md:w-[18%]",
    size: "sm",
    float: { y: [0, -9, 0], rotate: [-0.8, 0.8, -0.8], duration: 8, delay: 0.55 },
  },
  {
    id: "cap",
    src: "/images/hero-product-cap-navy.png",
    alt: "Navy Fusion Print baseball cap",
    className:
      "right-[12%] top-[38%] z-30 w-[28%] max-w-[168px] md:right-[10%] md:top-[40%] md:w-[30%]",
    size: "md",
    float: { y: [0, -11, 0], rotate: [-2.2, 2.2, -2.2], duration: 5.8, delay: 0.7 },
  },
  {
    id: "mug",
    src: "/images/hero-product-mug.png",
    alt: "Fusion Print branded ceramic mug",
    className:
      "left-[0%] bottom-[2%] z-[25] w-[24%] max-w-[136px] md:left-[-2%] md:bottom-[0%] md:w-[26%]",
    size: "md",
    float: { y: [0, 10, 0], rotate: [2, -1.5, 2], duration: 6.4, delay: 0.2 },
  },
  {
    id: "cards",
    src: "/images/hero-product-business-cards.png",
    alt: "Fusion Print business cards stack",
    className:
      "left-[26%] bottom-[0%] z-30 w-[22%] max-w-[128px] md:left-[24%] md:bottom-[-2%] md:w-[24%]",
    size: "sm",
    float: { y: [0, -8, 0], rotate: [-1.5, 2, -1.5], duration: 7, delay: 0.85 },
  },
  {
    id: "bag",
    src: "/images/hero-product-bag.png",
    alt: "Fusion Print branded shopping bag",
    className:
      "right-[24%] bottom-[-4%] z-[15] w-[20%] max-w-[118px] md:right-[22%] md:bottom-[-6%] md:w-[22%]",
    size: "sm",
    float: { y: [0, -10, 0], rotate: [-2, 2, -2], duration: 7.6, delay: 1 },
  },
  {
    id: "badge",
    src: "/images/hero-product-id-badge.png",
    alt: "Fusion Print ID badge and lanyard",
    className:
      "right-[2%] bottom-[6%] z-20 w-[15%] max-w-[90px] md:right-0 md:bottom-[4%] md:w-[17%]",
    size: "sm",
    float: { y: [0, 9, 0], rotate: [1.5, -1.5, 1.5], duration: 6.2, delay: 0.45 },
  },
];

function MerchPiece({
  item,
  index,
  reduceMotion,
  mouseX,
  mouseY,
}: {
  item: ShowcaseItem;
  index: number;
  reduceMotion: boolean | null;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], reduceMotion ? [0, 0] : [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], reduceMotion ? [0, 0] : [-8, 8]);
  const springX = useSpring(rotateX, { stiffness: 160, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 160, damping: 24 });

  const shadow =
    item.size === "hero"
      ? "drop-shadow-[0_28px_44px_rgba(0,0,0,0.65)]"
      : item.size === "lg"
        ? "drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)]"
        : "drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)]";

  return (
    <motion.div
      className={`absolute ${item.className}`}
      style={{
        perspective: 1000,
        rotateX: hovered ? springX : 0,
        rotateY: hovered ? springY : 0,
        transformStyle: "preserve-3d",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        className="relative"
        animate={
          reduceMotion
            ? undefined
            : {
                y: item.float.y,
                rotate: item.float.rotate,
              }
        }
        transition={{
          duration: item.float.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: item.float.delay,
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.06, zIndex: 50 }}
      >
        {!failed ? (
          <img
            src={item.src}
            alt={item.alt}
            loading="eager"
            decoding="async"
            className={`block w-full rounded-xl bg-white/10 object-contain ${shadow} ${
              item.size === "hero"
                ? "aspect-[3/4]"
                : item.id === "banner"
                  ? "aspect-[9/16]"
                  : "aspect-square"
            }`}
            draggable={false}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className={`flex w-full items-center justify-center rounded-xl bg-navy-light/80 text-center text-[10px] text-white/70 ${shadow} ${
              item.size === "hero" ? "aspect-[3/4]" : "aspect-square"
            }`}
            role="img"
            aria-label={item.alt}
          >
            Fusion merch
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function HeroProductShowcase() {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [active, setActive] = useState(0);
  const dragX = useRef(0);

  useEffect(() => {
    // Warm the image cache so the merch stage never falls back to empty boxes
    ITEMS.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % ITEMS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
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

  const onPointerDown = (e: ReactPointerEvent) => {
    dragX.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const dx = e.clientX - dragX.current;
    if (Math.abs(dx) < 40) return;
    setActive((a) => (dx < 0 ? (a + 1) % ITEMS.length : (a - 1 + ITEMS.length) % ITEMS.length));
  };

  return (
    <div className="relative w-full">
      {/* Desktop / tablet — floating product photos only (no category text stack) */}
      <div
        ref={stageRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative mx-auto hidden h-[480px] w-full max-w-xl md:block lg:h-[560px] lg:max-w-none"
        aria-label="Fusion branded merch showcase"
      >
        <motion.div
          className="pointer-events-none absolute left-[35%] top-[42%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange/35 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.22, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-[8%] top-[12%] h-48 w-48 rounded-full bg-brand-cyan/20 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -18, 0] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[10%] left-[8%] h-40 w-40 rounded-full bg-brand-magenta/18 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.14, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {ITEMS.map((item, i) => (
          <MerchPiece
            key={item.id}
            item={item}
            index={i}
            reduceMotion={reduceMotion}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}

        <motion.div
          className="absolute bottom-2 right-2 z-40"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Link
            to="/customize"
            className="rounded-full border border-white/25 bg-navy/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-brand-orange/55 hover:bg-brand-orange/90"
          >
            Customize yours →
          </Link>
        </motion.div>
      </div>

      {/* Mobile — image carousel (thumbnails, not text list) */}
      <div className="md:hidden">
        <motion.div
          className="relative"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-visible">
            <motion.div
              className="pointer-events-none absolute inset-x-8 top-10 bottom-6 rounded-full bg-brand-orange/30 blur-3xl"
              animate={reduceMotion ? undefined : { opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <AnimatePresence mode="wait">
              <motion.img
                key={ITEMS[active].id}
                src={ITEMS[active].src}
                alt={ITEMS[active].alt}
                className="absolute inset-0 m-auto h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]"
                initial={reduceMotion ? false : { opacity: 0, x: 48, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -48, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          <p className="mt-3 text-center text-[11px] text-white/50">Swipe or tap a thumbnail</p>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.alt}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-brand-orange" : "w-1.5 bg-white/35"
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ITEMS.map((item, i) => (
              <button
                key={`thumb-${item.id}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={item.alt}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10 transition ${
                  i === active
                    ? "ring-2 ring-brand-orange ring-offset-2 ring-offset-navy"
                    : "opacity-65"
                }`}
              >
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/customize"
              className="inline-block rounded-full border border-white/25 bg-navy/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
            >
              Customize yours →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
