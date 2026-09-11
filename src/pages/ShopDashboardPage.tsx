import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Printer,
  RefreshCw,
  Link2,
  CheckCircle2,
} from "lucide-react";
import {
  api,
  mediaUrl,
  type PrintJobRow,
  type ShopPrinter,
  type ShopPublic,
} from "../lib/api";
import { SHOP_TOKEN_KEY } from "./ShopLoginPage";

type Tab = "queue" | "printers" | "pair";

export function ShopDashboardPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SHOP_TOKEN_KEY));
  const [shop, setShop] = useState<ShopPublic | null>(null);
  const [userLabel, setUserLabel] = useState("");
  const [tab, setTab] = useState<Tab>("queue");
  const [jobs, setJobs] = useState<PrintJobRow[]>([]);
  const [printers, setPrinters] = useState<ShopPrinter[]>([]);
  const [devices, setDevices] = useState<Record<string, unknown>[]>([]);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingExpires, setPairingExpires] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [printerForm, setPrinterForm] = useState({
    name: "",
    bw: true,
    color: false,
    priority: "10",
  });

  const logout = () => {
    localStorage.removeItem(SHOP_TOKEN_KEY);
    setToken(null);
    navigate("/shop-login");
  };

  const refresh = useCallback(
    async (t: string) => {
      try {
        const me = await api.shopMe(t);
        setShop(me.shop);
        setUserLabel(String(me.user.username || ""));
        const [j, p, d] = await Promise.all([
          api.shopJobs(t),
          api.shopPrinters(t),
          api.shopDevices(t),
        ]);
        setJobs(j.jobs);
        setPrinters(p.printers);
        setDevices(d.devices);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Session expired");
        localStorage.removeItem(SHOP_TOKEN_KEY);
        setToken(null);
      }
    },
    []
  );

  useEffect(() => {
    if (!token) {
      navigate("/shop-login");
      return;
    }
    void refresh(token);
    const id = window.setInterval(() => void refresh(token), 8000);
    return () => window.clearInterval(id);
  }, [token, navigate, refresh]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-navy px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <img src="/logo-fp.png" alt="" className="h-9 w-9 rounded bg-white/10 p-0.5" />
          <div>
            <p className="font-display font-bold">{shop?.name || "Shop Dashboard"}</p>
            <p className="text-xs text-white/50">
              {userLabel} · /print/{shop?.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh(token)}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <nav className="mb-4 flex gap-1 overflow-x-auto">
          {(
            [
              ["queue", "Live queue"],
              ["printers", "Printers"],
              ["pair", "Pair device"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === id ? "bg-navy text-white" : "bg-white text-navy/70"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "queue" && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-navy">Print queue</h2>
            <p className="text-sm text-navy/50">
              Open / download files and print from this browser, or mark done. Auto-print needs a paired connector.
            </p>
            {!jobs.length && (
              <p className="rounded-xl border border-dashed border-navy/20 bg-white p-8 text-center text-sm text-navy/40">
                No jobs yet — customers scan QR → /print/{shop?.code}
              </p>
            )}
            {jobs.map((j) => (
              <div key={j.id} className="rounded-xl border border-navy/10 bg-white p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy">
                      {j.serviceName || j.serviceType}{" "}
                      <span className="text-xs font-normal text-brand-orange">
                        {j.options?.colorMode?.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-navy/50">
                      {j.status} · ₹{j.totalPrice} · pay {j.paymentStatus || "—"}
                      {j.paymentMethod ? ` (${j.paymentMethod})` : ""} ·{" "}
                      {j.assignedPrinterId ? `printer ${j.assignedPrinterId.slice(-6)}` : "unassigned"} ·{" "}
                      {j.id.slice(-8)}
                    </p>
                    {j.customerPhone && (
                      <p className="text-xs text-navy/40">Phone: {j.customerPhone}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(j.files || []).map((f, i) => (
                        <a
                          key={i}
                          href={mediaUrl(f.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-orange underline"
                        >
                          {f.originalName || "Open file"}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {j.paymentStatus === "pending" && (
                      <button
                        type="button"
                        className="rounded-full border border-emerald-500 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700"
                        onClick={async () => {
                          await api.shopUpdateJob(token, j.id, { paymentStatus: "paid" });
                          await refresh(token);
                        }}
                      >
                        Mark paid
                      </button>
                    )}
                    {["printing", "done", "failed"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className="rounded-full border px-2 py-1 text-[10px] capitalize"
                        onClick={async () => {
                          await api.shopUpdateJob(token, j.id, { status: st });
                          await refresh(token);
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "printers" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-navy">Printers</h2>
            <p className="text-sm text-navy/50">
              B&amp;W jobs → printers with B&amp;W · Color → color-capable · lower priority number wins · skip offline.
            </p>
            <form
              className="grid gap-2 rounded-xl border border-dashed border-navy/20 bg-white p-4 md:grid-cols-2"
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const caps: ("bw" | "color")[] = [];
                if (printerForm.bw) caps.push("bw");
                if (printerForm.color) caps.push("color");
                if (!caps.length) return;
                await api.shopCreatePrinter(token, {
                  name: printerForm.name,
                  capabilities: caps,
                  priority: Number(printerForm.priority) || 100,
                  status: "available",
                });
                setPrinterForm({ name: "", bw: true, color: false, priority: "10" });
                await refresh(token);
              }}
            >
              <input
                required
                placeholder="Printer name"
                className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
                value={printerForm.name}
                onChange={(e) => setPrinterForm({ ...printerForm, name: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={printerForm.bw}
                  onChange={(e) => setPrinterForm({ ...printerForm, bw: e.target.checked })}
                />
                B&amp;W capable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={printerForm.color}
                  onChange={(e) => setPrinterForm({ ...printerForm, color: e.target.checked })}
                />
                Color capable
              </label>
              <input
                type="number"
                placeholder="Priority (1 = first)"
                className="rounded-lg border px-3 py-2 text-sm"
                value={printerForm.priority}
                onChange={(e) => setPrinterForm({ ...printerForm, priority: e.target.value })}
              />
              <button type="submit" className="rounded-full bg-brand-orange py-2 text-sm font-semibold text-white">
                Add printer
              </button>
            </form>

            <ul className="space-y-3">
              {printers.map((p) => (
                <li key={p.id} className="rounded-xl border border-navy/10 bg-white p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        <Printer className="mr-1 inline h-4 w-4" />
                        {p.name}
                      </p>
                      <p className="text-xs text-navy/50">
                        {p.capabilities.join(" + ").toUpperCase()} · priority {p.priority} · {p.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(["available", "busy", "offline"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`rounded-full px-2 py-1 text-[10px] ${
                            p.status === st ? "bg-navy text-white" : "border"
                          }`}
                          onClick={async () => {
                            await api.shopUpdatePrinter(token, p.id, { status: st });
                            await refresh(token);
                          }}
                        >
                          {st}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="rounded-full border px-2 py-1 text-[10px] text-red-500"
                        onClick={async () => {
                          await api.shopDeletePrinter(token, p.id);
                          await refresh(token);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "pair" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-navy">Pair printer device</h2>
            <p className="text-sm text-navy/50">
              Optional auto-print: generate a one-time code, enter it in the Fusion Print Connector on the shop PC.
              You never need API URLs, Mongo, or agent tokens.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
              onClick={async () => {
                const res = await api.shopCreatePairing(token);
                setPairingCode(res.pairingCode);
                setPairingExpires(res.expiresAt);
                await refresh(token);
              }}
            >
              <Link2 className="h-4 w-4" /> Generate pairing code
            </button>

            {pairingCode && (
              <div className="rounded-2xl border-2 border-brand-orange bg-orange-50 p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-navy/50">Enter on connector</p>
                <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-navy">{pairingCode}</p>
                {pairingExpires && (
                  <p className="mt-2 text-xs text-navy/50">
                    Expires {new Date(pairingExpires).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={String(d.id)} className="flex items-center justify-between rounded-xl border bg-white p-3 text-sm">
                  <div>
                    <p className="font-semibold">{String(d.name)}</p>
                    <p className="text-xs text-navy/50">
                      {d.online ? (
                        <span className="text-emerald-600">
                          <CheckCircle2 className="mr-1 inline h-3 w-3" />
                          Online
                        </span>
                      ) : (
                        "Offline / waiting"
                      )}
                      {d.pairingCode ? ` · code ${String(d.pairingCode)}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={async () => {
                      await api.shopDeleteDevice(token, String(d.id));
                      await refresh(token);
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-navy/40">
              Dashboard-only printing works from phone/PC browser with no agent. Fully automatic physical print needs one paired device online.
            </p>
            <Link to="/" className="block text-center text-xs text-navy/40">
              ← Fusion site
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
