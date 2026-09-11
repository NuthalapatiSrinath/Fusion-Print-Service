import type {
  Addon,
  BusinessInfo,
  Package,
  PrintService,
  Product,
  Service,
  ShopPublic,
  SiteSettings,
} from "../lib/models";

const PRODUCT_IMAGES: Record<
  string,
  { image: string; images: string[]; featured?: boolean; storePrice?: number }
> = {
  "round-neck": {
    image: "/images/product-tshirt-black.jpg",
    images: ["/images/product-tshirt-black.jpg", "/images/product-tshirt-white.jpg"],
    featured: true,
    storePrice: 299,
  },
  polo: {
    image: "/images/product-polo-navy.jpg",
    images: ["/images/product-polo-navy.jpg", "/images/product-polo-orange.jpg"],
    featured: true,
    storePrice: 449,
  },
  cap: {
    image: "/images/product-cap-black.jpg",
    images: ["/images/product-cap-black.jpg", "/images/product-cap-navy.jpg"],
    featured: true,
    storePrice: 249,
  },
  mug: {
    image: "/images/product-mug-white.jpg",
    images: ["/images/product-mug-white.jpg"],
    featured: true,
    storePrice: 199,
  },
  bag: {
    image: "/images/product-bag-white.jpg",
    images: ["/images/product-bag-white.jpg"],
    storePrice: 99,
  },
  "business-card": {
    image: "/images/product-business-cards.jpg",
    images: ["/images/product-business-cards.jpg"],
    storePrice: 149,
  },
};

function withImages(p: Omit<Product, "image" | "images" | "featured" | "storePrice" | "active">): Product {
  const meta = PRODUCT_IMAGES[p.id] ?? {
    image: "/images/shop-tshirt-black.png",
    images: ["/images/shop-tshirt-black.png"],
  };
  return {
    ...p,
    image: meta.image,
    images: meta.images,
    featured: meta.featured ?? false,
    storePrice: meta.storePrice ?? p.recommendedPrice,
    active: true,
  };
}

const baseProducts: Omit<Product, "image" | "images" | "featured" | "storePrice" | "active">[] = [
  {
    id: "round-neck",
    name: "Round Neck T-Shirt",
    slug: "round-neck-tshirt",
    category: "apparel",
    material: "180 GSM Cotton",
    description: "Soft cotton round neck — ideal for everyday wear and events.",
    individual: {
      singleSide: { min: 299, max: 349 },
      frontBack: { min: 399, max: 499 },
      plain: 199,
      namePrint: 249,
      photoPrint: 299,
    },
    bulk: [
      { quantity: "10-25", min: 250, max: 280 },
      { quantity: "26-50", min: 230, max: 260 },
      { quantity: "51-100", min: 210, max: 240 },
      { quantity: "100+", min: null, max: null, quoteBased: true },
    ],
    recommendedPrice: 299,
    mockupType: "tshirt",
    colors: ["#FFFFFF", "#1A2A47", "#000000", "#F37021", "#E11D48", "#2563EB"],
    sides: ["front", "back"],
  },
  {
    id: "polo",
    name: "Polo T-Shirt",
    slug: "polo-tshirt",
    category: "apparel",
    material: "220 GSM Cotton",
    description: "Premium polo for corporate branding and uniforms.",
    individual: {
      singleSide: { min: 399, max: 499 },
      frontBack: { min: 499, max: 599 },
      plain: 299,
      logoPrint: 399,
    },
    bulk: [
      { quantity: "10-25", min: 350, max: 400 },
      { quantity: "26-50", min: 330, max: 380 },
      { quantity: "51-100", min: 300, max: 350 },
      { quantity: "100+", min: null, max: null, quoteBased: true },
    ],
    recommendedPrice: 449,
    mockupType: "polo",
    colors: ["#FFFFFF", "#1A2A47", "#000000", "#166534", "#F37021"],
    sides: ["front", "back"],
  },
  {
    id: "cap",
    name: "Cap",
    slug: "cotton-cap",
    category: "apparel",
    material: "Cotton Cap",
    description: "Custom printed cotton caps for teams and promotions.",
    individual: {
      singleSide: { min: 249, max: 299 },
      frontBack: { min: 299, max: 349 },
      plain: 149,
      printed: 249,
      logoPrint: 299,
    },
    bulk: [
      { quantity: "10-25", min: 200, max: 220 },
      { quantity: "26-50", min: 180, max: 200 },
      { quantity: "51-100", min: 170, max: 190 },
      { quantity: "100+", min: null, max: null, quoteBased: true },
    ],
    recommendedPrice: 249,
    mockupType: "cap",
    colors: ["#FFFFFF", "#1A2A47", "#000000", "#F37021", "#DC2626"],
    sides: ["front"],
  },
  {
    id: "mug",
    name: "Ceramic Mug",
    slug: "ceramic-mug",
    category: "mockup",
    description: "White ceramic mug mockup for custom designs.",
    individual: {},
    bulk: [],
    recommendedPrice: 199,
    mockupType: "mug",
    colors: ["#FFFFFF"],
    sides: ["front"],
  },
  {
    id: "bag",
    name: "Paper Shopping Bag",
    slug: "shopping-bag",
    category: "mockup",
    description: "Branded paper bag mockup for retail and events.",
    individual: {},
    bulk: [],
    recommendedPrice: 99,
    mockupType: "bag",
    colors: ["#FFFFFF", "#1A2A47"],
    sides: ["front"],
  },
  {
    id: "business-card",
    name: "Business Card",
    slug: "business-card",
    category: "mockup",
    description: "Professional business card mockup.",
    individual: {},
    bulk: [],
    recommendedPrice: 149,
    mockupType: "business-card",
    colors: ["#1A2A47", "#FFFFFF"],
    sides: ["front", "back"],
  },
];

export const DEFAULT_PRODUCTS: Product[] = baseProducts.map(withImages);

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "tshirt",
    name: "T-Shirt Printing",
    icon: "shirt",
    description: "Custom apparel printing for events, brands, and personal style.",
  },
  {
    id: "printing",
    name: "Color Printing & Xerox",
    icon: "printer",
    description: "High-quality color and B&W prints for documents and marketing.",
  },
  {
    id: "lamination",
    name: "Lamination & Binding",
    icon: "layers",
    description: "Protect and finish documents with professional lamination and binding.",
  },
  {
    id: "passport-photo",
    name: "Passport Photo & Editing",
    icon: "camera",
    description: "Compliant passport photos with on-the-spot editing.",
  },
  {
    id: "pan",
    name: "PAN Card Services",
    icon: "id-card",
    description: "PAN application support and related document services.",
  },
  {
    id: "passport-appt",
    name: "Passport Appointment",
    icon: "passport",
    description: "Assistance booking passport appointments and form help.",
  },
  {
    id: "exam",
    name: "Exam & Online Applications",
    icon: "laptop",
    description: "Exam forms, online applications, and submission support.",
  },
  {
    id: "scanning",
    name: "Scanning & Upload",
    icon: "scan",
    description: "Document scanning, digitizing, and upload assistance.",
  },
  {
    id: "id-card",
    name: "ID Card Printing",
    icon: "badge",
    description: "Custom ID cards for schools, offices, and events.",
  },
  {
    id: "design",
    name: "Designing Services",
    icon: "pen-tool",
    description: "Logo, flyer, and brand design from concept to print-ready.",
  },
  {
    id: "stationery",
    name: "Spiral Binding & Stationery",
    icon: "book",
    description: "Spiral binding, notebooks, and everyday stationery.",
  },
  {
    id: "flex",
    name: "Flex & Banner Printing",
    icon: "banner",
    description: "Large-format flex, banners, and outdoor signage.",
  },
];

export const DEFAULT_ADDONS: Addon[] = [
  {
    id: "glow",
    name: "Glow in the Dark Print",
    priceMin: 100,
    priceMax: 100,
    description: "Glow-in-the-dark ink finish",
  },
  {
    id: "metallic",
    name: "Metallic / Gold Finish",
    priceMin: 100,
    priceMax: 100,
    description: "Metallic or gold print finish",
  },
  {
    id: "puff",
    name: "Puff (3D) Print",
    priceMin: 100,
    priceMax: 150,
    description: "Raised 3D puff print effect",
  },
  {
    id: "embroidery",
    name: "Embroidery (Logo / Name)",
    priceMin: 100,
    priceMax: 200,
    description: "Embroidered logo or name",
  },
  {
    id: "name-number",
    name: "Individual Name & Number",
    priceMin: 50,
    priceMax: 100,
    description: "Per-piece name and number personalization",
  },
];

export const DEFAULT_PACKAGES: Package[] = [
  {
    id: "birthday",
    name: "Birthday Package",
    description: "Perfect for birthday parties and celebrations",
    price: 2499,
    quoteBased: false,
    items: "10 Printed T-Shirts",
  },
  {
    id: "school",
    name: "School Package",
    description: "Uniform printing for schools and colleges",
    price: null,
    quoteBased: true,
    items: "50 Uniform T-Shirts — Custom Quotation",
  },
  {
    id: "corporate",
    name: "Corporate Package",
    description: "Company branding for teams and events",
    price: null,
    quoteBased: true,
    items: "100 Polo T-Shirts with Company Logo — Custom Quotation",
  },
];

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: "FUSION PRINT & SERVICES",
  slogans: [
    "Your One-Stop Print & Digital Hub",
    "Print. Design. Deliver.",
    "PRINTING TODAY, SOLUTIONS FOR TOMORROW",
    "PRINT YOUR IDEAS, WEAR YOUR STYLE.",
  ],
  proprietor: "AARE BHAGAVAN",
  phones: {
    call: "9494197969",
    callDisplay: "94941 97969",
    whatsapp: "7995572200",
    whatsappDisplay: "79955 72200",
  },
  email: "fusionprintservices@gmail.com",
  address: {
    village: "Macherla",
    mandal: "Armoor",
    district: "Nizamabad",
    pincode: "503224",
    full: "Village: Macherla, Mandal: Armoor, District: Nizamabad, Pincode: 503224",
  },
  footerTaglines: [
    "Everything You Need, Under One Roof.",
    "FAST SERVICE | BEST QUALITY | REASONABLE PRICES",
  ],
  colors: {
    navy: "#1A2A47",
    orange: "#F37021",
    cyan: "#00AEEF",
    magenta: "#EC008C",
    yellow: "#FFF200",
    black: "#000000",
  },
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTagline: "Your One-Stop Print & Digital Hub",
  heroHeadline: "FUSION",
  heroSubline:
    "Print. Design. Deliver. Custom apparel, QR print, and digital services in Macherla, Armoor.",
  phone: DEFAULT_BUSINESS_INFO.phones.call,
  whatsapp: DEFAULT_BUSINESS_INFO.phones.whatsapp,
  email: DEFAULT_BUSINESS_INFO.email,
  address: DEFAULT_BUSINESS_INFO.address.full,
  featuredProductIds: ["round-neck", "polo", "cap", "mug"],
};

export const DEFAULT_PRINT_SERVICES: PrintService[] = [
  {
    id: "document",
    name: "Document Print",
    slug: "document",
    description: "PDF / Photo — A4 to Legal",
    icon: "file-text",
    basePriceBw: 5,
    basePriceColor: 10,
  },
  {
    id: "resume",
    name: "Resume Maker",
    slug: "resume",
    description: "Professional designs, print instantly",
    icon: "pen-tool",
    basePriceBw: 5,
    basePriceColor: 10,
  },
  {
    id: "photo-4x6",
    name: "4x6 Photo Print",
    slug: "photo-4x6",
    description: "Passport photos — 4, 6, 8 or 10 per sheet",
    icon: "camera",
    basePriceBw: 8,
    basePriceColor: 15,
  },
  {
    id: "big-size",
    name: "Big Size Print",
    slug: "big-size",
    description: "A3 / A2 / A1 large paper",
    icon: "maximize",
    basePriceBw: 20,
    basePriceColor: 40,
  },
  {
    id: "mini",
    name: "Mini Print",
    slug: "mini",
    description: "2–16 pages on one sheet",
    icon: "grid",
    basePriceBw: 5,
    basePriceColor: 10,
  },
  {
    id: "smart-scanner",
    name: "Smart Scanner",
    slug: "smart-scanner",
    description: "Photo of a document — clean scan-like page",
    icon: "scan",
    basePriceBw: 5,
    basePriceColor: 10,
  },
];

export const DEFAULT_SHOP_BY_CODE: Record<string, ShopPublic> = {
  fusion: {
    id: "default-fusion",
    name: "Fusion Print & Services",
    code: "fusion",
    address: DEFAULT_BUSINESS_INFO.address.full,
    phone: DEFAULT_BUSINESS_INFO.phones.call,
    whatsapp: "917995572200",
    pricing: { bwPerPage: 5, colorPerPage: 10, duplexSurcharge: 0 },
    qrPath: "/print/fusion",
    requiresPin: true,
  },
};

export function findDefaultProduct(idOrSlug: string): Product | undefined {
  const key = idOrSlug.trim().toLowerCase();
  return DEFAULT_PRODUCTS.find(
    (p) => p.id === key || p.slug === key || p.slug.replace(/-/g, "") === key.replace(/-/g, "")
  );
}

export function featuredDefaultProducts(settings?: SiteSettings | null): Product[] {
  const ids = settings?.featuredProductIds?.length
    ? settings.featuredProductIds
    : DEFAULT_SITE_SETTINGS.featuredProductIds;
  const picked = ids
    .map((id) => DEFAULT_PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  if (picked.length > 0) return picked;
  return DEFAULT_PRODUCTS.filter((p) => p.featured).slice(0, 4);
}
