const toolRegistry = new Map();
const toolStorageKey = "sheetflow-tools-v1";
const toolActiveKey = "sheetflow-active-tools";
const refreshChain = [];

const BASE_APP_IDS = new Set([
  "fileInput","dropZone",
  "workspaceDot","topStatus","clearButton","exportXlsxButton",
  "tableTitle","tableSubtitle","tableScroll","tableHead",
  "tableBody","emptyState","emptyTitle","emptyCopy","resultCount","toast","toolsButton",
  "toolsCount","toolsOverlay","toolsPanel","toolsList","closeToolsButton","installToolButton","installToolInput",
  "pageControls","pageStatus","previousPageButton","nextPageButton",
  "sfModalContainer","toolActionSlot","toolDropdownSlot"
]);

const BASE_GLOBALS = new Set([
  "$","refs","state","headerHints","emptyToken","toolRegistry","toolStorageKey",
  "refreshChain","chainRefresh","unchainRefresh","registerTool",
  "getTool","getAllTools","renderToolsButton","openToolsPanel","closeToolsPanel",
  "getInstalledToolData","saveInstalledToolData","loadInstalledTools","installTool",
  "uninstallTool","exportTool","importToolFile","renderToolsList","updateToolBar",
  "activateTool","deactivateTool","deactivateAllTools","handleToolsPanelClick",
  "saveActiveTools","restoreActiveTools","showToast","setEngineStatus","updateControls",
  "refresh","resetPage","updatePageControls","pageItems","hasEngine","escapeHTML",
  "valueToString","normalizeText","formatNumber","parseNumber","formatCell","padRow",
  "isBlankRow","copySelectedCell","downloadText","detectHeaderIndex","makeHeaderLabels",
  "findColumn","buildSheetState","currentSheet","placeSidebarSettings","columnLabel",
  "productFieldLabel","groupingFieldLabel","valueFieldLabel","refreshGroupingFieldOptions",
  "updateGroupingModeOptions","updateSortOptions","productText","groupingText",
  "groupingLabel","duplicateKey","groupToken","groupKeyFromToken","buildGroups",
  "groupLabel","groupFieldValues","groupQuantity","detectDelimiter","parseDelimited",
  "matchesSearch","matchesScope","compareRows","displayRows","displayGroups",
  "selectedRowsForView","selectAllState","rawTable","groupDetails","groupedTable",
  "renderTable","renderSelection","captureVisibility","sameVisibility","restoreVisibility",
  "commitVisibilityHistory","resetHistory","undo","redo","toggleRow","toggleGroupHidden",
  "toggleGroupExpanded","applyToSelected","hideZeroQuantity","restoreAll","clearWorkspace",
  "rowById","importFile","exportRows","exportBaseName","csvValue","exportCsv","exportXlsx",
  "handleTableClick","handleTableChange","handleKeyboardShortcuts",
  "sf","toggleSidebar"
]);

const FORBIDDEN_PATTERNS = [
  { pattern: /window\.refresh\s*=/, name: "window.refresh assignment", severity: "error",
    fix: "Use chainRefresh(fn) / unchainRefresh(fn) instead of monkey-patching window.refresh." },
  { pattern: /window\.renderTable\s*=/, name: "window.renderTable assignment", severity: "error",
    fix: "Use chainRefresh(fn) to hook into refresh instead of overriding renderTable." },
  { pattern: /window\.handleKeyboardShortcuts\s*=/, name: "window.handleKeyboardShortcuts assignment", severity: "warning",
    fix: "Tools should not override keyboard shortcuts. The base app handles Escape for tool deactivation." },
  { pattern: /\beval\s*\(/, name: "eval()", severity: "error",
    fix: "eval() is not allowed in tool code for security reasons." },
  { pattern: /document\.write\s*\(/, name: "document.write()", severity: "error",
    fix: "document.write() is not allowed. Use DOM manipulation instead." },
  { pattern: /document\.cookie\s*=/, name: "document.cookie assignment", severity: "warning",
    fix: "Direct cookie manipulation is discouraged. Use localStorage via the tool API." }
];

const DANGEROUS_GLOBAL_WRITE_PATTERNS = [
  { pattern: /(?:var|let|const)\s+(refresh|renderTable|handleKeyboardShortcuts|showToast|currentSheet|escapeHTML|formatNumber)\s*=/,
    name: "Overwriting base app function", severity: "error",
    fix: "Do not redefine base app functions. Use your own namespaced functions instead." }
];

function validateToolCode(code, toolId) {
  var warnings = [];
  var errors = [];
  if (typeof code !== "string") return { valid: false, errors: ["Tool code must be a string."], warnings: [] };

  FORBIDDEN_PATTERNS.forEach(function(rule) {
    if (rule.pattern.test(code)) {
      if (rule.severity === "error") errors.push({ message: rule.name + " detected.", fix: rule.fix });
      else warnings.push({ message: rule.name + " detected.", fix: rule.fix });
    }
  });

  DANGEROUS_GLOBAL_WRITE_PATTERNS.forEach(function(rule) {
    if (rule.pattern.test(code)) {
      errors.push({ message: rule.name + ".", fix: rule.fix });
    }
  });

  var idPrefix = toolId ? toolId.replace(/[^a-z0-9]/gi, "").substring(0, 8) + "_" : "";
  var createElementMatches = code.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/g) || [];
  createElementMatches.forEach(function(match) {
    var idMatch = match.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/);
    if (idMatch) {
      var id = idMatch[1];
      if (BASE_APP_IDS.has(id)) {
        errors.push({ message: "Element ID '" + id + "' clashes with a base app element.", fix: "Prefix all element IDs with your tool ID (e.g. '" + idPrefix + id + "')." });
      }
    }
  });

  var innerHTMLMatches = code.match(/innerHTML\s*=\s*["'][^"']*id\s*=\s*["']([^"']+)["']/g) || [];
  innerHTMLMatches.forEach(function(match) {
    var idMatch = match.match(/id\s*=\s*["']([^"']+)["']/);
    if (idMatch) {
      var id = idMatch[1];
      if (BASE_APP_IDS.has(id)) {
        errors.push({ message: "Generated element ID '" + id + "' clashes with a base app element.", fix: "Prefix all element IDs with your tool ID." });
      }
    }
  });

  var otherTools = getAllTools();
  otherTools.forEach(function(other) {
    if (other.id === toolId) return;
    var otherData = getInstalledToolData().find(function(t) { return t.id === other.id; });
    if (otherData && otherData.code) {
      var otherIds = (otherData.code.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/g) || []).map(function(m) {
        var r = m.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/);
        return r ? r[1] : null;
      }).filter(Boolean);
      var myIds = createElementMatches.map(function(m) {
        var r = m.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/);
        return r ? r[1] : null;
      }).filter(Boolean);
      myIds.forEach(function(myId) {
        if (otherIds.indexOf(myId) !== -1 && myId.indexOf(toolId) === -1 && myId.indexOf(other.id) === -1) {
          warnings.push({ message: "Element ID '" + myId + "' may clash with tool '" + other.name + "'.", fix: "Use a unique prefix for your element IDs." });
        }
      });
    }
  });

  return { valid: errors.length === 0, errors: errors, warnings: warnings };
}

function detectToolClashes(toolId) {
  var tool = toolRegistry.get(toolId);
  if (!tool) return [];
  var clashes = [];
  var myData = getInstalledToolData().find(function(t) { return t.id === toolId; });
  if (!myData || !myData.code) return clashes;

  var otherTools = getAllTools();
  otherTools.forEach(function(other) {
    if (other.id === toolId) return;
    var otherData = getInstalledToolData().find(function(t) { return t.id === other.id; });
    if (!otherData || !otherData.code) return;

    var myCode = myData.code;
    var otherCode = otherData.code;

    var myRefreshHooks = (myCode.match(/chainRefresh/g) || []).length;
    var otherRefreshHooks = (otherCode.match(/chainRefresh/g) || []).length;
    if (myRefreshHooks > 0 && otherRefreshHooks > 0) {
      var myTableOverrides = myCode.match(/tableHead\.innerHTML|tableBody\.innerHTML/g) || [];
      var otherTableOverrides = otherCode.match(/tableHead\.innerHTML|tableBody\.innerHTML/g) || [];
      if (myTableOverrides.length > 0 && otherTableOverrides.length > 0) {
        clashes.push({
          type: "render-override",
          severity: "warning",
          message: tool.name + " and " + other.name + " both override table rendering.",
          detail: "Both tools replace the table content during refresh. The last registered hook will determine the final table appearance."
        });
      }
    }

    var myEventListeners = (myCode.match(/addEventListener/g) || []).length;
    var otherEventListeners = (otherCode.match(/addEventListener/g) || []).length;
    if (myEventListeners > 3 && otherEventListeners > 3) {
      clashes.push({
        type: "event-heavy",
        severity: "info",
        message: tool.name + " and " + other.name + " both add many event listeners.",
        detail: "If both tools listen to the same elements, events may fire multiple times."
      });
    }
  });

  return clashes;
}

function scanToolOnInstall(toolData) {
  if (!toolData || !toolData.code) return { passed: true, errors: [], warnings: [] };
  var validation = validateToolCode(toolData.code, toolData.id);
  return {
    passed: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings
  };
}

function chainRefresh(fn) {
  if (typeof fn === "function" && refreshChain.indexOf(fn) === -1) refreshChain.push(fn);
}

function unchainRefresh(fn) {
  var index = refreshChain.indexOf(fn);
  if (index > -1) refreshChain.splice(index, 1);
}

function registerTool(tool) {
  if (!tool || !tool.id) return;
  toolRegistry.set(tool.id, tool);
  renderToolsButton();
}

function getTool(id) { return toolRegistry.get(id); }
function getAllTools() { return Array.from(toolRegistry.values()); }

function renderToolsButton() {
  refs.toolsCount.textContent = formatNumber(toolRegistry.size);
}

function openToolsPanel() {
  state.toolsPanelOpen = true;
  refs.toolsOverlay.hidden = false;
  refs.toolsButton.setAttribute("aria-expanded", "true");
  renderToolsList();
}

function closeToolsPanel() {
  state.toolsPanelOpen = false;
  refs.toolsOverlay.hidden = true;
  refs.toolsButton.setAttribute("aria-expanded", "false");
}

function getInstalledToolData() {
  try {
    if (typeof localStorage === "undefined") return [];
    var saved = JSON.parse(localStorage.getItem(toolStorageKey) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(function(t) { return t && typeof t === "object" && t.id; });
  } catch (e) {
    return [];
  }
}

function saveInstalledToolData(tools) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(toolStorageKey, JSON.stringify(tools));
  } catch (e) {
    console.warn("Tools could not be saved.", e);
  }
}

function loadInstalledTools() {
  var tools = getInstalledToolData();
  tools.forEach(function(toolData) {
    if (!toolData.code) return;
    try {
      new Function(toolData.code)();
    } catch (e) {
      console.error("Failed to load tool:", toolData.name, e);
    }
  });
  renderToolsButton();
}

function installTool(toolData) {
  if (!toolData || !toolData.id || !toolData.name || !toolData.code) {
    return { success: false, error: "Invalid tool file." };
  }
  if (toolRegistry.has(toolData.id)) {
    return { success: false, error: "A tool with this ID is already installed." };
  }
  var scan = scanToolOnInstall(toolData);
  if (!scan.passed) {
    var errorMessages = scan.errors.map(function(e) { return e.message + " " + e.fix; }).join("\n");
    return { success: false, error: "Tool failed security scan:\n" + errorMessages };
  }
  if (scan.warnings.length > 0) {
    scan.warnings.forEach(function(w) {
      console.warn("Tool warning for '" + toolData.name + "': " + w.message + " " + w.fix);
    });
  }
  try {
    new Function(toolData.code)();
  } catch (e) {
    return { success: false, error: "Tool code error: " + e.message };
  }
  var installed = getInstalledToolData();
  installed.push({
    id: String(toolData.id),
    name: String(toolData.name),
    icon: String(toolData.icon || "\u2699"),
    description: String(toolData.description || ""),
    author: String(toolData.author || ""),
    version: String(toolData.version || "1.0.0"),
    code: String(toolData.code)
  });
  saveInstalledToolData(installed);
  renderToolsList();
  renderToolsButton();
  return { success: true, warnings: scan.warnings };
}

function uninstallTool(id) {
  if (state.activeToolIds.has(id)) deactivateTool(id);
  toolRegistry.delete(id);
  var installed = getInstalledToolData().filter(function(t) { return t.id !== id; });
  saveInstalledToolData(installed);
  renderToolsList();
  renderToolsButton();
  showToast("Tool uninstalled.", "success");
}

function exportTool(id) {
  var tool = toolRegistry.get(id);
  if (!tool) return;
  var installed = getInstalledToolData().find(function(t) { return t.id === id; });
  var exportData = {
    format: "sheetflow-tool",
    version: 1,
    tool: {
      id: tool.id,
      name: tool.name,
      icon: tool.icon || "\u2699",
      description: tool.description || "",
      author: installed ? installed.author : "Sheetflow",
      version: installed ? installed.version : "1.0.0",
      code: installed ? installed.code : ""
    }
  };
  var filename = tool.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".sf";
  downloadText(JSON.stringify(exportData, null, 2), filename, "application/json");
}

function importToolFile(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (data.format !== "sheetflow-tool" || !data.tool) {
        showToast("Invalid tool file.", "error");
        return;
      }
      var result = installTool(data.tool);
      if (result.success) {
        var msg = "Installed: " + data.tool.name;
        if (result.warnings && result.warnings.length > 0) {
          msg += " (" + result.warnings.length + " warning" + (result.warnings.length === 1 ? "" : "s") + " — check console)";
        }
        showToast(msg, "success");
      } else {
        showToast(result.error, "error");
      }
    } catch (err) {
      showToast("Could not read tool file.", "error");
    }
  };
  reader.readAsText(file);
}

function renderToolsList() {
  var tools = getAllTools();
  if (!tools.length) {
    refs.toolsList.innerHTML = '<div class="automation-empty">No tools available. Install a .sf tool file to get started.</div>';
    return;
  }
  refs.toolsList.innerHTML = tools.map(function(tool) {
    var isActive = state.activeToolIds.has(tool.id);
    var clashes = detectToolClashes(tool.id);
    var clashBadge = "";
    if (clashes.length > 0) {
      var warnCount = clashes.filter(function(c) { return c.severity === "warning"; }).length;
      var infoCount = clashes.filter(function(c) { return c.severity === "info"; }).length;
      if (warnCount > 0) clashBadge = '<span class="tool-clash-badge tool-clash-warn" title="' + escapeHTML(clashes.filter(function(c) { return c.severity === "warning"; }).map(function(c) { return c.message; }).join("; ")) + '">' + warnCount + ' warning' + (warnCount === 1 ? "" : "s") + '</span>';
      if (infoCount > 0) clashBadge += '<span class="tool-clash-badge tool-clash-info" title="' + escapeHTML(clashes.filter(function(c) { return c.severity === "info"; }).map(function(c) { return c.message; }).join("; ")) + '">' + infoCount + ' note' + (infoCount === 1 ? "" : "s") + '</span>';
    }
    var tag = '<span class="addon-encrypted-badge">Installed</span>';
    var uninstallBtn = '<button class="button button-danger button-small" type="button" data-tool-action="uninstall" data-tool-id="' + escapeHTML(tool.id) + '">Uninstall</button>';
    return '<div class="tool-card' + (isActive ? ' tool-card-active' : '') + '">'
      + '<div class="tool-card-icon">' + (tool.icon || "\u2699") + '</div>'
      + '<div class="tool-card-copy"><strong>' + escapeHTML(tool.name) + '</strong><p>' + escapeHTML(tool.description || "") + '</p>' + tag + clashBadge + '</div>'
      + '<div class="tool-card-actions">'
      + '<label class="tool-toggle"><input type="checkbox" class="tool-toggle-input" data-tool-action="toggle" data-tool-id="' + escapeHTML(tool.id) + '"' + (isActive ? ' checked' : '') + '><span class="tool-toggle-track"></span></label>'
      + uninstallBtn
      + '</div></div>';
  }).join("");
}

function updateToolBar() {
  var count = state.activeToolIds.size;
  var ws = document.querySelector(".workspace");
  if (ws) ws.classList.toggle("tool-active", count > 0);
}

function activateTool(id) {
  if (state.activeToolIds.has(id)) return;
  var tool = toolRegistry.get(id);
  if (!tool) return;

  var clashes = detectToolClashes(id);
  if (clashes.length > 0) {
    clashes.forEach(function(c) {
      var prefix = c.severity === "warning" ? "Tool warning" : "Tool note";
      console.warn(prefix + " (" + tool.name + "): " + c.message + " " + c.detail);
    });
  }

  state.activeToolIds.add(id);
  saveActiveTools();
  try {
    if (tool.activate) tool.activate();
  } catch (e) {
    console.error("Tool activate failed:", tool.name, e);
    state.activeToolIds.delete(id);
    saveActiveTools();
    showToast(tool.name + " failed to start.", "error");
    return;
  }
  closeToolsPanel();
  updateToolBar();
  renderToolsList();
  refresh();
}

function deactivateTool(id) {
  var tool = toolRegistry.get(id);
  if (tool && tool.deactivate) {
    try { tool.deactivate(); } catch (e) {
      console.error("Tool deactivate failed:", tool.name, e);
    }
  }
  state.activeToolIds.delete(id);
  saveActiveTools();
  updateToolBar();
  renderToolsList();
  refresh();
}

function saveActiveTools() {
  try {
    localStorage.setItem(toolActiveKey, JSON.stringify(Array.from(state.activeToolIds)));
  } catch (e) {}
}

function restoreActiveTools() {
  try {
    var saved = JSON.parse(localStorage.getItem(toolActiveKey) || "[]");
    if (!Array.isArray(saved)) return;
    saved.forEach(function(id) {
      if (toolRegistry.has(id)) {
        activateTool(id);
      }
    });
  } catch (e) {}
}

function deactivateAllTools() {
  var ids = Array.from(state.activeToolIds);
  ids.forEach(function(id) { deactivateTool(id); });
}

function handleToolsPanelClick(event) {
  var action = event.target.closest("[data-tool-action]");
  if (!action) return;
  if (action.dataset.toolAction === "toggle") {
    if (action.checked) {
      activateTool(action.dataset.toolId);
    } else {
      deactivateTool(action.dataset.toolId);
    }
  } else if (action.dataset.toolAction === "activate") {
    activateTool(action.dataset.toolId);
  } else if (action.dataset.toolAction === "deactivate") {
    deactivateTool(action.dataset.toolId);
  } else if (action.dataset.toolAction === "export") {
    exportTool(action.dataset.toolId);
  } else if (action.dataset.toolAction === "uninstall") {
    if (confirm("Uninstall this tool? It will be removed from Sheetflow.")) uninstallTool(action.dataset.toolId);
  }
}
