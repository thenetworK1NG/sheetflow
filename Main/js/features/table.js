function renderTable() {
  const sheet = currentSheet();
  if (!sheet) {
    refs.tableScroll.hidden = true;
    refs.emptyState.hidden = false;
    refs.emptyTitle.textContent = state.loading ? "Reading your spreadsheet..." : "Bring in your spreadsheet";
    refs.emptyCopy.textContent = state.loading ? "Detecting headers and preparing the table." : "Drop an XLSX or CSV file into the panel on the left. Your data stays private and never leaves your browser.";
    refs.resultCount.textContent = "No rows loaded";
    updatePageControls(0);
    return;
  }
  const items = sheet.rows;
  updatePageControls(items.length);
  const visibleItems = pageItems(items);
  refs.tableScroll.hidden = items.length === 0;
  refs.emptyState.hidden = items.length !== 0;
  refs.tableHead.innerHTML = "<tr><th class='row-number'>#</th>" + sheet.headers.map((header) => "<th>" + escapeHTML(header) + "</th>").join("") + "</tr>";
  refs.tableBody.innerHTML = visibleItems.map((row) => {
    return "<tr>" + "<td class='row-number-cell'>" + row.sourceRowNumber + "</td>" + row.values.map((value, index) => "<td data-cell-row='" + escapeHTML(row.id) + "' data-cell-column='" + index + "'>" + formatCell(value) + "</td>").join("") + "</tr>";
  }).join("");
  refs.resultCount.textContent = formatNumber(items.length) + " row" + (items.length === 1 ? "" : "s");
}
