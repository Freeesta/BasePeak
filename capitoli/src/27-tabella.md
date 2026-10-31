<!-- script: chemi-common.js -->
<!-- title: La tabella delle feature -->
# Dalla serie di campioni alla tabella delle feature {kicker: Capitolo 27}

{.lead} Per confrontare molti campioni bisogna rendere uguali i tempi, trovare gli stessi composti in ogni corsa e riempire i vuoti. Qui si segue questo percorso fino alla tabella finale.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>La deformazione dinamica del tempo (DTW) nasce nel riconoscimento del parlato: Sakoe e Chiba (1978) l'hanno proposta per confrontare parole pronunciate a velocità diverse. La regressione locale robusta è di Cleveland (1979). Le due idee sono arrivate ai dati LC-MS nel 2006, con OBI-Warp (Prince e Marcotte, 2006) e con XCMS (Smith et al., 2006). Lange e colleghi (2008) hanno poi confrontato in modo critico diversi metodi di allineamento. Per gli studi su larga scala, Dunn e colleghi (2011) hanno descritto procedure basate sui campioni QC.</p></details>
```

## Perché il tempo di ritenzione si sposta

```html
<p>Lo stesso composto non esce sempre allo stesso istante. Nel corso di una sequenza di decine di iniezioni cambiano la temperatura della colonna, la composizione della fase mobile, la pressione e lo stato della fase stazionaria, e la matrice del campione modifica la ritenzione.</p>
<p>Lo spostamento è di solito di secondi, a volte di decine di secondi, e non è lineare: dipende dal punto del gradiente. Se non si corregge, lo stesso composto compare a tempi diversi nei diversi campioni e il passo successivo (la corrispondenza) lo scambia per composti diversi. I QC iniettati a intervalli regolari mostrano quanto vale lo spostamento (<a href="18-disegno.html">capitolo 18</a>).</p>
```

## Allineare i campioni

### Picchi di riferimento e curva LOWESS

```html
<p>Il metodo dei gruppi di picchi (Smith et al., 2006) cerca picchi «ben comportati»: presenti nella maggior parte dei campioni, uno solo per campione. Per ogni campione si calcola lo scarto <i>d</i>(rt) = rt<sub>campione</sub> − mediana degli rt del gruppo, e lo si interpola con una curva LOWESS (Cleveland, 1979): una retta locale con pesi tricubici, ripetuta riducendo il peso dei punti anomali.</p>
<span class="eq"><i>w</i>(<i>u</i>) = (1 − |<i>u</i>|<sup>3</sup>)<sup>3</sup> &nbsp;per |<i>u</i>| &lt; 1 &nbsp;&nbsp; rt<sub>corr</sub> = rt − <i>d</i>(rt)<span class="no">(27.1)</span></span>
<p>Qui <i>u</i> è la distanza dal punto divisa per quella dell'ultimo vicino incluso: la frazione di punti usata è l'ampiezza.</p>
```

### Deformare l'asse dei tempi (DTW, OBI-Warp)

```html
<p>Il DTW (Sakoe e Chiba, 1978) non ha bisogno di picchi di riferimento. Si costruisce una matrice di costo <i>c</i>(<i>i</i>, <i>j</i>) fra i punti di due profili e si accumula il costo minimo; poi si risale il cammino ottimo.</p>
<span class="eq"><i>D</i>(<i>i</i>, <i>j</i>) = <i>c</i>(<i>i</i>, <i>j</i>) + min[ <i>D</i>(<i>i</i>−1, <i>j</i>), <i>D</i>(<i>i</i>, <i>j</i>−1), <i>D</i>(<i>i</i>−1, <i>j</i>−1) ]<span class="no">(27.2)</span></span>
<p>Una banda limita le deformazioni. OBI-Warp (Prince e Marcotte, 2006) applica la programmazione dinamica alla somiglianza fra scansioni intere e interpola poi in modo monotono.</p>
```

### Come controllare l'allineamento

```html
<p>Lo scarto stimato deve essere una curva liscia. Sovrapponi i QC prima e dopo e controlla un composto noto in tutti i campioni. Metodi diversi danno risultati diversi (Lange et al., 2008).</p>
<details class="poe"><summary>Prima di provare: con un gradino a metà corsa, quale ampiezza LOWESS segue meglio la deriva, 0,3 o 1?</summary>
<p>0,3: una curva locale segue il gradino; con 1 lo smussa e restano errori di alcuni secondi. Poi aggiungi accoppiamenti sbagliati e guarda quanto pesano.</p></details>
<div class="sim" id="sim-chemi-allinea" data-sim="../assets/sim-chemi-tabella.js"><h4>Figura 27.1 Allineare due corse</h4>
<p class="note nota">Due cromatogrammi sintetici, uno deformato. Dati sintetici, a scopo didattico.</p></div>
```

## Corrispondenza fra campioni

```html
<p>Dopo l'allineamento bisogna decidere quali picchi dei diversi campioni sono la stessa feature. Il metodo a densità dei picchi (Smith et al., 2006) procede così:</p>
<ol>
<li>si divide l'asse m/z in fette strette (binSize, di default 0,25);</li>
<li>in ogni fetta si calcola la densità dei tempi di ritenzione con un nucleo gaussiano di larghezza bw (di default 30 s);</li>
<li>ogni massimo di densità definisce un gruppo, con i picchi sotto di esso;</li>
<li>il gruppo si tiene se compare in una frazione minima di campioni (minFraction, di default 0,5).</li>
</ol>
<p>Un altro approccio, tipico di MZmine, dà un punteggio a ogni coppia di picchi e assegna in ordine di punteggio, un picco per campione.</p>
<span class="eq">punteggio = <i>w</i><sub>mz</sub> (1 − Δ<i>m</i>/tol<sub>mz</sub>) + <i>w</i><sub>rt</sub> (1 − Δrt/tol<sub>rt</sub>)<span class="no">(27.3)</span></span>
<div class="box warn"><b>Errore frequente</b>
<p>Un bw più piccolo della deriva residua <b>divide</b> un composto in due righe. Un bw o una fetta troppo larghi <b>fondono</b> due composti vicini (quasi-isobari).</p></div>
```

## Riempire i buchi

```html
<p>Se un picco manca in un campione, la cella della tabella resta vuota. Il riempimento (gap filling) integra il segnale grezzo nella finestra [mzmin, mzmax] × [rtmin, rtmax] della feature in quel campione.</p>
<p>Il numero ottenuto è una misura di ciò che c'è in quella finestra, spesso rumore: non è una rivelazione. Per questo va segnalato nella tabella.</p>
<details class="poe"><summary>Prima di provare: con bw = 30 s e una fetta di 0,25 u, quali composti si fondono?</summary>
<p>Finiscono nella stessa riga i due quasi-isobari a m/z 255 (distano 5 mu) e i due composti a m/z 301 (distano 32 s). Riduci bw e la fetta e guarda quali tornano separati, e quali composti rari spariscono.</p></details>
<div class="sim" id="sim-chemi-corrispondenza" data-sim="../assets/sim-chemi-tabella.js"><h3>Figura 27.2 Lo stesso composto in sei campioni</h3>
<p class="note nota">Sei campioni sintetici con alcune rivelazioni mancanti. Le celle riempite sono in corsivo e segnate «(riempito)». Dati sintetici, a scopo didattico.</p></div>
```

## Filtrare: bianchi, repliche, QC

```html
<p>I filtri tolgono le feature che non si possono usare. Si calcolano sui campioni di controllo del capitolo 18 (<a href="18-disegno.html">bianchi</a>, <a href="18-disegno.html">repliche</a> e <a href="18-disegno.html">QC</a>).</p>
<ul>
<li><b>Bianco</b>: si tiene la feature se media(campioni) / media(bianchi) ≥ una soglia. Valori da 3 a 10 sono usati come esempio; in letteratura variano.</li>
<li><b>Frequenza nelle repliche</b>: si tiene se compare in almeno <i>n</i> repliche su <i>m</i>.</li>
<li><b>QC</b>: si tiene se l'RSD dei QC è sotto una soglia, di solito 20-30 %. Broadhurst e colleghi (2018) discutono i criteri.</li>
</ul>
<span class="eq">RSD = 100 · <i>s</i> / <i>x̄</i><span class="no">(27.4)</span></span>
<div class="box warn"><b>Errore frequente</b>
<p>Il filtro del bianco elimina anche un composto vero presente in tracce nel bianco (contaminazione da riporto): una feature scartata non è per forza un artefatto.</p></div>
```

## Normalizzare

```html
<p>La normalizzazione corregge le differenze di quantità fra campioni, come una diluizione o la deriva dello strumento. Ci sono diversi modi:</p>
<ul>
<li><b>intensità totale</b> o <b>mediana</b>: si divide ogni campione per un fattore calcolato su tutte le feature;</li>
<li><b>PQN</b> (Dieterle et al., 2006): si divide per la mediana dei quozienti fra il campione e uno spettro di riferimento;</li>
<li><b>standard interni</b>: si divide per un composto aggiunto in quantità nota;</li>
<li><b>correzione con i QC</b>: una curva LOESS sull'ordine di iniezione dei QC corregge la deriva (Dunn et al., 2011).</li>
</ul>
<span class="eq"><i>q</i><sub>i</sub> = <i>x</i><sub>i</sub> / <i>x</i><sub>rif,i</sub> &nbsp;&nbsp; fattore = mediana(<i>q</i><sub>i</sub>) &nbsp;&nbsp; <i>x</i><sub>norm</sub> = <i>x</i> / fattore<span class="no">(27.5)</span></span>
<div class="box warn"><b>Errore frequente</b>
<p>Normalizzare con la somma di tutte le feature può nascondere un effetto vero, se molte feature cambiano nello stesso verso. Con il PQN o la mediana il rischio è minore.</p></div>
```

## La tabella delle feature

```html
<p>Alla fine di questi passi c'è una tabella con una riga per feature:</p>
<ul>
<li>identificazione: id, m/z (mediana), mzmin, mzmax, rt, rtmin, rtmax, npeaks (numero di picchi);</li>
<li>una colonna di intensità per campione, ed è importante dire se è altezza o area;</li>
<li>annotazione: isotopo, addotto, gruppo del capitolo 26;</li>
<li>segnalazioni: riempito, nel bianco, RSD dei QC.</li>
</ul>
<p>Può andare storto in più modi: un composto diviso in due righe (deriva maggiore di bw), due composti in una riga, valori riempiti letti come rivelazioni, altezze e aree mischiate, un effetto vero nascosto dalla normalizzazione, un composto presente in tracce nel bianco e perso.</p>
<details class="poe"><summary>Prima di provare: quali delle cinque feature artefatto (contaminante, frammento, isotopo, rumore, deriva) tolgono i tre filtri da soli?</summary>
<p>Tre: il contaminante (bianco), la feature di rumore (repliche) e quella con deriva (QC). Frammento e isotopo restano finché non si usa l'annotazione del capitolo 26.</p></details>
<div class="sim" id="sim-chemi-tabella" data-sim="../assets/sim-chemi-esplora.js"><h3>Figura 27.3 Esplora la tabella delle feature</h3>
<p class="note nota">Uno studio sintetico con 3 bianchi, 6 campioni, 4 QC e 60 feature, cinque delle quali sono artefatti. Dati sintetici, a scopo didattico.</p></div>
```

## Verifica

```html
<details class="q"><summary>Un gradino di 20 s a metà corsa: quale ampiezza LOWESS scegli, 0,3 o 1, e perché?</summary><p>0,3. Una curva locale segue il gradino. Con ampiezza 1 la curva lo smussa e restano errori di molti secondi (sotto-adattamento).</p></details>
<details class="q"><summary>Con costi <i>c</i> = [[1, 2], [3, 1]], quanto vale <i>D</i>(2, 2) con la (27.2)?</summary><p><i>D</i>(1,1) = 1, <i>D</i>(1,2) = 3, <i>D</i>(2,1) = 4. Quindi <i>D</i>(2,2) = 1 + min(3, 4, 1) = 2: il cammino è la diagonale.</p></details>
<details class="q"><summary>Un composto compare in due righe con rt di 300 e 318 s. Su quale parametro intervieni?</summary><p>Su bw: deve essere più grande della deriva residua dopo l'allineamento, ma più piccolo della distanza fra composti diversi. Poi controlla che l'allineamento sia buono.</p></details>
<details class="q"><summary>Una feature ha RSD dei QC del 45 %, mentre le altre stanno sotto il 10 %. La normalizzazione totale la sistema?</summary><p>No. La normalizzazione totale corregge la deriva comune a tutte le feature; qui la deriva è solo di questa feature, che va scartata o corretta con la curva LOESS sui QC.</p></details>
<details class="q"><summary>Perché un valore riempito non va letto come una rivelazione?</summary><p>Perché è l'integrale del segnale grezzo in una finestra, anche dove non c'è un picco: può essere solo rumore.</p></details>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Sakoe H., Chiba S. (1978) Dynamic programming algorithm optimization for spoken word recognition. <i>IEEE Trans. ASSP</i> 26, 43-49. <a href="https://doi.org/10.1109/TASSP.1978.1163055" target="_blank" rel="noopener">doi:10.1109/TASSP.1978.1163055</a></li>
<li><span class="tag">articolo</span>Cleveland W.S. (1979) Robust locally weighted regression and smoothing scatterplots. <i>J. Am. Stat. Assoc.</i> 74, 829-836. <a href="https://doi.org/10.1080/01621459.1979.10481038" target="_blank" rel="noopener">doi:10.1080/01621459.1979.10481038</a></li>
<li><span class="tag">articolo</span>Prince J.T., Marcotte E.M. (2006) Chromatographic alignment of ESI-LC-MS proteomics data sets by ordered bijective interpolated warping. <i>Anal. Chem.</i> 78, 6140-6152. <a href="https://doi.org/10.1021/ac0605344" target="_blank" rel="noopener">doi:10.1021/ac0605344</a></li>
<li><span class="tag">articolo</span>Smith C.A. et al. (2006) XCMS: processing mass spectrometry data for metabolite profiling using nonlinear peak alignment, matching, and identification. <i>Anal. Chem.</i> 78, 779-787. <a href="https://doi.org/10.1021/ac051437y" target="_blank" rel="noopener">doi:10.1021/ac051437y</a></li>
<li><span class="tag">articolo</span>Lange E. et al. (2008) Critical assessment of alignment procedures for LC-MS proteomics and metabolomics measurements. <i>BMC Bioinformatics</i> 9, 375. <a href="https://doi.org/10.1186/1471-2105-9-375" target="_blank" rel="noopener">doi:10.1186/1471-2105-9-375</a></li>
<li><span class="tag">articolo</span>Dieterle F. et al. (2006) Probabilistic quotient normalization as robust method to account for dilution of complex biological mixtures. <i>Anal. Chem.</i> 78, 4281-4290. <a href="https://doi.org/10.1021/ac051632c" target="_blank" rel="noopener">doi:10.1021/ac051632c</a></li>
<li><span class="tag">articolo</span>Dunn W.B. et al. (2011) Procedures for large-scale metabolic profiling of serum and plasma using GC and LC coupled to MS. <i>Nat. Protoc.</i> 6, 1060-1083. <a href="https://doi.org/10.1038/nprot.2011.335" target="_blank" rel="noopener">doi:10.1038/nprot.2011.335</a></li>
<li><span class="tag">articolo</span>Broadhurst D. et al. (2018) Guidelines and considerations for the use of system suitability and quality control samples in mass spectrometry assays applied in untargeted clinical metabolomic studies. <i>Metabolomics</i> 14, 72. <a href="https://doi.org/10.1007/s11306-018-1367-3" target="_blank" rel="noopener">doi:10.1007/s11306-018-1367-3</a></li>
</ul>
```
