"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, Megaphone, Navigation } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { LeafletMap, DEFAULT_CENTER } from "@/components/map";
import { useSession } from "@/components/providers/SessionProvider";
import { garbagebins } from "@/services/garbagebin";
import { currentPosition } from "@/lib/image";
import { notify } from "@/lib/notify";
import { BIN_STATUS } from "@/lib/labels";

const RADIUS = 2000;

function km(a, b) {
  const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function ClientMapPage() {
  const { user } = useSession();
  const [origin, setOrigin] = useState(user?.latitude != null ? [user.latitude, user.longitude] : null);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(null);

  const locate = async () => {
    setLoading(true);
    try {
      const p = await currentPosition();
      setOrigin([p.latitude, p.longitude]);
    } catch (e) {
      notify.error(e.message);
      setOrigin((o) => o || DEFAULT_CENTER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!origin) {
      locate();
      return;
    }
    garbagebins.nearby(origin[0], origin[1], RADIUS).then((r) => r.success ? setBins(r.data) : notify.error(r.error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.[0], origin?.[1]]);

  const markers = [
    ...(origin ? [{ id: "me", position: origin, kind: "me", color: "blue", size: 22 }] : []),
    ...bins.map((b) => ({
      id: b.id, position: [b.latitude, b.longitude], kind: "bin", color: b.status === "FULL" ? "red" : b.status === "EMPTY" ? "green" : "slate",
      popup: (
        <div className="min-w-[170px] space-y-1.5 text-sm">
          <p className="font-semibold">Bac {b.code}</p>
          <p className="text-xs text-slate-500">{b.description || b.quarter}</p>
          <StatusBadge map={BIN_STATUS} value={b.status} />
          {b.status !== "FULL" && <Link href={`/client/reports?bin=${b.id}`} className="block font-semibold text-brand-700">Signaler plein →</Link>}
        </div>
      ),
    })),
  ];

  return (
    <div>
      <PageHeader title="Bacs près de moi" subtitle={`Les bacs à moins de ${RADIUS / 1000} km, du plus proche au plus éloigné.`}
        actions={<button className="btn-secondary" onClick={locate} disabled={loading}>{loading ? <Spinner /> : <LocateFixed size={16} />} Me localiser</button>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="h-[60vh] min-h-[380px] overflow-hidden">
          <LeafletMap markers={markers} center={origin || DEFAULT_CENTER} circle={origin ? { center: origin, radius: RADIUS } : null} flyTo={focus} fit={!focus} />
        </Card>
        <Card className="max-h-[60vh] overflow-y-auto p-3">
          {bins.length === 0 ? (
            <EmptyState compact icon={<MapPin size={24} />} title="Aucun bac à proximité" description="Aucun bac n'est encore répertorié dans ce rayon." />
          ) : (
            <ul className="space-y-1">
              {bins.map((b) => (
                <li key={b.id} className="rounded-xl p-2.5 hover:bg-slate-50">
                  <button className="flex w-full items-center gap-3 text-left" onClick={() => setFocus([b.latitude, b.longitude])}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${b.status === "FULL" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-700"}`}><Navigation size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{b.code}</span>
                      <span className="block truncate text-xs text-slate-500">{b.description || b.quarter} · {origin ? `${Math.round(km(origin, [b.latitude, b.longitude]) * 1000)} m` : ""}</span>
                    </span>
                    <StatusBadge map={BIN_STATUS} value={b.status} />
                  </button>
                  {b.status !== "FULL" && b.status !== "OUT_OF_SERVICE" && (
                    <Link href={`/client/reports?bin=${b.id}`} className="ml-12 mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"><Megaphone size={12} /> Signaler plein</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
