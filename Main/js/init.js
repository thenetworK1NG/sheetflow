function resetPage() {
  state.page = 1;
}

function updatePageControls(total) {
  const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
  state.page = Math.min(state.page, pageCount);
  refs.pageControls.hidden = total <= state.pageSize;
  refs.pageStatus.textContent = "Page " + state.page + " of " + pageCount;
  refs.previousPageButton.disabled = state.page <= 1;
  refs.nextPageButton.disabled = state.page >= pageCount;
}

function pageItems(items) {
  const start = (state.page - 1) * state.pageSize;
  return items.slice(start, start + state.pageSize);
}

function toggleSidebar() {
  var appShell = document.querySelector(".app-shell");
  var isCollapsed = appShell.classList.contains("sidebar-collapsed");
  if (isCollapsed) {
    appShell.classList.remove("sidebar-collapsed");
    try { localStorage.setItem("sheetflow-sidebar-collapsed", "0"); } catch (e) {}
  } else {
    appShell.classList.add("sidebar-collapsed");
    try { localStorage.setItem("sheetflow-sidebar-collapsed", "1"); } catch (e) {}
  }
}

function restoreSidebar() {
  try {
    if (localStorage.getItem("sheetflow-sidebar-collapsed") === "1") {
      document.querySelector(".app-shell").classList.add("sidebar-collapsed");
    }
  } catch (e) {}
}

restoreSidebar();
refs.sidebarToggle.addEventListener("click", toggleSidebar);
refs.sidebarEdge.addEventListener("mouseenter", function () {
  refs.sidebar.classList.add("sidebar-peek");
});
refs.sidebarEdge.addEventListener("mouseleave", function () {
  refs.sidebar.classList.remove("sidebar-peek");
});
refs.sidebarEdge.addEventListener("click", function () {
  refs.sidebar.classList.remove("sidebar-peek");
  document.querySelector(".app-shell").classList.remove("sidebar-collapsed");
  try { localStorage.setItem("sheetflow-sidebar-collapsed", "0"); } catch (e) {}
});

loadInstalledTools();
restoreActiveTools();
setEngineStatus();
refresh();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
      .catch((error) => console.warn("Sheetflow offline support is unavailable.", error));
  });
}
