/**
 * Lecture d'un fichier CSV (séparateur « ; » ou « , », guillemets pris en charge, BOM Excel ignoré).
 * Renvoie un tableau d'objets indexés par les en-têtes normalisés (minuscules, sans accents ni espaces).
 */
export function parseCsv(text) {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/)[0] || "";
  const sep = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];
  const norm = (h) => h.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const headers = rows[0].map(norm);
  return rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

/** Déclenche le téléchargement d'un modèle CSV (séparateur « ; », compatible Excel). */
export function downloadCsvTemplate(filename, headers, example) {
  const content = "﻿" + [headers.join(";"), example.join(";")].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
