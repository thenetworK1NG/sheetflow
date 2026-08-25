function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  return [",", "\t", ";"].reduce((best, candidate) => {
    const score = firstLine.split(candidate).length;
    return score > best.score ? { candidate, score } : best;
  }, { candidate: ",", score: 0 }).candidate;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"' && field.length === 0) quoted = true;
    else if (character === delimiter) { row.push(field); field = ""; }
    else if (character === "\r" || character === "\n") {
      row.push(field); field = "";
      if (row.some((value) => value !== "") || row.length > 1) rows.push(row);
      row = [];
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else field += character;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "") || row.length > 1) rows.push(row);
  }
  return rows;
}