import { useEffect, useRef } from "react";

export type MockupType = "tshirt" | "polo" | "cap" | "mug" | "bag" | "business-card";

type Props = {
  type: MockupType;
  color: string;
  side: "front" | "back";
  designUrl: string | null;
  className?: string;
};

/** Draws a product silhouette and overlays the uploaded design in the print zone. */
export function MockupPreview({ type, color, side, designUrl, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const designImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!designUrl) {
      designImgRef.current = null;
      draw();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      designImgRef.current = img;
      draw();
    };
    img.onerror = () => {
      designImgRef.current = null;
      draw();
    };
    img.src = designUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designUrl]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, color, side]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Soft studio background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#f4f6f9");
    bg.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const zone = getPrintZone(type, side, w, h);
    drawProduct(ctx, type, color, side, w, h);

    if (designImgRef.current) {
      ctx.save();
      clipPrintZone(ctx, type, side, w, h);
      const img = designImgRef.current;
      const scale = Math.min(zone.w / img.width, zone.h / img.height) * 0.92;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = zone.x + (zone.w - dw) / 2;
      const dy = zone.y + (zone.h - dh) / 2;
      ctx.globalAlpha = type === "mug" ? 0.92 : 0.95;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Subtle highlight on print area
      ctx.save();
      clipPrintZone(ctx, type, side, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.restore();
    } else {
      // Placeholder dashed print zone
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(26,42,71,0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.fillStyle = "rgba(26,42,71,0.08)";
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(26,42,71,0.45)";
      ctx.font = "500 13px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Your design here", zone.x + zone.w / 2, zone.y + zone.h / 2 + 4);
      ctx.restore();
    }

    // Side label
    ctx.fillStyle = "rgba(26,42,71,0.55)";
    ctx.font = "600 11px 'DM Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(side.toUpperCase(), 16, h - 16);
  }

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={520}
      className={`w-full h-auto rounded-2xl shadow-lg ${className}`}
      aria-label={`${type} mockup preview`}
    />
  );
}

function getPrintZone(
  type: MockupType,
  side: "front" | "back",
  w: number,
  h: number
): { x: number; y: number; w: number; h: number } {
  switch (type) {
    case "tshirt":
    case "polo":
      return side === "back"
        ? { x: w * 0.32, y: h * 0.28, w: w * 0.36, h: h * 0.32 }
        : { x: w * 0.34, y: h * 0.32, w: w * 0.32, h: h * 0.28 };
    case "cap":
      return { x: w * 0.32, y: h * 0.28, w: w * 0.36, h: h * 0.18 };
    case "mug":
      return { x: w * 0.22, y: h * 0.3, w: w * 0.38, h: h * 0.36 };
    case "bag":
      return { x: w * 0.3, y: h * 0.28, w: w * 0.4, h: h * 0.32 };
    case "business-card":
      return { x: w * 0.18, y: h * 0.32, w: w * 0.64, h: h * 0.36 };
    default:
      return { x: w * 0.3, y: h * 0.3, w: w * 0.4, h: h * 0.3 };
  }
}

function clipPrintZone(
  ctx: CanvasRenderingContext2D,
  type: MockupType,
  side: "front" | "back",
  w: number,
  h: number
) {
  const z = getPrintZone(type, side, w, h);
  ctx.beginPath();
  if (type === "mug") {
    roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  } else if (type === "business-card") {
    roundRect(ctx, z.x, z.y, z.w, z.h, 6);
  } else {
    roundRect(ctx, z.x, z.y, z.w, z.h, 4);
  }
  ctx.clip();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const num = parseInt(n.length === 3 ? n.split("").map((c) => c + c).join("") : n, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

function drawProduct(
  ctx: CanvasRenderingContext2D,
  type: MockupType,
  color: string,
  side: "front" | "back",
  w: number,
  h: number
) {
  const fill = color;
  const dark = shade(color, -35);
  const light = shade(color, 40);

  ctx.save();
  if (type === "tshirt" || type === "polo") {
    drawShirt(ctx, fill, dark, light, type === "polo", side, w, h);
  } else if (type === "cap") {
    drawCap(ctx, fill, dark, light, w, h);
  } else if (type === "mug") {
    drawMug(ctx, fill, dark, light, w, h);
  } else if (type === "bag") {
    drawBag(ctx, fill, dark, light, w, h);
  } else {
    drawCard(ctx, fill, dark, light, w, h);
  }
  ctx.restore();
}

function drawShirt(
  ctx: CanvasRenderingContext2D,
  fill: string,
  dark: string,
  light: string,
  polo: boolean,
  side: "front" | "back",
  w: number,
  _h: number
) {
  const cx = w / 2;
  ctx.beginPath();
  // Body
  ctx.moveTo(cx - 90, 130);
  ctx.lineTo(cx - 130, 160);
  ctx.lineTo(cx - 145, 250);
  ctx.lineTo(cx - 105, 255);
  ctx.lineTo(cx - 100, 420);
  ctx.lineTo(cx + 100, 420);
  ctx.lineTo(cx + 105, 255);
  ctx.lineTo(cx + 145, 250);
  ctx.lineTo(cx + 130, 160);
  ctx.lineTo(cx + 90, 130);
  // Neck
  ctx.quadraticCurveTo(cx + 40, 145, cx + 28, 120);
  ctx.quadraticCurveTo(cx, 145, cx - 28, 120);
  ctx.quadraticCurveTo(cx - 40, 145, cx - 90, 130);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Collar / polo
  if (polo && side === "front") {
    ctx.beginPath();
    ctx.moveTo(cx - 28, 120);
    ctx.lineTo(cx - 18, 155);
    ctx.lineTo(cx, 140);
    ctx.lineTo(cx + 18, 155);
    ctx.lineTo(cx + 28, 120);
    ctx.quadraticCurveTo(cx, 138, cx - 28, 120);
    ctx.fillStyle = dark;
    ctx.fill();
    // Placket
    ctx.fillStyle = light;
    ctx.fillRect(cx - 6, 140, 12, 50);
  } else {
    // Crew neck ring
    ctx.beginPath();
    ctx.ellipse(cx, 128, 30, 14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = dark;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Soft fold shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(cx - 2, 160, 4, 250);
}

function drawCap(
  ctx: CanvasRenderingContext2D,
  fill: string,
  dark: string,
  light: string,
  w: number,
  _h: number
) {
  const cx = w / 2;
  // Crown
  ctx.beginPath();
  ctx.ellipse(cx, 220, 120, 90, 0, Math.PI, 0);
  ctx.lineTo(cx + 120, 250);
  ctx.quadraticCurveTo(cx, 280, cx - 120, 250);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bill
  ctx.beginPath();
  ctx.ellipse(cx, 265, 140, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();

  // Panel seam
  ctx.strokeStyle = light;
  ctx.beginPath();
  ctx.moveTo(cx, 140);
  ctx.lineTo(cx, 250);
  ctx.stroke();

  // Button
  ctx.beginPath();
  ctx.arc(cx, 145, 8, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();
}

function drawMug(
  ctx: CanvasRenderingContext2D,
  fill: string,
  dark: string,
  _light: string,
  w: number,
  h: number
) {
  const x = w * 0.2;
  const y = h * 0.22;
  const mw = w * 0.42;
  const mh = h * 0.5;

  // Body
  ctx.beginPath();
  roundRect(ctx, x, y, mw, mh, 12);
  ctx.fillStyle = fill === "#FFFFFF" || fill.toLowerCase() === "#ffffff" ? "#f8fafc" : fill;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner rim
  ctx.beginPath();
  ctx.ellipse(x + mw / 2, y + 8, mw / 2 - 4, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e2e8f0";
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.stroke();

  // Handle
  ctx.beginPath();
  ctx.arc(x + mw + 28, y + mh / 2, 36, -1.2, 1.2);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 14;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + mw + 28, y + mh / 2, 36, -1.2, 1.2);
  ctx.strokeStyle = fill === "#FFFFFF" ? "#f1f5f9" : fill;
  ctx.lineWidth = 8;
  ctx.stroke();
}

function drawBag(
  ctx: CanvasRenderingContext2D,
  fill: string,
  dark: string,
  light: string,
  w: number,
  h: number
) {
  const x = w * 0.25;
  const y = h * 0.18;
  const bw = w * 0.5;
  const bh = h * 0.58;

  ctx.beginPath();
  ctx.moveTo(x, y + 40);
  ctx.lineTo(x + 20, y);
  ctx.lineTo(x + bw - 20, y);
  ctx.lineTo(x + bw, y + 40);
  ctx.lineTo(x + bw, y + bh);
  ctx.lineTo(x, y + bh);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Handles
  ctx.strokeStyle = dark;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + bw * 0.28, y + 50);
  ctx.quadraticCurveTo(x + bw * 0.35, y - 30, x + bw * 0.5, y + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + bw * 0.72, y + 50);
  ctx.quadraticCurveTo(x + bw * 0.65, y - 30, x + bw * 0.5, y + 20);
  ctx.stroke();

  // CMYK strip at bottom
  const stripY = y + bh - 28;
  const colors = ["#00AEEF", "#EC008C", "#FFF200", "#111"];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + 8 + i * ((bw - 16) / 4), stripY, (bw - 16) / 4, 16);
  });
  ctx.fillStyle = light;
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  fill: string,
  dark: string,
  light: string,
  w: number,
  height: number
) {
  const x = w * 0.15;
  const y = height * 0.28;
  const cw = w * 0.7;
  const ch = height * 0.42;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  roundRect(ctx, x + 8, y + 10, cw, ch, 10);
  ctx.fill();

  ctx.beginPath();
  roundRect(ctx, x, y, cw, ch, 10);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Corner accent
  ctx.fillStyle = "#F37021";
  ctx.fillRect(x, y, 8, ch);
  ctx.fillStyle = light;
}
