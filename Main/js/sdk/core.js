/* ── Sheetflow SDK Core ──────────────────────────────────────
   Creates the sf namespace, exposes refs/state, and provides
   utility wrappers for base app functions.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  window.sf = {
    /* Refs & State (read-only access for tools) */
    refs: refs,
    state: state,

    /* Wrappers — convenience access to base app globals */
    showToast: function (msg, type) { showToast(msg, type); },
    refresh: function () { refresh(); },
    renderTable: function () { renderTable(); },
    currentSheet: function () { return currentSheet(); },
    escapeHTML: function (s) { return escapeHTML(s); },
    normalizeText: function (v) { return normalizeText(v); },
    valueToString: function (v) { return valueToString(v); },
    formatNumber: function (n) { return formatNumber(n); },
    parseNumber: function (v) { return parseNumber(v); },
    downloadText: function (text, filename, mime) { downloadText(text, filename, mime); },
    rowById: function (id) { return rowById(id); }
  };

})();
