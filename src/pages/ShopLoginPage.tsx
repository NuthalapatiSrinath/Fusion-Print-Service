import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";

const TOKEN_KEY = "fps_shop_token";

export function ShopLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.shopLogin(username, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      navigate("/shop-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-sky-50 px-4">
      <form
        onSubmit={onLogin}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-navy/10 bg-white p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 text-navy">
          <img src="/logo-fp.png" alt="" className="h-10 w-10" />
          <div>
            <h1 className="font-display text-lg font-bold">Shop Login</h1>
            <p className="text-xs text-navy/50">Shopkeeper dashboard — not platform admin</p>
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
        <p className="text-center text-[10px] text-navy/40">
          Platform owners use <Link to="/fps-admin" className="underline">/fps-admin</Link>
        </p>
      </form>
    </div>
  );
}

export { TOKEN_KEY as SHOP_TOKEN_KEY };
