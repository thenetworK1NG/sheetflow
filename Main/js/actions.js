function clearWorkspace() {
  state.fileName = "";
  state.sourceType = "";
  state.workbook = null;
  state.sheetStates = new Map();
  state.currentSheet = "";
  state.loading = false;
  state.loadingFileName = "";
  state.expandedGroups.clear();
  state.selectedIds.clear();
  state.selectedCell = null;
  resetPage();
  resetHistory();
  refs.fileInput.value = "";
  refresh();
}

function rowById(id) {
  const sheet = currentSheet();
  return sheet ? sheet.rows.find((row) => row.id === id) : null;
}

async function importFile(file) {
  if (!file) return;
  const extension = file.name.split(".").pop().toLocaleLowerCase();
  state.loading = true;
  state.loadingFileName = file.name;
  refresh();
  try {
    if (!["xlsx", "xls", "csv", "tsv"].includes(extension)) throw new Error("Please choose an XLSX, XLS, CSV, or TSV file.");
    let workbook = null;
    const sheets = new Map();
    if (extension === "csv" || extension === "tsv") {
      let text = await file.text();
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      const rows = parseDelimited(text, extension === "tsv" ? "\t" : detectDelimiter(text));
      sheets.set("Sheet1", buildSheetState("Sheet1", null, rows));
      state.sourceType = extension;
    } else {
      if (!hasEngine()) throw new Error("The XLSX engine is unavailable. Reload this page while connected to the internet, or use CSV.");
      workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true, raw: true });
      if (!workbook.SheetNames.length) throw new Error("No worksheets were found in that file.");
      workbook.SheetNames.forEach((name) => sheets.set(name, buildSheetState(name, workbook.Sheets[name], null)));
      state.sourceType = extension || "xlsx";
    }
    state.fileName = file.name;
    state.workbook = workbook;
    state.sheetStates = sheets;
    state.currentSheet = sheets.keys().next().value;
    state.expandedGroups.clear();
    state.selectedIds.clear();
    state.selectedCell = null;
    resetPage();
    resetHistory();
    refresh();
    const sheet = currentSheet();
    showToast(file.name + " loaded: " + formatNumber(sheet.rows.length) + " data rows ready.", "success");
  } catch (error) {
    console.error(error);
    showToast(error.message || "That file could not be imported.", "error");
  } finally {
    state.loading = false;
    state.loadingFileName = "";
    refs.fileInput.value = "";
    refresh();
  }
}
