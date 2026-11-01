# DEV-FIX-03 - storia ch. 35 and 40: rewrite close paraphrases, attribute the ESI "first", show Aston's 1919 photo

Paste as the first message of a new Claude Code session (Sonnet) on `Freeesta/BasePeak`. Chat name: `DEV - fix storia 35-40`, branch `dev/fix-storia-35-40`, base `main`.
Findings: `docs/piani/storia-ms-revisione.md` (S7, S8, S9, S10, S11, S12). Parallel with DEV-FIX-01, 02, 04, 05 (no shared file).

## 0. Confirm
One line to the COO session: `DEV fix-storia-35-40 started, branch dev/fix-storia-35-40`.

## 1. Role
You are a DEV (Sonnet). You apply the exact replacements below. You do NOT rewrite other sentences, do NOT touch other files, do NOT merge.

## 2. Scope
- Touches: `capitoli/35-storia-aston-dempster.html`, `capitoli/40-storia-sorgenti.html`.
- Does not touch: `capitoli/src/`, other chapters, images (the photo is already committed and licensed), `docs/IMMAGINI.md`, `LICENZE-TERZI.md`, tests, `.github/`.

## 3. Context (verified by the ARCH)
- Close translations found: chapter 40 vs the KVA "Advanced information on the Nobel Prize in Chemistry 2002" (pp. 2-5); chapter 35 vs Aston's Nobel lecture 1922 (p. 19). The facts stay; only the wording changes.
- Nobel 2002 advanced information p. 2: in 1984 in Fenn's laboratory at Yale "electrospray and mass spectrometry were successfully combined for the first time ... This discovery was closely followed by results from a Russian research group (Aleksandrov et al.)". p. 4: Tanaka presented cytochrome c (12 384 Da), chymotrypsinogen (25 717 Da) and carboxypeptidase-A (34 472 Da) in 1987-1988.
- `assets/img/storia/foto/aston-spettrografo-1919.webp` (720x1089): Science History Institute `9w0324230`, "Original mass spectrograph" set up in the Cavendish Laboratory in 1919, Public Domain Mark 1.0; already listed in `docs/IMMAGINI.md` and `LICENZE-TERZI.md`, but shown in no chapter.

## 4. Work, in order
Each old text must match exactly once.

`capitoli/40-storia-sorgenti.html`
1. **S7.** Old: `<p>Il FAB misurava biomolecole piccole, sotto i 10 000 dalton, e permetteva di frammentarle per studiarne la struttura. Non risolse il problema delle masse più alte, ma cambiò le aspettative.</p>`
   New: `<p>Con il FAB si misuravano molecole fino a circa 10 000 dalton, e i frammenti davano informazioni sulla struttura. Le proteine grandi restavano fuori portata, ma ormai era chiaro che le molecole polari potevano entrare in uno spettrometro.</p>`
2. **S7.** Old: `<p>Negli anni 1980 la sfida era doppia. Bisognava arrivare alle molecole grandi e fare dello spettrometro un rivelatore per le separazioni in liquido. Una colonna di cromatografia liquida però non produce un vapore, ma un eluato.</p>`
   New: `<p>Negli anni 1980 restavano due problemi aperti: misurare molecole grandi e collegare lo spettrometro a una separazione in fase liquida. Il secondo era difficile perché una colonna per cromatografia liquida non produce un vapore, ma un eluato.</p>`
3. **S8.** Old: `<p>Nel 1984 M. Yamashita e J.B. Fenn, a Yale, unirono per la prima volta elettrospray e spettrometria di massa.`
   New: `<p>Nel 1984 M. Yamashita e J.B. Fenn, a Yale, collegarono un elettrospray a uno spettrometro di massa; secondo il comitato Nobel fu la prima volta, e poco dopo un gruppo russo, Aleksandrov e colleghi, ottenne risultati simili.`
4. **S7.** Old: `<p>All'inizio la serie regolare di picchi confuse chi la vedeva. Fenn capì che ogni picco è una misura indipendente della stessa massa. Con una media si ottiene una massa molto accurata, con un errore dello 0,01 %.</p>`
   New: `<p>A prima vista quella fila di picchi sembrava solo una complicazione. Fenn la trasformò in un vantaggio: ogni stato di carica dà una stima indipendente della stessa massa, e la media delle stime ha un errore di circa lo 0,01 %.</p>`
5. **S7, S9.** Old: `Fra le proteine c'erano il citocromo c, di circa 12 000 dalton. Usava un laser all'azoto a bassa energia, cosa che a quel tempo non ci si aspettava.</p>`
   New: `Fra le proteine che presentò nel 1987 e nel 1988 c'era il citocromo c, di circa 12 000 dalton. Usava un laser all'azoto di bassa energia.</p>`
6. **S7.** Old: `<p>La sua matrice era glicerolo con particelle colloidali, una soluzione che non è stata sviluppata oltre.`
   New: `<p>Come matrice usava glicerolo con particelle colloidali; oggi si usano invece matrici cristalline.`
7. **S11.** Delete the 2 `<!-- to verify against source: ... -->` comments. `grep -c 'to verify against source' capitoli/40-storia-sorgenti.html` -> 0.

`capitoli/35-storia-aston-dempster.html`
8. **S10.** Old: `<p>Aston stesso precisò che la regola non è matematicamente esatta. Gli atomi sono costruiti con le stesse unità, ma il modo in cui sono «impacchettate» cambia un poco la massa: per stagno e xeno la differenza può arrivare a due o tre parti su mille.</p>`
   New: `<p>La regola vale solo in prima approssimazione, e Aston lo diceva già nella conferenza per il Nobel. Quando protoni ed elettroni si stringono in un nucleo, la massa totale cambia un poco: Aston lo chiamò effetto di impaccamento e stimò scarti fino a due o tre parti su mille per lo stagno e lo xeno.</p>`
9. **S12.** Show the 1919 photo right after the paragraph that starts `<p>Per analogia con lo spettrografo ottico,`. Insert after that paragraph:
   ```
   <figure><img src="../assets/img/storia/foto/aston-spettrografo-1919.webp" loading="lazy" decoding="async" style="max-width:100%;height:auto" width="480" height="726" alt="Fotografia del primo spettrografo di massa di Aston al Cavendish Laboratory, con le parti indicate da lettere"><figcaption><b>Figura 35.2</b> Il primo spettrografo di massa di Aston, montato al Cavendish Laboratory nel 1919. F.W. Aston, Isotopes, 1922; Science History Institute; pubblico dominio.</figcaption></figure>
   ```
   Then renumber the later figures of this chapter: the caption `<b>Figura 35.2</b> Spettri di massa su lastra` becomes `<b>Figura 35.3</b>`, and `<b>Figura 35.3</b> Il settore magnetico a 180°` becomes `<b>Figura 35.4</b>`. Search the chapter text and `assets/storia-fig-*.js` for "35.2"/"35.3" and update any reference (the ARCH found none outside the captions).
10. **S11.** Delete the 2 `<!-- to verify against source: ... -->` comments. `grep -c 'to verify against source' capitoli/35-storia-aston-dempster.html` -> 0.
11. Run the checks, commit ("Storia ch. 35 and 40: own wording instead of close paraphrase, attribute the ESI first, show Aston's 1919 spectrograph"), push, open the PR (ready).

## 5. Acceptance
- `grep -c 'cambiò le aspettative\|confuse chi la vedeva\|non ci si aspettava\|non è stata sviluppata oltre\|unirono per la prima volta' capitoli/40-storia-sorgenti.html` -> 0.
- `grep -c 'matematicamente esatta' capitoli/35-storia-aston-dempster.html` -> 0; `grep -c 'aston-spettrografo-1919.webp' capitoli/35-storia-aston-dempster.html` -> 1.
- `grep -o 'Figura 35\.[0-9]' capitoli/35-storia-aston-dempster.html` -> 35.1, 35.2, 35.3, 35.4 in order.
- `git diff --stat origin/main` -> only the two chapter files.
- `python3 tools/controlla_teoria.py` -> 0 new errors; `python3 -m pytest -q tests` (includes `test_numerazione.py`, `test_immagini.py`) -> pass; `ci` green.

## Rules that always apply
- Repository `Freeesta/BasePeak` only. Code, commits, PR text: English. Handbook text, captions, alt text: Italian only.
- Dyslexia rules: paragraphs of 2-4 sentences, one idea each; no justified text; no whole sentences in italics; Italian decimal comma.
- Paraphrase; copy no sentence from any source.
- Never skip, disable or loosen a test; no `.github/` changes; do not merge; do not push to `main`. One small PR, ready for review.
- Report to the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
