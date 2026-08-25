/* ── Sheetflow SDK: Sidebar API ──────────────────────────────
   Tools can add labeled navigation sections with icons to the
   left sidebar. Sections are managed by ID for easy cleanup.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;
  var sections = {};
  var cachedSlot = null;

  function getSlot() {
    if (!cachedSlot) cachedSlot = document.getElementById("toolSidebarSlot");
    return cachedSlot;
  }

  sf.addSidebarSection = function (options) {
    if (!options || !options.id) return null;
    sf.removeSidebarSection(options.id);
    var slot = getSlot();
    if (!slot) return null;

    var section = document.createElement("div");
    section.className = "sf-sidebar-section";
    section.id = "sf-section-" + options.id;

    if (options.icon) {
      var iconBar = document.createElement("div");
      iconBar.style.cssText = "display:flex;align-items:center;gap:8px;padding:4px 0";
      var iconSpan = document.createElement("span");
      iconSpan.style.cssText = "font-size:16px;line-height:1";
      iconSpan.textContent = options.icon;
      iconBar.appendChild(iconSpan);
      var iconLabel = document.createElement("span");
      iconLabel.style.cssText = "font-size:13px;font-weight:600;color:var(--text)";
      iconLabel.textContent = options.label || "";
      iconBar.appendChild(iconLabel);
      section.appendChild(iconBar);
    } else if (options.label) {
      var kicker = document.createElement("div");
      kicker.className = "side-kicker";
      kicker.textContent = options.label;
      section.appendChild(kicker);
    }

    var contentWrap = document.createElement("div");
    contentWrap.className = "sf-sidebar-section-content";
    if (typeof options.content === "string") {
      contentWrap.innerHTML = options.content;
    } else if (options.content && options.content.nodeType) {
      contentWrap.appendChild(options.content);
    }
    section.appendChild(contentWrap);

    slot.appendChild(section);
    sections[options.id] = section;
    return section;
  };

  sf.removeSidebarSection = function (id) {
    if (sections[id]) {
      if (sections[id].parentNode) sections[id].parentNode.removeChild(sections[id]);
      delete sections[id];
    }
  };

  sf.updateSidebarSection = function (id, content) {
    if (!sections[id]) return;
    var wrap = sections[id].querySelector(".sf-sidebar-section-content");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (typeof content === "string") {
      wrap.innerHTML = content;
    } else if (content && content.nodeType) {
      wrap.appendChild(content);
    }
  };

  sf.toggleSidebar = function () {
    toggleSidebar();
  };

  sf.isSidebarCollapsed = function () {
    return document.querySelector(".app-shell").classList.contains("sidebar-collapsed");
  };

})();
