function detectHeaderIndex(aoa) {
  let bestIndex = 0;
  let bestScore = 0;
  for (let index = 0; index < Math.min(aoa.length, 15); index += 1) {
    const text = (aoa[index] || []).map(valueToString).join(" ").toLocaleLowerCase();
    const score = headerHints.reduce((total, hint) => total + (text.includes(hint) ? 1 : 0), 0);
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }
  if (bestScore > 0) return bestIndex;
  const firstPopulated = aoa.findIndex((row) => (row || []).filter((value) => valueToString(value).trim()).length > 1);
  return firstPopulated >= 0 ? firstPopulated : 0;
}

function makeHeaderLabels(values, width) {
  const seen = new Map();
  return values.slice(0, width).map((value, index) => {
    const base = valueToString(value).trim() || `Column ${index + 1}`;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function findColumn(labels, expressions) {
  return labels.findIndex((label) => expressions.some((expression) => expression.test(label)));
}

function buildSheetState(name, sourceSheet, csvRows) {
  let aoa = csvRows;
  let sourceWidth = 1;
  if (sourceSheet) {
    aoa = window.XLSX.utils.sheet_to_json(sourceSheet, { header: 1, defval: "", raw: true, blankrows: true });
    if (sourceSheet["!ref"]) {
      const range = window.XLSX.utils.decode_range(sourceSheet["!ref"]);
      sourceWidth = range.e.c - range.s.c + 1;
    }
  }
  aoa = Array.isArray(aoa) ? aoa : [];
  const width = Math.max(sourceWidth, 1, ...aoa.map((row) => Array.isArray(row) ? row.length : 0));
  const headerIndex = detectHeaderIndex(aoa);
  const headerValues = padRow(aoa[headerIndex] || [], width);
  const headers = makeHeaderLabels(headerValues, width);
  const prefixRows = aoa.slice(0, headerIndex).map((row) => padRow(row, width));
  const rows = aoa.slice(headerIndex + 1).map((row, index) => {
    const values = padRow(row, width);
    return { id: `${name}-${headerIndex + index + 2}`, values, searchText: values.map(normalizeText).join(" "), emptyColumns: values.map((value) => !valueToString(value).trim()), sourceIndex: index, sourceRowNumber: headerIndex + index + 2, blank: isBlankRow(values), hidden: false };
  });
  const product = findColumn(headers, [/product/i, /item/i, /sku/i, /description/i, /customer/i, /client/i, /order/i, /case/i, /ticket/i, /service/i, /account/i, /asset/i, /job/i, /claim/i, /reference/i, /record/i, /code/i, /^name/i, /^id$/i]);
  const location = findColumn(headers, [/location/i, /store/i, /branch/i, /site/i, /warehouse/i, /department/i, /division/i, /region/i, /area/i, /room/i, /section/i, /zone/i, /project/i, /team/i]);
  const quantity = findColumn(headers, [/quantity/i, /qty/i, /stock/i, /on[ -]?hand/i, /units?/i, /count/i, /amount/i, /total/i, /value/i, /balance/i, /cost/i, /price/i, /hours?/i, /score/i, /rate/i, /percent/i]);
  return {
    name, sourceSheet, width, headerIndex, headerValues, headers, prefixRows, rows, groupCache: new Map(),
    productColumn: product >= 0 ? product : null, locationColumn: location >= 0 ? location : null,
    quantityColumn: quantity >= 0 ? quantity : null
  };
}

function currentSheet() { return state.sheetStates.get(state.currentSheet) || null; }

function placeSidebarSettings() {
  // Sidebar settings removed — no longer needed
}

function columnLabel(sheet, columnIndex, fallback) {
  if (!sheet || columnIndex === null || columnIndex === undefined) return fallback;
  return valueToString(sheet.headers[columnIndex]).trim() || fallback;
}

function productFieldLabel(sheet) {
  return columnLabel(sheet, sheet ? sheet.productColumn : null, "Record");
}

function groupingFieldLabel(sheet) {
  return columnLabel(sheet, sheet ? sheet.locationColumn : null, "Grouping field");
}

function valueFieldLabel(sheet) {
  return columnLabel(sheet, sheet ? sheet.quantityColumn : null, "Value");
}

function refreshGroupingFieldOptions() {
  // Grouping field selector removed — no longer needed
}

function updateGroupingModeOptions(sheet) {
}

function updateSortOptions(sheet) {
}