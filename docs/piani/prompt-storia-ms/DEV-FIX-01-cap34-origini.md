# DEV-FIX-01 - storia ch. 34: correct Thomson's 1897 value (MUST-FIX, live now)

Paste as the first message of a new Claude Code session (Sonnet) on `Freeesta/BasePeak`. Chat name: `DEV - fix storia 34`, branch `dev/fix-storia-34`, base `main`.
Findings: `docs/piani/storia-ms-revisione.md` (M1, S1, S2, S11). **Run this one first.** It can run in parallel with DEV-FIX-02..05 (no shared file).

## 0. Confirm
One line to the COO session: `DEV fix-storia-34 started, branch dev/fix-storia-34`.

## 1. Role
You are a DEV (Sonnet). You apply the exact text replacements below. You do NOT rewrite other sentences, do NOT touch any other file, do NOT merge.

## 2. Scope
- Touches: `capitoli/34-storia-origini.html` only.
- Does not touch: `capitoli/src/` (old Markdown twins, no longer a source), other chapters, `assets/`, tests, `.github/`.

## 3. Context (facts already verified by the ARCH; do not re-research)
- Thomson 1897, Phil. Mag. 44, p. 310: m/e of the cathode-ray particles is about 10^-7, "very small compared with the value 10^-4 ... the value for the hydrogen ion in electrolysis" (about 1000x); "the smallness of m/e may be due to the smallness of m or the largeness of e". Source: Wikisource transcription `Page:Cathode_Rays.pdf/18`.
- The 1/1700 comes from Thomson's Nobel lecture of 1906 ("e/m = 1,700 E/M"; "about 1/1,700 part of the mass of the hydrogen atom"), nobelprize.org PDF `thomson-lecture.pdf`. It is already in the chapter's Fonti ("Carriers of negative electricity").
- Goldstein 1886, p. 698: not even the largest electromagnet of the Berlin Physics Institute (fed by six Bunsen cells) changed the direction of the canal rays, while a small hand-held magnet deflects cathode rays strongly.

## 4. Work, in order
Each replacement must match exactly once (`grep -c` before editing).

1. **M1 (must-fix).** Old (one paragraph plus the comment after it):
   ```
   <p>Nel 1897 Thomson misurò con campi elettrici e magnetici il rapporto fra carica e massa, e/m, delle particelle dei raggi catodici. Il valore non cambiava né con il gas né con il metallo degli elettrodi. Era circa 1700 volte quello dello ione idrogeno dell'elettrolisi: con la stessa carica, la massa è circa 1/1700 di quella dell'atomo di idrogeno.</p>
   <!-- to verify against source: the numbers come from the 1906 Nobel lecture; the 1897 paper itself was not read in full -->
   ```
   New:
   ```
   <p>Nel 1897 Thomson misurò con campi elettrici e magnetici il rapporto fra carica e massa, e/m, delle particelle dei raggi catodici. Il valore non cambiava né con il gas né con il metallo degli elettrodi. Era circa mille volte quello dello ione idrogeno dell'elettrolisi.</p>
   <p>Nel 1897 Thomson non poteva ancora dire se la causa fosse una massa piccola o una carica grande. Nella conferenza per il Nobel del 1906 indicò per queste particelle una massa di circa 1/1700 di quella dell'atomo di idrogeno.</p>
   ```
2. **S1.** Old: `Un piccolo magnete permanente, che sposta subito un fascio di raggi catodici, su di loro non aveva effetto visibile.`
   New: `Un piccolo magnete tenuto in mano piega subito i raggi catodici, ma Goldstein non riuscì a deviare i raggi canale nemmeno con il più grande elettromagnete del suo istituto.`
3. **S2.** Old: `Il biossido di carbonio con doppia carica avrebbe caduto nello stesso punto`
   New: `Il biossido di carbonio con doppia carica sarebbe caduto nello stesso punto`
4. **S11.** Delete the remaining line `<!-- to verify against source: Wien's own text was not read; the description of his apparatus and values is taken from Thomson's 1913 book -->` (the ARCH confirmed the values in Thomson 1913, p. 14). After this, `grep -c 'to verify against source' capitoli/34-storia-origini.html` must print 0.
5. Run the checks, commit ("Storia ch. 34: Thomson 1897 gave about 1000x, the 1/1700 is from the 1906 lecture"), push, open the PR (ready).

## 5. Acceptance
- `grep -c '1700 volte' capitoli/34-storia-origini.html` -> 0; `grep -c 'circa mille volte' capitoli/34-storia-origini.html` -> 1.
- `grep -c 'to verify against source' capitoli/34-storia-origini.html` -> 0.
- `git diff --stat origin/main` -> only `capitoli/34-storia-origini.html`.
- `python3 tools/controlla_teoria.py` -> 0 new errors; `python3 -m pytest -q tests` -> pass; `ci` green.

## Rules that always apply
- Repository `Freeesta/BasePeak` only. Code, commits, PR text: English. Handbook text: Italian only.
- Dyslexia rules: paragraphs of 2-4 sentences, one idea each; no justified text; no whole sentences in italics; Italian decimal comma.
- Never skip, disable or loosen a test; no `.github/` changes; do not merge; do not push to `main`. One small PR, ready for review.
- Report to the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
