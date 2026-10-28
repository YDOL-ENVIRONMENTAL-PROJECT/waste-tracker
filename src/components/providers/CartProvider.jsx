"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { del, get, put } from "@/services/api";
import { useSyncEffect } from "@/components/providers/SyncProvider";
import { notify } from "@/lib/notify";

const CartContext = createContext(null);

const toItems = (cart) => (cart?.items || []).map((i) => ({
  id: i.productId, name: i.name, unitPrice: i.unitPrice, unit: i.unit, photo: i.photo, stock: i.stock, quantity: i.quantity,
}));

/**
 * Panier de la boutique, conservé sur le serveur : le même sur le Web et sur l'application mobile.
 * Chaque modification est envoyée aussitôt (« telle quantité pour tel produit ») et l'affichage est mis
 * à jour sans attendre ; la réponse du serveur fait foi (stock, produit retiré de la vente…).
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const pending = useRef(0);

  const reload = useCallback(async () => {
    if (pending.current > 0) return; // une modification est en cours : sa réponse fera foi
    const r = await get("/cart");
    if (r.success) setItems(toItems(r.data));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);
  useSyncEffect(["cart"], reload);

  const send = useCallback(async (call, optimistic) => {
    setItems(optimistic);
    pending.current += 1;
    const r = await call();
    pending.current -= 1;
    if (r.success) setItems(toItems(r.data));
    else {
      notify.error(r.error);
      reload();
    }
    return r;
  }, [reload]);

  const setQuantity = (id, quantity) => send(
    () => put("/cart/items", { productId: id, quantity: Math.max(0, quantity) }, { error: "Impossible de mettre à jour le panier." }),
    (list) => (quantity <= 0 ? list.filter((i) => i.id !== id) : list.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.stock ?? Infinity, quantity) } : i))),
  );

  const add = (product, quantity = 1) => {
    const existing = items.find((i) => i.id === product.id);
    const next = Math.min(product.stock ?? Infinity, (existing?.quantity || 0) + quantity);
    return send(
      () => put("/cart/items", { productId: product.id, quantity: next }, { error: "Impossible d'ajouter ce produit au panier." }),
      (list) => (existing
        ? list.map((i) => (i.id === product.id ? { ...i, quantity: next } : i))
        : [...list, { id: product.id, name: product.name, unitPrice: product.unitPrice, unit: product.unit, photo: product.photo, stock: product.stock, quantity: next }]),
    );
  };

  const clear = () => send(() => del("/cart", { error: "Impossible de vider le panier." }), () => []);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return <CartContext.Provider value={{ items, add, setQuantity, clear, reload, count, total }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
