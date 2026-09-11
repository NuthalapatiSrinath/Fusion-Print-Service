import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Customize } from "../components/Customize";
import { api, type Addon, type Product } from "../lib/api";

export function CustomizePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [params] = useSearchParams();

  useEffect(() => {
    void api.products().then((r) => {
      setProducts(r.products);
      setAddons(r.addons);
    });
  }, []);

  // Prefetch hint for Customize via query — Customize uses first product; we reorder
  const ordered = (() => {
    const id = params.get("product");
    if (!id) return products;
    const hit = products.find((p) => p.id === id || p.slug === id);
    if (!hit) return products;
    return [hit, ...products.filter((p) => p.id !== hit.id)];
  })();

  return (
    <div>
      <Navbar />
      <div className="pt-16">
        <Customize products={ordered} addons={addons} />
      </div>
      <Footer />
    </div>
  );
}
