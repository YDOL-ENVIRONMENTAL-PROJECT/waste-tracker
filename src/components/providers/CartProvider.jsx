"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "wt-cart";

/** Panier de la boutique, conservé localement sur l'appareil (confort par utilisateur). */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      /* stockage indisponible : panier en mémoire uniquement */
    }
  }, []);

  const persist = (next) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignoré */
    }
  };

  const add = (product, quantity = 1) => {
    const existing = items.find((i) => i.id === product.id);
    const max = product.stock ?? Infinity;
    if (existing) {
      persist(items.map((i) => (i.id === product.id ? { ...i, quantity: Math.min(max, i.quantity + quantity) } : i)));
    } else {
      persist([...items, { id: product.id, name: product.name, unitPrice: product.unitPrice, unit: product.unit, photo: product.photo, stock: product.stock, quantity: Math.min(max, quantity) }]);
    }
  };
  const setQuantity = (id, quantity) => persist(quantity <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.stock ?? Infinity, quantity) } : i)));
  const clear = () => persist([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return <CartContext.Provider value={{ items, add, setQuantity, clear, count, total }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
