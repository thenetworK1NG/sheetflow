/* ── Sheetflow SDK: Keyboard Shortcuts ───────────────────────
   Tools register custom keyboard shortcuts without overriding
   the base app's handler. Combo format: "Ctrl+Shift+F".
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;
  var shortcuts = {};

  function parseCombo(combo) {
    var parts = combo.toLowerCase().replace(/\s+/g, "").split("+");
    var key = "";
    var ctrl = false;
    var shift = false;
    var alt = false;
    var meta = false;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "ctrl" || parts[i] === "control") ctrl = true;
      else if (parts[i] === "shift") shift = true;
      else if (parts[i] === "alt") alt = true;
      else if (parts[i] === "meta" || parts[i] === "cmd" || parts[i] === "command") meta = true;
      else key = parts[i];
    }
    return { key: key, ctrl: ctrl, shift: shift, alt: alt, meta: meta };
  }

  function matchShortcut(event, parsed) {
    var eventKey = event.key.toLowerCase();
    if (eventKey === "control") eventKey = "ctrl";
    if (event.ctrlKey && parsed.key === "ctrl") return false;
    return (
      eventKey === parsed.key &&
      event.ctrlKey === parsed.ctrl &&
      event.shiftKey === parsed.shift &&
      event.altKey === parsed.alt &&
      event.metaKey === parsed.meta
    );
  }

  /* Internal: called by sdk/init.js to check shortcuts */
  sf._handleShortcuts = function (event) {
    if (!event.key) return false;
    var combos = Object.keys(shortcuts);
    for (var i = 0; i < combos.length; i++) {
      var parsed = parseCombo(combos[i]);
      if (matchShortcut(event, parsed)) {
        try {
          event.preventDefault();
          event.stopPropagation();
          shortcuts[combos[i]].callback();
        } catch (e) { console.error("Shortcut error [" + combos[i] + "]:", e); }
        return true;
      }
    }
    return false;
  };

  sf.registerShortcut = function (combo, callback, description) {
    if (typeof combo !== "string" || typeof callback !== "function") return;
    shortcuts[combo.toLowerCase()] = { callback: callback, description: description || "" };
  };

  sf.unregisterShortcut = function (combo) {
    delete shortcuts[combo.toLowerCase()];
  };

})();
