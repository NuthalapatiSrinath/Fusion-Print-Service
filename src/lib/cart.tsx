import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  side?: string;
  designUrl?: string;
};

type CartCtx = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, quantity: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "fps_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo<CartCtx>(
    () => ({
      items,
      addItem: (item) => {
        const key = `${item.productId}-${item.color || ""}-${item.side || ""}-${item.designUrl || ""}`;
        setItems((prev) => {
          const existing = prev.find((p) => p.key === key);
          if (existing) {
            return prev.map((p) =>
              p.key === key ? { ...p, quantity: p.quantity + item.quantity } : p
            );
          }
          return [...prev, { ...item, key }];
        });
      },
      removeItem: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      updateQty: (key, quantity) =>
        setItems((prev) =>
          prev
            .map((p) => (p.key === key ? { ...p, quantity: Math.max(1, quantity) } : p))
            .filter((p) => p.quantity > 0)
        ),
      clear: () => setItems([]),
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.unitPrice * i.quantity, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside provider");
  return ctx;
}
