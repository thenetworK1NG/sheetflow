function productText(row, sheet) {
  if (sheet.productColumn !== null) return valueToString(row.values[sheet.productColumn]);
  return row.values.filter((value, index) => index !== sheet.locationColumn && index !== sheet.quantityColumn).map(valueToString).filter((value) => value.trim()).join(" | ");
}

function groupingText(row, sheet) {
  return sheet.locationColumn === null ? "" : valueToString(row.values[sheet.locationColumn]);
}

function groupingLabel(sheet = currentSheet()) {
  if (state.duplicateMode === "location") return `${groupingFieldLabel(sheet)} values`;
  if (state.duplicateMode === "product-location") return `${productFieldLabel(sheet)} + ${groupingFieldLabel(sheet)}`;
  if (state.duplicateMode === "exact") return "exact matching rows";
  return `${productFieldLabel(sheet)} values`;
}

function duplicateKey(row, sheet) {
  if (state.duplicateMode === "exact") {
    const key = row.values.map(normalizeText).join(String.fromCharCode(31));
    return key || `blank-row-${row.id}`;
  }
  if (state.duplicateMode === "location") {
    const key = normalizeText(groupingText(row, sheet));
    return key || `blank-grouping-field-${row.id}`;
  }
  if (state.duplicateMode === "product-location") {
    const key = [normalizeText(productText(row, sheet)), normalizeText(groupingText(row, sheet))].join(String.fromCharCode(31));
    return key !== String.fromCharCode(31) ? key : `blank-row-${row.id}`;
  }
  const key = normalizeText(productText(row, sheet));
  return key || `blank-row-${row.id}`;
}

function groupToken(key) {
  return encodeURIComponent(key);
}

function groupKeyFromToken(token) {
  try { return decodeURIComponent(token); }
  catch (error) { return token; }
}

function buildGroups(sheet) {
  if (sheet.groupCache && sheet.groupCache.has(state.duplicateMode)) return sheet.groupCache.get(state.duplicateMode);
  const groups = new Map();
  sheet.rows.forEach((row) => {
    const key = duplicateKey(row, sheet);
    if (!groups.has(key)) groups.set(key, { key, rows: [] });
    groups.get(key).rows.push(row);
  });
  if (!sheet.groupCache) sheet.groupCache = new Map();
  sheet.groupCache.set(state.duplicateMode, groups);
  return groups;
}

function groupLabel(group, sheet) {
  const row = group.rows[0];
  let text;
  if (state.duplicateMode === "location") {
    text = groupingText(row, sheet).trim() || `${groupingFieldLabel(sheet)} not set`;
  } else if (state.duplicateMode === "product-location") {
    const product = productText(row, sheet).trim() || "Unlabelled record";
    const groupingValue = groupingText(row, sheet).trim() || `${groupingFieldLabel(sheet)} not set`;
    text = `${product} / ${groupingValue}`;
  } else {
    text = state.duplicateMode === "product" ? productText(row, sheet) : (sheet.productColumn !== null ? productText(row, sheet) : row.values.map(valueToString).filter((value) => value.trim()).join(" | "));
  }
  return text.trim() || "Unlabelled row";
}

function groupFieldValues(group, sheet) {
  if (sheet.locationColumn === null) return "Choose a grouping field";
  const values = Array.from(new Set(group.rows.map((row) => valueToString(row.values[sheet.locationColumn]).trim()).filter(Boolean)));
  return values.length ? values.join(", ") : `${groupingFieldLabel(sheet)} not set`;
}

function groupQuantity(group, sheet, visibleOnly) {
  if (sheet.quantityColumn === null) return "-";
  const values = group.rows.filter((row) => !visibleOnly || !row.hidden).map((row) => parseNumber(row.values[sheet.quantityColumn])).filter((value) => value !== null);
  return values.length ? formatNumber(values.reduce((total, value) => total + value, 0)) : "-";
}