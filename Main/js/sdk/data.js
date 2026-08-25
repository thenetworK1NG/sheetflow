/* ── Sheetflow SDK: Data API ─────────────────────────────────
   Read and write access to spreadsheet data. Tools can hide/show
   rows, edit cells, insert/delete rows, and query column stats.
   ──────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var sf = window.sf;

  /* ── Read ─────────────────────────────────────────────── */

  sf.getVisibleRows = function () {
    var sheet = currentSheet();
    return sheet ? sheet.rows.filter(function (r) { return !r.hidden; }) : [];
  };

  sf.getAllRows = function () {
    var sheet = currentSheet();
    return sheet ? sheet.rows.slice() : [];
  };

  sf.findRows = function (columnIndex, filterFn) {
    var sheet = currentSheet();
    if (!sheet) return [];
    return sheet.rows.filter(function (row) {
      try { return filterFn(row, columnIndex); } catch (e) { return false; }
    });
  };

  sf.getColumnData = function (colIndex) {
    var sheet = currentSheet();
    if (!sheet) return [];
    return sheet.rows.map(function (r) { return r.values[colIndex]; });
  };

  sf.getColumnStats = function (colIndex) {
    var sheet = currentSheet();
    if (!sheet) return { count: 0, numeric: 0, min: null, max: null, sum: 0, avg: null };
    var values = [];
    var all = [];
    sheet.rows.forEach(function (r) {
      var v = parseNumber(r.values[colIndex]);
      all.push(r.values[colIndex]);
      if (v !== null) values.push(v);
    });
    if (values.length === 0) return { count: all.length, numeric: 0, min: null, max: null, sum: 0, avg: null };
    var min = values[0], max = values[0], sum = 0;
    for (var i = 0; i < values.length; i++) {
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
      sum += values[i];
    }
    return { count: all.length, numeric: values.length, min: min, max: max, sum: sum, avg: sum / values.length };
  };

  sf.getSelectedRows = function () {
    var sheet = currentSheet();
    if (!sheet || !state.selectedIds.size) return [];
    return sheet.rows.filter(function (r) { return state.selectedIds.has(r.id); });
  };

  /* ── Write ────────────────────────────────────────────── */

  sf.hideRow = function (id) {
    var sheet = currentSheet();
    if (!sheet) return;
    var row = sheet.rows.find(function (r) { return r.id === id; });
    if (row) { row.hidden = true; sf.emit("row:hidden", { id: id, row: row }); }
  };

  sf.showRow = function (id) {
    var sheet = currentSheet();
    if (!sheet) return;
    var row = sheet.rows.find(function (r) { return r.id === id; });
    if (row) { row.hidden = false; sf.emit("row:shown", { id: id, row: row }); }
  };

  sf.toggleRowVisibility = function (id) {
    var sheet = currentSheet();
    if (!sheet) return;
    var row = sheet.rows.find(function (r) { return r.id === id; });
    if (row) {
      row.hidden = !row.hidden;
      sf.emit(row.hidden ? "row:hidden" : "row:shown", { id: id, row: row });
    }
  };

  sf.setCellValue = function (rowId, colIndex, value) {
    var sheet = currentSheet();
    if (!sheet) return false;
    var row = sheet.rows.find(function (r) { return r.id === rowId; });
    if (!row || colIndex < 0 || colIndex >= row.values.length) return false;
    var oldValue = row.values[colIndex];
    row.values[colIndex] = value;
    row.searchText = row.values.map(normalizeText).join(" ");
    sf.emit("data:modified", { type: "cell", rowId: rowId, colIndex: colIndex, oldValue: oldValue, newValue: value });
    return true;
  };

  sf.insertRow = function (afterIndex, values) {
    var sheet = currentSheet();
    if (!sheet) return null;
    var width = sheet.width;
    var paddedValues = padRow(values || [], width);
    var newRow = {
      id: sheet.name + "-inserted-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      values: paddedValues,
      searchText: paddedValues.map(normalizeText).join(" "),
      emptyColumns: paddedValues.map(function (v) { return !valueToString(v).trim(); }),
      sourceIndex: afterIndex,
      sourceRowNumber: afterIndex + 2,
      blank: isBlankRow(paddedValues),
      hidden: false
    };
    sheet.rows.splice(afterIndex, 0, newRow);
    sheet.groupCache = new Map();
    sf.emit("data:modified", { type: "insert", rowId: newRow.id, index: afterIndex });
    return newRow;
  };

  sf.deleteRow = function (id) {
    var sheet = currentSheet();
    if (!sheet) return false;
    var idx = -1;
    for (var i = 0; i < sheet.rows.length; i++) {
      if (sheet.rows[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return false;
    sheet.rows.splice(idx, 1);
    sheet.groupCache = new Map();
    sf.emit("data:modified", { type: "delete", rowId: id, index: idx });
    return true;
  };

  sf.selectAllRows = function () {
    var sheet = currentSheet();
    if (!sheet) return;
    sheet.rows.forEach(function (r) { state.selectedIds.add(r.id); });
    sf.emit("selection:changed", { selectedIds: state.selectedIds });
  };

  sf.deselectAllRows = function () {
    state.selectedIds.clear();
    sf.emit("selection:changed", { selectedIds: state.selectedIds });
  };

})();
