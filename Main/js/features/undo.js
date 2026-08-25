function captureVisibility() {
  const snapshot = new Map();
  state.sheetStates.forEach((sheet, name) => snapshot.set(name, sheet.rows.map((row) => Boolean(row.hidden))));
  return snapshot;
}

function sameVisibility(first, second) {
  if (first.size !== second.size) return false;
  for (const [name, values] of first) {
    const other = second.get(name);
    if (!other || values.length !== other.length || values.some((value, index) => value !== other[index])) return false;
  }
  return true;
}

function restoreVisibility(snapshot) {
  snapshot.forEach((values, name) => {
    const sheet = state.sheetStates.get(name);
    if (!sheet) return;
    sheet.rows.forEach((row, index) => { row.hidden = Boolean(values[index]); });
  });
}

function commitVisibilityHistory(label, before) {
  const after = captureVisibility();
  if (sameVisibility(before, after)) return false;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push({ label, before, after });
  if (state.history.length > 50) state.history.shift();
  state.historyIndex = state.history.length - 1;
  return true;
}

function resetHistory() {
  state.history = [];
  state.historyIndex = -1;
}

function undo() {
  if (state.historyIndex < 0) {
    showToast("There is nothing to undo.");
    return;
  }
  const entry = state.history[state.historyIndex];
  restoreVisibility(entry.before);
  state.historyIndex -= 1;
  state.selectedIds.clear();
  state.selectedCell = null;
  refresh();
  showToast(`Undid ${entry.label}.`, "success");
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) {
    showToast("There is nothing to redo.");
    return;
  }
  const entry = state.history[state.historyIndex + 1];
  restoreVisibility(entry.after);
  state.historyIndex += 1;
  state.selectedIds.clear();
  state.selectedCell = null;
  refresh();
  showToast(`Redid ${entry.label}.`, "success");
}