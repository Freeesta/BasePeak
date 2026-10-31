/* BasePeak - Teoria: export of a chapter or of the whole handbook (PDF, Markdown, Word, HTML). Classic script, no network but the pages of the site itself.
   Everything is generated from the pages as the reader sees them (the Markdown sources of capitoli/src are not published). Notes on what is deliberate:
   - the whole-handbook files are built only when EVERY chapter was read: a partial file is never handed out as «tutta la Teoria»;
   - from file:// a browser does not let a page read its sibling files: the single chapter works, the package says so (or uses the local server, tools/server_teoria.py);
   - the PDF of the package is the print dialog of THIS page (a hidden #print-pack shown only to the printer): no pop-up window, which browsers block once the chapters have been loaded;
   - the object URL of a download is released only after a minute (Firefox and Safari cancel a download whose URL is revoked at once);
   - links and images are made absolute / embedded so that the downloaded file works offline. */
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

  function walkMd(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/\s+/g, " ");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const ch = () => Array.from(node.childNodes).map(walkMd).join("");
    switch (tag) {
      case "h1": return `\n\n# ${ch().trim()}\n\n`;
      case "h2": return `\n\n## ${ch().trim()}\n\n`;
      case "h3": return `\n\n### ${ch().trim()}\n\n`;
      case "h4": case "h5": case "h6": return `\n\n#### ${ch().trim()}\n\n`;
      case "p": return `\n\n${node.classList.contains("lead") ? `> *${ch().trim()}*` : ch().trim()}\n\n`;
      case "br": return "  \n";
      case "hr": return "\n\n---\n\n";
      case "b": case "strong": return `**${ch().trim()}**`;
      case "i": case "em": return `*${ch().trim()}*`;
      case "sub": return `~${ch().trim()}~`;
      case "sup": return `^${ch().trim()}^`;
      case "code": case "kbd": return `\`${ch().trim()}\``;
      case "pre": return `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n`;
      case "a": return `[${ch().trim()}](${node.getAttribute("href") || ""})`;
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

  /** Markdown of a (cleaned) element; with a title the kicker and the first h1 of the page are left out (the title says it). */
  function htmlToMarkdown(element, title = "") {
    const main = element.matches && element.matches("[data-clean]") ? element : cleanMainElement(element);
    if (title) { main.querySelectorAll(".kicker").forEach(e => e.remove()); const h1 = main.querySelector("h1"); if (h1) h1.remove(); }
    const md = (title ? `# ${title}\n\n` : "") + walkMd(main);
    return md.replace(/[ \t]+$/gm, "").replace(/^ +(?=\S)/gm, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  const WORD_CSS = "@page{size:A4;margin:2cm}body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.5;color:#222}h1{font-size:22pt;color:#2b5c8a;border-bottom:2pt solid #2b5c8a}h2{font-size:15pt;color:#2b5c8a;border-bottom:1pt solid #ccc}p{margin:6pt 0;text-align:justify}.box{border:1pt solid #ccc;border-left:4pt solid #2b5c8a;background:#f8fafc;padding:8pt 12pt;margin:10pt 0}.box.warn{border-left-color:#c2410c}.box.lab{border-left-color:#047857}.eq{background:#f5f5f5;border:1pt solid #e0e0e0;padding:8pt;margin:8pt 0;font-style:italic}table{border-collapse:collapse;width:100%;margin:10pt 0}th,td{border:1pt solid #bbb;padding:6pt 8pt;text-align:left}th{background:#eef3f8}details.q{border:1pt solid #2b5c8a;background:#f4f8fb;padding:8pt;margin:10pt 0;display:block}img,svg{max-width:100%;height:auto}.page-break{page-break-before:always}";
  const HTML_CSS = "body{max-width:860px;margin:30px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif;color:#24231f;background:#fbfbf9}h1{font-size:28px;color:#2b5c8a}h2{font-size:22px;border-top:1px solid #e4e2dc;padding-top:16px;margin-top:36px}a{color:#2b5c8a}p,li{max-width:70ch}.box{border:1px solid #e4e2dc;border-left:4px solid #2b5c8a;background:#fff;border-radius:6px;padding:12px 16px;margin:16px 0}.box.warn{border-left-color:#c2410c}.box.lab{border-left-color:#047857}.eq{display:block;background:#fff;border:1px solid #e4e2dc;border-radius:6px;padding:10px 14px;margin:12px 0;overflow-x:auto}table{border-collapse:collapse;width:100%;margin:14px 0}th,td{border:1px solid #e4e2dc;padding:6px 10px}th{background:#f4f3ef}details.q{border:1px solid #2b5c8a;border-radius:6px;background:#fff;padding:12px 14px;margin:14px 0}svg,img{max-width:100%;height:auto}.kicker{color:#2b5c8a;font-weight:700;text-transform:uppercase;font-size:13px}.chapter-block{margin-bottom:60px;padding-bottom:40px;border-bottom:2px dashed #e4e2dc}.src{margin-top:40px;font-size:13px;color:#555}@media print{body{max-width:100%;margin:0;padding:0}.page-break{page-break-before:always}}";

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
        try { out[i] = { num: chs[i][1], title: chs[i][2], el: await fetchChapterClean(chs[i][0]) }; progress(++done, chs.length); }
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
          <h2 id="exp-h">📥 Scarica</h2>
          <button type="button" class="exp-close" id="exp-btn-close" aria-label="Chiudi">✕</button>
        </div>
        <table class="exp-tab">
          <thead><tr><th scope="col"><span class="vh">Formato</span></th><th scope="col">Capitolo</th><th scope="col">Tutta la Teoria</th></tr></thead>
          <tbody>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true">📄</span><b>PDF</b> <span class="d">· per stampare</span></th>
            <td><button type="button" class="exp-item" id="exp-cur-pdf" aria-label="Capitolo, PDF" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-pdf" aria-label="Tutta la Teoria, PDF" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true">📝</span><b>Markdown</b> <span class="d">· per appunti</span></th>
            <td><button type="button" class="exp-item" id="exp-cur-md" aria-label="Capitolo, Markdown" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-md" aria-label="Tutta la Teoria, Markdown" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true">📄</span><b>Word</b> <span class="d">· da modificare</span></th>
            <td><button type="button" class="exp-item" id="exp-cur-doc" aria-label="Capitolo, Word" title="Scarica il capitolo">↓</button></td>
            <td><button type="button" class="exp-item" id="exp-all-doc" aria-label="Tutta la Teoria, Word" title="Scarica tutta la Teoria">↓</button></td></tr>
          <tr><th scope="row" class="exp-fmt"><span class="exp-ico" aria-hidden="true">🌐</span><b>HTML</b> <span class="d">· da aprire offline</span></th>
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

  /** Single page → `cl` (cleaned clone of the main of this page) in the requested format. */
  async function exportCurrent(fmt, curTitle, slug) {
    const mn = document.querySelector("main"); if (!mn) { showStatus("Questa pagina non ha un testo da scaricare.", true); return; }
    try {
      const cl = cleanMainElement(mn); cl.setAttribute("data-clean", "");
      if (fmt === "md") triggerDownload(htmlToMarkdown(cl, curTitle), `${slug}.md`, "text/markdown;charset=utf-8");
      else {
        await inlineImages(cl);
        if (fmt === "doc") triggerDownload(wrapWordDocument(cl.innerHTML, curTitle), `${slug}.doc`, "application/msword;charset=utf-8");
        else triggerDownload(wrapStandaloneHtml(cl.innerHTML, curTitle), `${slug}-standalone.html`, "text/html;charset=utf-8");
      }
      showStatus("✅ Capitolo scaricato.");
    } catch (e) { showStatus("Non riesco a preparare il file: " + (e.message || e), true); }
  }

  const PACK_CSS = "#print-pack{display:none}@media print{html.packing body>*:not(#print-pack){display:none!important}html.packing #print-pack{display:block!important;padding:0;font:11pt/1.5 system-ui,sans-serif;color:#000;background:#fff}#print-pack h1{font-size:22pt}#print-pack h2{font-size:15pt;break-after:avoid}#print-pack h3{font-size:12.5pt;break-after:avoid}#print-pack .chapter-block{break-before:page}#print-pack .cover{text-align:center;padding:80pt 0}#print-pack table{border-collapse:collapse;width:100%;break-inside:avoid}#print-pack th,#print-pack td{border:1pt solid #999;padding:3pt 5pt}#print-pack .box{border:1pt solid #ccc;border-left:4pt solid #2b5c8a;padding:6pt 10pt;margin:8pt 0;break-inside:avoid}#print-pack svg,#print-pack img{max-width:100%;height:auto}#print-pack details.q{display:block;border:1pt solid #999;padding:6pt;margin:6pt 0}#print-pack a{color:#000;text-decoration:none}}";

  /** The PDF of the package: the chapters are put in a block of THIS page that only the printer sees, then the print dialog opens (no pop-up). */
  function printPack(loaded) {
    document.getElementById("print-pack")?.remove();
    if (!document.getElementById("print-pack-css")) { const st = document.createElement("style"); st.id = "print-pack-css"; st.textContent = PACK_CSS; document.head.appendChild(st); }
    const box = document.createElement("div"); box.id = "print-pack";
    box.innerHTML = `<div class="cover"><h1>${NAME} · Dispensa completa</h1><p>Spettrometria di massa e cromatografia</p></div><h2>Indice</h2><ol>` + loaded.map(c => `<li>${c.num ? escH(c.num) + ". " : ""}${escH(c.title)}</li>`).join("") + "</ol>" +
      loaded.map(c => `<section class="chapter-block">${c.el.innerHTML}</section>`).join("");
    document.body.appendChild(box);
    const root = document.documentElement; root.classList.add("packing");
    const end = () => { root.classList.remove("packing"); box.remove(); };
    addEventListener("afterprint", end, { once: true });
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
      if (fmt === "pdf") { printPack(loaded); showStatus("✅ Finestra di stampa aperta: scegli «Salva come PDF»."); return; }
      if (fmt === "md") {
        let md = `# ${NAME} · Dispensa completa di teoria\n\n## Indice\n\n` + loaded.map(c => `- **Capitolo ${c.num}**: ${c.title}`).join("\n") + "\n\n---\n\n";
        loaded.forEach(c => { c.el.setAttribute("data-clean", ""); md += htmlToMarkdown(c.el, `Capitolo ${c.num}: ${c.title}`) + "\n\n---\n\n"; });
        triggerDownload(md, `${NAME}_Teoria_Completa.md`, "text/markdown;charset=utf-8");
        showStatus("✅ Tutta la Teoria scaricata in Markdown!");
        return;
      }
      await Promise.all(loaded.map(c => inlineImages(c.el)));
      if (fmt === "doc") {
        let b = `<div style="text-align:center;padding:80pt 0"><h1 style="font-size:28pt;color:#2b5c8a">${NAME} · Dispensa di teoria</h1><p>Spettrometria di massa e cromatografia</p></div><div class="page-break"></div><h2>Indice dei capitoli</h2><ul>` + loaded.map(c => `<li><b>Capitolo ${escH(c.num)}</b>: ${escH(c.title)}</li>`).join("") + `</ul><div class="page-break"></div>`;
        loaded.forEach(c => { b += `<div class="chapter-block">` + c.el.innerHTML + `</div><div class="page-break"></div>`; });
        triggerDownload(wrapWordDocument(b, NAME + " - Teoria completa"), `${NAME}_Teoria_Completa.doc`, "application/msword;charset=utf-8");
        showStatus("✅ Tutta la Teoria scaricata in Word (.doc)!");
      } else {
        let b = `<header style="text-align:center;margin-bottom:40px"><h1>${NAME} · Dispensa completa</h1><p>Spettrometria di massa e cromatografia</p></header><nav aria-label="Indice"><h2>Indice</h2><ol>` + loaded.map((c, i) => `<li><a href="#cap-${i}">${c.num ? escH(c.num) + ". " : ""}${escH(c.title)}</a></li>`).join("") + `</ol></nav>`;
        loaded.forEach((c, i) => { b += `<section class="chapter-block page-break" id="cap-${i}">` + c.el.innerHTML + `</section>`; });
        triggerDownload(wrapStandaloneHtml(b, NAME + " - Teoria completa"), `${NAME}_Teoria_Completa.html`, "text/html;charset=utf-8");
        showStatus("✅ Tutta la Teoria scaricata in HTML!");
      }
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
    $("exp-cur-pdf").onclick = () => { document.documentElement.classList.remove("packing"); close(); window.print(); };
    $("exp-cur-md").onclick = once(() => exportCurrent("md", curTitle, slug));
    $("exp-cur-doc").onclick = once(() => exportCurrent("doc", curTitle, slug));
    $("exp-cur-html").onclick = once(() => exportCurrent("html", curTitle, slug));
    ["pdf", "md", "doc", "html"].forEach(f => { $("exp-all-" + f).onclick = once(() => exportAll(f)); });
  }

  T().esporta = openExportModal;
})();
