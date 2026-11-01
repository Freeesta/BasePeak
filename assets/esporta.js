/* BasePeak - Teoria: export of a chapter or of the whole handbook (PDF, Markdown, Word, HTML). Classic script, no network but the pages of the site itself.
   Everything is generated from the pages as the reader sees them. Notes on what is deliberate:
   - the whole-handbook files are built only when EVERY chapter was read: a partial file is never handed out as «tutta la Teoria»;
   - from file:// a browser does not let a page read its sibling files: the single chapter works, the package says so (or uses the local server, tools/server_teoria.py);
   - the PDF of the package is the print dialog of THIS page (a hidden #print-pack shown only to the printer): no pop-up window, which browsers block once the chapters have been loaded;
   - the object URL of a download is released only after a minute (Firefox and Safari cancel a download whose URL is revoked at once);
   - links and images are made absolute / embedded so that the downloaded file works offline;
   - every file is «smart»: each chapter has an id (cap-NN), its heading / figure ids are namespaced (cap-NN--id) so they never clash, and links between chapters that are IN the same file
     become in-file anchors (#cap-04--frammentazione); links to chapters that are not in the file stay absolute site URLs (see prepareChapters / linkChapters). */
"use strict";

(function () {
  const SITE = (window.TEORIA && window.TEORIA.sito) || { here: location.pathname.split("/").pop() || "index.html", up: "", root: location.href, assets: "" };   // teoria.js has set it
  const here = SITE.here;
  const NAME = "BasePeak";
  const FILE = location.protocol === "file:";
  const T = () => (window.TEORIA = window.TEORIA || {});

  function getChaptersList() {
    const raw = typeof CHAPTERS !== "undefined" ? CHAPTERS : [];
    return raw.filter(c => !c[0].startsWith("pratica"));
  }

  function getCurrentChapter() {
    const raw = typeof CHAPTERS !== "undefined" ? CHAPTERS : [];
    return raw.find(c => c[0] === here) || [here, "", document.title || "Capitolo"];
  }

  const abs = (href, base) => { try { return new URL(href, base).href; } catch (_) { return href; } };
  const escH = t => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

  /** A copy of the <main> of a page without anything that belongs to the screen only (bars, buttons, canvases, phone notes, results of the simulations).
      `base` is the address of the page the node comes from: relative links become absolute, so the downloaded file still points at the right place. */
  function cleanMainElement(mainNode, base = location.href) {
    const cl = mainNode.cloneNode(true);
    cl.querySelectorAll(".pn, .navtop, .ha, .skip, #top, #side, script, style, #ed-bar, #export-modal, .fzoom, #lb, .ctl, .btns, canvas, #phnote, .phex, .readout, .fb, .resume, [hidden]").forEach(e => e.remove());
    cl.querySelectorAll(".tw").forEach(tw => { const t = tw.querySelector("table"); if (t) tw.replaceWith(t); else tw.remove(); });
    cl.querySelectorAll(".g").forEach(sp => sp.replaceWith(document.createTextNode(sp.textContent)));
    // an interactive figure keeps its title and its note; the page says where to find it
    cl.querySelectorAll(".sim, .eispec").forEach(e => {
      const keep = [...e.children].filter(c => /^H[1-6]$/.test(c.tagName) || c.classList.contains("note") || c.classList.contains("src"));
      const p = document.createElement("p"); p.className = "off"; p.innerHTML = "<i>Figura interattiva: si usa sul sito.</i>";
      e.replaceChildren(...keep, p);
    });
    cl.querySelectorAll("[contenteditable], [aria-level], [tabindex], [aria-live], [data-g]").forEach(e => { ["contenteditable", "aria-level", "tabindex", "aria-live", "data-g"].forEach(a => e.removeAttribute(a)); });
    cl.querySelectorAll("a[href]").forEach(a => { const h = a.getAttribute("href"); if (h && !h.startsWith("#") && !/^(mailto|tel|javascript):/i.test(h)) a.setAttribute("href", abs(h, base)); });
    cl.querySelectorAll("img[src]").forEach(i => { i.setAttribute("src", abs(i.getAttribute("src"), base)); i.removeAttribute("loading"); });
    return cl;
  }

  /** Images of the clone are embedded as data: addresses (a self-contained file); one that cannot be read keeps its absolute address. */
  async function inlineImages(cl) {
    await Promise.all([...cl.querySelectorAll("img[src]")].map(async img => {
      const src = img.getAttribute("src"); if (src.startsWith("data:")) return;
      try {
        const res = await fetch(src); if (!res.ok) return;
        const blob = await res.blob();
        const url = await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(blob); });
        img.setAttribute("src", url);
      } catch (_) { /* stays an absolute address */ }
    }));
    return cl;
  }

  let mdTargets = null;   // while a Markdown file is built: the anchors that exist in it (a link to any other #id loses the link and keeps the text)
  const mdAnchor = n => (n.id ? `<a id="${n.id}"></a>\n` : "");
  function walkMd(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/\s+/g, " ");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const ch = () => Array.from(node.childNodes).map(walkMd).join("");
    switch (tag) {
      case "h1": return `\n\n${mdAnchor(node)}# ${ch().trim()}\n\n`;
      case "h2": return `\n\n${mdAnchor(node)}## ${ch().trim()}\n\n`;
      case "h3": return `\n\n${mdAnchor(node)}### ${ch().trim()}\n\n`;
      case "h4": case "h5": case "h6": return `\n\n${mdAnchor(node)}#### ${ch().trim()}\n\n`;
      case "p": return `\n\n${node.classList.contains("lead") ? `> *${ch().trim()}*` : ch().trim()}\n\n`;
      case "br": return "  \n";
      case "hr": return "\n\n---\n\n";
      case "b": case "strong": return `**${ch().trim()}**`;
      case "i": case "em": return `*${ch().trim()}*`;
      case "sub": return `~${ch().trim()}~`;
      case "sup": return `^${ch().trim()}^`;
      case "code": case "kbd": return `\`${ch().trim()}\``;
      case "pre": return `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n`;
      case "a": { const h = node.getAttribute("href") || ""; if (/^file:/i.test(h)) return ch(); if (mdTargets && h.startsWith("#") && !mdTargets.has(h.slice(1))) return ch(); return `[${ch().trim()}](${h})`; }      // opened from disk, a relative link becomes a file:// URL that means nothing in the exported file: keep the text only
      case "img": return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})`;
      case "svg": case "canvas": case "script": case "style": return "";
      case "figure": { const cap = node.querySelector("figcaption"), im = node.querySelector("img"); return `\n\n${im ? walkMd(im) + "\n\n" : ""}${cap ? "*" + cap.textContent.replace(/\s+/g, " ").trim() + "*" : "*(figura: si vede sul sito)*"}\n\n`; }
      case "ul": return `\n\n${Array.from(node.children).filter(c => c.tagName === "LI").map(li => `- ${walkMd(li).trim()}`).join("\n")}\n\n`;
      case "ol": return `\n\n${Array.from(node.children).filter(c => c.tagName === "LI").map((li, i) => `${i + 1}. ${walkMd(li).trim()}`).join("\n")}\n\n`;
      case "li": return ch();
      case "dl": return `\n\n${ch()}\n\n`;
      case "dt": return `\n\n**${ch().trim()}**\n`;
      case "dd": return `: ${ch().trim()}\n`;
      case "blockquote": return `\n\n${ch().trim().split("\n").map(l => `> ${l}`).join("\n")}\n\n`;
      case "div": {
        if (node.classList.contains("box")) {
          // the label of the box is its own first line (<b>…</b>), not a guess from the colour
          const first = node.firstElementChild, lab = first && first.tagName === "B" ? first.textContent.trim() : "";
          const body = Array.from(node.childNodes).filter(n => !(lab && n === first)).map(walkMd).join("").trim();
          return `\n\n> **${lab || "Nota"}**\n${body.split("\n").map(l => `> ${l}`).join("\n")}\n\n`;
        }
        return `\n\n${ch()}\n\n`;
      }
      case "span":
        if (node.classList.contains("eq")) return `\n\n$$\n${Array.from(node.childNodes).filter(n => !(n.classList && n.classList.contains("no"))).map(n => n.textContent).join("").trim()}\n$$\n\n`;
        if (node.classList.contains("frac")) return `(${Array.from(node.children).map(c => c.textContent.trim()).join(")/(")})`;
        return ch();
      case "details": {
        const sm = node.querySelector(":scope > summary"), q = sm ? sm.textContent.trim() : "";
        const rest = Array.from(node.childNodes).filter(n => n !== sm).map(walkMd).join("").trim();
        return node.classList.contains("q") ? `\n\n> **Domanda di ripasso:** ${q}\n>\n> *Risposta:* ${rest.replace(/\n+/g, " ")}\n\n` : `\n\n**${q}**\n\n${rest}\n\n`;
      }
      case "summary": return "";
      case "table": {
        const rows = Array.from(node.querySelectorAll("tr")); if (!rows.length) return "";
        let t = "\n\n";
        rows.forEach((tr, i) => {
          const cells = Array.from(tr.querySelectorAll("th, td")).map(c => c.textContent.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|"));
          t += `| ${cells.join(" | ")} |\n`;
          if (i === 0) t += `| ${cells.map(() => "---").join(" | ")} |\n`;
        });
        return t + "\n";
      }
      default: return ch();
    }
  }

  /** Markdown of a (cleaned) element; with a title the kicker and the first h1 of the page are left out (the title says it).
      opts.anchor: the id of the chapter, written as <a id> (after the title line when opts.anchorAfter, so the file still starts with «# »); opts.toc: Markdown list of the sections. */
  function htmlToMarkdown(element, title = "", opts = {}) {
    const main = element.matches && element.matches("[data-clean]") ? element : cleanMainElement(element);
    if (title) { main.querySelectorAll(".kicker").forEach(e => e.remove()); const h1 = main.querySelector("h1"); if (h1) h1.remove(); }
    const body = walkMd(main).replace(/[ \t]+$/gm, "").replace(/^ +(?=\S)/gm, "").replace(/\n{3,}/g, "\n\n").trim();
    const anc = opts.anchor ? `<a id="${opts.anchor}"></a>` : "";
    const head = (anc && !opts.anchorAfter ? anc + "\n" : "") + (title ? `# ${title}\n` + (anc && opts.anchorAfter ? anc + "\n" : "") + "\n" : "") + (opts.toc ? opts.toc + "\n\n" : "");
    return (head + body).replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  // ---------------------------------------------------------------- links inside the file
  const slugId = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);   // same as slug() of teoria.js
  const capIdOf = (file, i) => { const b = String(file).replace(/^.*\//, "").replace(/\.html$/, ""), m = b.match(/^(\d+)/); return "cap-" + (m ? m[1] : slugId(b) || "x" + i); };
  const chapTitle = c => (c.num && c.num !== "0" ? c.num + ". " : "") + c.title;
  const headText = h => h.textContent.replace(/\s+/g, " ").trim();

  /** Phase 1. Every item {file, num, title, el}: gets a unique block id (c.id = cap-NN), its headings an id (the one teoria.js gives them at run time), and every id of its text (headings, figures,
      figure descriptions...) and every reference to it (aria-*, for, url(#x) of the SVG) is namespaced cap-NN--id. The first h1 (the chapter title) IS the block: its id is c.id. */
  function prepareChapters(items) {
    const caps = new Set();
    items.forEach((c, i) => {
      let id = capIdOf(c.file, i); while (caps.has(id)) id += "x"; caps.add(id); c.id = id; c.url = abs(c.file, SITE.root);
      const el = c.el, used = new Set([...el.querySelectorAll("[id]")].map(e => e.id)), h1 = el.querySelector("h1");
      el.querySelectorAll("h2, h3, h4").forEach(h => {
        if (h.id) return;
        const base = slugId(headText(h)) || "sezione"; let n = 2, x = base; while (used.has(x)) x = base + "-" + n++;
        h.id = x; used.add(x);
      });
      const map = new Map(), ids = [...el.querySelectorAll("[id]")];
      ids.forEach(e => map.set(e.id, e === h1 ? c.id : c.id + "--" + e.id));
      ids.forEach(e => { if (e === h1) e.removeAttribute("id"); else e.id = map.get(e.id); });
      const sub = v => v.split(/\s+/).filter(Boolean).map(t => map.get(t) || t).join(" ");
      el.querySelectorAll("*").forEach(e => [...e.attributes].forEach(a => {
        if (/^(aria-labelledby|aria-describedby|aria-controls|for|headers)$/.test(a.name)) e.setAttribute(a.name, sub(a.value));
        else if (a.value.includes("url(#")) e.setAttribute(a.name, a.value.replace(/url\(#([^)]+)\)/g, (m0, k) => map.has(k) ? `url(#${map.get(k)})` : m0));
        else if (e.tagName.toLowerCase() === "use" && /href$/.test(a.name) && a.value.startsWith("#")) e.setAttribute(a.name, "#" + (map.get(a.value.slice(1)) || a.value.slice(1)));
      }));
      c.idmap = map;
      c.heads = new Set([c.id, ...[...el.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(h => h.id).map(h => h.id)]);
      c.sections = [...el.querySelectorAll("h2, h3")].filter(h => h.id).map(h => ({ id: h.id, level: +h.tagName[1], text: headText(h) }));
    });
    return items;
  }

  /** Phase 2 (all the chapters of the file are prepared). A link to a place of THIS file becomes an anchor (#cap-04--frammentazione, or #cap-04 when the section is unknown);
      a link to a chapter that is not in the file stays the absolute site URL; an in-page anchor that leads nowhere loses the link and keeps the text. */
  function linkChapters(items) {
    const byUrl = new Map(items.map(c => [c.url, c])), look = (c, k) => { try { return c.idmap.get(k) || c.idmap.get(decodeURIComponent(k)); } catch (_) { return c.idmap.get(k); } };
    items.forEach(c => c.el.querySelectorAll("a[href]").forEach(a => {
      const h = a.getAttribute("href");
      if (h.startsWith("#")) { const nid = h.length > 1 && look(c, h.slice(1)); if (nid) a.setAttribute("href", "#" + nid); else a.replaceWith(...a.childNodes); return; }
      const i = h.indexOf("#"), t = byUrl.get(i < 0 ? h : h.slice(0, i)); if (!t) return;
      const nid = i >= 0 && h.length > i + 1 ? look(t, h.slice(i + 1)) : "";
      a.setAttribute("href", "#" + (nid || t.id));
    }));
    return items;
  }

  /** The list of the sections of a chapter, as a nav of links (HTML, Word, PDF) or as a Markdown list. */
  function tocHtml(c) {
    return c.sections.length ? `<nav class="cap-toc" id="${c.id}-toc" aria-label="Sezioni del capitolo"><p class="cap-toc-t"><b>In questo capitolo</b></p><ul>${c.sections.map(s => `<li class="l${s.level}"><a href="#${s.id}">${escH(s.text)}</a></li>`).join("")}</ul></nav>` : "";
  }
  const tocMd = c => c.sections.map(s => `${s.level > 2 ? "  " : ""}- [${s.text.replace(/[\[\]]/g, "")}](#${s.id})`).join("\n");
  /** The text of a chapter for HTML / Word / PDF: its table of contents after the title. */
  function chapterHtml(c) {
    const h1 = c.el.querySelector("h1"), t = tocHtml(c); if (!t) return c.el.innerHTML;
    const tpl = document.createElement("template"); tpl.innerHTML = t;
    if (h1) h1.after(tpl.content); else c.el.prepend(tpl.content);
    return c.el.innerHTML;
  }
  /** Word shows bookmarks, not ids: every id becomes an empty <a name> at the start of its element (never twice: the id is removed). */
  function idsToBookmarks(html) {
    const box = document.createElement("div"); box.innerHTML = html;
    [...box.querySelectorAll("[id]")].forEach(e => {
      const a = document.createElement("a"); a.setAttribute("name", e.id); e.removeAttribute("id");
      const t = e.tagName;
      if (t === "TR") { const f = e.querySelector("th, td"); if (f) f.prepend(a); else e.before(a); }
      else if (/^(H[1-6]|P|DIV|LI|SPAN|SECTION|ARTICLE|FIGURE|TD|TH|NAV|HEADER)$/.test(t)) e.prepend(a);
      else e.before(a);
    });
    return box.innerHTML;
  }

  const WORD_CSS = "@page{size:A4;margin:2cm}body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.5;color:#222}h1{font-size:22pt;color:#2b5c8a;border-bottom:2pt solid #2b5c8a}h2{font-size:15pt;color:#2b5c8a;border-bottom:1pt solid #ccc}p{margin:6pt 0;text-align:justify}.box{border:1pt solid #ccc;border-left:4pt solid #2b5c8a;background:#f8fafc;padding:8pt 12pt;margin:10pt 0}.box.warn{border-left-color:#c2410c}.box.lab{border-left-color:#047857}.eq{background:#f5f5f5;border:1pt solid #e0e0e0;padding:8pt;margin:8pt 0;font-style:italic}table{border-collapse:collapse;width:100%;margin:10pt 0}th,td{border:1pt solid #bbb;padding:6pt 8pt;text-align:left}th{background:#eef3f8}details.q{border:1pt solid #2b5c8a;background:#f4f8fb;padding:8pt;margin:10pt 0;display:block}img,svg{max-width:100%;height:auto}.page-break{page-break-before:always}a{color:#2b5c8a;text-decoration:underline}.cap-toc{border:1pt solid #ccc;background:#f8fafc;padding:6pt 12pt;margin:10pt 0}.cap-toc p{margin:0 0 4pt}.cap-toc ul{margin:0;padding-left:16pt}.cap-toc li.l3{margin-left:14pt;list-style:circle}";
  const HTML_CSS = "body{max-width:860px;margin:30px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif;color:#24231f;background:#fbfbf9}h1{font-size:28px;color:#2b5c8a}h2{font-size:22px;border-top:1px solid #e4e2dc;padding-top:16px;margin-top:36px}a{color:#2b5c8a}p,li{max-width:70ch}.box{border:1px solid #e4e2dc;border-left:4px solid #2b5c8a;background:#fff;border-radius:6px;padding:12px 16px;margin:16px 0}.box.warn{border-left-color:#c2410c}.box.lab{border-left-color:#047857}.eq{display:block;background:#fff;border:1px solid #e4e2dc;border-radius:6px;padding:10px 14px;margin:12px 0;overflow-x:auto}table{border-collapse:collapse;width:100%;margin:14px 0}th,td{border:1px solid #e4e2dc;padding:6px 10px}th{background:#f4f3ef}details.q{border:1px solid #2b5c8a;border-radius:6px;background:#fff;padding:12px 14px;margin:14px 0}svg,img{max-width:100%;height:auto}.kicker{color:#2b5c8a;font-weight:700;text-transform:uppercase;font-size:13px}.chapter-block{margin-bottom:60px;padding-bottom:40px;border-bottom:2px dashed #e4e2dc}.src{margin-top:40px;font-size:13px;color:#555}.cap-toc{border:1px solid #e4e2dc;border-left:4px solid #2b5c8a;background:#fff;border-radius:6px;padding:8px 16px;margin:16px 0}.cap-toc p{margin:0 0 4px}.cap-toc ul{margin:0;padding-left:18px}.cap-toc li.l3{margin-left:16px;list-style:circle}.back-index{position:sticky;top:8px;z-index:5;margin:0;text-align:right;font-size:12px}.back-index a{display:inline-block;background:#fff;border:1px solid #e4e2dc;border-radius:12px;padding:2px 10px;text-decoration:none}@media print{body{max-width:100%;margin:0;padding:0}.page-break{page-break-before:always}}";

  function wrapWordDocument(bodyHtml, title = NAME + " Teoria") {
    return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${escH(title)}</title><style>${WORD_CSS}</style></head><body>${bodyHtml}</body></html>`;
  }

  const sourceNote = () => `<p class="src">Fonte: <a href="${escH(abs(SITE.root, location.href))}">${escH(abs(SITE.root, location.href))}</a> · scaricato il ${new Date().toLocaleDateString("it-IT")}</p>`;
  function wrapStandaloneHtml(bodyHtml, title = NAME + " Teoria") {
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escH(title)}</title><style>${HTML_CSS}</style></head><body>${bodyHtml}${sourceNote()}</body></html>`;
  }

  function triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener"; a.style.display = "none";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ---------------------------------------------------------------- reading the chapters of the package
  /** The cleaned <main> of a chapter, read from the site (the current page is used as it is). Throws with a reason in Italian. */
  async function fetchChapterClean(filename) {
    const url = abs(filename, SITE.root);
    if (filename === here) { const mn = document.querySelector("main"); if (mn) return cleanMainElement(mn, url); }
    let raw = "";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      raw = await res.text();
    } catch (e) {
      if (!FILE) throw new Error(`${filename}: ${e.message || e}`);
      // from the disk the browser refuses; the local server of the program (tools/server_teoria.py) can hand the page over
      try {
        const res2 = await fetch(`http://127.0.0.1:8765/carica?file=${encodeURIComponent(filename)}`);
        const d = res2.ok ? await res2.json() : null; if (!d || !d.ok) throw new Error("no");
        raw = d.html;
      } catch (_) { throw new Error("file"); }
    }
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const mn = doc.querySelector("main"); if (!mn) throw new Error(`${filename}: pagina senza testo`);
    return cleanMainElement(mn, url);
  }

  async function loadAll(chs, progress) {
    const out = new Array(chs.length); let next = 0, done = 0, failed = null;
    const worker = async () => {
      while (!failed) {
        const i = next++; if (i >= chs.length) return;
        try { out[i] = { file: chs[i][0], num: chs[i][1], title: chs[i][2], el: await fetchChapterClean(chs[i][0]) }; progress(++done, chs.length); }
        catch (e) { failed = failed || e; }
      }
    };
    await Promise.all(Array.from({ length: FILE ? 1 : 5 }, worker));
    if (failed) throw failed;
    return out;
  }

  // ---------------------------------------------------------------- the dialog
  let lastFocus = null;
  function openExportModal() {
    lastFocus = document.activeElement;
    let m = document.getElementById("export-modal");
    if (m) { m.style.display = "flex"; const c = m.querySelector("#exp-btn-close"); if (c) c.focus(); return; }
    const cur = getCurrentChapter(), curTitle = `${cur[1] && cur[1] !== '0' ? cur[1] + '. ' : ''}${cur[2]}`;
    m = document.createElement("div"); m.id = "export-modal"; m.className = "exp-backdrop";
    m.innerHTML = `
      <div class="exp-card" role="dialog" aria-modal="true" aria-labelledby="exp-h">
        <div class="exp-header">
          <h2 id="exp-h"><span class="exp-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v11"/><path d="M7.5 11l4.5 4.5 4.5-4.5"/><path d="M5 19h14"/></svg></span>Scarica</h2>
          <button type="button" class="exp-close" id="exp-btn-close" aria-label="Chiudi">✕</button>
        </div>
        <table class="exp-tab">
          <thead><tr><th scope="col"><span class="vh">Formato</span></th><th scope="col">Capitolo</th><th scope="col">Tutta la Teoria</th></tr></thead>
          <tbody>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 17v-4h1.5a1.2 1.2 0 0 1 0 2.4H8"/><path d="M13 13v4"/><path d="M13 13h2.5M13 15h2"/></svg></span><b>PDF</b></th>
            <td><button type="button" class="exp-item" id="exp-cur-pdf" aria-label="Capitolo, PDF" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-pdf" aria-label="Tutta la Teoria, PDF" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6.5 15V9l2.5 3 2.5-3v6"/><path d="M16.5 9v6M14.5 13l2 2 2-2"/></svg></span><b>Markdown</b></th>
            <td><button type="button" class="exp-item" id="exp-cur-md" aria-label="Capitolo, Markdown" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-md" aria-label="Tutta la Teoria, Markdown" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 12.5l1.2 4.5 1.3-3.5 1.3 3.5 1.2-4.5"/></svg></span><b>Word</b></th>
            <td><button type="button" class="exp-item" id="exp-cur-doc" aria-label="Capitolo, Word" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-doc" aria-label="Tutta la Teoria, Word" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8.5 7L3.5 12l5 5"/><path d="M15.5 7l5 5-5 5"/><path d="M13.5 5l-3 14"/></svg></span><b>HTML</b></th>
            <td><button type="button" class="exp-item" id="exp-cur-html" aria-label="Capitolo, HTML" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-html" aria-label="Tutta la Teoria, HTML" title="Scarica tutta la Teoria">↓</button></td></tr>
          </tbody>
        </table>
        <div id="exp-status" class="exp-status" role="status" style="display:none"></div>
      </div>`;
    document.body.appendChild(m);
    bindExportEvents(m, curTitle);
    m.querySelector("#exp-btn-close").focus();
  }

  function showStatus(msg, isErr = false) {
    const s = document.getElementById("exp-status"); if (!s) return;
    s.style.display = "block"; s.className = "exp-status" + (isErr ? " err" : " ok"); s.textContent = msg;
    if (isErr) s.setAttribute("role", "alert"); else s.setAttribute("role", "status");
  }

  const itemOf = (file, num, title, el) => ({ file, num, title, el: el.cloneNode(true) });   // a copy: the builders rewrite ids and links
  const BACK = "indice-dispensa";

  /** The text of ONE chapter (cl: cleaned clone of its main) in a format, as a string. In-chapter links and the table of its sections work inside the file; links to other chapters are absolute. */
  function buildChapter(fmt, item, curTitle) {
    item = itemOf(item.file, item.num, item.title, item.el); prepareChapters([item]); linkChapters([item]);
    if (fmt === "md") { mdTargets = item.heads; try { return htmlToMarkdown(item.el, curTitle, { anchor: item.id, anchorAfter: true, toc: tocMd(item) }); } finally { mdTargets = null; } }
    const block = `<article class="chapter-block" id="${item.id}">${chapterHtml(item)}</article>`;
    return fmt === "doc" ? wrapWordDocument(idsToBookmarks(block), curTitle) : wrapStandaloneHtml(block, curTitle);
  }

  /** Single page → the requested format. */
  async function exportCurrent(fmt, curTitle, slug) {
    const mn = document.querySelector("main"); if (!mn) { showStatus("Questa pagina non ha un testo da scaricare.", true); return; }
    try {
      const cl = cleanMainElement(mn); cl.setAttribute("data-clean", "");
      if (fmt !== "md") await inlineImages(cl);
      const out = buildChapter(fmt, itemOf(here, getCurrentChapter()[1], curTitle, cl), curTitle);
      if (fmt === "md") triggerDownload(out, `${slug}.md`, "text/markdown;charset=utf-8");
      else if (fmt === "doc") triggerDownload(out, `${slug}.doc`, "application/msword;charset=utf-8");
      else triggerDownload(out, `${slug}-standalone.html`, "text/html;charset=utf-8");
      showStatus("✅ Capitolo scaricato.");
    } catch (e) { showStatus("Non riesco a preparare il file: " + (e.message || e), true); }
  }

  /** The whole handbook in a format ("pdf" = the inner HTML of the print block): `loaded` = [{file, num, title, el}] of every chapter. */
  function buildAll(fmt, loaded) {
    const items = loaded.map(c => itemOf(c.file, c.num, c.title, c.el)); prepareChapters(items); linkChapters(items);
    const index = items.map(c => `<li><a href="#${c.id}">${escH(chapTitle(c))}</a></li>`).join("");
    if (fmt === "md") {
      mdTargets = new Set(items.flatMap(c => [...c.heads]));
      try {
        let md = `# ${NAME} · Dispensa completa di teoria\n\n## Indice\n\n` + items.map(c => `- [${c.num ? "Capitolo " + c.num + ": " : ""}${c.title.replace(/[\[\]]/g, "")}](#${c.id})`).join("\n") + "\n\n---\n\n";
        items.forEach(c => { c.el.setAttribute("data-clean", ""); md += htmlToMarkdown(c.el, `Capitolo ${c.num}: ${c.title}`, { anchor: c.id, toc: tocMd(c) }) + "\n\n---\n\n"; });
        return md;
      } finally { mdTargets = null; }
    }
    const back = `<p class="back-index"><a href="#${BACK}">↑ Torna all'indice</a></p>`;
    if (fmt === "pdf") return `<div class="cover"><h1>${NAME} · Dispensa completa</h1><p>Spettrometria di massa e cromatografia</p></div><nav id="${BACK}" aria-label="Indice"><h2>Indice</h2><ol>${index}</ol></nav>` +
      items.map(c => `<section class="chapter-block" id="${c.id}">${chapterHtml(c)}</section>`).join("");
    if (fmt === "doc") {
      const b = `<div style="text-align:center;padding:80pt 0"><h1 style="font-size:28pt;color:#2b5c8a">${NAME} · Dispensa di teoria</h1><p>Spettrometria di massa e cromatografia</p></div><div class="page-break"></div><div id="${BACK}"><h2>Indice dei capitoli</h2><ol>${index}</ol></div><div class="page-break"></div>` +
        items.map(c => `<div class="chapter-block" id="${c.id}">${back}${chapterHtml(c)}</div><div class="page-break"></div>`).join("");
      return wrapWordDocument(idsToBookmarks(b), NAME + " - Teoria completa");
    }
    const b = `<header style="text-align:center;margin-bottom:40px"><h1>${NAME} · Dispensa completa</h1><p>Spettrometria di massa e cromatografia</p></header><nav id="${BACK}" aria-label="Indice"><h2>Indice</h2><ol>${index}</ol></nav>` +
      items.map(c => `<section class="chapter-block page-break" id="${c.id}">${back}${chapterHtml(c)}</section>`).join("");
    return wrapStandaloneHtml(b, NAME + " - Teoria completa");
  }
  T().esportaCostruisci = { capitolo: buildChapter, tutto: buildAll };   // the pure builders (strings), used by the tests

  const PACK_CSS = ".print-toc{display:none}#print-pack{display:none}@media print{html.packing body>*:not(#print-pack){display:none!important}html.packing #print-pack{display:block!important;padding:0;font:11pt/1.5 system-ui,sans-serif;color:#000;background:#fff}#print-pack h1{font-size:22pt}#print-pack h2{font-size:15pt;break-after:avoid}#print-pack h3{font-size:12.5pt;break-after:avoid}#print-pack .chapter-block{break-before:page}#print-pack .cover{text-align:center;padding:80pt 0}#print-pack table{border-collapse:collapse;width:100%;break-inside:avoid}#print-pack th,#print-pack td{border:1pt solid #999;padding:3pt 5pt}#print-pack .box{border:1pt solid #ccc;border-left:4pt solid #2b5c8a;padding:6pt 10pt;margin:8pt 0;break-inside:avoid}#print-pack svg,#print-pack img{max-width:100%;height:auto}#print-pack details.q{display:block;border:1pt solid #999;padding:6pt;margin:6pt 0}#print-pack a{color:inherit;text-decoration:underline}#print-pack .cap-toc{border:1pt solid #ccc;padding:4pt 10pt;margin:8pt 0;break-inside:avoid}#print-pack .cap-toc p{margin:0 0 3pt}#print-pack .cap-toc ul{margin:0;padding-left:14pt}#print-pack .cap-toc li.l3{margin-left:12pt;list-style:circle}}@media print{.print-toc a{color:inherit;text-decoration:underline}.print-toc{display:block;border:1pt solid #ccc;padding:4pt 10pt;margin:8pt 0;break-inside:avoid}.print-toc p{margin:0 0 3pt}.print-toc ul{margin:0;padding-left:14pt}.print-toc li.l3{margin-left:12pt;list-style:circle}}";

  /** The PDF of the package: the chapters are put in a block of THIS page that only the printer sees, then the print dialog opens (no pop-up). */
  function printPack(loaded) {
    document.getElementById("print-pack")?.remove();
    if (!document.getElementById("print-pack-css")) { const st = document.createElement("style"); st.id = "print-pack-css"; st.textContent = PACK_CSS; document.head.appendChild(st); }
    const box = document.createElement("div"); box.id = "print-pack";
    box.innerHTML = buildAll("pdf", loaded);
    document.body.appendChild(box);
    const root = document.documentElement; root.classList.add("packing");
    const end = () => { root.classList.remove("packing"); box.remove(); };
    addEventListener("afterprint", end, { once: true });
    window.print();
  }

  /** PDF of the chapter: the page itself is printed; for the printer only, the list of its sections (links to the headings of the page) is put after the title. */
  function printChapter() {
    document.querySelectorAll(".print-toc").forEach(e => e.remove());
    if (!document.getElementById("print-pack-css")) { const st = document.createElement("style"); st.id = "print-pack-css"; st.textContent = PACK_CSS; document.head.appendChild(st); }
    const mn = document.querySelector("main"), hs = mn ? [...mn.querySelectorAll("h2, h3")].filter(h => h.id) : [];
    if (hs.length) {
      const nav = document.createElement("nav"); nav.className = "print-toc"; nav.setAttribute("aria-label", "Sezioni del capitolo");
      nav.innerHTML = `<p><b>In questo capitolo</b></p><ul>${hs.map(h => `<li class="l${h.tagName[1]}"><a href="#${escH(h.id)}">${escH(headText(h.cloneNode(true)).replace(/#$/, "").trim() || h.id)}</a></li>`).join("")}</ul>`;
      const h1 = mn.querySelector("h1"); if (h1) h1.after(nav); else mn.prepend(nav);
      addEventListener("afterprint", () => nav.remove(), { once: true });
    }
    window.print();
  }

  async function exportAll(fmt) {
    const chs = getChaptersList();
    showStatus(`Caricamento capitoli… (0/${chs.length})`);
    let loaded;
    try { loaded = await loadAll(chs, (n, t) => showStatus(`Caricamento capitoli… (${n}/${t})`)); }
    catch (e) {
      showStatus(e.message === "file"
        ? "Dal disco il browser non permette di leggere gli altri capitoli: per scaricare tutta la Teoria apri il sito pubblicato, oppure avvia python3 tools/server_teoria.py. Il capitolo aperto si scarica comunque."
        : "Non riesco a caricare tutti i capitoli (" + e.message + "): nessun file creato, riprova.", true);
      return;
    }
    showStatus(`Generazione del pacchetto completo (${fmt.toUpperCase()})…`);
    try {
      if (fmt === "pdf") { printPack(loaded); const st = document.getElementById("exp-status"); if (st) st.style.display = "none"; return; }
      if (fmt !== "md") await Promise.all(loaded.map(c => inlineImages(c.el)));
      const out = buildAll(fmt, loaded);
      if (fmt === "md") triggerDownload(out, `${NAME}_Teoria_Completa.md`, "text/markdown;charset=utf-8");
      else if (fmt === "doc") triggerDownload(out, `${NAME}_Teoria_Completa.doc`, "application/msword;charset=utf-8");
      else triggerDownload(out, `${NAME}_Teoria_Completa.html`, "text/html;charset=utf-8");
      showStatus({ md: "✅ Tutta la Teoria scaricata in Markdown!", doc: "✅ Tutta la Teoria scaricata in Word (.doc)!", html: "✅ Tutta la Teoria scaricata in HTML!" }[fmt]);
    } catch (e) { showStatus("Non riesco a preparare il file: " + (e.message || e), true); }
  }

  function bindExportEvents(modal, curTitle) {
    const slug = here.replace(/^.*\//, "").replace(/\.html$/, "") || "index";
    const close = () => { modal.style.display = "none"; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); };
    const $ = id => document.getElementById(id);
    let busy = false;
    const once = fn => async () => { if (busy) return; busy = true; modal.setAttribute("aria-busy", "true"); try { await fn(); } finally { busy = false; modal.removeAttribute("aria-busy"); } };
    $("exp-btn-close").onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };
    window.addEventListener("keydown", e => {
      if (modal.style.display === "none") return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {   // the focus stays in the dialog
        const f = [...modal.querySelectorAll("button")].filter(b => b.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    $("exp-cur-pdf").onclick = () => { document.documentElement.classList.remove("packing"); close(); printChapter(); };
    $("exp-cur-md").onclick = once(() => exportCurrent("md", curTitle, slug));
    $("exp-cur-doc").onclick = once(() => exportCurrent("doc", curTitle, slug));
    $("exp-cur-html").onclick = once(() => exportCurrent("html", curTitle, slug));
    ["pdf", "md", "doc", "html"].forEach(f => { $("exp-all-" + f).onclick = once(() => exportAll(f)); });
  }

  T().esporta = openExportModal;
})();
