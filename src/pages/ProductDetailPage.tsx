import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Product3DViewer } from "../components/Product3DViewer";
import { api, mediaUrl, type Product } from "../lib/api";
import { findDefaultProduct } from "../data/defaults";
import { useCart } from "../lib/cart";

export function ProductDetailPage() {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [color, setColor] = useState("#1A2A47");
  const [side, setSide] = useState<"front" | "back">("front");
  const [qty, setQty] = useState(1);
  const cart = useCart();

  useEffect(() => {
    void api
      .product(id)
      .then((p) => {
        setProduct(p);
        setColor(p.colors?.[0] || "#1A2A47");
        setSide(p.sides?.[0] || "front");
      })
      .catch(() => setProduct(findDefaultProduct(id) ?? null));
  }, [id]);

  if (!product) {
    return (
      <div>
        <Navbar />
        <main className="px-4 py-32 text-center text-navy/50">
          <p>Product not found.</p>
          <Link to="/shop" className="mt-4 inline-block text-brand-orange font-semibold">
            Back to shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const price = product.storePrice || product.recommendedPrice || 0;

  return (
    <div>
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-24 lg:grid-cols-2">
        <div>
          <Product3DViewer
            type={product.mockupType}
            color={color}
            side={side}
            className="h-[420px] rounded-2xl border border-navy/10 md:h-[520px]"
          />
          <img src={mediaUrl(product.image)} alt="" className="mt-4 h-28 w-full rounded-xl object-cover" />
        </div>
        <div>
          <p className="text-sm text-brand-orange">{product.material}</p>
          <h1 className="font-display text-3xl font-bold text-navy">{product.name}</h1>
          <p className="mt-3 text-navy/60">{product.description}</p>
          <p className="mt-4 text-2xl font-bold text-brand-orange">₹{price}</p>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-navy/50">Color</p>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full border-2 ${color === c ? "border-brand-orange" : "border-navy/15"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          {product.sides.length > 1 && (
            <div className="mt-4 flex gap-2">
              {product.sides.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                    side === s ? "bg-navy text-white" : "border border-navy/15"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 rounded-xl border border-navy/15 px-3 py-2"
            />
            <button
              type="button"
              onClick={() =>
                cart.addItem({
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  quantity: qty,
                  unitPrice: price,
                  color,
                  side,
                })
              }
              className="rounded-full bg-brand-orange px-6 py-2.5 font-semibold text-white"
            >
              Add to cart
            </button>
            <Link
              to={`/customize?product=${product.id}`}
              className="rounded-full border border-navy/20 px-4 py-2.5 text-sm font-semibold"
            >
              Customize 3D
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
