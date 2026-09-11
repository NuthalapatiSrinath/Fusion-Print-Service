import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  LogOut,
  LayoutDashboard,
  Store,
  Printer,
  Package,
  Settings,
  ShoppingBag,
  QrCode,
} from "lucide-react";
import { api, mediaUrl } from "../lib/api";

const TOKEN_KEY = "fps_admin_token";

type Tab =
  | "overview"
  | "shops"
  | "jobs"
  | "products"
  | "services"
  | "orders"
  | "settings";

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLabel, setUserLabel] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [shops, setShops] = useState<Record<string, unknown>[]>([]);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [printServices, setPrintServices] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [qrPreview, setQrPreview] = useState<{ url: string; dataUrl: string; shopCode?: string } | null>(null);
  const [shopForm, setShopForm] = useState({ name: "", code: "", address: "", phone: "" });
  const [keeperForm, setKeeperForm] = useState({ shopId: "", username: "", password: "" });
  const [productForm, setProductForm] = useState({
    name: "",
    id: "",
    storePrice: "",
    mockupType: "tshirt",
    description: "",
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [jobFilter, setJobFilter] = useState({ shopCode: "", status: "" });

  const refresh = async (t: string, which: Tab = tab) => {
    try {
      if (which === "overview") {
        const s = await api.adminStats(t);
        setStats(s.stats);
      }
      if (which === "shops" || which === "overview") {
        const s = await api.adminShops(t);
        setShops(s.shops);
      }
      if (which === "jobs") {
        const q = new URLSearchParams();
        if (jobFilter.shopCode) q.set("shopCode", jobFilter.shopCode);
        if (jobFilter.status) q.set("status", jobFilter.status);
        const j = await api.adminPrintJobs(t, q.toString() ? `?${q}` : "");
        setJobs(j.jobs);
      }
      if (which === "products") {
        const p = await api.adminProducts(t);
        setProducts(p.products as unknown as Record<string, unknown>[]);
      }
      if (which === "services") {
        const ps = await api.adminPrintServices(t);
        setPrintServices(ps.services as unknown as Record<string, unknown>[]);
      }
      if (which === "orders") {
        const o = await api.adminOrders(t);
        setOrders(o.orders as Record<string, unknown>[]);
      }
      if (which === "settings") {
        const s = await api.adminSettings(t);
        setSettings(s.settings as unknown as Record<string, unknown>);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const me = await api.me(token);
        setUserLabel(me.user.username);
        await refresh(token, tab);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    })();
  }, [token, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(username, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUserLabel(res.user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-navy/10 bg-white p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 text-navy">
            <img src="/logo-fp.png" alt="" className="h-10 w-10" />
            <div>
              <h1 className="font-display text-lg font-bold">Fusion Admin</h1>
              <p className="text-xs text-navy/50">Authorized personnel only</p>
            </div>
          </div>
          <input
            className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center gap-2 rounded-full bg-navy py-2.5 font-semibold text-white hover:bg-brand-orange disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
          <Link to="/" className="block text-center text-xs text-navy/40">
            ← Back
          </Link>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Store }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "shops", label: "Shops + QR", icon: QrCode },
    { id: "jobs", label: "Print Jobs", icon: Printer },
    { id: "products", label: "Products", icon: Package },
    { id: "services", label: "Print Services", icon: Store },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-navy px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <img src="/logo-fp.png" alt="" className="h-9 w-9 rounded bg-white/10 p-0.5" />
          <div>
            <p className="font-display font-bold">Fusion Admin</p>
            <p className="text-xs text-white/50">{userLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${
                tab === t.id ? "bg-navy text-white" : "text-navy/70 hover:bg-white"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          {tab === "overview" && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Overview</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {Object.entries(stats).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-navy/40">{k}</p>
                    <p className="font-display text-2xl font-bold text-navy">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "shops" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-navy">Shops & QR</h2>
              <p className="text-sm text-navy/50">
                Create shop → auto code → QR URL only (<code className="text-xs">/print/&#123;code&#125;</code>). No customer PIN.
                Then create a shopkeeper login for <Link to="/shop-login" className="underline">/shop-login</Link>.
              </p>
              <form
                className="grid gap-2 rounded-xl border border-dashed border-navy/20 p-4 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await api.adminCreateShop(token, {
                    name: shopForm.name,
                    code: shopForm.code || undefined,
                    address: shopForm.address,
                    phone: shopForm.phone,
                  });
                  setShopForm({ name: "", code: "", address: "", phone: "" });
                  await refresh(token, "shops");
                }}
              >
                <input
                  required
                  placeholder="Shop name"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                />
                <input
                  placeholder="Code (optional — auto SHOP_XXXXXXXX)"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={shopForm.code}
                  onChange={(e) => setShopForm({ ...shopForm, code: e.target.value })}
                />
                <input
                  placeholder="Phone"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                />
                <input
                  placeholder="Address"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                />
                <button type="submit" className="rounded-full bg-brand-orange py-2 text-sm font-semibold text-white md:col-span-2">
                  Create shop + QR path
                </button>
              </form>

              <form
                className="grid gap-2 rounded-xl border border-navy/10 bg-slate-50 p-4 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!keeperForm.shopId) return;
                  await api.adminCreateShopkeeper(token, keeperForm.shopId, {
                    username: keeperForm.username,
                    password: keeperForm.password,
                  });
                  setKeeperForm({ shopId: keeperForm.shopId, username: "", password: "" });
                  await refresh(token, "shops");
                }}
              >
                <p className="md:col-span-2 text-sm font-semibold text-navy">Create shopkeeper login</p>
                <select
                  required
                  className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
                  value={keeperForm.shopId}
                  onChange={(e) => setKeeperForm({ ...keeperForm, shopId: e.target.value })}
                >
                  <option value="">Select shop…</option>
                  {shops.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {String(s.name)} (/{String(s.code)})
                    </option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Username"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={keeperForm.username}
                  onChange={(e) => setKeeperForm({ ...keeperForm, username: e.target.value })}
                />
                <input
                  required
                  type="password"
                  placeholder="Password (min 6)"
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={keeperForm.password}
                  onChange={(e) => setKeeperForm({ ...keeperForm, password: e.target.value })}
                />
                <button type="submit" className="rounded-full bg-navy py-2 text-sm font-semibold text-white md:col-span-2">
                  Create shopkeeper
                </button>
              </form>

              <ul className="space-y-4">
                {shops.map((s) => (
                  <li key={String(s.id)} className="rounded-xl border border-navy/10 p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy">
                          {String(s.name)}{" "}
                          <span className="font-mono text-xs text-brand-orange">/{String(s.code)}</span>
                        </p>
                        <p className="text-xs text-navy/50">QR path: {String(s.qrPath)} · customers: no PIN</p>
                        <p className="mt-1 text-xs text-navy/50">
                          Shopkeepers:{" "}
                          {((s.shopkeepers as { username: string; id: string }[]) || [])
                            .map((u) => u.username)
                            .join(", ") || "none yet"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-navy px-3 py-1 text-xs text-white"
                          onClick={async () => {
                            const qr = await api.adminShopQr(token, String(s.id));
                            setQrPreview(qr);
                          }}
                        >
                          Download QR
                        </button>
                        <a
                          href={`/print/${String(s.code)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border px-3 py-1 text-xs"
                        >
                          Open print page
                        </a>
                        <button
                          type="button"
                          className="rounded-full border px-3 py-1 text-xs text-red-500"
                          onClick={async () => {
                            if (!confirm(`Delete shop ${s.code}?`)) return;
                            await api.adminDeleteShop(token, String(s.id));
                            await refresh(token, "shops");
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {qrPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="rounded-2xl bg-white p-6 text-center">
                    <img src={qrPreview.dataUrl} alt="QR" className="mx-auto h-64 w-64" />
                    <p className="mt-2 text-xs text-navy/60">{qrPreview.url}</p>
                    <a
                      href={qrPreview.dataUrl}
                      download={`qr-${qrPreview.shopCode || "shop"}.png`}
                      className="mt-3 inline-block rounded-full bg-navy px-4 py-2 text-sm text-white"
                    >
                      Download PNG
                    </a>
                    <button
                      type="button"
                      className="ml-2 text-sm text-navy/50"
                      onClick={() => setQrPreview(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "jobs" && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Print jobs</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  placeholder="Filter shop code"
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={jobFilter.shopCode}
                  onChange={(e) => setJobFilter({ ...jobFilter, shopCode: e.target.value })}
                />
                <select
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={jobFilter.status}
                  onChange={(e) => setJobFilter({ ...jobFilter, status: e.target.value })}
                >
                  <option value="">All status</option>
                  {["queued", "printing", "done", "failed", "cancelled"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-full bg-navy px-3 py-1.5 text-xs text-white"
                  onClick={() => void refresh(token, "jobs")}
                >
                  Apply
                </button>
              </div>
              <ul className="mt-4 space-y-3">
                {jobs.map((j) => (
                  <li key={String(j.id)} className="rounded-xl border border-navy/10 p-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {String(j.serviceName || j.serviceType)} · /{String(j.shopCode)}
                        </p>
                        <p className="text-xs text-navy/50">
                          {String(j.status)} · ₹{String(j.totalPrice)} · {String(j.id).slice(-8)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {((j.files as { url: string; originalName: string }[]) || []).map((f, i) => (
                            <a
                              key={i}
                              href={mediaUrl(f.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-orange underline"
                            >
                              {f.originalName || "file"}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {["printing", "done", "failed"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            className="rounded-full border px-2 py-1 text-[10px]"
                            onClick={async () => {
                              await api.adminUpdateJob(token, String(j.id), st);
                              await refresh(token, "jobs");
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-navy">Products</h2>
              <form
                className="grid gap-2 rounded-xl border border-dashed p-4 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData();
                  form.append("name", productForm.name);
                  form.append("id", productForm.id || productForm.name.toLowerCase().replace(/\s+/g, "-"));
                  form.append("slug", productForm.id || productForm.name.toLowerCase().replace(/\s+/g, "-"));
                  form.append("storePrice", productForm.storePrice);
                  form.append("recommendedPrice", productForm.storePrice);
                  form.append("mockupType", productForm.mockupType);
                  form.append("description", productForm.description);
                  form.append("category", "apparel");
                  form.append("featured", "true");
                  form.append(
                    "colors",
                    JSON.stringify(["#FFFFFF", "#1A2A47", "#000000", "#F37021"])
                  );
                  form.append("sides", JSON.stringify(["front", "back"]));
                  if (productImage) form.append("images", productImage);
                  await api.adminSaveProduct(token, form);
                  setProductForm({ name: "", id: "", storePrice: "", mockupType: "tshirt", description: "" });
                  setProductImage(null);
                  await refresh(token, "products");
                }}
              >
                <input required placeholder="Name" className="rounded-lg border px-3 py-2 text-sm" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                <input placeholder="ID / slug" className="rounded-lg border px-3 py-2 text-sm" value={productForm.id} onChange={(e) => setProductForm({ ...productForm, id: e.target.value })} />
                <input required placeholder="Store price ₹" className="rounded-lg border px-3 py-2 text-sm" value={productForm.storePrice} onChange={(e) => setProductForm({ ...productForm, storePrice: e.target.value })} />
                <select className="rounded-lg border px-3 py-2 text-sm" value={productForm.mockupType} onChange={(e) => setProductForm({ ...productForm, mockupType: e.target.value })}>
                  {["tshirt", "polo", "cap", "mug", "bag", "business-card"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input type="file" accept="image/*" className="text-sm md:col-span-2" onChange={(e) => setProductImage(e.target.files?.[0] || null)} />
                <textarea placeholder="Description" className="rounded-lg border px-3 py-2 text-sm md:col-span-2" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                <button type="submit" className="rounded-full bg-brand-orange py-2 text-sm font-semibold text-white md:col-span-2">
                  Add / upsert product
                </button>
              </form>
              <ul className="space-y-2">
                {products.map((p) => (
                  <li key={String(p.id)} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                    {p.image ? (
                      <img src={mediaUrl(String(p.image))} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-slate-100" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{String(p.name)}</p>
                      <p className="text-xs text-navy/50">
                        ₹{String(p.storePrice || p.recommendedPrice)} · {String(p.mockupType)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={async () => {
                        await api.adminDeleteProduct(token, String(p.id));
                        await refresh(token, "products");
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "services" && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">QR Print services (prices)</h2>
              <ul className="mt-4 space-y-2">
                {printServices.map((s) => (
                  <li key={String(s.id)} className="rounded-xl border p-3 text-sm">
                    <form
                      className="flex flex-wrap items-end gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        await api.adminSavePrintService(token, {
                          id: s.id,
                          name: fd.get("name"),
                          slug: s.slug || s.id,
                          description: fd.get("description"),
                          basePriceBw: Number(fd.get("bw")),
                          basePriceColor: Number(fd.get("color")),
                          active: true,
                          sortOrder: s.sortOrder || 0,
                        });
                        await refresh(token, "services");
                      }}
                    >
                      <input name="name" defaultValue={String(s.name)} className="rounded border px-2 py-1" />
                      <input name="description" defaultValue={String(s.description || "")} className="min-w-[160px] flex-1 rounded border px-2 py-1" />
                      <label className="text-xs">
                        B&W
                        <input name="bw" type="number" defaultValue={Number(s.basePriceBw)} className="ml-1 w-16 rounded border px-1 py-1" />
                      </label>
                      <label className="text-xs">
                        Color
                        <input name="color" type="number" defaultValue={Number(s.basePriceColor)} className="ml-1 w-16 rounded border px-1 py-1" />
                      </label>
                      <button type="submit" className="rounded-full bg-navy px-3 py-1 text-xs text-white">
                        Save
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Orders / inquiries</h2>
              <ul className="mt-4 space-y-2">
                {orders.map((o) => (
                  <li key={String(o.id)} className="rounded-xl border p-3 text-sm">
                    <p className="font-semibold">
                      {String(o.customerName)} · {String(o.phone)}
                    </p>
                    <p className="text-xs text-navy/50">
                      {String(o.status)} · ₹{String(o.totalEstimate)} · {String(o.type)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "settings" && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Site settings</h2>
              <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await api.adminSaveSettings(token, settings);
                  alert("Saved");
                }}
              >
                {(["heroTagline", "heroHeadline", "heroSubline", "phone", "whatsapp", "email", "address"] as const).map(
                  (key) => (
                    <label key={key} className="block text-xs font-semibold uppercase text-navy/50">
                      {key}
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-normal normal-case"
                        value={String(settings[key] ?? "")}
                        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      />
                    </label>
                  )
                )}
                <button type="submit" className="rounded-full bg-brand-orange px-6 py-2 font-semibold text-white">
                  Save settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
