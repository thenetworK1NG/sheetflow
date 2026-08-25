/* ── Sheetflow SDK: Init ─────────────────────────────────────
   Wires the SDK into the base app. Monkey-patches lifecycle
   functions to emit events, and integrates the shortcut system.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;

  /* Hook into handleKeyboardShortcuts for registered shortcuts */
  var origHandleKeyboardShortcuts = window.handleKeyboardShortcuts;
  window.handleKeyboardShortcuts = function (event) {
    if (sf._handleShortcuts(event)) return;
    if (typeof origHandleKeyboardShortcuts === "function") origHandleKeyboardShortcuts(event);
  };

  /* Emit events from base app lifecycle */
  var origImportFile = window.importFile;
  if (typeof origImportFile === "function") {
    window.importFile = function () {
      var result = origImportFile.apply(this, arguments);
      if (result && typeof result.then === "function") {
        result.then(function () {
          if (state.fileName) sf.emit("sheet:loaded", { fileName: state.fileName });
        }).catch(function () {});
      }
      return result;
    };
  }

  var origClearWorkspace = window.clearWorkspace;
  if (typeof origClearWorkspace === "function") {
    window.clearWorkspace = function () {
      origClearWorkspace();
      sf.emit("sheet:cleared", {});
    };
  }

  /* Emit selection:changed from base app click handler */
  var origHandleTableClick = window.handleTableClick;
  if (typeof origHandleTableClick === "function") {
    window.handleTableClick = function (event) {
      origHandleTableClick(event);
      sf.emit("selection:changed", { selectedIds: state.selectedIds });
    };
  }

  /* Expose cleanup helper */
  window._sfCleanupShortcuts = function () {
    window.handleKeyboardShortcuts = origHandleKeyboardShortcuts;
  };

})();
