function hasEngine() {
  return typeof window.XLSX !== "undefined" && window.XLSX && window.XLSX.utils;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === "\"") return "&quot;";
    return "&#39;";
  });
}

function valueToString(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  return String(value);
}

function normalizeText(value) {
  return valueToString(value).normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(value);
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = valueToString(value).replace(/,/g, "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function formatCell(value) {
  const text = valueToString(value);
  return text ? `<span class="cell-value" title="${escapeHTML(text)}">${escapeHTML(text)}</span>` : `<span class="cell-empty">${escapeHTML(emptyToken)}</span>`;
}

function padRow(row, width) {
  const result = Array.isArray(row) ? row.slice(0, width) : [];
  while (result.length < width) result.push("");
  return result;
}

function isBlankRow(row) {
  return row.every((value) => !valueToString(value).trim());
}

function copySelectedCell() {
  if (!state.selectedCell) return false;
  const sheet = currentSheet();
  const row = rowById(state.selectedCell.rowId);
  if (!sheet || !row) return false;
  const value = valueToString(row.values[state.selectedCell.columnIndex]);
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    showToast("Cell selected. Clipboard access is unavailable in this browser.");
    return true;
  }
  navigator.clipboard.writeText(value).then(() => showToast("Cell copied.", "success")).catch(() => showToast("The cell could not be copied.", "error"));
  return true;
}