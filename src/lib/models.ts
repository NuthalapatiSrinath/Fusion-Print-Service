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
