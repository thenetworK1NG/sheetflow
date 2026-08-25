/* ── Sheetflow SDK: Event Bus ────────────────────────────────
   Pub/sub system for tool-to-tool communication and app
   lifecycle events. Attach to the sf namespace.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;
  var listeners = {};

  sf.on = function (event, fn) {
    if (typeof event !== "string" || typeof fn !== "function") return;
    if (!listeners[event]) listeners[event] = [];
    if (listeners[event].indexOf(fn) === -1) listeners[event].push(fn);
  };

  sf.off = function (event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(function (f) { return f !== fn; });
    if (listeners[event].length === 0) delete listeners[event];
  };

  sf.emit = function (event, data) {
    if (!listeners[event]) return;
    var list = listeners[event].slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](data); } catch (e) { console.error("Event handler error [" + event + "]:", e); }
    }
  };

  sf.once = function (event, fn) {
    var wrapper = function (data) {
      sf.off(event, wrapper);
      fn(data);
    };
    sf.on(event, wrapper);
  };

})();
