"use client";

import { useState } from "react";
import { Archive, BadgeCheck, FileClock, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "@/components/providers/SessionProvider";
import { useAction } from "@/hooks/useAsync";
import { notify } from "@/lib/notify";

/**
 * Droits sur un objet du référentiel (véhicule, bac, caserne, produit) :
 * - valider : super administrateur, sur un brouillon ;
 * - supprimer définitivement : brouillon, par un super administrateur ou son auteur ;
 * - archiver : objet validé uniquement.
 */
export function useApprovalRights(item) {
  const { user } = useSession();
  const superAdmin = user?.role === "SUPER_ADMIN";
  const draft = !!item?.draft;
  return {
    superAdmin,
    draft,
    canApprove: superAdmin && draft,
    canDelete: draft && (superAdmin || (item?.requestedById && item.requestedById === user?.id)),
    canArchive: !draft,
  };
}

export function DraftBadge({ item }) {
  if (!item?.draft) return null;
  return (
    <Badge tone="violet" dot>
      <FileClock size={12} /> Brouillon{item.requestedByName ? ` · ${item.requestedByName}` : ""}
    </Badge>
  );
}

/**
 * Boutons Valider / Supprimer / Archiver selon les droits. `service` expose approve, remove et archive.
 * `label` désigne l'objet dans les messages (ex. « le bac YDE-001 »).
 */
export function ApprovalActions({ item, service, label, onDone, compact = false, archive = true }) {
  const rights = useApprovalRights(item);
  const [confirm, setConfirm] = useState(null); // "delete" | "archive"
  const [pending, run] = useAction();

  const act = (fn, msg) => run(async () => {
    const r = await fn();
    if (r.success) {
      notify.success(msg);
      setConfirm(null);
      onDone?.(r.data);
    } else notify.error(r.error);
  });

  const size = compact ? "px-2.5 py-1.5 text-xs" : "";
  return (
    <>
      {rights.canApprove && (
        <button className={`btn bg-violet-600 text-white hover:bg-violet-700 ${size}`} disabled={pending}
          onClick={(e) => { e.stopPropagation(); act(() => service.approve(item.id), `${capitalize(label)} est validé`); }}>
          {pending ? <Spinner size={14} /> : <BadgeCheck size={15} />} Valider
        </button>
      )}
      {rights.canDelete && (
        <button className={`btn-danger-soft ${size}`} onClick={(e) => { e.stopPropagation(); setConfirm("delete"); }}>
          <Trash2 size={15} /> Supprimer
        </button>
      )}
      {archive && rights.canArchive && (
        <button className={`btn-ghost text-red-600 ${size}`} onClick={(e) => { e.stopPropagation(); setConfirm("archive"); }} title="Archiver">
          <Archive size={15} />{!compact && " Archiver"}
        </button>
      )}
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        danger
        pending={pending}
        title="Supprimer définitivement ?"
        message={`${capitalize(label)} sera supprimé définitivement. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={() => act(() => service.remove(item.id), `${capitalize(label)} est supprimé`)}
      />
      <ConfirmDialog
        open={confirm === "archive"}
        onClose={() => setConfirm(null)}
        danger
        pending={pending}
        title="Archiver ?"
        message={`${capitalize(label)} sera retiré de l'activité. Son historique est conservé et il pourra être restauré.`}
        confirmLabel="Archiver"
        onConfirm={() => act(() => service.archive(item.id), `${capitalize(label)} est archivé`)}
      />
    </>
  );
}

/** Boutons d'enregistrement d'un formulaire de création / modification. */
export function SaveButtons({ isEdit, saving, onSave }) {
  const { user } = useSession();
  if (isEdit) {
    return <button type="button" className="btn-primary" disabled={saving} onClick={() => onSave(undefined)}>{saving && <Spinner />} Enregistrer</button>;
  }
  if (user?.role === "SUPER_ADMIN") {
    return (
      <>
        <button type="button" className="btn-secondary" disabled={saving} onClick={() => onSave(true)}>Enregistrer en brouillon</button>
        <button type="button" className="btn-primary" disabled={saving} onClick={() => onSave(false)}>{saving && <Spinner />} Créer définitivement</button>
      </>
    );
  }
  return (
    <button type="button" className="btn-primary" disabled={saving} onClick={() => onSave(true)}>
      {saving ? <Spinner /> : <Send size={15} />} Soumettre pour validation
    </button>
  );
}

/** Rappel affiché en tête des formulaires de création. */
export function ApprovalHint() {
  const { user } = useSession();
  return user?.role === "SUPER_ADMIN" ? (
    <p className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
      Vous pouvez <b>enregistrer en brouillon</b> (modifiable et supprimable) ou <b>créer définitivement</b> : un élément créé ne peut plus être supprimé, seulement archivé.
    </p>
  ) : (
    <p className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
      Votre création restera un <b>brouillon</b> jusqu'à sa validation par un super administrateur. D'ici là, vous pouvez la modifier ou la supprimer.
    </p>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
