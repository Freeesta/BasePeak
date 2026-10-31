<!-- script: chemi-common.js -->
<!-- title: Tracce di massa e ROI -->
# Tracce di massa: XIC e regioni d'interesse {kicker: Capitolo 24}

{.lead} Un'analisi LC-HRMS è una nuvola di punti con tempo, m/z e intensità. Qui si impara a scegliere la finestra di un XIC e a costruire le tracce di massa passo per passo.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Nel 1970 Hites e Biemann (1970) descrissero la valutazione al calcolatore di spettri di massa registrati in continuo sull'effluente di un gascromatografo: far leggere a una macchina molte scansioni è l'idea da cui discendono le tracce di oggi. Nel 2006 XCMS (Smith et al., 2006) divise l'asse m/z in intervalli fissi. Per sfruttare l'alta accuratezza di massa Tautenhahn et al. (2008) proposero le regioni d'interesse (ROI), che seguono la massa misurata e sono il primo passo di centWave.</p></details>
```

## I dati come nuvola di punti

Ogni scansione di uno spettrometro LC-HRMS è una lista di centroidi, ciascuno con un m/z e un'intensità (come si ottengono: capitolo 22; che cosa sono: [Profilo e centroide](10-dati.html)). Mettendo in fila le scansioni nel tempo, l'analisi diventa una nuvola di punti in tre dimensioni: tempo di ritenzione, m/z e intensità.

Un composto che eluisce lascia una fila di punti allo stesso m/z, scansione dopo scansione: quella fila è una **traccia di massa**. La sua intensità nel tempo è il cromatogramma su cui si cerca il picco (capitolo 25).

Ci sono due modi per ottenere una traccia. Se la massa è nota, si fa un **XIC** con una finestra attorno a quel valore ([Cromatogrammi: TIC, BPC, XIC](10-dati.html)). Se non lo è, un algoritmo cerca le tracce nei dati: sono le **regioni d'interesse** (ROI, dall'inglese *region of interest*).

## La finestra di estrazione in ppm

Un XIC somma le intensità dei centroidi (o ne prende il massimo) che cadono in una finestra attorno a un m/z scelto. Per ogni scansione *s*:

```html
<span class="eq"><i>I</i>(<i>s</i>) = Σ <i>I</i><sub><i>k</i>,<i>s</i></sub> &nbsp; per &nbsp; |<i>m</i><sub><i>k</i></sub> − <i>m</i>| ≤ Δ, &nbsp; Δ = <i>m</i> · tol · 10<sup>−6</sup><span class="no">(24.1)</span></span>
```

Si dà in ppm perché l'errore cresce con la massa: a m/z 300,1234, ±5 ppm vale ±0,0015 Da. Le definizioni di ppm e accuratezza sono nel [capitolo 9](09-risoluzione.html).

### Quanto larga: errore di massa e risoluzione

La larghezza segue la **dispersione** dell'm/z misurato per lo stesso ione da una scansione all'altra, non la risoluzione nominale. Con una deviazione standard di 2 ppm, ±5 ppm raccoglie quasi tutti i punti; ±1 ppm ne perde più della metà. Ai bordi del picco la dispersione cresce. Non c'è un valore valido per tutti: si stima sui propri dati ([Potere risolutivo, accuratezza e ppm](17-hr-dda.html)).

### Isobari vicini

Due ioni di masse *m*~1~ e *m*~2~ sono separati dalla finestra se distano più della semi-ampiezza; lo strumento però deve anche risolverli:

```html
<span class="eq">|<i>m</i><sub>1</sub> − <i>m</i><sub>2</sub>| &gt; Δ &nbsp;&nbsp; e &nbsp;&nbsp; <i>R</i> ≥ <span class="frac"><span><i>m</i></span><span>Δ<i>m</i></span></span><span class="no">(24.2)</span></span>
```

Due ioni a m/z 300 distanti 12 ppm differiscono di 3,6 mDa e servono *R* ≳ 83 000. Con *R* minore lo strumento dà un solo centroide intermedio; con *R* sufficiente ma una finestra più larga di 12 ppm, l'isobaro entra nell'XIC e l'area è sbagliata ([Difetto di massa e masse quasi uguali](17-hr-dda.html)).

```html
<details class="poe"><summary>Prima di provare: con dispersione di 2 ppm e un isobaro a 12 ppm, quale finestra prende tutta l'area senza l'isobaro?</summary>
<p>Da circa ±3 a ±8 ppm: a ±3 si recupera l'88 % dell'area, da ±5 il 100 %. Sotto ±2 si perde quasi metà del segnale; da ±11 entra l'isobaro (12 % dell'area, 40 % oltre ±20).</p></details>
```

```html
<div class="sim" id="sim-chemi-xic" data-sim="../assets/sim-chemi-tracce.js"><h4>Figura 24.1 La finestra in ppm</h4>
<p class="note nota">Una finestra troppo stretta perde segnale, una troppo larga include un isobaro. Dati sintetici, a scopo didattico.</p></div>
```

## Costruire le tracce di massa

Per ioni sconosciuti un algoritmo costruisce le tracce dai dati. Questa versione semplificata è il primo passo di centWave (Tautenhahn et al., 2008); i picchi sono nel capitolo 25.

### L'algoritmo passo per passo

```html
<div class="box math"><b>Costruzione delle ROI</b>
<ol>
<li>Si scorrono le scansioni nel tempo, senza ROI iniziali.</li>
<li>Ogni centroide, dal più intenso, cerca la ROI aperta più vicina con massa media entro Δ, non ancora estesa in questa scansione.</li>
<li>Se la trova vi si aggiunge e la media si aggiorna (24.3); altrimenti apre una ROI nuova.</li>
<li>Una ROI non estesa per più del «vuoto massimo» si chiude.</li>
<li>Restano le ROI di almeno <i>L</i> scansioni con almeno <i>k</i> punti ≥ <i>I</i><sub>min</sub> (prefiltro).</li>
</ol></div>
```

```html
<span class="eq"><i>m</i><sub>media</sub> = <span class="frac"><span>Σ <i>m</i><sub><i>i</i></sub> <i>I</i><sub><i>i</i></sub></span><span>Σ <i>I</i><sub><i>i</i></sub></span></span><span class="no">(24.3)</span></span>
```

### I parametri

```html
<p>I valori predefiniti di <code>CentWaveParam</code> in xcms (sorgente, ramo di sviluppo, 31 ottobre 2026) sono un punto di partenza, non una raccomandazione:</p>
```

```html
<table>
<caption>Valori predefiniti in xcms</caption>
<tr><th>Parametro</th><th class="n">Valore</th><th>Parametro</th><th class="n">Valore</th></tr>
<tr><td><code>ppm</code></td><td class="n">25</td><td><code>mzCenterFun</code></td><td class="n">"wMean"</td></tr>
<tr><td><code>prefilter</code></td><td class="n">c(3, 100)</td><td><code>integrate</code></td><td class="n">1</td></tr>
<tr><td><code>peakwidth</code></td><td class="n">c(20, 50) s</td><td><code>mzdiff</code></td><td class="n">−0,001</td></tr>
<tr><td><code>snthresh</code></td><td class="n">10</td><td><code>noise</code></td><td class="n">0</td></tr>
<tr><td colspan="2"></td><td><code>fitgauss</code></td><td class="n">FALSE</td></tr>
</table>
```

```html
<p>Per le ROI contano <code>ppm</code>, <code>prefilter</code> (<i>k</i>, <i>I</i><sub>min</sub>) e <code>mzCenterFun</code>. <code>ppm</code> segue la dispersione dello strumento, spesso molto sotto 25 ppm in un Orbitrap o un TOF moderno: si ricava dai dati.</p>
```

### Quando sbaglia: tracce spezzate o fuse

Una traccia si **spezza** se la tolleranza è più stretta della dispersione o il vuoto è troppo corto per un segnale che sparisce nel rumore: due ROI corte, scartate. Si **fonde** se la tolleranza supera la distanza fra due ioni vicini, o se il rumore sostituisce un centroide mancante.

```html
<details class="poe"><summary>Prima di provare: con le impostazioni iniziali, quante tracce restano? E con vuoto 0?</summary>
<p>Quattro: la forte, le due della coppia e la debole. Una quinta è scartata («4 scansioni &lt; 5»): un pezzo della debole. Con vuoto 0 la debole si spezza in pezzi troppo corti e sparisce.</p></details>
```

```html
<div class="sim" id="sim-chemi-roi" data-sim="../assets/sim-chemi-tracce.js"><h4>Figura 24.2 Costruire una traccia, scansione per scansione</h4>
<p class="note nota">Costruisce le tracce una scansione alla volta e dice perché ognuna è tenuta o scartata. Dati sintetici, a scopo didattico.</p></div>
```

## L'alternativa a bin fissi

Il metodo *matchedFilter* di XCMS (Smith et al., 2006) taglia l'asse m/z in intervalli di larghezza fissa (*binSize*, di solito 0,1) e per ogni intervallo costruisce un cromatogramma con il massimo, o la somma, delle intensità di ogni scansione. L'intervallo di un valore m/z è:

```html
<span class="eq"><i>b</i> = ⌊ (m/z) / binSize ⌋<span class="no">(24.4)</span></span>
```

Con intervalli di 0,1 Da, m/z 300,04 e 300,06 cadono nello stesso intervallo (3000) e 300,16 in quello accanto (3001).

Con spettri a risoluzione unitaria questo basta. Ad alta risoluzione 0,1 Da a m/z 300 sono oltre 330 ppm: ioni distinti finiscono nello stesso cromatogramma, mentre una traccia a cavallo di due intervalli si spezza. Con la tolleranza in ppm delle ROI la finestra segue la massa. Myers et al. (2017) hanno confrontato in dettaglio la costruzione dei cromatogrammi e il rilevamento dei picchi di XCMS e MZmine 2.

```html
<div class="box warn"><b>Errori frequenti con le tracce di massa</b>
<ul>
<li>Finestra più stretta della dispersione reale: buchi nell'XIC e tracce spezzate.</li>
<li>Finestra più larga della distanza da un quasi-isobaro: tracce fuse e area sbagliata.</li>
<li>Dispersione maggiore a bassa intensità, cioè ai bordi del picco.</li>
<li>Tolleranza in ppm applicata a una media mobile che deriva.</li>
<li>Ioni di fondo sempre presenti (matrice, contaminanti): diventano ROI lunghe.</li>
</ul></div>
```

## Verifica

```html
<details class="q"><summary>Quanto vale la semi-ampiezza di una finestra di ±25 ppm a m/z 500?</summary><p>Δ = 500 · 25 · 10<sup>−6</sup> = 0,0125 Da, cioè 12,5 mDa.</p></details>
```

```html
<details class="q"><summary>Due ioni a m/z 300,000 e 300,004: la finestra di ±5 ppm li separa? Che <i>R</i> serve?</summary><p>±5 ppm a m/z 300 sono ±1,5 mDa e la distanza è 4 mDa, quindi la finestra li separa. Per risolverli serve <i>R</i> ≈ 300,002/0,004 ≈ 75 000.</p></details>
```

```html
<details class="q"><summary>Una traccia debole è spezzata in due ROI di 4 e 3 scansioni, con lunghezza minima 5. Che cosa succede e che cosa si controlla?</summary><p>Tutte e due sono scartate e il segnale si perde. Si controlla se la tolleranza è più stretta della dispersione dell'm/z e se il vuoto massimo (qui 0) è troppo corto per un segnale che cade sotto il rumore.</p></details>
```

```html
<details class="q"><summary>Perché un intervallo fisso di 0,1 Da è poco adatto all'alta risoluzione?</summary><p>A m/z 300 vale oltre 330 ppm, molto più della dispersione dello strumento: unisce ioni diversi nello stesso cromatogramma e spezza le tracce che cadono a cavallo di due intervalli.</p></details>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Hites R.A., Biemann K. (1970) Computer evaluation of continuously scanned mass spectra of gas chromatographic effluents. <i>Anal. Chem.</i> 42, 855-860. <a href="https://doi.org/10.1021/ac60290a009" target="_blank" rel="noopener">doi:10.1021/ac60290a009</a></li>
<li><span class="tag">articolo</span>Smith C.A. et al. (2006) XCMS: processing mass spectrometry data for metabolite profiling using nonlinear peak alignment, matching, and identification. <i>Anal. Chem.</i> 78, 779-787. <a href="https://doi.org/10.1021/ac051437y" target="_blank" rel="noopener">doi:10.1021/ac051437y</a></li>
<li><span class="tag">articolo</span>Tautenhahn R. et al. (2008) Highly sensitive feature detection for high resolution LC/MS. <i>BMC Bioinformatics</i> 9, 504. <a href="https://doi.org/10.1186/1471-2105-9-504" target="_blank" rel="noopener">doi:10.1186/1471-2105-9-504</a></li>
<li><span class="tag">articolo</span>Myers O.D. et al. (2017) Detailed investigation and comparison of the XCMS and MZmine 2 chromatogram construction and chromatographic peak detection methods. <i>Anal. Chem.</i> 89, 8689-8695. <a href="https://doi.org/10.1021/acs.analchem.7b01069" target="_blank" rel="noopener">doi:10.1021/acs.analchem.7b01069</a></li>
<li><span class="tag">software</span>xcms, pacchetto R: <code>R/functions-Params.R</code> (valori predefiniti di <code>CentWaveParam</code>), <a href="https://github.com/sneumann/xcms" target="_blank" rel="noopener">github.com/sneumann/xcms</a>, ramo di sviluppo.</li>
</ul>
```
