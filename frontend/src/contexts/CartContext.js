import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LS_KEY = "web_cart";

/** Exported so legacy code (useContext(CartContext)) keeps working */
export const CartContext = createContext(null);

function normalize(raw, type = "product", quantity = 1) {
  const id =
    raw?.id ?? raw?.ID ?? raw?.productId ?? raw?.serviceId ?? String(Math.random());
  const title =
    raw?.title ?? raw?.name ?? raw?.productName ?? raw?.serviceName ?? "Untitled";
  const price = Number(raw?.price ?? raw?.amount ?? 0);
  const image = raw?.image ?? raw?.img ?? raw?.photo ?? raw?.thumbnail ?? raw?.imgUrl;
  const key = `${type}:${id}`;
  return { key, id, type, title, price, image, quantity: Number(quantity) || 1 };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(raw, quantity = 1, type = "product") {
    const n = normalize(raw, type, quantity);
    setCart((prev) => {
      const i = prev.findIndex((p) => p.key === n.key);
      if (i > -1) {
        const copy = [...prev];
        copy[i] = { ...copy[i], quantity: (copy[i].quantity || 0) + n.quantity };
        return copy;
      }
      return [...prev, n];
    });
  }

  function setQuantity(key, quantity) {
    const q = Math.max(1, Number(quantity) || 1);
    setCart((prev) =>
      prev
        .map((p) => (p.key === key ? { ...p, quantity: q } : p))
        .filter((p) => p.quantity > 0)
    );
  }

  function removeFromCart(keyOrId) {
    const k = String(keyOrId);
    setCart((prev) => prev.filter((p) => p.key !== k && String(p.id) !== k));
  }

  function clearCart() {
    setCart([]);
  }

  const count = useMemo(
    () => cart.reduce((s, it) => s + (it.quantity || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((s, it) => s + Number(it.price || 0) * (it.quantity || 0), 0),
    [cart]
  );

  const value = {
    cart,
    count,
    totalPrice,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Preferred modern hook */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
