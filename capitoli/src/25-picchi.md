<!-- script: chemi-common.js -->
<!-- title: Trovare i picchi -->
# Trovare i picchi cromatografici {kicker: Capitolo 25}

{.lead} Un cromatogramma rumoroso va trasformato in una lista di picchi con tempo, altezza e area. Qui si confrontano le famiglie di algoritmi e si vede che cosa succede con picchi sovrapposti.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Nel 1964 Savitzky e Golay (1964) pubblicarono le procedure ai minimi quadrati per lisciare e derivare i dati. Nel 1999 Stein (1999) descrisse il metodo integrato di estrazione dello spettro e identificazione per i dati GC/MS da cui nasce AMDIS. Nel 2006 XCMS (Smith et al., 2006) applicò ai cromatogrammi la filtrazione adattata e Du et al. (2006) la trasformata wavelet continua ai picchi degli spettri; Tautenhahn et al. (2008) la portarono ai dati LC-MS (centWave).</p>
<p>Seguirono le piattaforme aperte MZmine 2 (Pluskal et al., 2010), MS-DIAL (Tsugawa et al., 2015), OpenMS (Röst et al., 2016) e MZmine 3 (Schmid et al., 2023).</p></details>
```

## Che cosa cerca un algoritmo di picchi

Un cromatogramma ricostruito (un XIC o una ROI, capitolo 24) contiene picchi veri, rumore, una linea di base che deriva e a volte spike isolati. L'algoritmo decide dove comincia e dove finisce ogni picco e ne restituisce tempo del massimo, altezza, area e larghezza.

Un picco ideale è gaussiano ([Forma del picco](01-cromatografia.html)). La larghezza a metà altezza e l'area valgono:

```html
<span class="eq"><i>w</i><sub>½</sub> = 2,355 σ &nbsp;&nbsp; e &nbsp;&nbsp; <i>A</i> = <i>h</i> σ √(2π)<span class="no">(25.1)</span></span>
```

Con *h* = 1000 e σ = 4 s, *w*~½~ = 9,4 s e *A* = 10 027 (unità arbitrarie). I picchi reali hanno spesso una coda: la gaussiana è solo un'approssimazione.

Il rilevamento dei picchi è presente nelle piattaforme aperte XCMS, MZmine 2 e 3 (Pluskal et al., 2010; Schmid et al., 2023), OpenMS (Röst et al., 2016) e MS-DIAL (Tsugawa et al., 2015); Myers et al. (2017) hanno confrontato i metodi di XCMS e di MZmine 2.

## Lisciare il segnale

Il rumore crea falsi massimi. Lisciare significa sostituire ogni punto con una media dei vicini. La **media mobile** dà lo stesso peso a tutti i punti della finestra: riduce il rumore, ma abbassa e allarga i picchi.

Savitzky e Golay (1964) adattano ai punti della finestra un polinomio di grado *p* con i minimi quadrati e prendono il suo valore al centro. Il risultato è ancora una media pesata, su *w* = 2*h* + 1 punti:

```html
<span class="eq"><i>ŷ</i><sub><i>i</i></sub> = Σ<sub><i>k</i>=−<i>h</i></sub><sup><i>h</i></sup> <i>c</i><sub><i>k</i></sub> <i>y</i><sub><i>i</i>+<i>k</i></sub><span class="no">(25.2)</span></span>
```

```html
<p>I pesi <i>c</i><sub><i>k</i></sub> dipendono solo da <i>w</i> e <i>p</i>. Per <i>w</i> = 5 e <i>p</i> = 2:</p>
```

```html
<span class="eq">(<i>c</i><sub>−2</sub>, …, <i>c</i><sub>2</sub>) = (−3, 12, 17, 12, −3) / 35<span class="no">(25.3)</span></span>
```

Sui punti 10, 14, 13, 15, 11 la media mobile dà 12,6 e Savitzky-Golay 506/35 = 14,46. I pesi negativi permettono di seguire la curvatura: a parità di finestra Savitzky-Golay abbassa e allarga i picchi meno della media mobile.

La finestra deve restare più stretta del picco. Con la figura 25.1 si vede che una media mobile di 21 punti su picchi larghi 10 s dimezza il primo e fonde la coppia vicina.

## Tre famiglie di algoritmi

### Massimi e minimi locali

```html
<ol>
<li>Si liscia il segnale.</li>
<li>Si cercano i massimi sopra la soglia (S/N × rumore).</li>
<li>Da ogni massimo si scende ai due lati fino a un minimo o alla base.</li>
<li>L'area è la somma dei trapezi fra i limiti.</li>
</ol>
```

Senza lisciatura il rumore crea falsi massimi sulle code; due picchi diventano uno se manca il minimo fra loro.

### Il filtro adattato

```html
<p>Il segnale si convolve con la derivata seconda, cambiata di segno, di una gaussiana con σ = FWHM / 2,3548 (Smith et al., 2006): risponde alla forma del picco e annulla una base dritta. I picchi sono i massimi del filtrato sopra S/N × rumore, con limiti dove passa per zero. In xcms <code>MatchedFilterParam</code>: <code>fwhm</code> = 30 s, <code>snthresh</code> = 10.</p>
```

### La trasformata wavelet continua (centWave)

Du et al. (2006) usano il «cappello messicano» ψ(*x*) = (1 − *x*^2^) e^−*x*<sup>2^/2</sup> a molte larghezze *a*; Tautenhahn et al. (2008) la adattano a LC-MS:

```html
<span class="eq"><i>C</i>(<i>a</i>, <i>t</i>) = <span class="frac"><span>1</span><span><i>a</i></span></span> ∫ <i>y</i>(<i>u</i>) ψ((<i>u</i> − <i>t</i>)/<i>a</i>) d<i>u</i><span class="no">(25.4)</span></span>
```

```html
<ol>
<li>Per ogni ROI si calcola <i>C</i> sulle larghezze attese e se ne cercano i massimi.</li>
<li>I massimi di larghezze vicine formano creste.</li>
<li>Un picco è una cresta che dura abbastanza larghezze; dove <i>C</i> è massima sta la sua larghezza.</li>
<li>Un test di S/N usa il rumore stimato attorno; l'area si integra sul grezzo o sul filtrato.</li>
</ol>
```

Questa è l'idea, non l'implementazione di xcms: stima del rumore e regole sulle creste cambiano da programma a programma.

```html
<details class="poe"><summary>Prima di provare: quali dei cinque picchi trovano i massimi locali senza lisciatura?</summary>
<p>Con i valori iniziali: 6 picchi, i quattro grandi e due falsi sulla coda del secondo; manca il piccolo e lo spike è scartato perché stretto. Con Savitzky-Golay a 7 punti i falsi spariscono; filtro adattato e CWT trovano anche il piccolo.</p></details>
```

```html
<div class="sim" id="sim-chemi-picchi" data-sim="../assets/sim-chemi-picchi.js"><h4>Figura 25.1 Cercare i picchi in un cromatogramma rumoroso</h4>
<p class="note nota">Tre algoritmi su picchi noti: trovati, mancati, falsi. Dati sintetici, a scopo didattico.</p></div>
```

## Segnale, rumore e linea di base

Il rapporto segnale/rumore (S/N) dice quanto un picco emerge dal rumore σ di un tratto senza picchi:

```html
<span class="eq">S/N = <span class="frac"><span><i>h</i><sub>apice</sub> − <i>h</i><sub>base</sub></span><span>σ<sub>rumore</sub></span></span><span class="no">(25.5)</span></span>
```

Altre definizioni usano metà dell'ampiezza picco-picco del rumore, oppure la deviazione mediana assoluta (MAD). Per lo stesso picco danno valori diversi: un picco alto 100 sopra la base, con σ = 20, ha S/N = 5 con la prima definizione e meno di 3 con l'ampiezza picco-picco. Una soglia di S/N non si trasporta da un programma a un altro e va riprovata sui propri dati.

Anche la linea di base va stimata: una deriva che sale sposta altezze e aree. Un metodo semplice taglia il segnale punto per punto con la media dei vicini a distanze via via minori; il filtro adattato la elimina da sé, perché la derivata seconda di una retta è zero.

## La qualità di un picco

Dicono se un picco è affidabile la larghezza a metà altezza, il numero di punti che lo descrivono (legato al tempo di scansione), la forma e l'S/N. Asimmetria e fattore di coda si misurano sul lato anteriore *a* e posteriore *b* del picco ([Forma del picco](01-cromatografia.html)):

```html
<span class="eq"><i>A</i><sub>s</sub> = <i>b</i>/<i>a</i> (al 10 % dell'altezza) &nbsp;&nbsp; <i>T</i><sub>f</sub> = (<i>a</i> + <i>b</i>)/(2<i>a</i>) (al 5 %)<span class="no">(25.6)</span></span>
```

Una misura della somiglianza a una gaussiana è il R² dell'adattamento. Zhang e Zhao (2014) propongono altri indici per valutare la qualità degli XIC e dei picchi.

```html
<details class="poe"><summary>Prima di provare: quanto cambiano i numeri se la scansione è lenta?</summary>
<p>Con una coda moderata e 0,05 s per scansione il picco ha 91 punti sopra metà altezza; con 1 s ne ha 5 e l'asimmetria passa da 1,52 a 1,31, come se il picco fosse un altro. L'S/N cambia anche con la definizione usata.</p></details>
```

```html
<div class="sim" id="sim-chemi-qualita" data-sim="../assets/sim-chemi-picchi.js"><h3>Figura 25.2 Quanto è buono questo picco?</h3>
<p class="note nota">Mostra come i punti per picco e la coda cambiano larghezza, asimmetria, S/N e area. Dati sintetici, a scopo didattico.</p></div>
```

```html
<div class="box warn"><b>Errori frequenti</b>
<ul>
<li>Lisciare con una finestra più larga del picco: i picchi si fondono e si abbassano.</li>
<li>Un intervallo di larghezze che non corrisponde a quelle reali: centWave perde i picchi stretti o larghi.</li>
<li>Troppo pochi punti per picco, con scansioni lente rispetto a una cromatografia veloce.</li>
<li>Spike contati come picchi.</li>
<li>Soglie di S/N copiate da un altro programma.</li>
<li>Un picco diviso e integrato due volte.</li>
</ul></div>
```

## Picchi sovrapposti

Due composti vicini danno picchi che si toccano. Per picchi della stessa larghezza la risoluzione è *R*~s~ = Δ*t* / (4σ); sotto circa 1,5 il segnale non torna alla base fra i due e l'area di ciascuno è incerta.

### Valle e minimo locale

Si divide nel punto più basso fra i due massimi se la valle è abbastanza profonda: con *h*~valle~ l'altezza della valle e *h*~min~ quella del massimo più basso,

```html
<span class="eq"><i>v</i> = <span class="frac"><span><i>h</i><sub>valle</sub></span><span><i>h</i><sub>min</sub></span></span> &lt; 0,5 &nbsp; ⇒ &nbsp; due picchi<span class="no">(25.7)</span></span>
```

La soglia 0,5 è un esempio. Dividere così attribuisce al picco piccolo parte della coda del grande: la sua area è sovrastimata.

### Somma di curve

Si adatta ai dati una somma di due o più curve, gaussiane o gaussiane con coda esponenziale (EMG), con i minimi quadrati e con i massimi trovati come stima iniziale. Ogni curva dà la sua area *A*:

```html
<span class="eq"><i>y</i>(<i>t</i>) = <span class="frac"><span><i>A</i></span><span>2τ</span></span> exp(<span class="frac"><span>σ<sup>2</sup></span><span>2τ<sup>2</sup></span></span> − <span class="frac"><span><i>t</i> − <i>t</i><sub>0</sub></span><span>τ</span></span>) erfc(<span class="frac"><span>σ/τ − (<i>t</i> − <i>t</i><sub>0</sub>)/σ</span><span>√2</span></span>)<span class="no">(25.8)</span></span>
```

Con una coda o con *R*~s~ bassa più soluzioni descrivono bene i dati: le aree dipendono dalla forma scelta.

### Deconvoluzione degli spettri in GC-EI

In GC-EI ogni composto dà molti ioni frammento. Il metodo AMDIS (Stein, 1999) cerca i cromatogrammi degli ioni che hanno lo stesso massimo e la stessa forma e li raggruppa: le loro intensità a quel tempo formano lo spettro «puro» del componente, anche se un altro composto eluisce quasi insieme. Il raggruppamento delle tracce di uno stesso composto è il tema del [capitolo 26](26-gruppi.html).

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Savitzky A., Golay M.J.E. (1964) Smoothing and differentiation of data by simplified least squares procedures. <i>Anal. Chem.</i> 36, 1627-1639. <a href="https://doi.org/10.1021/ac60214a047" target="_blank" rel="noopener">doi:10.1021/ac60214a047</a></li>
<li><span class="tag">articolo</span>Smith C.A. et al. (2006) XCMS: processing mass spectrometry data for metabolite profiling using nonlinear peak alignment, matching, and identification. <i>Anal. Chem.</i> 78, 779-787. <a href="https://doi.org/10.1021/ac051437y" target="_blank" rel="noopener">doi:10.1021/ac051437y</a></li>
<li><span class="tag">articolo</span>Du P. et al. (2006) Improved peak detection in mass spectrum by incorporating continuous wavelet transform-based pattern matching. <i>Bioinformatics</i> 22, 2059-2065. <a href="https://doi.org/10.1093/bioinformatics/btl355" target="_blank" rel="noopener">doi:10.1093/bioinformatics/btl355</a></li>
<li><span class="tag">articolo</span>Tautenhahn R. et al. (2008) Highly sensitive feature detection for high resolution LC/MS. <i>BMC Bioinformatics</i> 9, 504. <a href="https://doi.org/10.1186/1471-2105-9-504" target="_blank" rel="noopener">doi:10.1186/1471-2105-9-504</a></li>
<li><span class="tag">articolo</span>Stein S.E. (1999) An integrated method for spectrum extraction and compound identification from GC/MS data. <i>J. Am. Soc. Mass Spectrom.</i> 10, 770-781. <a href="https://doi.org/10.1016/S1044-0305(99)00047-1" target="_blank" rel="noopener">doi:10.1016/S1044-0305(99)00047-1</a></li>
<li><span class="tag">articolo</span>Zhang W., Zhao P.X. (2014) Quality evaluation of extracted ion chromatograms and chromatographic peaks in LC/MS-based metabolomics data. <i>BMC Bioinformatics</i> 15 (Suppl 11), S5. <a href="https://doi.org/10.1186/1471-2105-15-S11-S5" target="_blank" rel="noopener">doi:10.1186/1471-2105-15-S11-S5</a></li>
<li><span class="tag">articolo</span>Myers O.D. et al. (2017) Detailed investigation and comparison of the XCMS and MZmine 2 chromatogram construction and chromatographic peak detection methods. <i>Anal. Chem.</i> 89, 8689-8695. <a href="https://doi.org/10.1021/acs.analchem.7b01069" target="_blank" rel="noopener">doi:10.1021/acs.analchem.7b01069</a></li>
<li><span class="tag">articolo</span>Pluskal T. et al. (2010) MZmine 2. <i>BMC Bioinformatics</i> 11, 395. <a href="https://doi.org/10.1186/1471-2105-11-395" target="_blank" rel="noopener">doi:10.1186/1471-2105-11-395</a></li>
<li><span class="tag">articolo</span>Tsugawa H. et al. (2015) MS-DIAL: data-independent MS/MS deconvolution for comprehensive metabolome analysis. <i>Nat. Methods</i> 12, 523-526. <a href="https://doi.org/10.1038/nmeth.3393" target="_blank" rel="noopener">doi:10.1038/nmeth.3393</a></li>
<li><span class="tag">articolo</span>Röst H.L. et al. (2016) OpenMS. <i>Nat. Methods</i> 13, 741-748. <a href="https://doi.org/10.1038/nmeth.3959" target="_blank" rel="noopener">doi:10.1038/nmeth.3959</a></li>
<li><span class="tag">articolo</span>Schmid R. et al. (2023) Integrative analysis of multimodal mass spectrometry data in MZmine 3. <i>Nat. Biotechnol.</i> 41, 447-449. <a href="https://doi.org/10.1038/s41587-023-01690-2" target="_blank" rel="noopener">doi:10.1038/s41587-023-01690-2</a></li>
<li><span class="tag">software</span>xcms, pacchetto R: <code>R/functions-Params.R</code> (valori predefiniti di <code>MatchedFilterParam</code>), <a href="https://github.com/sneumann/xcms" target="_blank" rel="noopener">github.com/sneumann/xcms</a>, ramo di sviluppo.</li>
</ul>
```
