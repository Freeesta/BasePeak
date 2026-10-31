# ARCH review: scientific correctness of part VII (chapters 22-32)

Reviewer: ARCH-CHEMI-REVIEW (read-only study). Base: `origin/main` at 25d5968 (DEV-CHEMI-00..07 merged).
Scope: chapters 22-32 (HTML and Markdown twins), `assets/sim-chemi-*.js`, `assets/chemi-common.js`, the part VII
glossary entries, formulary section 6, `docs/piani/riferimenti-chemioinformatica.tsv`, open doubts of
`docs/piani/chemioinformatica.md` section 10 and the extra doubts the builders flagged.
Not in scope: the Nier-Johnson / Mattauch-Herzog drawings (history part, `docs/piani/storia-ms.md`).

Method, in short:
- Every formula re-derived and every worked number recomputed by hand or with a short script (exact masses from
  NIST/AME2020, the same values as `assets/masse.js`).
- Every DOI of the TSV resolved on the Crossref API on 2026-10-31 (119 DOIs): first author, year, volume and first
  page compared with the `citation` column.
- Algorithm descriptions compared with the primary paper and, where the chapter gives defaults, with the code:
  xcms `devel` (`R/functions-Params.R`, `R/do_findChromPeaks-functions.R`, `R/cwTools.R`), CAMERA `devel`
  (`R/xsAnnotate.R`), matchms master 50baefdb (`similarity/CosineGreedy.py`, `ModifiedCosineGreedy.py`,
  `spectrum_similarity_functions.py`), SpectralEntropy 4795aff2 (`spectral_entropy/math_distance.py`), MSEntropy
  fe953bd9 (`ms_entropy/spectra/entropy.py`), MassBank-web 57083f49, HUPO-PSI `mzML1.1.0.xsd` and `psi-ms.obo`
  (data-version 4.2.14), GNPS documentation, NIST MS Search manual v2.2.
- Figures: pure functions read; `python3 -m pytest -q tests` -> 178 passed (node tests included); outputs checked by hand
  for the worked examples quoted in the text (centroid example of ch. 22, isotope score of ch. 30, entropy example
  of ch. 28, formula enumeration of ch. 32).

Result: no wrong formula in the core definitions. Two numeric/sign errors (ppm sign in ch. 30, isotope score
example in ch. 30), a set of imprecise statements (mainly ch. 22, 25, 26, 28, 31, 32) and a few style points.
The TSV metadata are correct for every `verified` row. The fixes are grouped in five small DEV prompts (section 5).

---------------------------------------------------------------------------------------------------------------------

## 1. Findings

Severity: **error** = wrong statement or number; **imprecise** = defensible but misleading or not what the source
says; **style** = wording, missing attribution, consistency. Line numbers are the HTML files; the Markdown twin in
`capitoli/src/` has the same text and must be changed in the same way.

| # | file:line | severity | finding | source | proposed fix (Italian text for the chapter) |
|---|---|---|---|---|---|
| 1 | `capitoli/30-candidati.html:19` (eq. 30.1) and `assets/sim-chemi-candidati.js:32` | error | Sign convention: ch. 30 writes ppm = (m_calc − m_mis)/m_mis, opposite sign and different denominator from ch. 9, ch. 22 (eq. 22.9), ch. 32 (eq. 32.1), the glossary, formulary 6 and `CHEMI.ppm`. The figure code computes `ppmOf(calc, mz)`, so its "Errore (ppm)" column has the opposite sign of every other figure. | Brenton & Godfrey 2010, doi:10.1016/j.jasms.2010.06.006, p. 1823 (mass measurement error of a single reading = (m_i − m_a)/m_a × 10^6, m_a the calculated exact mass); Murray et al. 2013 (IUPAC), doi:10.1351/PAC-REC-06-04-06, entries "exact mass" (calculated) and "accurate mass" (measured) | Eq. 30.1: `errore (ppm) = (m_mis − m_teo) / m_teo × 10^6`. Code: `ppmOf(mz, calc)`. See section 3 for the convention and the full list of places. |
| 2 | `capitoli/32-esempio.html:32` (eq. 32.1) | style | Same convention as ch. 22, but the symbol is m_calc instead of m_teo. | as #1 | Use m_mis and m_teo, as in eq. 22.9 and formulary 6: `errore (ppm) = (m_mis − m_teo) / m_teo × 10^6`; in the text before it: «Il valore teorico calcolato con masse.js per [M+H]+ è 237,1022». |
| 3 | `capitoli/30-candidati.html:26` | error | "Se M+2 sparisce sotto la soglia, *S* scende a 0,21": with only M+2 lost, S = 1 − (0,64 + 32,51 + 0,42)/46,57 = 0,28. 0,21 is the value with M+2 **and** M+3 lost, which is what the figure preset `m2` does (`sim-chemi-candidati.js:55`). | recomputation; pattern 100 : 10,64 : 32,51 : 3,42 checked with NIST abundances | «Se M+2 e M+3 spariscono sotto la soglia, *S* scende a 0,21.» |
| 4 | `capitoli/22-segnale.html:64` | imprecise | The per-bin model k_oss = 1 − e^−k (eq. 22.8) is symmetric: it flattens the peak but does not move a symmetric centroid. The shift toward earlier arrival times comes from a dead time that lasts longer than one bin (an early ion blocks the following bins). The sentence attributes the shift to the model. | eq. 22.8 itself (a symmetric non-linear map of a symmetric peak keeps its centre); dead-time physics of TDC detection | Replace «I bin più alti si saturano per primi: l'intensità è sottostimata e il centroide si sposta verso il lato che arriva prima.» with «I bin più alti si saturano per primi e l'intensità è sottostimata. Se il tempo morto dura più di un bin, uno ione arrivato prima blocca anche quelli che lo seguono: il picco si deforma e il centroide si sposta verso i tempi più brevi, cioè verso m/z più bassi.» |
| 5 | `capitoli/22-segnale.html:56` (eq. 22.7) | no change | σ_c ≈ FWHM/(2,355 √N) is correct (σ/√N with σ = FWHM/2,355); 0,085 ppm and 0,19 ppm recomputed. Design doubt 10 closed (section 4). | Liu et al. 2007, Chem. Rev. 107, 3621-3653, doi:10.1021/cr068288j, §2.3.1 ("statistical error σ/√N"; their 100 ppm FWHM, 16 ions -> ~10 ppm example only works with σ = FWHM/2,355). Not in the TSV: not to be cited unless a DEV adds it as `verified`. | none (the text already says «stima statistica approssimata») |
| 6 | `capitoli/25-picchi.html:39` (eq. 25.4) | imprecise | The CWT is written with a 1/a factor. Du et al. 2006 (and MassSpecWavelet, whose `cwt` xcms adapts as `MSW.cwt`) use ψ_a,b = (1/√a) ψ((t − b)/a). The figure (`sim-chemi-picchi.js:39`) also uses 1/a, so text and code agree with each other but not with the cited source; the normalisation changes which scale gives the largest coefficient ("dove C è massima sta la sua larghezza"). | Du et al. 2006, doi:10.1093/bioinformatics/btl355, Methods (CWT definition); xcms `R/cwTools.R` `MSW.cwt(..., wavelet = "mexh")` | Keep the figure; change the formula to the source and say what the figure does: eq. 25.4 `C(a, t) = (1/√a) ∫ y(u) ψ((u − t)/a) du` and after it: «Du et al. (2006) normalizzano con 1/√*a*; la figura usa 1/*a*, che a parità di picco favorisce un po' le scale piccole.» |
| 7 | `capitoli/25-picchi.html:38-39` | no change | Matched filter (negative second derivative of a Gaussian, σ = fwhm/2,3548, fwhm 30, snthresh 10), centWave S/N = (max − baseline)/sd of local noise, scales from `peakwidth`, ridge lines: all consistent with source. The chapter's «Questa è l'idea, non l'implementazione di xcms» is right: the current xcms noise estimate is more elaborate than the paper's 10 % trimmed mean. | Smith et al. 2006; Tautenhahn et al. 2008 §2.1.3 ("SNR = (I_max − BL)/NL", BL and NL from the 10 % trimmed signal); xcms `do_findChromPeaks-functions.R` l. 252-276, 457-459, 556 | none |
| 8 | `capitoli/26-gruppi.html:43` | imprecise | «Un picco a +1,0034 u più intenso del picco di partenza non può esserlo»: true only while n_C · 1,1 % < 100 %, i.e. below about 90 carbon atoms. Also the example assumes z = 1 without saying so (builder doubt 6). | recomputation; isotope abundances (13C 1,07 %, 15N 0,364 %) | «Per uno ione con *z* = 1, un picco a +1,0034 u con quel rapporto è il suo isotopo <sup>13</sup>C. Per una piccola molecola (meno di circa 90 atomi di C) un picco a +1,0034 u più intenso del picco di partenza non può esserlo.» |
| 9 | `capitoli/26-gruppi.html:38` (table, eq. 26.2) | style | "circa 1,07 % per ogni C" is the 13C abundance; the M+1/M contribution per carbon is 1,07/98,93 = 1,08 % (usually rounded to 1,1 %). The example gives 16,8 %; the full calculation (with 2H and 17O) gives 17,1 %. | NIST isotopic compositions; recomputation | Table: «circa 1,1 % per ogni C»; eq. 26.2 with 1,1 %; example: «15 · 1,1 + 2 · 0,37 ≈ 17,2 % (il calcolo completo, con H e O, dà 17,1 %)». |
| 10 | `capitoli/27-tabella.html:62` | imprecise | PQN as described skips its first step: Dieterle et al. first apply an integral (total area) normalisation, then divide by the median of the quotients to a reference spectrum (often the median spectrum). | Dieterle et al. 2006, doi:10.1021/ac051632c, Methods (procedure steps 1-5) | «<b>PQN</b> (Dieterle et al., 2006): dopo una normalizzazione sull'area totale, si divide ogni campione per la mediana dei quozienti fra il campione e uno spettro di riferimento, di solito lo spettro mediano.» |
| 11 | `capitoli/27-tabella.html:22` (DTW) | style | Builder doubt 7. The figure's DTW cost is |difference of the two intensities| (`sim-chemi-tabella.js:70`), a legitimate local cost; OBI-Warp scores whole scans with a similarity (xcms `ObiwarpParam` default `distFun = "cor_opt"`). Text and code do not contradict each other, but the reader is not told what the figure uses. | Sakoe & Chiba 1978; Prince & Marcotte 2006, doi:10.1021/ac0605344; xcms `R/functions-Params.R` l. 329 | After eq. 27.2: «Nella figura il costo *c*(*i*, *j*) è la differenza assoluta fra le intensità dei due profili; OBI-Warp usa invece una somiglianza fra spettri interi, per esempio la correlazione.» |
| 12 | `capitoli/27-tabella.html:37` (eq. 27.3) | style | The join-aligner score is MZmine's but is given without a source. | Pluskal et al. 2010, doi:10.1186/1471-2105-11-395 (Join aligner) | «Un altro approccio, tipico di MZmine (Pluskal et al., 2010), dà un punteggio ...» (Pluskal2010 is `verified`; add it to the chapter's «Per approfondire»). |
| 13 | `capitoli/28-somiglianza.html:36` | imprecise | Builder doubt 2. The greedy rule is presented as *the* pair-selection rule. In the source of the modified cosine the score is the **optimal** assignment (maximum-weight bipartite matching = highest possible cosine); greedy (matchms `CosineGreedy`, `ModifiedCosineGreedy`) is an approximation that can only give a score ≤ the optimum. Bittremieux et al. compute the optimal assignment (SciPy linear assignment). | Watrous et al. 2012, doi:10.1073/pnas.1203689109, Methods "Construction of molecular MS/MS networks" (PMC3387089); Bittremieux et al. 2022, doi:10.1021/jasms.2c00153, Methods; matchms `CosineGreedy.py` docstring, `ModifiedCosineGreedy.py` l. 56-82, `spectrum_similarity_functions.py` `score_best_matches` | Replace the paragraph «Un picco può avere più candidati ... perdite neutre.» with: «Un picco può avere più candidati ma si accoppia una volta sola. Watrous et al. (2012) scelgono l'insieme di coppie che rende massimo il coseno: è un problema di assegnazione, che si risolve in modo esatto, per esempio con l'algoritmo ungherese. Molti programmi, e la figura, usano una regola più rapida: si ordinano tutte le coppie per prodotto decrescente delle due intensità e si prende ciascuna se nessuno dei due picchi è già stato usato (regola *greedy*). Quasi sempre il risultato è lo stesso; quando cambia, il coseno greedy è un po' più basso. Bittremieux et al. (2022) confrontano coseno, coseno modificato e perdite neutre con l'accoppiamento esatto.» |
| 14 | `capitoli/28-somiglianza.html:47` (modified cosine) | no change | Pair eligibility (direct |Δm/z| ≤ tol, or shifted by the precursor difference) matches Watrous 2012 and matchms; Δ sign consistent with the code. | Watrous 2012 Methods; matchms `ModifiedCosineGreedy.py` l. 56-74 | none |
| 15 | `capitoli/28-somiglianza.html:45` (eq. 28.4) | style | Builder doubt 4. "Gli esponenti dipendono dal programma" is true but gives no reference value. Stein & Scott's optimum on EI spectra is mass^3 and intensity^0,6 (mass^2 equally good). MassBank's search code effectively uses m/z · I^0,5, the values of the figure. | Stein & Scott 1994, doi:10.1016/1044-0305(94)87009-8, abstract and Table 2; MassBank-web `QuickSearchByPeak.java` (intensity × m/z²/100, then square root) | «Gli esponenti dipendono dal programma: Stein e Scott (1994), su spettri EI, trovarono ottimali *n* = 3 e *m* = 0,6; la figura usa *n* = 1 e *m* = 0,5.» |
| 16 | `capitoli/28-somiglianza.html:25` (precursor removal) | no change | Builder doubt 4. "Il valore giusto dipende dal programma" is correct: GNPS and matchms remove peaks within ±17 Da of the precursor; the figure removes everything above precursor − 1,5. No verified reference for a number; leave the text. | GNPS documentation, networking, "Filter Precursor Ion Window"; matchms `remove_peaks_around_precursor_mz` (default 17) | none (optional after the GNPS-docs TSV row becomes `verified`, see DEV-FIX-05) |
| 17 | `capitoli/28-somiglianza.html` (entropy, eq. 28.5 and steps 1-4) | no change | Builder doubt 3 / design doubt 4: w = 0,25 + 0,25 S for S < 3 (then renormalise) is the paper's Eq. 3 and the code; the docstring of `entropy_distance` («0.25+S*0.5, S<1.5») is wrong. Similarity 1 − (2 S_AB − S_A − S_B)/ln 4 with natural log and S_AB of the 1:1 mixture: correct. Worked example recomputed: S = 1,030, w = 0,507, 1,081, S_M = 1,262, similarity 0,738. | Li et al. 2021, doi:10.1038/s41592-021-01331-z, Methods, Eqs. 1-3 (PMC11492813); SpectralEntropy `math_distance.py` l. 62 (docstring) vs l. 70-81 (code); MSEntropy `apply_weight_to_intensity` l. 212-222 | none |
| 18 | `capitoli/29-librerie.html:47` (network) | style | Builder doubt 4. The top-K rule of the figure (edge kept if among the K best of **both** nodes) is GNPS's rule; the chapter gives no reference values. Watrous et al. used cosine ≥ 0,7, at least 6 matched peaks and at most 10 links per spectrum. | Watrous 2012 Methods; GNPS documentation, networking ("Node TopK", default 10, "kept only if both nodes are within each other's TopK") | After «...fra i K migliori di entrambi)»: «Watrous et al. (2012) usavano un coseno di almeno 0,7, almeno 6 picchi in comune e al più 10 legami per spettro.» |
| 19 | `capitoli/29-librerie.html:24` | no change | Match factor / reverse match factor (0-999, reverse ignores query peaks absent in the library spectrum) agrees with the NIST manual. The exact composite formula is not in the manual passage read (design doubt 7: half open). | NIST MS Search v2.2 manual, p. 39 "Basis for interpretation of the library search results" | none |
| 20 | `capitoli/29-librerie.html:17` (licences table) | no change | MassBank: licence per record (allowed CC0, CC BY, CC BY-NC, CC BY-NC-SA, CC BY-SA); GNPS: spectra contributed directly are CC0 by default, imported libraries vary: the chapter's «condizioni d'uso sul sito» is right. MoNA per-record licence not confirmed on an official page. | MassBank-web `Documentation/MassBankRecordFormat.md` §2.1.5; GNPS documentation (spectrum curation, browse libraries) | none |
| 21 | `capitoli/31-confidenza.html:16, 30` | style | Builder doubt 1. Two HTML comments «to verify against source» are still in the published page. Resolved by #22-#25: remove both comments (here and in the Markdown twin). | this review | delete the two comments |
| 22 | `capitoli/31-confidenza.html:22-24` (Schymanski table) | imprecise | Level names and minimum data match Fig. 1 of Schymanski 2014 (1 "Confirmed structure by reference standard": MS, MS2, RT, reference standard; 2a "Probable structure by library spectrum match"; 2b "by diagnostic evidence"; 3 "Tentative candidate(s)": MS, MS2, experimental data; 4 "Unequivocal molecular formula": MS isotope/adduct; 5 "Exact mass of interest": MS). Two cells are not what the source says: level 3 needs MS, MS2 **and** experimental data (not "o"); level 2a requires that the spectrum-structure match is **unambiguous** (library or literature). | Schymanski et al. 2014, doi:10.1021/es5002105, Fig. 1 and text; read through two faithful open reproductions of Fig. 1 and its text: Metabolites 2021, 11, 757 (doi:10.3390/metabo11110757, PMC8618349) and MethodsX 2021 (doi:10.1016/j.mex.2021.101470, PMC8374650, Table 2). See section 4, doubt 5. | Row 2a, column «Prove minime»: «MS e MS2 coincidono senza ambiguità con uno spettro di libreria o di letteratura». Row 3: «MS, MS2 e dati sperimentali compatibili con uno o più candidati, ma non bastano per una sola struttura (per esempio isomeri di posizione)». Row 1: add «se possibile, anche un metodo ortogonale». |
| 23 | `capitoli/31-confidenza.html:28` | style | «Dal livello 2 in giù non basta un nome: il livello 2 ha due sottolivelli, uno per ciascun tipo di prova» is hard to parse and the first clause says nothing. | Schymanski 2014 (2a library, 2b diagnostic, "no other structure fits") | «Il livello 2 ha due sottolivelli: 2a se lo spettro coincide senza ambiguità con uno di libreria o di letteratura, 2b se nessun'altra struttura spiega i dati ma mancano standard e letteratura. Solo il livello 1 richiede uno standard di riferimento.» |
| 24 | `capitoli/31-confidenza.html:31` (MSI level 1) | style | The paraphrase is correct; the source says "authentic compound" and "two independent and orthogonal data". The source also says that literature or external-laboratory data give level 2, a useful sentence for the reader. | Sumner et al. 2007, doi:10.1007/s11306-007-0082-2, §"Proposed minimum metadata relative to metabolite identification" (PMC3772505) | «Il livello 1 richiede almeno due dati indipendenti e ortogonali, per esempio tempo di ritenzione e spettro, confrontati con quelli di un composto autentico misurato nelle stesse condizioni. Dati di letteratura o di un altro laboratorio portano al livello 2.» |
| 25 | `capitoli/31-confidenza.html:35` | style | The source spells "Putatively characterized compound classes" (z). | Sumner 2007, same section | «(*Putatively characterized compound classes*)» |
| 26 | `capitoli/32-esempio.html:67, 77` (compound C, level 4) | imprecise | Level 4 requires the formula to be fixed by spectral evidence (isotopes/adducts). The text says the formula is unique only by mass within 3 ppm and a restricted element set; the figure code already ranks by isotope error (`sim-chemi-esempio.js:120-130`). Uniqueness checked: C13H18N4O3 is the only CHNO(Cl≤2) formula, RDB ≥ 0 integer, within 3 ppm of 279,1456. | Schymanski 2014, Fig. 1 (level 4: "MS isotope/adduct") | Line 67, after «l'unica formula è C13H18N4O3»: «e il suo profilo isotopico (M+1 circa 16 %, nessun M+2 da cloro) concorda con quello misurato.» Line 77: «C ha il livello 4: massa e profilo isotopico fissano la formula, ma senza MS2 non c'è nessun candidato.» |
| 27 | `capitoli/32-esempio.html:65` (eq. 32.3) | style | Correct, but it is the cosine of square-root intensities (p = 0,5 of ch. 28) written in a different form from eq. 28.3; the reader may think it is another score. | eq. 28.3 with a_i = √I_i | Before the equation: «È il coseno della (28.3) calcolato sulle radici delle intensità (*p* = 0,5):». |
| 28 | `capitoli/19-glossario.html:56` («Frammentazione in sorgente (ISF)», linked from ch. 26) | style | «si vede nel full scan come un prodotto di trasformazione» belongs to the removed TP storyline, and «Q1 / declustering potential» is QqQ-specific while ch. 26 is about HRMS. | design rule (no TP storyline); ch. 26 text | «Rottura di uno ione prima dell'analizzatore, nella regione della sorgente, per urti degli ioni accelerati. Il frammento è uno ione vero e nel full scan sembra un composto diverso, ma ha il tempo e la forma del picco del suo precursore.» (keep the links Cap. 15, Cap. 26) |
| 29 | `capitoli/20-formulario.html:128` (13C spacing) | no change | Builder doubt 6: Δ(m/z) ≈ 1,0034/z is right in value and sign (13C − 12C = 1,0033548 u; heavier isotopologue at higher m/z); ch. 26 says the same (table + «Δm/z»). Only the ch. 26 example needs «z = 1» (#8). | NIST isotopic compositions (13C = 13,00335483507 u); AME2020 | none |
| 30 | `capitoli/24-tracce.html:35` (ROI) | no change | Simplified ROI building, `prefilter`, `wMean` and the CentWaveParam defaults table all match xcms `devel` and Tautenhahn §2.1.1 (the chapter says it is simplified). | xcms `R/functions-Params.R` l. 90; Tautenhahn 2008 §2.1.1 | none |
| 32 | `assets/sim-chemi-confidenza.js:37-43` (`F.livello`) | no change | Decision order 1 (standard + MS2) > 2a (library) > 2b (MS2 + diagnostic) > 3 (formula and MS2 or other evidence) > 4 (formula) > 5 (mass) matches Fig. 1; level 3 accepting «MS2 o altra evidenza» is a didactic simplification of «MS, MS2, Exp. data», acceptable because the figure says what is missing to go up. | Schymanski 2014, Fig. 1 | none |
| 31 | `capitoli/23-formati.html` (CV table, binary arrays) | no change | Little-endian IEEE-754 arrays, base64 4·⌈n/3⌉ (4000 bytes -> 5336 chars), float32 relative error 2^−24 ≈ 0,06 ppm, all PSI-MS accessions (MS:1000511, 1000016, 1000127/8, 1000744, 1000041, 1000514/5, 1000521, 1000523, 1000574, 1000576, 1002312-4), mzXML network byte order: correct. | `mzML1.1.0.xsd` l. 783-790 ("Byte ordering is always little endian"); psi-ms.obo 4.2.14; mzXML 3.1 schema (`byteOrder fixed="network"`) | none |

Checked and correct, with no line in the table: eq. 22.1-22.6, 22.8 (values), 22.10, 22.11 and all ch. 22 worked
numbers (FWHM 6 and 1,25 mDa; 5,0/2,0/1,0 ppm; parabola 200,1217; centroid 200,1211; 4,8 % and 37 %); eq. 24.1-24.4
and examples (0,0015 Da; 3,6 mDa and R ≈ 83 000; bins 3000/3001; 333 ppm); eq. 25.1-25.3, 25.5-25.8 (A = 10 027;
SG 506/35 = 14,46; Rs = Δt/4σ; EMG form; As and Tf); all mass differences of ch. 26 (21,9819; 17,0265; 37,9559;
35,9767; 46,0055; 18,0106; 43,9898; 1,9970; 1,9980; dimer rule; 1,0073 and 22,9892); eq. 27.1, 27.2, 27.4, 27.5 and
the PeakDensity / CentWave / MatchedFilter defaults; cosine example 0,82 and 10 ppm = 0,002/0,008 Da (ch. 28);
eq. 29.1-29.2 (target-decoy competition gives FDR ≈ D/T); atrazine 215,0938 / 216,1011 and pattern 100 : 10,64 :
32,51 : 3,42, S = 0,923 (ch. 30); Seven Golden Rules list and H/C 0,2-3,1 (Kind & Fiehn 2007); carbamazepine
[M+H]+ 237,1022 and M+1 at 1,7 ppm, window 237,1013-237,1037, CVs 4-8 %, blank ratio 0,97 (ch. 32); every
formulary section 6 entry against its chapter.

---------------------------------------------------------------------------------------------------------------------

## 2. References and the TSV

- All 80 `verified` rows: DOI resolves, first author, year (print or online), volume and first page match the
  `citation` column. Notes:
  - Dunn2011: Crossref lists "The Human Serum Metabolome (HUSERMET) Consortium" as first author and then Dunn, Broadhurst,
    Begley...; "Dunn W.B. et al." is the usual citation and is correct for the person list. The note «first author
    not returned by Crossref: to verify» can become «first person author Dunn W.B., consortium listed first by Crossref».
  - Hertz1971: authors Hertz, Hites, Biemann confirmed on Crossref.
  - Watrous2012: Crossref returns no pages; PMC3387089 confirms E1743-E1752.
  - Broadhurst2018 (72), Scheubert2017 (1494), Hollender2023 (75): article numbers confirmed by Crossref.
- `to verify` rows that can now be closed (DEV-FIX-05):
  - ASTM-E2077: designation E2077-00(2024), doi:10.1520/E2077-00R24, "Standard Specification for Analytical Data
    Interchange Protocol for Mass Spectrometric Data", active (ASTM store page). Status -> `verified`.
  - NIST-MSSearch: NIST MS Search Program v2.2 manual, p. 39 (match factor, reverse match factor, 0-999). Status ->
    `verified` for those definitions; the composite score formula stays unverified.
  - GNPS-docs: ccms-ucsd.github.io/GNPSDocumentation/networking/ (defaults: precursor tolerance 2,0 Da, fragment 0,5 Da,
    min cosine 0,7, min matched peaks 6, Node TopK 10 mutual, max component size 100, precursor window ±17 Da).
    Status -> `verified` (read 2026-10-31).
  - MassBank-licences: MassBank record format spec §2.1.5 (licence mandatory, allowed list). Status -> `verified`.
  - deHoffmann2007, McLaffertyTurecek1993: not checked (books without DOI, not cited in part VII): leave as they are.
- `preexisting` rows (42): every DOI resolves on Crossref. Five of them are photocatalysis / transformation-product
  papers cited only in the ch. 19 bibliography or ch. 16 (preexisting-14, -24, -26, -29, -30). Not part VII scope:
  they belong to the pending question to Federico on stripping the TP story (COORDINAMENTO "Waiting for Federico").
- Claims attributed to papers in the text («ha introdotto ...») were checked against abstracts/methods for every
  history box; all names and years match the cited source. The ch. 24 box does not claim "reconstructed ion
  chromatograms" for Hites & Biemann 1970 (that design item was `to verify against source` and was rightly left out).

---------------------------------------------------------------------------------------------------------------------

## 3. ppm sign convention (builder doubt 5): decision and places

Decision: everywhere **ppm = (m_mis − m_teo) / m_teo × 10^6**, positive when the measured value is too high.
Reason: it is the definition of Brenton & Godfrey 2010 (p. 1823), it follows the IUPAC use of "exact mass" as the
calculated reference (Murray 2013), and it is already used in ch. 9, ch. 22, the glossary, formulary 6 and `CHEMI.ppm`.

| Place | Now | Action |
|---|---|---|
| `capitoli/09-risoluzione.html` eq. 9.1-9.2 (via formulary) | (m_mis − m_teor)/m_teor | none |
| `capitoli/22-segnale.html:67` eq. 22.9 (+ `src`) | (m_mis − m_teo)/m_teo | none |
| `capitoli/30-candidati.html:19` eq. 30.1 (+ `src/30-candidati.md:22`) | (m_calc − m_mis)/m_mis | change (DEV-FIX-01) |
| `capitoli/32-esempio.html:32` eq. 32.1 (+ `src`) | (m_mis − m_calc)/m_calc | rename m_calc -> m_teo (DEV-FIX-01) |
| `capitoli/20-formulario.html` section 6 and ch. 9 block | (m_mis − m_teo)/m_teo | none |
| `capitoli/19-glossario.html:13` «Accuratezza di massa / errore in ppm» | (m_mis − m_teor)/m_teor | none |
| `assets/chemi-common.js:60` `CHEMI.ppm(meas, theo)` | (meas − theo)/theo | none |
| `assets/sim-chemi-candidati.js:32` `ppmOf(calc, mz)` | (calc − meas)/meas | `ppmOf(mz, calc)` (DEV-FIX-01); line 115 is already (meas, theo) |
| `assets/sim-chemi-esempio.js`, `sim-chemi-segnale.js` (all `CHEMI.ppm` calls) | (meas, theo) | none |

`tests/test_chemi_livelli.py` only checks `Math.abs(x.ppm)`: the sign change does not touch any test.

---------------------------------------------------------------------------------------------------------------------

## 4. Open doubts: design section 10 and builders' doubts

| Doubt | Status | Answer and source |
|---|---|---|
| D1 centWave noise, ridges, snthresh | closed | Paper: BL and NL = mean and SD of the 10 % trimmed signal, SNR = (I_max − BL)/NL (Tautenhahn 2008 §2.1.3). Current xcms: first guess `estimateChromNoise` (trimmed mean of non-zero intensities), then a local estimate outside the peak; `baseline = max(1, min(local, noise))`, `sdnoise = max(1, local SD)`, S/N = (maxint − baseline)/sdnoise; scales `round(peakwidth/mean(diff(scantime))/2)` in steps of 2; ridges linked coarse to fine with gap ≤ 3 scales (`R/do_findChromPeaks-functions.R` l. 252-276, 457-459, 556; `R/cwTools.R`). The chapter's simplified description is compatible (#7). |
| D2 modified cosine pair selection, GNPS vs matchms | closed | Watrous 2012: optimal bipartite matching (highest cosine), sqrt intensities, tolerances 1,0/0,3 Da. matchms: greedy by product of weighted intensities (approximation), defaults tolerance 0,1 Da, mz_power 0, intensity_power 1; exact variants `CosineHungarian`, `ModifiedCosineHungarian`. Greedy is **not** equal to the GNPS/Watrous definition (can be lower; counterexample weights 0,5/0,45/0,45 -> greedy 0,5, optimum 0,9). Fix #13. |
| D3 weighted cosine exponents | closed (composite open) | Stein & Scott 1994 Table 2: mass^3, intensity^0,6 (mass^2 equally effective). MassBank code: m/z · I^0,5. NIST composite formula: not read (open, not needed by the text). Fix #15. |
| D4 spectral entropy weighting | closed | w = 0,25 + 0,25 S for S < 3 (Li 2021 Eq. 3; SpectralEntropy and MSEntropy code). The docstring «0.25 + 0.5 S, S < 1.5» is a docstring error. Chapter and code correct (#17). |
| D5 Schymanski 2014 levels and MSI wording | closed for MSI; closed for Schymanski through reproductions | MSI: four levels and level-1 requirement read in Sumner 2007 (PMC3772505). Schymanski: names, minimum data and 2a/2b/3/4/5 wording read in two open reproductions of Fig. 1 and text (PMC8618349, PMC8374650); the ACS full text was not reachable from this container (HTTP 403). Residual: the 2b and level 5 "minimum data" cells were not seen in a reproduction (chapter says «evidenza diagnostica» and «MS», consistent with the 2014 text). Fixes #21-#25. |
| D6 CAMERA defaults | closed | `groupFWHM(sigma = 6, perfwhm = 0.6)`, `groupCorr(cor_eic_th = 0.75, pval = 0.05)`, `findIsotopes(ppm = 5, mzabs = 0.01, maxcharge = 3, maxiso = 4)`, `findAdducts(ppm = 5, mzabs = 0.015)` (CAMERA `R/xsAnnotate.R` l. 235, 365, 539, 773); Kuhl 2012: "typically 60 % of the FWHM", "default ... correlation threshold of 0.75", isotopes 1,0033/z. Ch. 26 says «per esempio 0,8»: acceptable as an example, no fix. |
| D7 NIST match factor / reverse / composite | half open | MF and RMF definitions closed (manual v2.2 p. 39); composite formula open (not used by the text). |
| D8 GNPS networking defaults | closed | GNPS docs: 2,0 / 0,5 Da, cosine 0,7, 6 peaks, Node TopK 10 (mutual), component size 100, ±17 Da precursor filter. Aron 2020 full text not read. |
| D9 mzML / mzXML byte order, ASTM E2077 | closed | mzML little-endian (xsd 1.1.0 l. 783-790); mzXML network order (schema 3.1 `byteOrder fixed="network"`); ASTM E2077-00(2024), active. |
| D10 centroid precision FWHM/(2,355 √N) | closed | Liu et al. 2007 Chem. Rev. §2.3.1 (σ/√N, σ = peak width; example consistent with σ = FWHM/2,355). Not in the TSV: the text needs no citation (#5). |
| D11 licences MassBank / GNPS / MoNA | mostly closed | MassBank per record (allowed list), GNPS CC0 default for direct contributions; MoNA licence page not reachable: open, chapter wording «per ogni record» stays. |
| B1 Schymanski / MSI wording (ch. 30-31) | closed | = D5; fixes #21-#25. |
| B2 modified cosine rule (ch. 28) | closed | = D2; fix #13. |
| B3 entropy weighting (ch. 28) | closed | = D4; no fix. |
| B4 weighted-cosine exponents, precursor margin, top-K (ch. 28-29) | closed | = D3 (#15), #16 (no fix), #18. |
| B5 ppm sign convention (ch. 22, 30, 32) | closed | Section 3; fixes #1, #2. |
| B6 isotope spacing 1,0034/z (formulary 6, ch. 26) | closed | Value and sign right (#29); ch. 26 example gets «z = 1» (#8). |
| B7 DTW cost in fig. 27.1 | closed | Code uses |intensity difference|; text generic; add one sentence (#11). |
| B8 Nier-Johnson / Mattauch-Herzog drawings | out of scope | History part, not reviewed here. |

Open scientific doubts after this review: NIST composite score formula (not used in the text); MoNA licence wording;
Schymanski Fig. 1 cells for 2b and level 5 seen only in the 2014 text, not in a reproduction of the figure.

---------------------------------------------------------------------------------------------------------------------

## 5. DEV fix prompts

Five small PRs with disjoint files (prompts in `docs/piani/prompt-chemioinformatica-fix/`). They can run in parallel;
the only shared file is the generated `assets/indice-ricerca.js`: on a conflict, merge `main` and re-run
`python3 tools/genera_indice_teoria.py` (never hand-merge it).

| Prompt | Findings | Files |
|---|---|---|
| `DEV-FIX-01-segnale-candidati-esempio.md` | #1, #2, #3, #4, #26, #27 | `capitoli/22-segnale.*`, `capitoli/30-candidati.*`, `capitoli/32-esempio.*`, `assets/sim-chemi-candidati.js` |
| `DEV-FIX-02-picchi-gruppi-tabella.md` | #6, #8, #9, #10, #11, #12 | `capitoli/25-picchi.*`, `capitoli/26-gruppi.*`, `capitoli/27-tabella.*` |
| `DEV-FIX-03-somiglianza-librerie.md` | #13, #15, #18 | `capitoli/28-somiglianza.*`, `capitoli/29-librerie.*` |
| `DEV-FIX-04-confidenza.md` | #21, #22, #23, #24, #25 | `capitoli/31-confidenza.*` |
| `DEV-FIX-05-glossario-riferimenti.md` | #28, TSV statuses (section 2), design section 10 pointer | `capitoli/19-glossario.html` + `src`, `assets/glossario-dati.js`, `docs/piani/riferimenti-chemioinformatica.tsv`, `docs/piani/chemioinformatica.md` (section 10 only) |
