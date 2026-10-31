"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSyncEffect } from "@/components/providers/SyncProvider";

/**
 * Charge des données via une fonction de service renvoyant { success, data, error }.
 * `sync` : domaines de synchronisation (ex. ["orders"], ["admin:bins"]) qui déclenchent un rechargement
 * discret quand ils changent, y compris depuis un autre appareil.
 * Renvoie { data, loading, error, reload, setData }.
 */
export function useAsync(fn, deps = [], { initial = null, pollMs, sync } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const result = await fnRef.current();
    if (result?.success) {
      setData(result.data ?? initial);
      setError(null);
    } else if (result) {
      setError(result.error || "Une erreur est survenue");
    }
    setLoading(false);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
    if (!pollMs) return undefined;
    const id = setInterval(() => reload({ silent: true }), pollMs);
    return () => clearInterval(id);
  }, [reload, pollMs]);

  useSyncEffect(sync, () => reload({ silent: true }));

  return { data, loading, error, reload, setData };
}

/** Exécute une action et gère l'état « en cours ». */
export function useAction() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async (fn) => {
    setPending(true);
    try {
      return await fn();
    } finally {
      setPending(false);
    }
  }, []);
  return [pending, run];
}
