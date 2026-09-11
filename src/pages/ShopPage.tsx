import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { api, mediaUrl, type Product } from "../lib/api";
import { useCart } from "../lib/cart";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const cart = useCart();

  useEffect(() => {
    void api
      .products()
      .then((r) => setProducts((r.products ?? []).filter((p) => p.active !== false)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange">Store</p>
          <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">Shop products</h1>
          <p className="mt-2 text-navy/60">
            Round neck, polo, caps &amp; more — customize any item in 3D.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
            >
              <Link to={`/shop/${p.slug || p.id}`} className="block overflow-hidden">
                <img
                  src={mediaUrl(p.image) || "/images/shop-tshirt-black.png"}
                  alt={p.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="space-y-2 p-4">
                <Link
                  to={`/shop/${p.slug || p.id}`}
                  className="font-display text-lg font-bold text-navy hover:text-brand-orange"
                >
                  {p.name}
                </Link>
                <p className="line-clamp-2 text-sm text-navy/50">{p.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-semibold text-brand-orange">
                    ₹{p.storePrice || p.recommendedPrice || "—"}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/customize?product=${p.id}`}
                      className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold"
                    >
                      3D
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        cart.addItem({
                          productId: p.id,
                          name: p.name,
                          image: p.image,
                          quantity: 1,
                          unitPrice: p.storePrice || p.recommendedPrice || 0,
                        })
                      }
                      className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-orange"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
