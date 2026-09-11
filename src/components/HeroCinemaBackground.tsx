import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Cinematic layered hero background — print-shop lifestyle stills + soft particles.
 * Prefers /hero-video.mp4 when present; otherwise uses generated lifestyle images.
 */
export function HeroCinemaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = "/hero-video.mp4";
    const onErr = () => {
      video.style.display = "none";
    };
    video.addEventListener("error", onErr);
    return () => video.removeEventListener("error", onErr);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const colors = ["#00AEEF", "#EC008C", "#FFF200", "#F37021", "#ffffff"];
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.00035,
      vy: -0.00015 - Math.random() * 0.0004,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: 0.15 + Math.random() * 0.45,
    }));

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x * cw, p.y * ch, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      void w;
      void h;
    };
  }, [reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-lifestyle-press.png"
      />
      {/* Layered cinematic stills — no white fade, no CMYK bars */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: "url(/images/hero-lifestyle-press.png)" }}
      />
      <div
        className="absolute inset-0 bg-cover bg-right opacity-25 mix-blend-lighten"
        style={{ backgroundImage: "url(/images/hero-lifestyle-wideformat.png)" }}
      />
      <div
        className="absolute inset-0 bg-cover bg-[center_top] opacity-20"
        style={{ backgroundImage: "url(/images/hero-lifestyle-merch-desk.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/95 via-navy/88 to-navy-light/72" />
      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-brand-orange/25 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-brand-magenta/20 blur-2xl"
        animate={reduceMotion ? undefined : { y: [0, -30, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
