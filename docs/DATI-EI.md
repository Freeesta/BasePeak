# EI spectra data

The electron-ionisation (EI, 70 eV) spectra used by chapters 13-14 of the Teoria and by the Pratica game
"Dallo spettro alla struttura" are committed as plain JavaScript data files. This page explains where they come from,
how they are structured, how to add a spectrum by hand and how they were generated.

## Origin and licence

- **Source: MassBank Europe** (<https://massbank.eu>, REST API). Every one of the 177 spectra (120 in `ei-dati.js`, 57 in the level files) is a MassBank EI record
  (all with the MassBank prefix `MSBNK-Fac_Eng_Univ_Tokyo`; authors and institutions are in each `src`).
- **Licence of the records: CC BY-NC-SA** (Creative Commons Attribution-NonCommercial-ShareAlike). All 177 records in the
  files carry this licence. The data files are therefore distributed under **CC BY-NC-SA 4.0** (non-commercial teaching
  use, attribution, same licence for adaptations), not under the MIT licence of the code and not under the CC BY 4.0 of the texts.
- **Attribution is part of the data.** Every spectrum has a `src` object with the MassBank accession, authors, instrument and
  licence, and the page shows it under each spectrum (`ei-spettri.js`) and in the game.
- No spectrum comes from the NIST library. The site never calls MassBank at run time.
- Modifications made to the records: peaks merged to integer m/z, intensities rescaled to per mille (base peak = 999),
  peaks below 0.2 % of the base peak dropped, and one representative record chosen per compound (see "How it was generated").
- The short teaching notes on the ions (`keys[].text`) are original and carry the same licence as the data files.
- Third-party licences overview: `LICENZE-TERZI.md`.

## Files

| File | Content |
|---|---|
| `mzlab/web/teoria/pratica/ei-dati.js` | `const EI_DATA = {...}`: the base set (`items`) and the index of the extra compounds (`extra`) |
| `mzlab/web/teoria/pratica/ei-dati-l1.js` ... `ei-dati-l5.js` | `EI_DATA.items.push(...[...])`: extra compounds, loaded by the game only when that path level (or one of its compounds) is asked for |
| `mzlab/web/teoria/pratica/ei-aiuti.js` | Level-3 hints of the hard mode, by compound id (hand-written) |

## Structure of `ei-dati.js`

```js
const EI_DATA = {
  "version": 3,
  "source": "MassBank Europe",
  "items": [ /* spectra */ ],
  "extra": { "dodecano": 1, "2-metil-2-pentanolo": 2 }   // id -> number N of the file ei-dati-lN.js that holds it
};
```

Each spectrum (an element of `items`, in the level files too):

| Field | Meaning |
|---|---|
| `id` | Unique, stable key (used by `data-ei="..."` in the chapters and by the saved progress of the game: never rename it) |
| `name`, `name_en` | Italian and English name |
| `formula`, `M` | Molecular formula and nominal mass (integer, from the most abundant isotopes) |
| `smiles`, `inchikey` | Structure identifiers |
| `family` | Section of chapter 14 (`alcani`, `alcheni`, ...) |
| `level` | Difficulty 1-4 |
| `play` | `true`: used by the game; `false`: reference spectrum only |
| `keys` | Teaching notes: list of `{mz, ion, type, text, delta?}`. `ion` is a formula with `+.` (radical cation) or `+` (cation); `type` is one of `M`, `alpha`, `i`, `sigma`, `mclafferty`, `rda`, `tropilio`, `orto`, `serie`, `perdita`, `riarr`, `isotopo` (then `delta` = 1, 2 or 4) |
| `iso` | M+1 / M+2 measured and expected (`m1`, `m2`, `m1_exp`, `m2_exp`) and `ok` (is the cluster usable) |
| `path`, `order` | Optional: level 1-5 of the learning path and position inside it |
| `skills` | Optional, for path compounds: skills practised (`M`, `isotopi`, `azoto`, `alpha`, `sigma`, ...) |
| `peaks` | `[[m/z, intensity], ...]` sorted by m/z, integer m/z, base peak = 999 |
| `src` | `{accession, authors, license, instrument, n_spectra, cos_mean}`: the MassBank record shown, its licence, how many records of the compound were compared and the mean cosine of the chosen one against the others |

`tests/test_ei_dati.py` checks the committed files only: structure, source and licence of every spectrum, nominal mass and
nitrogen rule, odd/even electrons of every key ion, sub-formula of the compound, key peaks really present, no NIST,
file sizes, and that every `data-ei` used in the chapters exists.

## Adding a spectrum by hand

1. Pick a record on <https://massbank.eu> (EI, 70 eV) whose licence is one of CC BY-NC-SA, CC BY-NC, CC BY-SA, CC BY, CC0.
   Do not use NIST or any record with another licence.
2. Add an item to `items` in `ei-dati.js` (or to the right `ei-dati-lN.js` and add `"id": N` to `extra`). Copy a similar
   item and change every field: take `peaks` from the record, merge to integer m/z, scale so the base peak is 999 and
   keep peaks above 2 (0.2 %). Fill `src` from the record (accession `MSBNK-...`, authors, instrument, licence);
   `n_spectra` = 1 and `cos_mean` = 1 when you compared no other record.
3. Write the `keys`: for each ion `mz` must equal the nominal mass of `ion` (plus `delta` for an isotope peak), the
   radical cation `+.` goes with odd-electron mechanisms (`M`, `mclafferty`, `rda`, `orto`) and `+` with simple cleavages
   (`alpha`, `i`, `sigma`, `tropilio`, `serie`), and the peak must be at least 10 per mille (2 for `M`). A note must not say the name of the compound.
4. Optional: `path`/`order`/`skills` for the learning path, a hint in `ei-aiuti.js` for every path compound.
5. Keep each data file under about 150 kB (split further if needed). Run `python3 -m pytest tests/test_ei_dati.py`.
6. Cite it in a chapter with `<div class="eispec" data-ei="your-id" data-keys="1"></div>`.

## How it was generated

The files were produced once by a script (kept for the record in `docs/provenance/genera_ei.py`, **not runnable here**).
For each compound of an internal list it searched the MassBank EI records by each synonym, kept a record only if its name and
formula matched exactly and it contained every key ion, merged the peaks to integer m/z, and chose the most representative
record (highest mean cosine similarity, with square-root intensities, against the other records of the same compound,
with a preference for a molecular-ion cluster consistent with the formula). The number of records and the cosine are stored in `src`.

The inputs of that script are **private and not published**: the list of compounds with their teaching notes in the
unpublished modules `ei_lista_extra.py` and `ei_percorso.py` (extra compounds and learning path), and the chemistry helper `mzlab.chem.elements`
of the private mzLab application, plus a local cache of the MassBank downloads. Only the generated public files are in this
repository. The hand-written notes were, and remain, checked by `tests/test_ei_dati.py`.

## Other generated files (these do run here)

| File | Generator | Input |
|---|---|---|
| `mzlab/web/teoria/glossario-dati.js` | `tools/genera_glossario.py` | `19-glossario.html` |
| `mzlab/web/teoria/indice-ricerca.js` | `tools/genera_indice_teoria.py` | the chapter HTML files |
