import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  MapPin,
  RotateCcw,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { api, type PrintService, type ShopPublic } from "../lib/api";

type Step = "upload" | "received" | "edit" | "preview" | "options" | "pay" | "success";
type Layout = "id-front-back" | "certificate" | "admit" | "auto";
type PayMethod = "online" | "counter";

const STEPPER = ["Upload", "Edit", "Preview", "Pay"] as const;

const SERVICE_EMOJI: Record<string, string> = {
  document: "📄",
  resume: "📝",
  "photo-4x6": "📷",
  "big-size": "📐",
  mini: "🗒️",
  "smart-scanner": "📸",
};

export function PrintPage() {
  const { shopCode = "fusion" } = useParams();
  const [shop, setShop] = useState<ShopPublic | null>(null);
  const [services, setServices] = useState<PrintService[]>([]);
  const [step, setStep] = useState<Step>("upload");
  const [service, setService] = useState<PrintService | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [layout, setLayout] = useState<Layout>("auto");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [duplex, setDuplex] = useState(false);
  const [copies, setCopies] = useState(1);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [brightness, setBrightness] = useState(100);
  const [cropRot, setCropRot] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [resumeStub, setResumeStub] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("online");
  const [total, setTotal] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepperIndex = useMemo(() => {
    if (step === "upload") return 0;
    if (step === "received" || step === "edit") return 1;
    if (step === "preview" || step === "options") return 2;
    return 3;
  }, [step]);

  useEffect(() => {
    void (async () => {
      try {
        const [s, svc] = await Promise.all([api.shopByCode(shopCode), api.printServices()]);
        setShop(s.shop ?? null);
        const list = svc.services ?? [];
        setServices(list);
        if (list.length && !service) {
          const doc = list.find((x) => x.id === "document") || list[0];
          setService(doc);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Shop unavailable");
      }
    })();
  }, [shopCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const priceBw = shop?.pricing?.bwPerPage ?? service?.basePriceBw ?? 5;
  const priceColor = shop?.pricing?.colorPerPage ?? service?.basePriceColor ?? 10;
  const pricePerPage = colorMode === "color" ? priceColor : priceBw;

  useEffect(() => {
    const pages = Math.max(1, files.length);
    const duplexFee = duplex ? shop?.pricing?.duplexSurcharge || 0 : 0;
    setTotal((pricePerPage * pages + duplexFee) * copies);
  }, [files.length, copies, duplex, pricePerPage, shop]);

  const addFiles = useCallback((list: FileList | File[] | null) => {
    if (!list) return;
    const arr = Array.from(list).filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type === "application/pdf" ||
        /\.(jpe?g|png|pdf)$/i.test(f.name)
    );
    if (!arr.length) {
      setError("Only PDF, JPG, PNG supported");
      return;
    }
    setError("");
    setFiles((f) => [...f, ...arr]);
    setPreviews((p) => [...p, ...arr.map((file) => URL.createObjectURL(file))]);
    setStep("received");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const pickService = (s: PrintService) => {
    setService(s);
    setResumeStub(s.id === "resume");
    setShowCamera(s.id === "smart-scanner" || s.id === "photo-4x6");
    if (s.id === "resume") {
      setError("");
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(s);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera permission denied — use Choose Files instead.");
      setShowCamera(false);
    }
  };

  const snapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropRot * Math.PI) / 180);
    ctx.filter = `brightness(${brightness}%)`;
    ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        setFiles((f) => [...f, file]);
        setPreviews((p) => [...p, URL.createObjectURL(blob)]);
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
        setShowCamera(false);
        setStep("received");
      },
      "image/jpeg",
      0.92
    );
  };

  const submit = async (method: PayMethod) => {
    if (!service || !files.length) return;
    setSubmitting(true);
    setError("");
    setPayMethod(method);
    try {
      const form = new FormData();
      form.append("shopCode", shopCode);
      form.append("serviceType", service.id);
      form.append("colorMode", colorMode);
      form.append("duplex", String(duplex));
      form.append("copies", String(copies));
      form.append("layout", layout);
      form.append("pageCount", String(Math.max(1, files.length)));
      form.append("paymentStatus", method === "counter" ? "pending" : "stub");
      form.append("paymentMethod", method);
      if (note) form.append("customerNote", note);
      if (phone) form.append("customerPhone", phone);
      files.forEach((f) => form.append("files", f));
      const res = await api.submitPrintJob(form);
      setJobId(res.job.id);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    const map: Partial<Record<Step, Step>> = {
      received: "upload",
      edit: "received",
      preview: "received",
      options: "preview",
      pay: "options",
    };
    const prev = map[step];
    if (prev) setStep(prev);
  };

  const useResumeStub = () => {
    const blob = new Blob(
      [
        "Fusion Print — Resume Maker (stub)\n\nName: Your Name\nPhone: 9999999999\n\nExperience\n- Role at Company\n\nEducation\n- Degree, College\n",
      ],
      { type: "text/plain" }
    );
    const file = new File([blob], "resume-fusion.txt", { type: "text/plain" });
    // Convert to a printable PDF-like placeholder image via canvas
    const canvas = document.createElement("canvas");
    canvas.width = 794;
    canvas.height = 1123;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0B3D91";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("Resume Preview", 48, 80);
      ctx.fillStyle = "#333";
      ctx.font = "22px sans-serif";
      [
        "Your Name",
        "email@example.com · 99999 99999",
        "",
        "EXPERIENCE",
        "Role — Company (2022–Present)",
        "• Built Fusion Print QR flow",
        "",
        "EDUCATION",
        "B.Tech — University",
        "",
        "(Stub template — full maker coming soon)",
      ].forEach((line, i) => ctx.fillText(line, 48, 140 + i * 36));
      canvas.toBlob((b) => {
        if (!b) {
          setFiles([file]);
          setPreviews([URL.createObjectURL(blob)]);
        } else {
          const img = new File([b], "resume-preview.jpg", { type: "image/jpeg" });
          setFiles([img]);
          setPreviews([URL.createObjectURL(b)]);
        }
        setResumeStub(false);
        setStep("received");
      }, "image/jpeg");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-navy">
      <header className="px-4 pb-3 pt-4">
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#062a66] p-4 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <img src="/logo-fp.png" alt="" className="h-12 w-12 rounded-xl bg-white/15 p-1" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight">
                {shop?.name || "Loading…"}
                {shop && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              </p>
              {shop?.address && (
                <p className="mt-0.5 flex items-start gap-1 text-[11px] leading-snug text-white/70">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-brand-orange" />
                  <span className="line-clamp-2">{shop.address}</span>
                </p>
              )}
            </div>
            <Link to="/" className="text-[10px] text-white/40">
              Fusion
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              B&amp;W: ₹{priceBw}/page
            </span>
            <span className="rounded-full bg-gradient-to-r from-brand-orange to-amber-400 px-3 py-1 text-xs font-bold text-navy">
              Color: ₹{priceColor}/page
            </span>
          </div>
        </div>

        {/* Stepper: Upload → Edit → Preview → Pay */}
        <div className="mx-auto mt-4 flex max-w-lg items-center justify-between px-2">
          {STEPPER.map((label, i) => {
            const done = i < stepperIndex;
            const active = i === stepperIndex;
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-brand-orange text-navy"
                        : active
                          ? "bg-[#0B3D91] text-white"
                          : "bg-slate-200 text-navy/40"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      active || done ? "text-[#0B3D91]" : "text-navy/35"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPPER.length - 1 && (
                  <div
                    className={`mx-1 mb-4 h-0.5 flex-1 ${
                      i < stepperIndex ? "bg-brand-orange" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28">
        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {step !== "upload" && step !== "success" && (
          <button type="button" className="mb-3 text-xs font-medium text-navy/50" onClick={goBack}>
            ← Back
          </button>
        )}

        {/* —— UPLOAD —— */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {services.map((s) => {
                const selected = service?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickService(s)}
                    className={`rounded-2xl border bg-white p-3.5 text-left shadow-sm transition ${
                      selected
                        ? "border-brand-orange ring-2 ring-brand-orange/30"
                        : "border-navy/8 hover:border-navy/20"
                    }`}
                  >
                    <span className="text-2xl">{SERVICE_EMOJI[s.id] || "📄"}</span>
                    <p className="mt-1.5 text-sm font-bold text-navy">{s.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-navy/45">{s.description}</p>
                  </button>
                );
              })}
            </div>

            {resumeStub && service?.id === "resume" ? (
              <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                <h2 className="font-display text-lg font-bold">Resume Maker</h2>
                <p className="mt-1 text-sm text-navy/50">
                  Full 6-template builder coming soon. Use a quick stub preview to test the print queue.
                </p>
                <button
                  type="button"
                  onClick={useResumeStub}
                  className="mt-4 w-full rounded-full bg-[#0B3D91] py-3 text-sm font-semibold text-white"
                >
                  Use stub resume &amp; continue
                </button>
                <label className="mt-2 flex cursor-pointer justify-center text-sm text-brand-orange underline">
                  Or upload your own resume PDF
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </label>
              </div>
            ) : (
              <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                <h2 className="font-display text-lg font-bold">Upload Document</h2>
                <p className="mt-1 text-sm text-navy/50">PDF, JPG, PNG — all supported</p>
                <p className="mt-1 text-xs text-navy/40">
                  📚 You can select multiple files at once — all print in one order
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["PDF", "JPG", "PNG"].map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-navy/60"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-navy/50">
                    🔒 Private upload
                  </span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                    dragOver
                      ? "border-brand-orange bg-amber-50"
                      : "border-navy/15 bg-slate-50 hover:border-[#0B3D91]/40"
                  }`}
                >
                  <Upload className="mx-auto h-8 w-8 text-[#0B3D91]/60" />
                  <p className="mt-2 text-sm font-semibold text-navy">
                    👆 Tap here or drag &amp; drop your file
                  </p>
                  <p className="mt-1 text-xs text-navy/40">or</p>
                  <span className="mt-2 inline-block rounded-full bg-[#0B3D91] px-5 py-2 text-sm font-semibold text-white">
                    Choose Files
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>

                {(service?.id === "smart-scanner" || service?.id === "photo-4x6") && (
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-navy/15 py-2.5 text-sm font-semibold"
                  >
                    <Camera className="h-4 w-4 text-brand-orange" /> Use Camera
                  </button>
                )}

                {showCamera && (
                  <div className="mt-3 space-y-2">
                    <div className="overflow-hidden rounded-2xl bg-black">
                      <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCropRot((r) => (r + 90) % 360)}
                        className="flex-1 rounded-full border border-navy/15 py-2 text-sm"
                      >
                        <RotateCcw className="mr-1 inline h-4 w-4" /> Rotate
                      </button>
                      <button
                        type="button"
                        onClick={snapPhoto}
                        className="flex-[2] rounded-full bg-brand-orange py-2 font-semibold text-navy"
                      >
                        Capture
                      </button>
                    </div>
                  </div>
                )}

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-navy/45">
                  <Lock className="h-3.5 w-3.5" /> Your files are secure &amp; private
                </p>
              </div>
            )}

            {/* Trust bar */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-navy/8 bg-white p-3 shadow-sm">
              {[
                { icon: Shield, title: "Secure & Safe", sub: "Your files are 100% safe" },
                { icon: Zap, title: "Fast Printing", sub: "Quick & reliable service" },
                { icon: Sparkles, title: "Best Quality", sub: "Clear & sharp prints" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="text-center">
                  <Icon className="mx-auto h-5 w-5 text-[#0B3D91]" />
                  <p className="mt-1 text-[10px] font-bold text-navy">{title}</p>
                  <p className="text-[9px] text-navy/40">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* —— FILE RECEIVED —— */}
        {step === "received" && (
          <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold">👀 File Received</h2>
            <p className="mt-1 text-sm text-navy/50">
              {files.length} page{files.length === 1 ? "" : "s"} — ek nazar dekh lo
            </p>
            {previews[0] && (
              <img
                src={previews[0]}
                alt="Received"
                className="mx-auto mt-4 max-h-56 rounded-xl border border-navy/10 object-contain"
                style={{
                  transform: `rotate(${cropRot}deg)`,
                  filter: `brightness(${brightness}%)`,
                }}
              />
            )}
            <button
              type="button"
              onClick={() => setStep("preview")}
              className="mt-5 w-full rounded-full bg-emerald-500 py-3.5 font-bold text-white"
            >
              ✅ All Good — Continue
            </button>
            <p className="mt-1 text-center text-[11px] text-navy/40">
              File prints exactly as it is — cleanest and fastest
            </p>
            <button
              type="button"
              onClick={() => setStep("edit")}
              className="mt-3 w-full rounded-full border-2 border-[#0B3D91]/20 bg-slate-50 py-3.5 font-bold text-[#0B3D91]"
            >
              ✏️ Want to Edit
            </button>
            <p className="mt-1 text-center text-[11px] text-navy/40">
              Rotate, crop, adjust brightness or add more documents
            </p>
          </div>
        )}

        {/* —— EDIT —— */}
        {step === "edit" && (
          <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold">Edit</h2>
            {previews[0] && (
              <div className="overflow-hidden rounded-xl bg-slate-100 p-2">
                <img
                  src={previews[0]}
                  alt="Edit"
                  className="mx-auto max-h-64 object-contain"
                  style={{
                    transform: `rotate(${cropRot}deg)`,
                    filter: `brightness(${brightness}%)`,
                  }}
                />
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold text-navy/50">Document layout</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["id-front-back", "ID Card", "Front & back"],
                    ["certificate", "Certificate", "Full A4"],
                    ["admit", "Admit / Marksheet", "Half page"],
                    ["auto", "Auto Fit", "System chooses"],
                  ] as const
                ).map(([id, title, desc]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLayout(id)}
                    className={`rounded-xl border p-3 text-left text-sm ${
                      layout === id
                        ? "border-brand-orange ring-2 ring-brand-orange/25"
                        : "border-navy/10 bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">{title}</p>
                    <p className="text-[11px] text-navy/45">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCropRot((r) => (r + 90) % 360)}
                className="rounded-full border border-navy/15 px-3 py-2 text-xs font-semibold"
              >
                ↻ Right 90°
              </button>
              <button
                type="button"
                onClick={() => setCropRot((r) => (r + 270) % 360)}
                className="rounded-full border border-navy/15 px-3 py-2 text-xs font-semibold"
              >
                ↺ Left 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setCropRot(0);
                  setBrightness(100);
                }}
                className="rounded-full border border-navy/15 px-3 py-2 text-xs font-semibold"
              >
                ↺ Reset
              </button>
            </div>

            <label className="block text-xs font-semibold text-navy/50">
              Brightness {brightness}%
              <input
                type="range"
                min={60}
                max={140}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="mt-1 w-full accent-brand-orange"
              />
            </label>

            <p className="text-[11px] text-navy/40">
              Corner / perspective crop: drag corners on phone preview (basic rotate + brightness
              applied to print preview). Full canvas warp is shop-side for PDFs.
            </p>

            <label className="flex cursor-pointer items-center justify-center rounded-full border border-dashed border-navy/20 py-2.5 text-sm font-medium">
              ➕ Add Document (Back Side, etc.)
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files?.length) return;
                  const arr = Array.from(e.target.files);
                  setFiles((f) => [...f, ...arr]);
                  setPreviews((p) => [...p, ...arr.map((file) => URL.createObjectURL(file))]);
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => setStep("preview")}
              className="w-full rounded-full bg-emerald-500 py-3 font-bold text-white"
            >
              ✅ OK, Continue
            </button>
          </div>
        )}

        {/* —— PREVIEW —— */}
        {step === "preview" && (
          <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold">👀 Print Preview</h2>
            <div className="mt-4 rounded-xl border border-navy/10 bg-slate-50 p-4">
              <div className="mx-auto flex min-h-[200px] max-w-[240px] flex-wrap content-start justify-center gap-2 rounded-lg border bg-white p-3 shadow-inner">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="max-h-40 w-full object-contain"
                    style={{
                      transform: `rotate(${cropRot}deg)`,
                      filter: `brightness(${brightness}%)`,
                    }}
                  />
                ))}
                {!previews.length && (
                  <p className="self-center text-xs text-navy/40">No preview</p>
                )}
              </div>
              <p className="mt-3 text-center text-xs text-emerald-600">✅ File ready!</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("options")}
              className="mt-5 w-full rounded-full bg-emerald-500 py-3.5 font-bold text-white"
            >
              ✅ Continue
            </button>
          </div>
        )}

        {/* —— OPTIONS —— */}
        {step === "options" && (
          <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold">⚙️ Print Options</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setColorMode("bw")}
                className={`rounded-2xl border p-4 text-left ${
                  colorMode === "bw"
                    ? "border-brand-orange ring-2 ring-brand-orange/30"
                    : "border-navy/10 bg-slate-50"
                }`}
              >
                <p className="text-lg">⬛</p>
                <p className="font-semibold">Black &amp; White</p>
                <p className="text-sm text-brand-orange">₹{priceBw}/page</p>
              </button>
              <button
                type="button"
                onClick={() => setColorMode("color")}
                className={`rounded-2xl border p-4 text-left ${
                  colorMode === "color"
                    ? "border-brand-orange ring-2 ring-brand-orange/30"
                    : "border-navy/10 bg-slate-50"
                }`}
              >
                <p className="text-lg">🌈</p>
                <p className="font-semibold">Color</p>
                <p className="text-sm text-brand-orange">₹{priceColor}/page</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDuplex((d) => !d)}
              className={`w-full rounded-2xl border p-4 text-left ${
                duplex ? "border-brand-orange ring-2 ring-brand-orange/25" : "border-navy/10 bg-slate-50"
              }`}
            >
              <p className="font-semibold">📑 Dual-Side (Duplex)</p>
              <p className="text-xs text-navy/45">
                {shop?.pricing?.duplexSurcharge
                  ? `+₹${shop.pricing.duplexSurcharge} surcharge`
                  : "No extra charge"}
              </p>
            </button>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="font-semibold">📑 Copies</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white text-lg shadow-sm"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center font-bold">{copies}</span>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white text-lg shadow-sm"
                  onClick={() => setCopies((c) => c + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm">
              <p className="text-navy/50">
                {colorMode === "color" ? "Color" : "B&W"} Print · {Math.max(1, files.length)} page
                {files.length === 1 ? "" : "s"} × {copies} copy
              </p>
              <div className="mt-1 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-orange">₹{total}</span>
              </div>
            </div>

            <input
              placeholder="Phone (optional — for counter pickup)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm"
            />
            <textarea
              placeholder="Note for shop (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-navy/15 px-3 py-2.5 text-sm"
              rows={2}
            />

            <button
              type="button"
              onClick={() => setStep("pay")}
              className="w-full rounded-full bg-[#0B3D91] py-3.5 font-bold text-white"
            >
              💳 Go to Payment
            </button>
          </div>
        )}

        {/* —— PAY —— */}
        {step === "pay" && (
          <div className="space-y-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold">💳 Make Payment</h2>
            <p className="text-sm text-navy/50">
              {service?.name} · {colorMode.toUpperCase()} · {copies} copy · ₹{total}
            </p>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit("online")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0B3D91] to-[#1a56c4] py-4 font-bold text-white disabled:opacity-60"
            >
              {submitting && payMethod === "online" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "💳"
              )}
              Pay Online — ₹{total}
            </button>
            <p className="text-center text-[11px] text-navy/40">
              UPI/gateway stub — marks paid and queues the job. Connect Razorpay later.
            </p>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit("counter")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0B3D91]/20 bg-slate-50 py-4 font-bold text-[#0B3D91] disabled:opacity-60"
            >
              {submitting && payMethod === "counter" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "💵"
              )}
              Pay at Counter (Cash)
            </button>
            <p className="text-center text-[11px] text-navy/40">
              Job queued as unpaid — shopkeeper marks paid at counter.
            </p>
          </div>
        )}

        {/* —— SUCCESS —— */}
        {step === "success" && (
          <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-bold tracking-wider text-navy">
              QUEUED FOR PRINT
            </div>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-4 font-display text-2xl font-bold">Sent to {shop?.name}</h1>
            <p className="mt-2 text-sm text-navy/60">
              Job <span className="font-mono text-xs">{jobId.slice(-8)}</span> is in the shop queue.
              Collect at the counter.
            </p>
            <p className="mt-1 text-lg font-bold text-brand-orange">₹{total}</p>
            <p className="mt-1 text-xs text-navy/45">
              {payMethod === "counter" ? "Pay at counter · pending" : "Online stub · marked paid"}
            </p>
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setPreviews([]);
                setCopies(1);
                setDuplex(false);
                setStep("upload");
                setJobId("");
              }}
              className="mt-6 w-full rounded-full border border-navy/15 py-2.5 text-sm font-semibold"
            >
              New Print
            </button>
            <Link
              to="/"
              className="mt-3 inline-block text-sm text-[#0B3D91] underline"
            >
              Back to Fusion
            </Link>
          </div>
        )}
      </main>

      <p className="pb-6 text-center text-[10px] text-navy/35">
        ⚡ Powered by Fusion Print &amp; Services
      </p>
    </div>
  );
}
