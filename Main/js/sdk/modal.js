/* ── Sheetflow SDK: Modal API ────────────────────────────────
   Built-in modal dialog system. Provides openModal, closeModal,
   confirm (Promise<boolean>), and prompt (Promise<string|null>).
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;
  var modalContainer = null;
  var modalClose = null;

  function ensureContainer() {
    if (modalContainer) return modalContainer;
    modalContainer = document.getElementById("sfModalContainer");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "sfModalContainer";
      document.body.appendChild(modalContainer);
    }
    modalContainer.addEventListener("click", function (e) {
      if (e.target === modalContainer) sf.closeModal();
    });
    return modalContainer;
  }

  sf.openModal = function (options) {
    sf.closeModal();
    var container = ensureContainer();
    var title = (options && options.title) || "";
    var content = (options && options.content) || "";
    var buttons = (options && options.buttons) || [{ label: "Close", type: "ghost", onClick: null }];
    var width = (options && options.width) || 520;
    var onClose = (options && options.onClose) || null;

    var overlay = document.createElement("div");
    overlay.className = "sf-modal-overlay";

    var modal = document.createElement("div");
    modal.className = "sf-modal";
    modal.style.maxWidth = width + "px";

    var head = document.createElement("div");
    head.className = "sf-modal-head";
    var headLeft = document.createElement("div");
    if (title) {
      var titleEl = document.createElement("h3");
      titleEl.className = "sf-modal-title";
      titleEl.textContent = title;
      headLeft.appendChild(titleEl);
    }
    var closeBtn = document.createElement("button");
    closeBtn.className = "sf-modal-close";
    closeBtn.innerHTML = "\u00d7";
    closeBtn.addEventListener("click", sf.closeModal);
    head.appendChild(headLeft);
    head.appendChild(closeBtn);

    var body = document.createElement("div");
    body.className = "sf-modal-body";
    if (typeof content === "string") {
      body.innerHTML = content;
    } else if (content && content.nodeType) {
      body.appendChild(content);
    }

    var footer = document.createElement("div");
    footer.className = "sf-modal-footer";
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var el = document.createElement("button");
        el.className = "button button-small";
        if (btn.type === "primary") el.classList.add("button-primary");
        else if (btn.type === "danger") el.classList.add("button-danger");
        else el.classList.add("button-ghost");
        el.textContent = btn.label || "OK";
        el.addEventListener("click", function () {
          if (typeof btn.onClick === "function") {
            var result = btn.onClick();
            if (result !== false) sf.closeModal();
          } else {
            sf.closeModal();
          }
        });
        footer.appendChild(el);
      })(buttons[i]);
    }

    modal.appendChild(head);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    container.appendChild(overlay);

    modalClose = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (onClose) onClose();
      modalClose = null;
    };

    requestAnimationFrame(function () { overlay.classList.add("sf-modal-visible"); });

    return sf.closeModal;
  };

  sf.closeModal = function () {
    if (modalClose) modalClose();
  };

  sf.confirm = function (message) {
    return new Promise(function (resolve) {
      sf.openModal({
        title: "Confirm",
        content: '<p style="color:var(--muted);font-size:14px;line-height:1.6;margin:0">' + escapeHTML(message) + "</p>",
        buttons: [
          { label: "Cancel", type: "ghost", onClick: function () { resolve(false); } },
          { label: "OK", type: "primary", onClick: function () { resolve(true); } }
        ],
        onClose: function () { resolve(false); }
      });
    });
  };

  sf.prompt = function (message, defaultValue) {
    return new Promise(function (resolve) {
      var inputWrap = document.createElement("div");
      if (message) {
        var label = document.createElement("label");
        label.style.cssText = "display:block;margin-bottom:8px;font-size:13px;font-weight:600;color:var(--text)";
        label.textContent = message;
        inputWrap.appendChild(label);
      }
      var input = document.createElement("input");
      input.type = "text";
      input.value = defaultValue || "";
      input.style.cssText = "width:100%;padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-size:14px;outline:none;font-family:inherit";
      input.addEventListener("focus", function () { input.style.borderColor = "var(--blue)"; });
      input.addEventListener("blur", function () { input.style.borderColor = "var(--line)"; });
      inputWrap.appendChild(input);

      sf.openModal({
        title: "Input",
        content: inputWrap,
        buttons: [
          { label: "Cancel", type: "ghost", onClick: function () { resolve(null); } },
          { label: "OK", type: "primary", onClick: function () { resolve(input.value); } }
        ],
        onClose: function () { resolve(null); }
      });

      setTimeout(function () { input.focus(); input.select(); }, 100);
    });
  };

})();
