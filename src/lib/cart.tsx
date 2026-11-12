"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = { variantId: string; quantity: number };

const KEY = "dijah-cart-v1";
export const MAX_PER_LINE = 10;

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        typeof l?.variantId === "string" &&
        Number.isInteger(l?.quantity) &&
        l.quantity > 0 &&
        l.quantity <= MAX_PER_LINE
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart once the page is open in the browser
  useEffect(() => {
    setLines(readStored());
    setReady(true);
  }, []);

  // Save every change
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // Storage can be blocked, so the cart just won't persist
    }
  }, [lines, ready]);

  const add = useCallback((variantId: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variantId
            ? { ...l, quantity: Math.min(MAX_PER_LINE, l.quantity + quantity) }
            : l
        );
      }
      return [...prev, { variantId, quantity: Math.min(MAX_PER_LINE, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.min(MAX_PER_LINE, quantity) }
              : l
          )
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}