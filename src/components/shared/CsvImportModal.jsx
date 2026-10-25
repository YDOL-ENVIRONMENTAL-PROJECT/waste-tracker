"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { downloadCsvTemplate, parseCsv } from "@/lib/csv";
import { notify } from "@/lib/notify";

/**
 * Import en masse depuis un fichier CSV.
 * columns : [{ key, label, required }] ; toRow(record) convertit une ligne lue en objet pour l'API ;
 * onImport(rows) renvoie { success, data: [{ line, success, message }] }.
 */
export default function CsvImportModal({ open, onClose, title, description, columns, example, templateName, toRow, onImport, extra, onDone }) {
  const inputRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState(null);
  const [pending, setPending] = useState(false);

  const reset = () => { setRecords([]); setFileName(""); setResults(null); };
  const close = () => { reset(); onClose(); };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const parsed = parseCsv(await file.text());
    if (!parsed.length) return notify.error("Fichier vide ou illisible : vérifiez la ligne d'en-tête.");
    const missing = columns.filter((c) => c.required && !(c.key.toLowerCase().replace(/[^a-z0-9]/g, "") in parsed[0]));
    if (missing.length) return notify.error(`Colonnes manquantes : ${missing.map((c) => c.key).join(", ")}`);
    setRecords(parsed);
    setFileName(file.name);
    setResults(null);
  };

  const submit = async () => {
    setPending(true);
    const r = await onImport(records.map(toRow));
    setPending(false);
    if (!r.success) return notify.error(r.error);
    setResults(r.data);
    const ok = r.data.filter((x) => x.success).length;
    notify.success(`${ok} ligne(s) importée(s) sur ${r.data.length}`);
    onDone?.();
  };

  const okCount = results?.filter((r) => r.success).length ?? 0;
  return (
    <Modal open={open} onClose={close} title={title} subtitle={description} size="lg"
      footer={results ? <button className="btn-primary" onClick={close}>Fermer</button> : (
        <>
          <button className="btn-secondary" onClick={close}>Annuler</button>
          <button className="btn-primary" disabled={!records.length || pending} onClick={submit}>
            {pending ? <Spinner /> : <Upload size={15} />} Importer {records.length ? `${records.length} ligne(s)` : ""}
          </button>
        </>
      )}>
      {!results ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Colonnes attendues (séparateur « ; » ou « , ») :</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {columns.map((c) => (
                <span key={c.key} className={`chip ${c.required ? "bg-brand-100 text-brand-800" : "bg-white text-slate-600 ring-1 ring-slate-200"}`} title={c.label}>
                  {c.key}{c.required ? " *" : ""}
                </span>
              ))}
            </div>
            <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
              onClick={() => downloadCsvTemplate(templateName, columns.map((c) => c.key), example)}>
              <Download size={14} /> Télécharger le modèle
            </button>
          </div>
          {extra}
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={pick} />
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-slate-500 hover:border-brand-400 hover:text-brand-700">
            <FileSpreadsheet size={28} />
            <span className="text-sm font-medium">{fileName || "Choisir un fichier CSV"}</span>
            {records.length > 0 && <span className="text-xs text-slate-400">{records.length} ligne(s) détectée(s)</span>}
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-slate-600"><b className="text-brand-700">{okCount}</b> réussite(s), <b className="text-red-600">{results.length - okCount}</b> erreur(s).</p>
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {results.map((r) => (
              <li key={r.line} className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                {r.success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
                <span className="w-16 shrink-0 text-slate-400">Ligne {r.line}</span>
                <span className={r.success ? "text-slate-700" : "text-red-700"}>{r.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
