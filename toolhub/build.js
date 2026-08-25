/**
 * toolhub/build.js
 * Scans all .sf files in this folder and generates tools.json.
 * Run: node build.js
 */
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith(".sf"));
const tools = [];

const TAG_RULES = [
  { pattern: /export|csv|xlsx/i, tag: "export" },
  { pattern: /filter|search|find/i, tag: "filter" },
  { pattern: /sort|group|order/i, tag: "organize" },
  { pattern: /edit|modify|cell/i, tag: "edit" },
  { pattern: /hide|restore|visibility/i, tag: "visibility" },
  { pattern: /automat|rule|addon/i, tag: "automation" },
  { pattern: /summary|stat|count/i, tag: "data" },
  { pattern: /sdk|demo|showcase/i, tag: "sdk" },
  { pattern: /replace/i, tag: "edit" },
];

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const data = JSON.parse(raw);
    const t = data.tool || {};
    const name = t.name || file.replace(/\.sf$/, "");
    const desc = t.description || "";
    const combined = name + " " + desc;

    const tags = [];
    for (const rule of TAG_RULES) {
      if (rule.pattern.test(combined) && !tags.includes(rule.tag)) {
        tags.push(rule.tag);
      }
    }

    tools.push({
      file: file,
      name: name,
      icon: t.icon || "\u2699",
      description: desc,
      author: t.author || "",
      version: t.version || "1.0.0",
      tags: tags
    });
    console.log("  + " + file + " -> " + name + (tags.length ? " [" + tags.join(", ") + "]" : ""));
  } catch (e) {
    console.log("  ! Skipping " + file + ": " + e.message);
  }
}

tools.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(path.join(dir, "tools.json"), JSON.stringify(tools, null, 2), "utf8");
console.log("\nGenerated tools.json with " + tools.length + " tool(s).");
