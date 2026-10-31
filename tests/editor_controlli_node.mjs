// Runs assets/editor-controlli.js (the checks of the page editor) under Node on every page and on a few samples; prints JSON for tests/test_editor_controlli.py.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const C = createRequire(import.meta.url)("../assets/editor-controlli.js");
const root = path.resolve(import.meta.dirname, "..");
const files = ["index.html", ...fs.readdirSync(path.join(root, "capitoli")).sort().map(f => "capitoli/" + f).filter(f => f.endsWith(".html")), ...fs.readdirSync(path.join(root, "pratica")).sort().map(f => "pratica/" + f).filter(f => f.endsWith(".html"))];
const out = { pages: {}, samples: JSON.parse(fs.readFileSync(0, "utf8")) };
for (const f of files) {
  const t = fs.readFileSync(path.join(root, f), "utf8");
  const S = C.segmenta(t);
  out.pages[f] = { errors: C.controlla(t, true).map(e => [e.riga, e.tipo, e.msg]), seg: S ? S.seg.length : null, rebuilt: S ? t.slice(0, S.ini) + S.seg.map(x => t.slice(x.s, x.e)).join("") + t.slice(S.fine) === t : null };
}
out.samples = out.samples.map(s => C.controlla(s, true).map(e => [e.riga, e.tipo, e.msg]));
console.log(JSON.stringify(out));
