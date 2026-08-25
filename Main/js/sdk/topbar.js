/* ── Sheetflow SDK: Topbar API ───────────────────────────────
   Tools can add buttons, dropdown menus, and override the status
   text in the top bar. All additions are managed by ID.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;
  var buttons = {};
  var dropdowns = {};
  var statusOverride = false;
  var originalStatusText = "";

  sf.addTopbarButton = function (options) {
    if (!options || !options.id) return null;
    sf.removeTopbarButton(options.id);
    var slot = document.getElementById("toolActionSlot");
    if (!slot) return null;

    var btn = document.createElement("button");
    btn.className = "button button-ghost button-small";
    if (options.className) {
      options.className.split(" ").forEach(function (c) { if (c) btn.classList.add(c); });
    }
    btn.id = "sf-topbtn-" + options.id;
    if (options.icon) {
      var iconSpan = document.createElement("span");
      iconSpan.textContent = options.icon;
      btn.appendChild(iconSpan);
    }
    if (options.label) {
      var textSpan = document.createElement("span");
      textSpan.textContent = options.label;
      btn.appendChild(textSpan);
    }
    if (typeof options.onClick === "function") btn.addEventListener("click", options.onClick);
    slot.appendChild(btn);
    buttons[options.id] = btn;
    return btn;
  };

  sf.removeTopbarButton = function (id) {
    if (buttons[id]) {
      if (buttons[id].parentNode) buttons[id].parentNode.removeChild(buttons[id]);
      delete buttons[id];
    }
  };

  sf.setTopbarStatus = function (text, type) {
    var el = document.getElementById("topStatus");
    if (!el) return;
    if (!statusOverride) originalStatusText = el.textContent;
    statusOverride = true;
    el.textContent = text;
    var dot = document.getElementById("workspaceDot");
    if (dot && type) {
      dot.className = "status-dot";
      if (type === "info") dot.classList.add("offline");
    }
  };

  sf.resetTopbarStatus = function () {
    if (!statusOverride) return;
    var el = document.getElementById("topStatus");
    if (el) el.textContent = originalStatusText;
    statusOverride = false;
    var dot = document.getElementById("workspaceDot");
    if (dot) { dot.className = "status-dot"; }
  };

  sf.addTopbarDropdown = function (options) {
    if (!options || !options.id || !options.items) return null;
    sf.removeTopbarDropdown(options.id);
    var slot = document.getElementById("toolDropdownSlot");
    if (!slot) return null;

    var wrapper = document.createElement("div");
    wrapper.className = "sf-topbar-dropdown";
    wrapper.id = "sf-dropdown-" + options.id;

    var trigger = document.createElement("button");
    trigger.className = "button button-ghost button-small";
    trigger.innerHTML = (options.label || "Menu") + ' <span style="font-size:8px;margin-left:2px">\u25be</span>';

    var menu = document.createElement("div");
    menu.className = "sf-dropdown-menu";

    options.items.forEach(function (item) {
      if (item.divider) {
        var divider = document.createElement("div");
        divider.className = "sf-dropdown-divider";
        menu.appendChild(divider);
        return;
      }
      var menuBtn = document.createElement("button");
      menuBtn.className = "sf-dropdown-item";
      if (item.icon) {
        var mIcon = document.createElement("span");
        mIcon.style.cssText = "font-size:14px;margin-right:6px";
        mIcon.textContent = item.icon;
        menuBtn.appendChild(mIcon);
      }
      var mLabel = document.createElement("span");
      mLabel.textContent = item.label || "";
      menuBtn.appendChild(mLabel);
      if (typeof item.onClick === "function") {
        menuBtn.addEventListener("click", function () {
          item.onClick();
          menu.classList.remove("sf-dropdown-open");
        });
      }
      menu.appendChild(menuBtn);
    });

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelectorAll(".sf-dropdown-menu.sf-dropdown-open").forEach(function (m) {
        if (m !== menu) m.classList.remove("sf-dropdown-open");
      });
      menu.classList.toggle("sf-dropdown-open");
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    slot.appendChild(wrapper);
    dropdowns[options.id] = wrapper;
    return wrapper;
  };

  sf.removeTopbarDropdown = function (id) {
    if (dropdowns[id]) {
      if (dropdowns[id].parentNode) dropdowns[id].parentNode.removeChild(dropdowns[id]);
      delete dropdowns[id];
    }
  };

  /* Close all dropdowns on outside click */
  document.addEventListener("click", function () {
    document.querySelectorAll(".sf-dropdown-menu.sf-dropdown-open").forEach(function (m) {
      m.classList.remove("sf-dropdown-open");
    });
  });

})();
