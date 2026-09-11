import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Type, Upload, Trash2, Move } from "lucide-react";
import type { MockupKind } from "./Product3DViewer";

export type EditorLayer =
  | {
      id: string;
      kind: "image";
      src: string;
      x: number; // 0–1 relative to stage
      y: number;
      w: number;
      h: number;
      rotation: number;
    }
  | {
      id: string;
      kind: "text";
      text: string;
      fontFamily: string;
      fontSize: number;
      color: string;
      fontWeight: number;
      italic: boolean;
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
    };

type Props = {
  type: MockupKind;
  color: string;
  side: "front" | "back";
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeLayers: (layers: EditorLayer[]) => void;
  className?: string;
};

const FONTS = [
  { label: "Outfit", value: '"Outfit", system-ui, sans-serif' },
  { label: "DM Sans", value: '"DM Sans", system-ui, sans-serif' },
  { label: "Caveat", value: '"Caveat", cursive' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: '"Courier New", monospace' },
];

function baseImageFor(type: MockupKind, color: string): string {
  const dark = isDark(color);
  switch (type) {
    case "tshirt":
      return dark
        ? "/images/mockup-tshirt-navy-blank.png"
        : "/images/mockup-tshirt-white-blank.jpg";
    case "polo":
      return dark
        ? "/images/product-polo-navy.jpg"
        : "/images/mockup-polo-white-blank.png";
    case "cap":
      return dark
        ? "/images/mockup-cap-navy-blank.png"
        : "/images/product-cap-black.jpg";
    case "mug":
      return "/images/mockup-mug-white-blank.jpg";
    case "bag":
      return "/images/mockup-bag-white-blank.jpg";
    case "business-card":
      return "/images/product-business-cards.jpg";
    default:
      return "/images/mockup-tshirt-white-blank.jpg";
  }
}

function isDark(hex: string): boolean {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const num = parseInt(full || "ffffff", 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

function uid() {
  return `layer-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultLogoLayer(): EditorLayer {
  return {
    id: uid(),
    kind: "image",
    src: "/logo-fp.png",
    x: 0.35,
    y: 0.28,
    w: 0.3,
    h: 0.22,
    rotation: 0,
  };
}

export function createTextLayer(text = "Fusion Print"): EditorLayer {
  return {
    id: uid(),
    kind: "text",
    text,
    fontFamily: '"Outfit", system-ui, sans-serif',
    fontSize: 28,
    color: "#1A2A47",
    fontWeight: 700,
    italic: false,
    x: 0.28,
    y: 0.52,
    w: 0.44,
    h: 0.1,
    rotation: 0,
  };
}

export { FONTS };

type DragMode = "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl";

export function MockupEditor({
  type,
  color,
  side,
  layers,
  selectedId,
  onSelect,
  onChangeLayers,
  className = "",
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    mode: DragMode;
    startX: number;
    startY: number;
    orig: EditorLayer;
  } | null>(null);
  const [tint, setTint] = useState(color);

  useEffect(() => {
    setTint(color);
  }, [color]);

  const baseSrc = useMemo(() => baseImageFor(type, color), [type, color]);

  const updateLayer = useCallback(
    (id: string, patch: Partial<EditorLayer>) => {
      onChangeLayers(
        layers.map((l) => (l.id === id ? ({ ...l, ...patch } as EditorLayer) : l))
      );
    },
    [layers, onChangeLayers]
  );

  const onPointerDown = (e: ReactPointerEvent, id: string, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    onSelect(id);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...layer },
    };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    const o = drag.orig;

    if (drag.mode === "move") {
      updateLayer(drag.id, {
        x: Math.min(0.92, Math.max(0.02, o.x + dx)),
        y: Math.min(0.92, Math.max(0.02, o.y + dy)),
      });
      return;
    }

    let { x, y, w, h } = o;
    if (drag.mode === "resize-br") {
      w = Math.min(0.85, Math.max(0.08, o.w + dx));
      h = Math.min(0.85, Math.max(0.06, o.h + dy));
    } else if (drag.mode === "resize-bl") {
      w = Math.min(0.85, Math.max(0.08, o.w - dx));
      h = Math.min(0.85, Math.max(0.06, o.h + dy));
      x = o.x + (o.w - w);
    } else if (drag.mode === "resize-tr") {
      w = Math.min(0.85, Math.max(0.08, o.w + dx));
      h = Math.min(0.85, Math.max(0.06, o.h - dy));
      y = o.y + (o.h - h);
    } else if (drag.mode === "resize-tl") {
      w = Math.min(0.85, Math.max(0.08, o.w - dx));
      h = Math.min(0.85, Math.max(0.06, o.h - dy));
      x = o.x + (o.w - w);
      y = o.y + (o.h - h);
    }
    updateLayer(drag.id, { x, y, w, h });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[4/5] w-full max-w-lg cursor-default select-none"
        onPointerDown={() => onSelect(null)}
      >
        {/* Color wash for apparel tinting */}
        <div
          className="absolute inset-0"
          style={{
            background:
              type === "mug" || type === "business-card"
                ? undefined
                : `linear-gradient(180deg, ${tint}22, transparent 40%)`,
          }}
        />
        <img
          src={baseSrc}
          alt={`${type} mockup ${side}`}
          className="absolute inset-0 h-full w-full object-contain p-3"
          draggable={false}
          style={
            type === "tshirt" || type === "polo" || type === "cap" || type === "bag"
              ? {
                  filter: isDark(color)
                    ? "brightness(0.95) contrast(1.05)"
                    : "brightness(1.02)",
                }
              : undefined
          }
        />

        {/* Soft color multiply for non-matching blank bases */}
        {(type === "tshirt" || type === "polo") && (
          <div
            className="pointer-events-none absolute inset-[12%] mix-blend-multiply opacity-35"
            style={{ backgroundColor: tint }}
          />
        )}

        {layers.map((layer) => {
          const selected = layer.id === selectedId;
          const style: CSSProperties = {
            left: `${layer.x * 100}%`,
            top: `${layer.y * 100}%`,
            width: `${layer.w * 100}%`,
            height: `${layer.h * 100}%`,
            transform: `rotate(${layer.rotation}deg)`,
          };
          return (
            <div
              key={layer.id}
              className={`absolute touch-none ${selected ? "z-20" : "z-10"}`}
              style={style}
              onPointerDown={(e) => onPointerDown(e, layer.id, "move")}
            >
              <div
                className={`relative h-full w-full ${
                  selected ? "ring-2 ring-brand-orange ring-offset-1" : "hover:ring-1 hover:ring-white/70"
                }`}
              >
                {layer.kind === "image" ? (
                  <img
                    src={layer.src}
                    alt=""
                    className="h-full w-full object-contain drop-shadow-md"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center overflow-hidden text-center leading-tight"
                    style={{
                      color: layer.color,
                      fontFamily: layer.fontFamily,
                      fontSize: `clamp(10px, ${layer.fontSize * (layer.w + 0.4)}px, 64px)`,
                      fontWeight: layer.fontWeight,
                      fontStyle: layer.italic ? "italic" : "normal",
                      textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                    }}
                  >
                    {layer.text || "Text"}
                  </div>
                )}

                {selected && (
                  <>
                    {(
                      [
                        ["resize-tl", "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"],
                        ["resize-tr", "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"],
                        ["resize-bl", "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"],
                        ["resize-br", "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"],
                      ] as const
                    ).map(([mode, cls]) => (
                      <span
                        key={mode}
                        className={`absolute h-3 w-3 rounded-full border-2 border-white bg-brand-orange shadow ${cls}`}
                        onPointerDown={(e) => onPointerDown(e, layer.id, mode)}
                      />
                    ))}
                    <span className="pointer-events-none absolute -top-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-navy/80 px-2 py-0.5 text-[10px] text-white">
                      <Move className="h-3 w-3" /> Drag
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="pb-2 text-center text-[11px] text-navy/45">
        Drag layers · corner handles to resize · {side} · {type}
      </p>
    </div>
  );
}

export function MockupEditorToolbar({
  layers,
  selectedId,
  onSelect,
  onChangeLayers,
  onUploadLogo,
}: {
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeLayers: (layers: EditorLayer[]) => void;
  onUploadLogo: (file: File) => void;
}) {
  const selected = layers.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
          Design layers
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const layer = createDefaultLogoLayer();
              onChangeLayers([...layers, layer]);
              onSelect(layer.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-orange"
          >
            <img src="/logo-fp.png" alt="" className="h-4 w-4 object-contain" />
            Add Fusion logo
          </button>
          <button
            type="button"
            onClick={() => {
              const layer = createTextLayer();
              onChangeLayers([...layers, layer]);
              onSelect(layer.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-orange"
          >
            <Type className="h-3.5 w-3.5" />
            Add text
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-brand-orange">
            <Upload className="h-3.5 w-3.5" />
            Upload logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadLogo(f);
              }}
            />
          </label>
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChangeLayers(layers.filter((l) => l.id !== selected.id));
                onSelect(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      {selected?.kind === "text" && (
        <div className="space-y-3 rounded-2xl border border-navy/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy/50">Text style</p>
          <input
            value={selected.text}
            onChange={(e) =>
              onChangeLayers(
                layers.map((l) =>
                  l.id === selected.id && l.kind === "text" ? { ...l, text: e.target.value } : l
                )
              )
            }
            className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            placeholder="Your text"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase text-navy/40">Font</label>
              <select
                value={selected.fontFamily}
                onChange={(e) =>
                  onChangeLayers(
                    layers.map((l) =>
                      l.id === selected.id && l.kind === "text"
                        ? { ...l, fontFamily: e.target.value }
                        : l
                    )
                  )
                }
                className="mt-1 w-full rounded-xl border border-navy/15 px-2 py-2 text-sm"
              >
                {FONTS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase text-navy/40">Size</label>
              <input
                type="range"
                min={14}
                max={72}
                value={selected.fontSize}
                onChange={(e) =>
                  onChangeLayers(
                    layers.map((l) =>
                      l.id === selected.id && l.kind === "text"
                        ? { ...l, fontSize: Number(e.target.value) }
                        : l
                    )
                  )
                }
                className="mt-3 w-full accent-brand-orange"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[10px] font-semibold uppercase text-navy/40">Color</label>
            <input
              type="color"
              value={selected.color}
              onChange={(e) =>
                onChangeLayers(
                  layers.map((l) =>
                    l.id === selected.id && l.kind === "text" ? { ...l, color: e.target.value } : l
                  )
                )
              }
              className="h-9 w-12 cursor-pointer rounded border border-navy/15"
            />
            <button
              type="button"
              onClick={() =>
                onChangeLayers(
                  layers.map((l) =>
                    l.id === selected.id && l.kind === "text"
                      ? { ...l, fontWeight: l.fontWeight >= 700 ? 400 : 700 }
                      : l
                  )
                )
              }
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                selected.fontWeight >= 700
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-navy/15 text-navy"
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeLayers(
                  layers.map((l) =>
                    l.id === selected.id && l.kind === "text" ? { ...l, italic: !l.italic } : l
                  )
                )
              }
              className={`rounded-lg border px-3 py-1.5 text-sm italic ${
                selected.italic
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-navy/15 text-navy"
              }`}
            >
              I
            </button>
          </div>
        </div>
      )}

      {layers.length > 0 && (
        <ul className="space-y-1">
          {layers.map((l, i) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelect(l.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                  selectedId === l.id
                    ? "bg-navy text-white"
                    : "bg-white text-navy/70 hover:bg-slate-100"
                }`}
              >
                {l.kind === "image" ? `Logo / image ${i + 1}` : `Text: “${l.text.slice(0, 24)}”`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
