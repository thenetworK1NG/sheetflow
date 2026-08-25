<p align="center">
  <img src="Main/icons/icon-192.png" width="72" alt="Sheetflow icon">
</p>

<h1 align="center">Sheetflow</h1>

<p align="center">
  <strong>Review, organize, and export cleaner spreadsheets — without touching the original file.</strong>
</p>

<p align="center">
  <a href="https://thenetworK1NG.github.io/exel/Main/index.html">Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="#features">Features</a> &nbsp;&middot;&nbsp;
  <a href="#tool-system">Tools</a> &nbsp;&middot;&nbsp;
  <a href="#privacy">Privacy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20offline-yes-brightgreen" alt="Works offline">
  <img src="https://img.shields.io/badge/zero%20uploads-blue" alt="Zero uploads">
  <img src="https://img.shields.io/badge/PWA-ready-6b4ce6" alt="PWA ready">
  <img src="https://img.shields.io/badge/license-proprietary-gray" alt="Proprietary license">
</p>

---

Sheetflow is a browser-based spreadsheet workspace that helps you review, group, hide, and export business data. Drop in a file, clean it up, and export a polished version — nothing is uploaded, rewritten, or reordered behind your back.

## Quick Start

1. Open **[Sheetflow](https://thenetworK1NG.github.io/exel/Main/index.html)** in your browser
2. Drop an **XLSX**, **CSV**, or **TSV** file into the workspace
3. Search, group, hide rows, and export the clean version

No account. No server. No setup.

## Features

| Feature | What it does |
|---------|-------------|
| **Import XLSX / CSV / TSV** | Drag-and-drop or file picker. Auto-detects delimiters, headers, and field types. |
| **Duplicate detection** | Finds repeated records and groups rows by any column — location, warehouse, status, etc. |
| **Row visibility** | Hide rows you don't want to carry forward. Restore them anytime. |
| **Search & filter** | Full-text search across every cell. Filter by active, hidden, or duplicate rows. |
| **Export XLSX & CSV** | Exports only the visible rows. Original row order is always preserved. |
| **Automation rules** | Create rules that automatically hide matching rows. Run them with one click. |
| **Addons** | Write custom JavaScript that processes your spreadsheet data. Share or password-protect them. |
| **Tool system** | Install portable `.sf` tool packages to extend Sheetflow without touching the core app. |
| **Undo / Redo** | Every hide, restore, and group action can be undone. |
| **PWA** | Install as a desktop or mobile app. Works offline after first load. |

## Tool System

Sheetflow has a built-in tool system. Tools are portable packages (`.sf` files) that anyone can create and share.

**Included tools:**
- **Sheet Editor** — Click any cell to edit its value directly

**Install a tool:**
1. Click **Tools** in the topbar
2. Click **Install tool**
3. Select a `.sf` file

**Create your own tool:**

Create a `.sf` file (JSON format) and call `registerTool()`:

```json
{
  "format": "sheetflow-tool",
  "version": 1,
  "tool": {
    "id": "my-tool",
    "name": "My Tool",
    "icon": "⚙",
    "description": "What this tool does.",
    "author": "Your Name",
    "version": "1.0.0",
    "code": "registerTool({\n  id: 'my-tool',\n  name: 'My Tool',\n  icon: '⚙',\n  description: 'What this tool does.',\n  activate: function() { /* runs when tool is opened */ },\n  deactivate: function() { /* runs when tool is closed */ }\n});"
  }
}
```

**Available inside tool code** (no imports needed):
- `refs.*` — all DOM elements
- `state.*` — app state
- `currentSheet()` — active sheet data
- `refresh()` — re-render the table
- `showToast()` — show notifications
- `valueToString()`, `normalizeText()`, `escapeHTML()` — utilities

Tools can inject CSS, hook into the render cycle, create UI panels, and modify cell data — all without changing a single line of the core app.

## Project Structure

```
exel/
├── index.html              # Landing page
├── styles.css              # Landing page styles
├── networKING.svg          # Brand logo
├── tools/                  # Distributable .sf tool packages
│   └── find-replace.sf     # Find & Replace tool (installable)
└── Main/                   # The workspace app
    ├── index.html          # Main app
    ├── styles.css          # App styles (33 KB)
    ├── manifest.webmanifest
    ├── service-worker.js
    ├── icons/
    ├── addon-instructions.html
    └── js/
        ├── core.js         # DOM refs, state, constants
        ├── utils.js        # Text helpers
        ├── storage.js      # localStorage CRUD
        ├── crypto.js       # AES-256-GCM encryption
        ├── csv-parser.js   # Delimiter detection & parsing
        ├── sheet.js        # Header detection, column mapping
        ├── grouping.js     # Duplicate keys, groups
        ├── automation.js   # Rule matching & rendering
        ├── addons.js       # Addon CRUD & execution
        ├── table.js        # Table rendering, filtering, sorting
        ├── ui.js           # Toast, stats, controls
        ├── undo.js         # Visibility snapshots
        ├── export.js       # CSV & XLSX export
        ├── actions.js      # Hide/restore, file import
        ├── conversion.js   # Rule-to-addon conversion
        ├── events.js       # All event listeners
        ├── init.js         # Startup sequence
        ├── tools.js        # Tool registry & management
        └── tools/
            └── sheet-editor.js  # Built-in cell editor
```

## Tech Stack

- **Vanilla JavaScript** — no frameworks, no build step
- **SheetJS** — XLSX parsing and export
- **Web Crypto API** — AES-256-GCM encryption for addon protection
- **Service Worker** — offline caching
- **CSS Custom Properties** — responsive design, light theme

## Privacy

Sheetflow processes everything locally in your browser. No data is ever uploaded to a server. Your spreadsheet stays on your device.

## License

Copyright &copy; networKING. All rights reserved.

Sheetflow and its entire source code are owned and maintained by **[networKING](https://github.com/thenetworK1NG)**. Unauthorized reproduction, redistribution, or modification of this software, in whole or in part, is prohibited without explicit written permission from networKING.
