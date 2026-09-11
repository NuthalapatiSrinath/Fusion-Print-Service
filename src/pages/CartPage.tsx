import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { api, mediaUrl } from "../lib/api";
import { useCart } from "../lib/cart";

export function CartPage() {
  const cart = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.placeOrder({
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        note: form.note,
        totalEstimate: cart.total,
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          color: i.color,
          side: i.side,
          designUrl: i.designUrl,
          image: i.image,
        })),
      });
      cart.clear();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-24">
        <h1 className="font-display text-3xl font-bold text-navy">Cart</h1>
        {done ? (
          <p className="mt-8 rounded-2xl bg-emerald-50 p-6 text-emerald-700">
            Order / inquiry received! We&apos;ll contact you soon.
            <Link to="/shop" className="mt-4 block font-semibold text-navy underline">
              Continue shopping
            </Link>
          </p>
        ) : cart.items.length === 0 ? (
          <p className="mt-8 text-navy/50">
            Cart is empty.{" "}
            <Link to="/shop" className="text-brand-orange">
              Browse shop
            </Link>
          </p>
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-3"
                >
                  {item.image && (
                    <img src={mediaUrl(item.image)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{item.name}</p>
                    <p className="text-xs text-navy/50">
                      ₹{item.unitPrice} · qty {item.quantity}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={() => cart.removeItem(item.key)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right text-xl font-bold text-navy">Total ≈ ₹{cart.total}</p>
            <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-navy/10 bg-white p-4">
              <p className="font-display font-semibold">Place order / inquiry</p>
              <input
                required
                placeholder="Name"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                placeholder="Phone"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                placeholder="Email"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <textarea
                placeholder="Address / notes"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-brand-orange py-2.5 font-semibold text-white"
              >
                {loading ? "Sending…" : "Submit order"}
              </button>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
