const API_BASE = import.meta.env.VITE_API_URL || "";

export type PriceRange = { min: number; max: number | null };
export type BulkTier = {
  quantity: string;
  min: number | null;
  max: number | null;
  quoteBased?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: "apparel" | "mockup";
  material?: string;
  description: string;
  individual: {
    singleSide?: PriceRange;
    frontBack?: PriceRange;
    plain?: number;
    namePrint?: number;
    photoPrint?: number;
    logoPrint?: number;
    printed?: number;
  };
  bulk: BulkTier[];
  recommendedPrice?: number;
  storePrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  active?: boolean;
  featured?: boolean;
  mockupType: "tshirt" | "polo" | "cap" | "mug" | "bag" | "business-card";
  colors: string[];
  sides: ("front" | "back")[];
};

export type Addon = {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  description: string;
};

export type Package = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  quoteBased: boolean;
  items: string;
};

export type Service = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type BusinessInfo = {
  name: string;
  slogans: string[];
  proprietor: string;
  phones: {
    call: string;
    callDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
  };
  email: string;
  address: {
    village: string;
    mandal: string;
    district: string;
    pincode: string;
    full: string;
  };
  footerTaglines: string[];
  colors: Record<string, string>;
};

export type PrintService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePriceBw: number;
  basePriceColor: number;
};

export type ShopPublic = {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  pricing?: { bwPerPage?: number; colorPerPage?: number; duplexSurcharge?: number };
  qrPath: string;
  requiresPin?: boolean;
};

export type SiteSettings = {
  heroTagline: string;
  heroHeadline: string;
  heroSubline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  featuredProductIds: string[];
};

export type ShopPrinter = {
  id: string;
  shopId: string;
  name: string;
  capabilities: ("bw" | "color")[];
  priority: number;
  status: "available" | "busy" | "offline";
  agentDeviceId?: string | null;
};

export type PrintJobRow = {
  id: string;
  shopId: string;
  shopCode: string;
  assignedPrinterId?: string | null;
  serviceType: string;
  serviceName?: string;
  files: { url: string; originalName: string; filename: string }[];
  options: { colorMode: "bw" | "color"; duplex: boolean; copies: number; pageCount?: number };
  status: string;
  totalPrice: number;
  paymentStatus?: string;
  paymentMethod?: string;
  customerNote?: string;
  customerPhone?: string;
  createdAt?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  products: (featured?: boolean) =>
    request<{ products: Product[]; addons: Addon[]; packages: Package[] }>(
      `/api/products${featured ? "?featured=1" : ""}`
    ),
  product: (id: string) => request<Product>(`/api/products/${id}`),
  services: () => request<{ services: Service[] }>("/api/products/services"),
  business: () => request<BusinessInfo>("/api/products/business"),
  settings: () => request<{ settings: SiteSettings }>("/api/orders/settings/public"),
  quote: (body: {
    productId: string;
    quantity: number;
    side: string;
    addonIds: string[];
  }) => request("/api/products/quote", { method: "POST", body: JSON.stringify(body) }),
  inquiry: (body: Record<string, unknown>) =>
    request("/api/inquiries", { method: "POST", body: JSON.stringify(body) }),
  placeOrder: (body: Record<string, unknown>) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  uploadDesign: async (file: File) => {
    const form = new FormData();
    form.append("design", file);
    return request<{ url: string; filename: string }>("/api/uploads", {
      method: "POST",
      body: form,
    });
  },
  shopByCode: (code: string) => request<{ shop: ShopPublic }>(`/api/shops/code/${code}`),
  printServices: () => request<{ services: PrintService[] }>("/api/print-jobs/services"),
  submitPrintJob: async (form: FormData) =>
    request<{ success: boolean; job: { id: string; totalPrice: number } }>("/api/print-jobs/submit", {
      method: "POST",
      body: form,
    }),
  login: (username: string, password: string) =>
    request<{ token: string; user: { username: string; role: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: (token: string) =>
    request<{ user: { username: string; role: string } }>("/api/auth/me", {
      headers: authHeaders(token),
    }),
  inquiries: (token: string) =>
    request<{ inquiries: unknown[] }>("/api/inquiries", {
      headers: authHeaders(token),
    }),
  adminStats: (token: string) =>
    request<{ stats: Record<string, number> }>("/api/admin/stats", {
      headers: authHeaders(token),
    }),
  adminProducts: (token: string) =>
    request<{ products: Product[] }>("/api/admin/products", { headers: authHeaders(token) }),
  adminSaveProduct: (token: string, form: FormData, id?: string) =>
    request(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PATCH" : "POST",
      headers: authHeaders(token),
      body: form,
    }),
  adminDeleteProduct: (token: string, id: string) =>
    request(`/api/admin/products/${id}`, { method: "DELETE", headers: authHeaders(token) }),
  adminShops: (token: string) =>
    request<{ shops: Record<string, unknown>[] }>("/api/shops", { headers: authHeaders(token) }),
  adminCreateShop: (token: string, body: Record<string, unknown>) =>
    request("/api/shops", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminUpdateShop: (token: string, id: string, body: Record<string, unknown>) =>
    request(`/api/shops/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminShopQr: (token: string, id: string) =>
    request<{ url: string; dataUrl: string; shopCode: string }>(`/api/shops/${id}/qr?dataUrl=1`, {
      headers: authHeaders(token),
    }),
  adminCreateShopkeeper: (token: string, shopId: string, body: { username: string; password: string }) =>
    request(`/api/shops/${shopId}/shopkeepers`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminDeleteShopkeeper: (token: string, shopId: string, userId: string) =>
    request(`/api/shops/${shopId}/shopkeepers/${userId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
  adminDeleteShop: (token: string, id: string) =>
    request(`/api/shops/${id}`, { method: "DELETE", headers: authHeaders(token) }),
  adminPrintJobs: (token: string, q?: string) =>
    request<{ jobs: Record<string, unknown>[] }>(`/api/print-jobs${q || ""}`, {
      headers: authHeaders(token),
    }),
  adminUpdateJob: (token: string, id: string, status: string) =>
    request(`/api/print-jobs/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    }),
  adminPrintServices: (token: string) =>
    request<{ services: PrintService[] }>("/api/admin/print-services", {
      headers: authHeaders(token),
    }),
  adminSavePrintService: (token: string, body: Record<string, unknown>) =>
    request("/api/admin/print-services", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminOrders: (token: string) =>
    request<{ orders: unknown[] }>("/api/admin/orders", { headers: authHeaders(token) }),
  adminSettings: (token: string) =>
    request<{ settings: SiteSettings }>(`/api/admin/settings`, { headers: authHeaders(token) }),
  adminSaveSettings: (token: string, body: Record<string, unknown>) =>
    request("/api/admin/settings", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminSaveAddon: (token: string, body: Record<string, unknown>) =>
    request("/api/admin/addons", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminSavePackage: (token: string, body: Record<string, unknown>) =>
    request("/api/admin/packages", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  adminSaveService: (token: string, body: Record<string, unknown>) =>
    request("/api/admin/services", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),

  /* Shopkeeper */
  shopLogin: (username: string, password: string) =>
    request<{
      token: string;
      user: { id: string; username: string; role: string; shopId: string };
      shop: ShopPublic;
    }>("/api/shop/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  shopMe: (token: string) =>
    request<{ user: Record<string, unknown>; shop: ShopPublic }>("/api/shop/me", {
      headers: authHeaders(token),
    }),
  shopJobs: (token: string, q?: string) =>
    request<{ jobs: PrintJobRow[] }>(`/api/shop/jobs${q || ""}`, { headers: authHeaders(token) }),
  shopUpdateJob: (token: string, id: string, body: { status?: string; paymentStatus?: string }) =>
    request(`/api/shop/jobs/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(typeof body === "string" ? { status: body } : body),
    }),
  shopPrinters: (token: string) =>
    request<{ printers: ShopPrinter[] }>("/api/shop/printers", { headers: authHeaders(token) }),
  shopCreatePrinter: (token: string, body: Record<string, unknown>) =>
    request<{ printer: ShopPrinter }>("/api/shop/printers", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  shopUpdatePrinter: (token: string, id: string, body: Record<string, unknown>) =>
    request<{ printer: ShopPrinter }>(`/api/shop/printers/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  shopDeletePrinter: (token: string, id: string) =>
    request(`/api/shop/printers/${id}`, { method: "DELETE", headers: authHeaders(token) }),
  shopDevices: (token: string) =>
    request<{ devices: Record<string, unknown>[] }>("/api/shop/devices", {
      headers: authHeaders(token),
    }),
  shopCreatePairing: (token: string, name?: string) =>
    request<{ pairingCode: string; expiresAt: string; hint: string }>("/api/shop/pair", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: name || "Print connector" }),
    }),
  shopDeleteDevice: (token: string, id: string) =>
    request(`/api/shop/devices/${id}`, { method: "DELETE", headers: authHeaders(token) }),
};

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  return `${API_BASE}${path}`;
}
