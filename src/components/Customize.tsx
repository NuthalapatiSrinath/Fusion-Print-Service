import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Upload, Loader2, Send, CheckCircle2, Box, ImageIcon } from "lucide-react";
import { Product3DViewer, type MockupKind } from "./Product3DViewer";
import {
  MockupEditor,
  MockupEditorToolbar,
  createDefaultLogoLayer,
  type EditorLayer,
} from "./MockupEditor";
import { api, mediaUrl, type Addon, type Product } from "../lib/api";
import { fadeUp } from "../lib/motion";
import { useCart } from "../lib/cart";

type Props = {
  products: Product[];
  addons: Addon[];
};

const mockupLabels: Record<MockupKind, string> = {
  tshirt: "Round Neck",
  polo: "Polo",
  cap: "Cap",
  mug: "Mug",
  bag: "Bag",
  "business-card": "Biz Card",
};

export function Customize({ products, addons }: Props) {
  const reduceMotion = useReducedMotion();
  const cart = useCart();
  const mockupProducts = useMemo(
    () =>
      products.length
        ? products
        : ([
            {
              id: "round-neck",
              name: "Round Neck T-Shirt",
              mockupType: "tshirt" as const,
              colors: ["#FFFFFF", "#1A2A47", "#000000", "#F37021"],
              sides: ["front", "back"] as ("front" | "back")[],
              material: "180 GSM Cotton",
            },
            {
              id: "polo",
              name: "Polo T-Shirt",
              mockupType: "polo" as const,
              colors: ["#FFFFFF", "#1A2A47", "#000000"],
              sides: ["front", "back"] as ("front" | "back")[],
              material: "220 GSM Cotton",
            },
            {
              id: "cap",
              name: "Cap",
              mockupType: "cap" as const,
              colors: ["#FFFFFF", "#1A2A47", "#000000", "#F37021"],
              sides: ["front"] as ("front" | "back")[],
            },
            {
              id: "mug",
              name: "Ceramic Mug",
              mockupType: "mug" as const,
              colors: ["#FFFFFF"],
              sides: ["front"] as ("front" | "back")[],
            },
            {
              id: "bag",
              name: "Shopping Bag",
              mockupType: "bag" as const,
              colors: ["#FFFFFF", "#1A2A47"],
              sides: ["front"] as ("front" | "back")[],
            },
            {
              id: "business-card",
              name: "Business Card",
              mockupType: "business-card" as const,
              colors: ["#1A2A47", "#FFFFFF"],
              sides: ["front", "back"] as ("front" | "back")[],
            },
          ] as Product[]),
    [products]
  );

  const [selectedId, setSelectedId] = useState(mockupProducts[0]?.id ?? "round-neck");
  const selected = mockupProducts.find((p) => p.id === selectedId) ?? mockupProducts[0];
  const [color, setColor] = useState(selected?.colors[0] ?? "#FFFFFF");
  const [side, setSide] = useState<"front" | "back">("front");
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quote, setQuote] = useState<{
    quoteBased?: boolean;
    totalRange?: { min: number; max: number };
    message?: string;
  } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"mockup" | "3d">("mockup");
  const [layers, setLayers] = useState<EditorLayer[]>(() => [createDefaultLogoLayer()]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(layers[0]?.id ?? null);

  useEffect(() => {
    if (selected) {
      setColor(selected.colors[0]);
      setSide(selected.sides[0]);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset default Fusion logo when product type changes
  useEffect(() => {
    const logo = createDefaultLogoLayer();
    setLayers([logo]);
    setSelectedLayerId(logo.id);
  }, [selected?.mockupType]);

  const previewSrc = localPreview || designUrl;
  const primaryDesign =
    previewSrc ||
    (layers.find((l) => l.kind === "image") as Extract<EditorLayer, { kind: "image" }> | undefined)
      ?.src ||
    "/logo-fp.png";

  const onFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setDone(false);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    const layer: EditorLayer = {
      id: `layer-${Math.random().toString(36).slice(2, 9)}`,
      kind: "image",
      src: objectUrl,
      x: 0.32,
      y: 0.3,
      w: 0.36,
      h: 0.28,
      rotation: 0,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
    setUploading(true);
    try {
      const res = await api.uploadDesign(file);
      setDesignUrl(res.url);
    } catch (e) {
      console.warn(e);
      setError("Upload to server failed — preview still works locally.");
    } finally {
      setUploading(false);
    }
  }, []);

  const fetchQuote = async () => {
    if (!selected || selected.category === "mockup") {
      setQuote({ quoteBased: true, message: "Contact us for mockup product pricing." });
      return;
    }
    try {
      const q = await api.quote({
        productId: selected.id,
        quantity,
        side: side === "back" ? "frontBack" : "single",
        addonIds: selectedAddons,
      });
      setQuote(q as typeof quote);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed");
    }
  };

  useEffect(() => {
    if (selected?.category === "apparel") {
      void fetchQuote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, quantity, side, selectedAddons.join(",")]);

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.inquiry({
        name: form.name,
        phone: form.phone,
        message: form.message,
        productId: selected?.id,
        quantity,
        side,
        color,
        addonIds: selectedAddons,
        designUrl: designUrl || undefined,
      });
      setDone(true);
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  const apparelAddons = addons.length
    ? addons
    : [
        { id: "glow", name: "Glow in the Dark", priceMin: 100, priceMax: 100, description: "" },
        { id: "metallic", name: "Metallic / Gold", priceMin: 100, priceMax: 100, description: "" },
        { id: "puff", name: "Puff (3D)", priceMin: 100, priceMax: 150, description: "" },
        { id: "embroidery", name: "Embroidery", priceMin: 100, priceMax: 200, description: "" },
        { id: "name-number", name: "Name & Number", priceMin: 50, priceMax: 100, description: "" },
      ];

  return (
    <section id="customize" className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="mb-10 max-w-xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-orange">
            Print your ideas
          </p>
          <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
            Live Customize
          </h2>
          <p className="mt-3 text-navy/60">
            Real product photo mockups with drag-to-place Fusion logo &amp; text — or orbit in 3D.
            Default design: Fusion FP mark on the chest.
          </p>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            className="sticky top-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("mockup")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  viewMode === "mockup"
                    ? "bg-navy text-white"
                    : "border border-navy/15 bg-white text-navy"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Photo mockup
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  viewMode === "3d"
                    ? "bg-navy text-white"
                    : "border border-navy/15 bg-white text-navy"
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                3D orbit
              </button>
            </div>

            <div className="rounded-2xl bg-white/70 p-2 shadow-lg ring-1 ring-navy/5 backdrop-blur-sm">
              {viewMode === "mockup" ? (
                <MockupEditor
                  type={(selected?.mockupType || "tshirt") as MockupKind}
                  color={color}
                  side={side}
                  layers={layers}
                  selectedId={selectedLayerId}
                  onSelect={setSelectedLayerId}
                  onChangeLayers={setLayers}
                  className="min-h-[420px] w-full md:min-h-[520px]"
                />
              ) : (
                <Product3DViewer
                  type={(selected?.mockupType || "tshirt") as MockupKind}
                  color={color}
                  side={side}
                  designUrl={mediaUrl(primaryDesign)}
                  className="h-[420px] w-full rounded-xl md:h-[520px]"
                />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-navy/40">
              {viewMode === "mockup"
                ? "Drag logo & text · resize with corners"
                : "Drag to orbit · scroll to zoom"}{" "}
              · {selected?.name}
              {selected?.material ? ` · ${selected.material}` : ""}
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                Product
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {mockupProducts.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedId === p.id
                        ? "bg-navy text-white"
                        : "border border-navy/15 bg-white text-navy hover:border-brand-orange"
                    }`}
                  >
                    {mockupLabels[p.mockupType] || p.name}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                Color
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selected?.colors || []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setColor(c)}
                    className={`h-9 w-9 rounded-full border-2 transition-transform ${
                      color === c ? "scale-110 border-brand-orange" : "border-navy/20"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {(selected?.sides?.length ?? 0) > 1 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                  Side
                </label>
                <div className="mt-2 flex gap-2">
                  {selected!.sides.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                        side === s
                          ? "bg-brand-orange text-white"
                          : "border border-navy/15 bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <MockupEditorToolbar
              layers={layers}
              selectedId={selectedLayerId}
              onSelect={setSelectedLayerId}
              onChangeLayers={setLayers}
              onUploadLogo={(file) => void onFile(file)}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                Quick upload
              </label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 bg-white px-4 py-6 transition-colors hover:border-brand-orange/50">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                ) : (
                  <Upload className="h-8 w-8 text-navy/40" />
                )}
                <span className="text-sm font-medium text-navy">
                  {previewSrc ? "Replace image" : "Upload logo / photo / design"}
                </span>
                <span className="text-xs text-navy/40">PNG, JPG, WEBP · max 8MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                />
              </label>
            </div>

            {selected?.category !== "mockup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-2 w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full rounded-xl bg-navy px-3 py-2 text-sm text-white">
                      {quote?.quoteBased ? (
                        <span>Custom quote</span>
                      ) : quote?.totalRange ? (
                        <span>
                          ≈ ₹{quote.totalRange.min}–₹{quote.totalRange.max}
                        </span>
                      ) : (
                        <span>Estimate…</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy/50">
                    Add-ons
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apparelAddons.map((a) => {
                      const on = selectedAddons.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() =>
                            setSelectedAddons((prev) =>
                              on ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            on
                              ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                              : "border-navy/15 bg-white text-navy/70"
                          }`}
                        >
                          {a.name} (+₹{a.priceMin}
                          {a.priceMax !== a.priceMin ? `–${a.priceMax}` : ""})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <form
              onSubmit={submitInquiry}
              className="space-y-3 rounded-2xl border border-navy/10 bg-white p-4"
            >
              <p className="font-display text-sm font-semibold text-navy">Request this design</p>
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
              <input
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
              <textarea
                placeholder="Notes (size, deadline…)"
                rows={2}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              {done && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Inquiry sent — we&apos;ll contact you
                  soon.
                </p>
              )}
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => {
                    if (!selected) return;
                    cart.addItem({
                      productId: selected.id,
                      name: selected.name,
                      image: selected.image,
                      quantity,
                      unitPrice: selected.storePrice || selected.recommendedPrice || 299,
                      color,
                      side,
                      designUrl: designUrl || undefined,
                    });
                  }}
                  className="flex-1 rounded-full border border-navy/20 py-2.5 text-sm font-semibold text-navy hover:border-brand-orange"
                >
                  Add to cart
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={reduceMotion || submitting ? undefined : { scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange py-2.5 font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send inquiry
                </motion.button>
              </div>
            </form>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
