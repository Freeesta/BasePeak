# Accoppiamenti, MS/MS e ibridi {kicker: Capitolo 41}

{.lead} Lo spettro di una miscela è un groviglio. Prima si separa, poi si pesa; e se non basta, si rompe lo ione e si pesano i pezzi.

## GC-MS: il primo accoppiamento (anni '50)

Uno spettrometro di massa dà il meglio con una sostanza pura per volta. Una miscela produce spettri sovrapposti, difficili da leggere. L'idea è mettere davanti allo strumento una colonna cromatografica: i composti escono uno dopo l'altro e lo spettrometro li pesa a mano a mano che arrivano.

### Gohlke e McLafferty: il gas di trasporto e il vuoto

Nel 1959 R.S. Gohlke collegò un gascromatografo a uno spettrometro a tempo di volo e pubblicò il lavoro su *Analytical Chemistry*. Il tempo di volo era adatto perché registra uno spettro completo in pochissimo tempo, mentre il picco cromatografico è breve e cambia in fretta.

La difficoltà era il gas di trasporto: esce dalla colonna alla pressione atmosferica, mentre l'analizzatore vuole il vuoto. Gohlke e McLafferty hanno ricostruito più tardi questi primi anni, in un articolo del 1993 (vedi Fonti). La regola del vuoto è nel capitolo 6; la gascromatografia è nel capitolo <a href="03-gc.html">3</a>.

<!-- to verify against source: how the first GC-MS interfaces removed the carrier gas (Gohlke-McLafferty 1993) -->

## LC-MS: trent'anni di interfacce

Con la cromatografia liquida il problema è più duro. Un liquido che evapora produce un volume di gas enorme, molto più grande di quello che un sistema da vuoto sopporta. Per questo l'LC-MS ha avuto bisogno di molte interfacce prima di diventare uno strumento di routine.

### Introduzione diretta, nastro mobile, thermospray

Nel 1973 Baldwin e McLafferty introdussero una soluzione direttamente in una sorgente a ionizzazione chimica. Il loro breve articolo prevedeva così di seguire l'eluato di una colonna con una sensibilità dell'ordine del nanogrammo.

Un'altra soluzione fu il nastro mobile: un nastro porta l'eluato verso la sorgente, dove il solvente viene tolto prima della ionizzazione (rassegna di Arpino, 1989). Nel 1983 Blakley e Vestal descrissero il thermospray, che nebulizza l'eluato riscaldandolo e rese l'LC-MS pratica prima dell'elettrospray.

### Le sorgenti a pressione atmosferica chiudono la partita

Già nel 1973 Horning e colleghi usarono una sorgente di ionizzazione esterna, a pressione atmosferica, con sensibilità dell'ordine del picogrammo. Nel 1989 Fenn e collaboratori mostrarono l'elettrospray su grandi biomolecole. Oggi l'LC-MS usa quasi sempre ESI o APCI (capitoli <a href="02-lc.html">2</a> e <a href="04-esi.html">4</a>).

## Spettrometria di massa tandem

Un solo stadio di massa dice quanto pesa uno ione, ma non com'è fatto. La spettrometria di massa tandem (MS/MS) usa due stadi in serie: il primo sceglie uno ione, poi lo si rompe, e il secondo pesa i frammenti. Così si ottiene sia una struttura sia una selettività molto più alta.

<!-- to verify against source: metastable ions and sector instruments as the first MS/MS (1960s-70s); no verified reference in the plan -->

### Yost ed Enke (1978): il triplo quadrupolo

Nel 1978 Yost ed Enke descrissero la frammentazione di ioni selezionati con uno spettrometro a quadrupoli in tandem. Nel triplo quadrupolo Q1 sceglie lo ione precursore, la cella q2 lo frammenta con un gas e Q3 pesa i frammenti.

Da qui nasce l'MRM: si registra solo una coppia precursore-frammento, e il rumore chimico si abbassa molto. La teoria è nel capitolo <a href="08-qqq.html">8</a>.

## Gli ibridi

Un ibrido unisce analizzatori di tipo diverso nello stesso strumento. Il quadrupolo è veloce e selettivo: sceglie l'ione. Un analizzatore ad alta risoluzione poi ne misura la massa con grande precisione.

```html
<figure>
<img src="../assets/img/storia/schemi/ibridi.svg" loading="lazy" decoding="async" width="720" height="350" alt="Tre schemi a blocchi in sequenza: triplo quadrupolo, Q-TOF e Q-Orbitrap">
<figcaption><b>Figura 41.1</b> Gli schemi di QqQ, Q-TOF e Q-Orbitrap: nei due ibridi l'ultimo quadrupolo è sostituito da un analizzatore ad alta risoluzione. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption>
</figure>
```

### Q-TOF (1996)

Nel 1996 Morris e colleghi presentarono uno spettrometro con un quadrupolo seguito da un TOF ad accelerazione ortogonale. Il loro articolo descrive la decomposizione indotta da collisioni con alta sensibilità: l'MS/MS ottiene così spettri dei frammenti ad alta risoluzione.

### Q-Orbitrap (2011)

Nel 2011 Michalski e colleghi descrissero Q Exactive, uno strumento da banco con un quadrupolo e un Orbitrap, pensato per la proteomica. Gli ioni scelti dal quadrupolo vengono misurati ad alta risoluzione. Le strategie di acquisizione sono nel capitolo <a href="17-hr-dda.html">17</a>.

<!-- to verify against source: first hybrid linear ion trap + Orbitrap (2005) -->

## Mobilità ionica: separare per forma

La massa non è l'unica proprietà di uno ione. Due ioni con lo stesso m/z possono avere forme diverse: uno è compatto, l'altro è esteso. In un tubo pieno di gas, con un campo elettrico, quello esteso urta più molecole e arriva dopo.

### Dalla «cromatografia di plasma» (1970) agli strumenti IM-MS

Nel 1970 Cohen e Karasek chiamarono «cromatografia di plasma» la separazione di ioni in un gas sotto campo elettrico, e la presentarono come una nuova dimensione per la GC e la spettrometria di massa. Oggi la stessa idea si chiama mobilità ionica e si affianca a un analizzatore di massa negli strumenti IM-MS.

La velocità di deriva è proporzionale al campo: v = K·E. La mobilità K diminuisce se la sezione d'urto dello ione cresce o se il gas è più denso. Prova nella figura: cambia pressione e campo e osserva che i tempi si scalano, ma il loro rapporto no.

```html
<div class="sim storia-fig" id="sf-mobilita"><h4>Due ioni, stesso m/z, forma diversa</h4>
<figure>
<img src="../assets/img/storia/schemi/mobilita.svg" loading="lazy" decoding="async" width="720" height="324" alt="Tubo di deriva con gas e campo elettrico: lo ione compatto arriva prima di quello esteso">
<figcaption><b>Figura 41.2</b> Il tubo di deriva: velocità v = K·E, tempo di arrivo t = L/(K·E). Le sezioni d'urto sono relative (1 e 1,4) e i tempi in unità arbitrarie. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption>
</figure>
</div>
```

## Chi era

```html
<details class="storia-chi"><summary>F.W. McLafferty</summary>
<p>F.W. McLafferty è coautore dei due lavori della cromatografia accoppiata alla spettrometria di massa citati qui: l'introduzione diretta di una soluzione in una sorgente a ionizzazione chimica (1973, con Baldwin) e la ricostruzione dei primi anni della GC-MS (1993, con Gohlke).</p>
</details>
```

<!-- to verify against source: McLafferty birth/death years and workplace -->

```html
<details class="storia-chi"><summary>R.A. Yost e C.G. Enke</summary>
<p>R.A. Yost e C.G. Enke firmano l'articolo del 1978 sul Journal of the American Chemical Society dedicato alla frammentazione di ioni selezionati con uno spettrometro a quadrupoli in tandem: la base del triplo quadrupolo.</p>
</details>
```

<!-- to verify against source: Yost and Enke affiliations and dates -->

## Perché contava

```html
<div class="box key"><b>Perché contava</b>
<ul>
<li>Separare e pesare insieme trasformò l'identificazione di singoli composti nell'analisi di miscele reali.</li>
<li>L'MS/MS diede selettività (MRM) e informazioni sulla struttura.</li>
<li>Gli ibridi unirono il quadrupolo, veloce e selettivo, ad analizzatori ad alta risoluzione.</li>
</ul></div>
```

## Per capire meglio

```html
<p class="storia-link">Per capire meglio: <a href="03-gc.html">GC e GC-MS</a>, <a href="02-lc.html">LC</a>, <a href="08-qqq.html">triplo quadrupolo</a>, <a href="10-dati.html">dati</a>, <a href="17-hr-dda.html">alta risoluzione e DDA</a>.</p>
```

## Fonti

```html
<ul class="refs">
<li><span class="tag">articolo</span>Gohlke R.S. (1959) Time-of-flight mass spectrometry and gas-liquid partition chromatography. <i>Anal. Chem.</i> 31, 535-541. <a href="https://doi.org/10.1021/ac50164a024" target="_blank" rel="noopener">doi:10.1021/ac50164a024</a></li>
<li><span class="tag">articolo</span>Gohlke R.S., McLafferty F.W. (1993) Early gas chromatography/mass spectrometry. <i>J. Am. Soc. Mass Spectrom.</i> 4, 367-371. <a href="https://doi.org/10.1016/1044-0305(93)85001-E" target="_blank" rel="noopener">doi:10.1016/1044-0305(93)85001-E</a></li>
<li><span class="tag">articolo</span>Baldwin M.A., McLafferty F.W. (1973) Liquid chromatography-mass spectrometry interface-I: the direct introduction of liquid solutions into a chemical ionization mass spectrometer. <i>Org. Mass Spectrom.</i> 7, 1111-1112. <a href="https://doi.org/10.1002/oms.1210070913" target="_blank" rel="noopener">doi:10.1002/oms.1210070913</a></li>
<li><span class="tag">articolo</span>Arpino P. (1989) Combined liquid chromatography mass spectrometry. Part I. Coupling by means of a moving belt interface. <i>Mass Spectrom. Rev.</i> 8, 35-55. <a href="https://doi.org/10.1002/mas.1280080103" target="_blank" rel="noopener">doi:10.1002/mas.1280080103</a></li>
<li><span class="tag">articolo</span>Blakley C.R., Vestal M.L. (1983) Thermospray interface for liquid chromatography/mass spectrometry. <i>Anal. Chem.</i> 55, 750-754. <a href="https://doi.org/10.1021/ac00255a036" target="_blank" rel="noopener">doi:10.1021/ac00255a036</a></li>
<li><span class="tag">articolo</span>Horning E.C. et al. (1973) New picogram detection system based on a mass spectrometer with an external ionization source at atmospheric pressure. <i>Anal. Chem.</i> 45, 936-943. <a href="https://doi.org/10.1021/ac60328a035" target="_blank" rel="noopener">doi:10.1021/ac60328a035</a></li>
<li><span class="tag">articolo</span>Fenn J.B. et al. (1989) Electrospray ionization for mass spectrometry of large biomolecules. <i>Science</i> 246, 64-71. <a href="https://doi.org/10.1126/science.2675315" target="_blank" rel="noopener">doi:10.1126/science.2675315</a></li>
<li><span class="tag">articolo</span>Yost R.A., Enke C.G. (1978) Selected ion fragmentation with a tandem quadrupole mass spectrometer. <i>J. Am. Chem. Soc.</i> 100, 2274-2275. <a href="https://doi.org/10.1021/ja00475a072" target="_blank" rel="noopener">doi:10.1021/ja00475a072</a></li>
<li><span class="tag">articolo</span>Morris H.R. et al. (1996) High sensitivity collisionally-activated decomposition tandem mass spectrometry on a novel quadrupole/orthogonal-acceleration time-of-flight mass spectrometer. <i>Rapid Commun. Mass Spectrom.</i> 10, 889-896. <a href="https://doi.org/10.1002/(SICI)1097-0231(19960610)10:8&lt;889::AID-RCM615&gt;3.0.CO;2-F" target="_blank" rel="noopener">doi:10.1002/(SICI)1097-0231(19960610)10:8&lt;889::AID-RCM615&gt;3.0.CO;2-F</a></li>
<li><span class="tag">articolo</span>Michalski A. et al. (2011) Mass spectrometry-based proteomics using Q Exactive, a high-performance benchtop quadrupole Orbitrap mass spectrometer. <i>Mol. Cell. Proteomics</i> 10, M111.011015. <a href="https://doi.org/10.1074/mcp.M111.011015" target="_blank" rel="noopener">doi:10.1074/mcp.M111.011015</a></li>
<li><span class="tag">articolo</span>Cohen M.J., Karasek F.W. (1970) Plasma chromatography - a new dimension for gas chromatography and mass spectrometry. <i>J. Chromatogr. Sci.</i> 8, 330-337. <a href="https://doi.org/10.1093/chromsci/8.6.330" target="_blank" rel="noopener">doi:10.1093/chromsci/8.6.330</a></li>
</ul>
```

```html
<script>STORIA_UI.lazy(document.getElementById("sf-mobilita"), "../assets/storia-fig-mobilita.js");</script>
```
