function exportRows(sheet) {
  return [...sheet.prefixRows, sheet.headerValues, ...sheet.rows.filter((row) => !row.hidden).map((row) => row.values.slice())];
}

function exportBaseName() {
  const base = state.fileName.replace(/\.[^.]+$/, "").replace(/[<>:"/\\|?*]+/g, "-").trim();
  return `${base || "spreadsheet"}-organized`;
}

function csvValue(value) {
  const text = valueToString(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv() {
  const sheet = currentSheet();
  if (!sheet) return;
  const csv = exportRows(sheet).map((row) => row.map(csvValue).join(",")).join("\r\n");
  downloadText(String.fromCharCode(0xFEFF) + csv, `${exportBaseName()}.csv`, "text/csv;charset=utf-8");
  showToast(`${formatNumber(sheet.rows.filter((row) => !row.hidden).length)} rows exported as CSV.`, "success");
}

function exportXlsx() {
  const sheet = currentSheet();
  if (!sheet) return;
  if (!hasEngine()) {
    showToast("The XLSX engine is unavailable. Use CSV or reconnect to the internet and reload this page.", "error");
    return;
  }
  try {
    const outputBook = window.XLSX.utils.book_new();
    state.sheetStates.forEach((sheetState) => {
      const outputSheet = window.XLSX.utils.aoa_to_sheet(exportRows(sheetState));
      if (sheetState.sourceSheet && sheetState.sourceSheet["!cols"]) outputSheet["!cols"] = sheetState.sourceSheet["!cols"].map((column) => ({ ...column }));
      window.XLSX.utils.book_append_sheet(outputBook, outputSheet, sheetState.name);
    });
    window.XLSX.writeFile(outputBook, `${exportBaseName()}.xlsx`, { bookType: "xlsx", compression: true });
    showToast("XLSX exported with hidden rows removed.", "success");
  } catch (error) {
    console.error(error);
    showToast("The workbook could not be exported. Try exporting CSV instead.", "error");
  }
}