import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { Services } from "../components/Services";
import { Customize } from "../components/Customize";
import { Pricing } from "../components/Pricing";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import {
  api,
  mediaUrl,
  type Addon,
  type BusinessInfo,
  type Package,
  type Product,
  type Service,
  type SiteSettings,
} from "../lib/api";
import { fadeUp } from "../lib/motion";

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [prod, svc, biz, set] = await Promise.all([
          api.products(),
          api.services(),
          api.business(),
          api.settings(),
        ]);
        setProducts(prod.products);
        setAddons(prod.addons);
        setPackages(prod.packages);
        setServices(svc.services);
        setBusiness(biz);
        setSettings(set.settings);
      } catch (e) {
        console.warn("API unavailable", e);
      }
    })();
  }, []);

  const featured =
    products.filter((p) => p.featured).length > 0
      ? products.filter((p) => p.featured)
      : products.slice(0, 4);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Navbar />
      <main>
        <Hero settings={settings} />

        <WhyChooseUs />

        {/* Trust strip */}
        <section className="border-y border-navy/5 bg-white py-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-center text-sm font-medium text-navy/70 md:justify-between">
            <span>⚡ Fast turnaround</span>
            <span>🎨 Custom apparel &amp; live mockup</span>
            <span>📱 Multi-shop QR print</span>
            <span>📍 Macherla · Armoor · Nizamabad</span>
          </div>
        </section>

        {/* Featured products */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-8 flex items-end justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
                  Featured
                </p>
                <h2 className="font-display text-3xl font-bold text-navy">Shop bestsellers</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-brand-orange hover:underline">
                View all →
              </Link>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {(featured.length > 0
                ? featured.map((p) => ({
                    key: p.id,
                    to: `/shop/${p.slug || p.id}`,
                    name: p.name,
                    price: p.storePrice || p.recommendedPrice,
                    image: mediaUrl(p.image) || "/images/shop-tshirt-black.png",
                  }))
                : [
                    {
                      key: "tee",
                      to: "/shop",
                      name: "Navy Fusion Tee",
                      price: 499,
                      image: "/images/hero-product-tshirt-navy.png",
                    },
                    {
                      key: "polo",
                      to: "/shop",
                      name: "White Brand Polo",
                      price: 699,
                      image: "/images/hero-product-polo-white.png",
                    },
                    {
                      key: "cap",
                      to: "/shop",
                      name: "Navy Cap",
                      price: 349,
                      image: "/images/hero-product-cap-navy.png",
                    },
                    {
                      key: "mug",
                      to: "/shop",
                      name: "Brand Mug",
                      price: 249,
                      image: "/images/shop-mug-white.png",
                    },
                  ]
              ).map((p, i) => (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
                >
                  <Link to={p.to}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="font-semibold text-navy">{p.name}</p>
                      <p className="text-sm text-brand-orange">₹{p.price}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Services services={services} />

        {/* Customize teaser banner */}
        <section className="relative overflow-hidden py-16">
          <img
            src="/images/banner-customize-cta.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/80" />
          <div className="relative mx-auto max-w-6xl px-4 text-center text-white">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Design it live</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/75">
              Drag your logo on a real t-shirt photo, add text, or orbit in 3D — then order with confidence.
            </p>
            <Link
              to="/customize"
              className="mt-6 inline-block rounded-full bg-brand-orange px-8 py-3 font-semibold text-white"
            >
              Open Live Customize
            </Link>
          </div>
        </section>

        <Customize products={products} addons={addons} />

        {/* How QR print works */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange">QR Print</p>
              <h2 className="font-display text-3xl font-bold text-navy">How Scan &amp; Print works</h2>
            </motion.div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { t: "Scan shop QR", d: "Each shop has a unique code like /print/fusion" },
                { t: "Enter PIN", d: "4-digit shop PIN connects you securely" },
                { t: "Upload / capture", d: "Files or camera — crop, layout, options" },
                { t: "Sent to printer", d: "Job hits the shop queue & print agent" },
              ].map((s, i) => (
                <div key={s.t} className="rounded-2xl border border-navy/10 bg-slate-50 p-5">
                  <p className="text-brand-orange font-display text-2xl font-bold">{i + 1}</p>
                  <p className="mt-2 font-semibold text-navy">{s.t}</p>
                  <p className="mt-1 text-sm text-navy/55">{s.d}</p>
                </div>
              ))}
            </div>
            <Link
              to="/print/fusion"
              className="mt-8 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange"
            >
              Try Fusion QR Print
            </Link>
          </div>
        </section>

        <Pricing products={products} packages={packages} addons={addons} />
        <Contact business={business} />
      </main>
      <Footer />
    </motion.div>
  );
}
