// Undo/redo history and local draft of the Teoria editor (mzlab/web/libro/storia.js); prints one JSON object. See tests/test_teoria_editor.py.
import { makeHistory, saveDraft, loadDraft, clearDraft } from "../mzlab/web/libro/storia.js";

const store = () => {
  const d = new Map();
  return { getItem: (k) => (d.has(k) ? d.get(k) : null), setItem: (k, v) => void d.set(k, String(v)), removeItem: (k) => void d.delete(k), dump: () => JSON.stringify([...d]) };
};
const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };

const out = {};
const h = makeHistory("a");
out.same = h.record("a");
h.record("b");
h.record("c");
out.undo = [h.undo(), h.undo(), h.undo()];
out.redo = [h.redo(), h.redo(), h.redo()];

const g = makeHistory("a");
g.record("b");
g.record("c");
g.undo();
g.record("x");                                   // a step after an undo drops the redo states
out.branch = { canRedo: g.canRedo(), now: g.current(), back: g.undo() };

const l = makeHistory("1", 3);
["2", "3", "4"].forEach((t) => l.record(t));
out.limit = [l.undo(), l.undo(), l.undo()];

const s = store();
const draft = { text: "testo", base: "sha1", summary: "s", saved: "2026-10-20T10:00:00Z" };
out.saved = saveDraft("12-dati.md", draft, s);
out.raw = s.dump();
out.loaded = loadDraft("12-dati.md", s);
out.other = loadDraft("00-uso.md", s);
s.setItem("mzlab.libro.teoria.draft.bad.md", "{not json");
out.bad = loadDraft("bad.md", s);
clearDraft("12-dati.md", s);
out.cleared = loadDraft("12-dati.md", s);
out.blocked = [saveDraft("12-dati.md", draft, blocked), loadDraft("12-dati.md", blocked)];
console.log(JSON.stringify(out));
