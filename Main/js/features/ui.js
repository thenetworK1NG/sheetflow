function showToast(message, type) {
  clearTimeout(state.toastTimer);
  refs.toast.textContent = message;
  refs.toast.className = "toast is-visible" + (type ? " " + type : "");
  state.toastTimer = setTimeout(() => refs.toast.classList.remove("is-visible"), 3200);
}

function setEngineStatus() {
  // Engine status is no longer displayed in the sidebar
}

function updateControls() {
  const sheet = currentSheet();
  const loaded = Boolean(sheet);
  refs.clearButton.disabled = !loaded || state.loading;
  refs.exportXlsxButton.disabled = !loaded || state.loading || !hasEngine();
  refs.workspaceDot.classList.toggle("offline", !loaded);
  refs.dropZone.classList.toggle("is-loading", state.loading);
  refs.topStatus.textContent = state.loading ? "Reading " + (state.loadingFileName || state.fileName || "your spreadsheet") + "..." : (loaded ? state.fileName + " / " + formatNumber(sheet.rows.length) + " rows" : "Waiting for a spreadsheet");
  refs.tableTitle.textContent = loaded ? sheet.name + " rows" : "Spreadsheet rows";
  refs.tableSubtitle.textContent = loaded ? formatNumber(sheet.width) + " columns detected." : "Import your spreadsheet to begin.";
}

function refresh() {
  setEngineStatus();
  updateControls();
  renderTable();
  for (var i = 0; i < refreshChain.length; i++) {
    try { refreshChain[i](); } catch (e) { console.error("Refresh hook error:", e); }
  }
}
