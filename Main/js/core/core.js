const $ = (id) => document.getElementById(id);

const refs = {
  fileInput: $("fileInput"), dropZone: $("dropZone"),
  workspaceDot: $("workspaceDot"),
  topStatus: $("topStatus"),
  clearButton: $("clearButton"), exportXlsxButton: $("exportXlsxButton"),
  tableTitle: $("tableTitle"),
  tableSubtitle: $("tableSubtitle"),
  tableScroll: $("tableScroll"), tableHead: $("tableHead"), tableBody: $("tableBody"), emptyState: $("emptyState"),
  emptyTitle: $("emptyTitle"), emptyCopy: $("emptyCopy"), resultCount: $("resultCount"),
  toast: $("toast"),
  toolsButton: $("toolsButton"), toolsCount: $("toolsCount"), toolsOverlay: $("toolsOverlay"), toolsPanel: $("toolsPanel"), toolsList: $("toolsList"), closeToolsButton: $("closeToolsButton"),
  installToolButton: $("installToolButton"), installToolInput: $("installToolInput"),
  pageControls: $("pageControls"), pageStatus: $("pageStatus"), previousPageButton: $("previousPageButton"), nextPageButton: $("nextPageButton"),
  sidebar: $("sidebar"), sidebarToggle: $("sidebarToggle"), sidebarEdge: $("sidebarEdge"),
  mobileImportButton: $("mobileImportButton")
};

const state = {
  fileName: "", sourceType: "", workbook: null, sheetStates: new Map(), currentSheet: "",
  expandedGroups: new Set(), selectedIds: new Set(), selectedCell: null, toastTimer: null,
  loading: false, loadingFileName: "", page: 1, pageSize: 250,
  toolsPanelOpen: false, activeToolIds: new Set(), duplicateMode: "product",
  history: [], historyIndex: -1
};

const headerHints = ["location", "store", "branch", "site", "warehouse", "department", "division", "region", "area", "room", "section", "zone", "project", "team", "category", "customer", "client", "order", "case", "ticket", "record", "product", "item", "sku", "description", "quantity", "qty", "stock", "units", "amount", "total", "value", "balance", "count", "name"];
const emptyToken = "<empty>";
