function handleTableClick(event) {
  const cell = event.target.closest("[data-cell-row]");
  if (cell && !event.target.closest("button, input")) {
    state.selectedCell = { rowId: cell.dataset.cellRow, columnIndex: Number(cell.dataset.cellColumn) };
    renderTable();
    return;
  }
}

function handleKeyboardShortcuts(event) {
  if (!event.key) return;
  const key = event.key.toLowerCase();
  const targetTag = event.target && event.target.tagName;
  const isEditing = ["INPUT", "TEXTAREA", "SELECT"].includes(targetTag) || Boolean(event.target && event.target.isContentEditable);
  if (event.key === "Escape") {
    if (state.activeToolIds.size > 0) {
      var lastId = Array.from(state.activeToolIds).pop();
      deactivateTool(lastId);
    } else if (state.toolsPanelOpen) {
      closeToolsPanel();
    }
  }
  if ((event.ctrlKey || event.metaKey) && !isEditing && key === "c" && copySelectedCell()) {
    event.preventDefault();
  }
}

refs.fileInput.addEventListener("change", (event) => importFile(event.target.files[0]));
refs.dropZone.addEventListener("dragover", (event) => { event.preventDefault(); refs.dropZone.classList.add("is-dragging"); });
refs.dropZone.addEventListener("dragleave", () => refs.dropZone.classList.remove("is-dragging"));
refs.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  refs.dropZone.classList.remove("is-dragging");
  importFile(event.dataTransfer.files[0]);
});
refs.emptyState.addEventListener("click", () => refs.fileInput.click());
refs.mobileImportButton.addEventListener("click", () => refs.fileInput.click());
refs.tableBody.addEventListener("click", handleTableClick);
refs.clearButton.addEventListener("click", clearWorkspace);
refs.exportXlsxButton.addEventListener("click", exportXlsx);
refs.toolsButton.addEventListener("click", () => { state.toolsPanelOpen ? closeToolsPanel() : openToolsPanel(); });
refs.closeToolsButton.addEventListener("click", closeToolsPanel);
refs.toolsOverlay.addEventListener("click", function (e) { if (e.target === refs.toolsOverlay) closeToolsPanel(); });
refs.installToolButton.addEventListener("click", () => refs.installToolInput.click());
refs.installToolInput.addEventListener("change", (event) => { importToolFile(event.target.files[0]); event.target.value = ""; });
refs.toolsList.addEventListener("click", handleToolsPanelClick);
refs.previousPageButton.addEventListener("click", () => { state.page = Math.max(1, state.page - 1); renderTable(); });
refs.nextPageButton.addEventListener("click", () => { state.page += 1; renderTable(); });
document.addEventListener("keydown", handleKeyboardShortcuts);
