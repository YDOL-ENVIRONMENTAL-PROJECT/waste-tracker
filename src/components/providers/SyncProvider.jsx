"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { get, setRequestHooks } from "@/services/api";

const SyncContext = createContext(null);
const POLL_MS = 15_000;

/**
 * Synchronisation avec les autres appareils du même utilisateur (application mobile, autre onglet) et
 * avec les actions de l'équipe YDOL. Le serveur tient un numéro de révision par domaine (« orders »,
 * « cart », « admin:bins »…) ; on l'interroge toutes les 15 s, au retour sur l'onglet, après chaque
 * action et après un conflit (409). Les écrans abonnés à un domaine modifié se rechargent.
 */
export function SyncProvider({ children }) {
  const listeners = useRef(new Map()); // domaine → Set(callback)
  const revisions = useRef(null);
  const epoch = useRef(null);
  const timer = useRef(null);

  const poll = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    const r = await get("/sync");
    if (!r.success) return;
    const { epoch: serverEpoch, scopes = {} } = r.data;
    const previous = revisions.current;
    const restarted = epoch.current && epoch.current !== serverEpoch;
    revisions.current = scopes;
    epoch.current = serverEpoch;
    if (!previous) return; // premier relevé : les écrans viennent de charger leurs données
    const changed = new Set();
    listeners.current.forEach((_, scope) => {
      if (restarted || (scopes[scope] ?? 0) !== (previous[scope] ?? 0)) changed.add(scope);
    });
    const callbacks = new Set();
    changed.forEach((scope) => listeners.current.get(scope)?.forEach((cb) => callbacks.add(cb)));
    callbacks.forEach((cb) => cb());
  }, []);

  /** Relevé anticipé (après une action ou un conflit), regroupé pour éviter les rafales. */
  const poke = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(poll, 400);
  }, [poll]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", poll);
    window.addEventListener("online", poll);
    setRequestHooks({ onMutation: poke, onConflict: poke });
    return () => {
      clearInterval(id);
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", poll);
      window.removeEventListener("online", poll);
      setRequestHooks({});
    };
  }, [poll, poke]);

  const subscribe = useCallback((scopes, callback) => {
    scopes.forEach((s) => {
      if (!listeners.current.has(s)) listeners.current.set(s, new Set());
      listeners.current.get(s).add(callback);
    });
    return () => scopes.forEach((s) => listeners.current.get(s)?.delete(callback));
  }, []);

  return <SyncContext.Provider value={{ subscribe, poke }}>{children}</SyncContext.Provider>;
}

/** Rappelle `callback` quand l'un des domaines change (sans effet hors d'un SyncProvider). */
export function useSyncEffect(scopes, callback) {
  const ctx = useContext(SyncContext);
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const key = (scopes || []).join(",");
  useEffect(() => {
    if (!ctx || !key) return undefined;
    return ctx.subscribe(key.split(","), () => cbRef.current());
  }, [ctx, key]);
}
