<!-- script-before: masse.js -->
<!-- script: chemi-common.js -->
<!-- title: Formule e candidati in silico -->
# Formule e strutture candidate {kicker: Capitolo 30}

{.lead} Dalla massa esatta e dal profilo isotopico si ricava una lista di formule, poi di strutture candidate. Qui si vede come ogni indizio riduce la lista e dove i metodi in silico si fermano.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Nel 2007 Kind e Fiehn proposero regole euristiche per scartare le formule improbabili tra quelle compatibili con una massa esatta. Nel 2010 Wolf e colleghi presentarono MetFrag, che rompe in silico i legami di ogni candidato; Ruttkies e colleghi lo rilanciarono nel 2016.</p><p>CFM-ID comparve nel 2014 come servizio web (Allen et al., 2014) e nel 2021 arrivò alla versione 4.0 (Wang et al., 2021). Dührkop e colleghi pubblicarono CSI:FingerID nel 2015 e SIRIUS 4 nel 2019; ZODIAC (Ludwig et al., 2020) e CANOPUS (Dührkop et al., 2021) ne estesero l'uso alle formule e alle classi di composti.</p></details>
```

## Dalla massa alle formule

Una massa esatta non indica una formula sola, ma tutte quelle la cui massa calcolata cade entro la tolleranza. L'elenco si costruisce così (la versione già interattiva, con il solo conteggio, è nel [capitolo 11](11-formula.html#sim-formule)):

1. si sceglie il tipo di ione, per esempio [M+H]^+^, e si toglie dal m/z la massa dello ione aggiunto: M = m/z − 1,00728;
2. si fissano i limiti di ogni elemento: C, H, N e O sempre, P, S, Cl, Br e F solo se plausibili;
3. per ogni combinazione degli elementi diversi da H si calcola quanti idrogeni completano la massa;
4. si tengono le formule con errore, in valore assoluto, non oltre la tolleranza.

```html
<span class="eq">errore (ppm) = <span class="frac"><span><i>m</i><sub>calc</sub> − <i>m</i><sub>mis</sub></span><span><i>m</i><sub>mis</sub></span></span> × 10<sup>6</sup><span class="no">(30.1)</span></span>
```

Esempio: lo ione [M+H]^+^ misurato a 216,1011 corrisponde a una massa neutra di 215,0938, che è quella di C~8~H~14~ClN~5~ (l'atrazina, a titolo di esempio). Ogni formula elencata deve poi avere un RDB intero e non negativo ([capitolo 11](11-formula.html)).

```html
<div class="box warn"><b>Errori frequenti</b><p>Una finestra in ppm più stretta dell'errore reale esclude la formula vera. Un tipo di ione sbagliato (per esempio [M+H]<sup>+</sup> al posto di [M+Na]<sup>+</sup>) rende sbagliate tutte le formule. La figura 30.1 mostra entrambi gli effetti.</p></div>
```

## Il pattern isotopico come filtro

Ogni formula ha un gruppo teorico di picchi M, M+1, M+2, M+3, ricavabile dalle abbondanze naturali degli isotopi ([capitolo 11](11-formula.html)). Si confronta con le intensità misurate, riferite a M = 100. Un punteggio didattico semplice è:

```html
<span class="eq"><i>S</i> = 1 − <span class="frac"><span>Σ<sub><i>k</i>=1..3</sub> |<i>r<sub>k</sub></i> − <i>t<sub>k</sub></i>|</span><span>Σ<sub><i>k</i>=1..3</sub> <i>t<sub>k</sub></i></span></span><span class="no">(30.2)</span></span>
```

Qui *r~k~* è l'intensità misurata del picco M+*k* e *t~k~* quella teorica. I programmi reali usano punteggi propri, più raffinati: questo serve a capire l'effetto.

Per C~8~H~14~ClN~5~ il pattern teorico è 100 : 10,64 : 32,51 : 3,42. Se si misura 100 : 10,0 : 30,0 : 3,0, la somma degli scarti è 3,57 e quella dei valori teorici 46,57: *S* = 0,923. Se M+2 sparisce sotto la soglia, *S* scende a 0,21. Un rivelatore saturo gonfia tutti i rapporti rispetto a M. Il segnale va quindi controllato prima (capitolo [22](22-segnale.html)).

## Regole euristiche

Kind e Fiehn (2007) hanno raccolto sette regole per togliere le formule chimicamente improbabili senza perdere quelle vere. In breve:

1. limiti sul numero di atomi di ogni elemento, in funzione della massa;
2. regole di valenza di Lewis e di Senior;
3. accordo con il pattern isotopico;
4. intervallo ammesso per il rapporto H/C;
5. limiti sui rapporti tra eteroatomi (N, O, P, S) e carbonio;
6. probabilità delle combinazioni di rapporti tra elementi;
7. controllo del trimetilsilile, per le molecole derivatizzate.

La figura usa tre filtri di questo tipo: RDB intero e non negativo, H/C tra 0,2 e 3,1 (come nel capitolo 11) e punteggio isotopico minimo. I limiti dei singoli elementi sono quelli, più stretti, della ricerca didattica.

```html
<details class="poe"><summary style="color:var(--ink)">Prima di provare: quante formule restano per l'atrazina con C H N O, S e Cl, a 5 ppm? E se il rivelatore è saturo?</summary>
<p>Dopo la sola massa restano pochi candidati; il filtro RDB ne toglie qualcuno, quello H/C quasi nessuno. Il filtro isotopico lascia solo la formula vera. Con il pattern saturo, invece, anche la formula vera viene scartata: prova.</p></details>
```

```html
<div class="sim" id="sim-chemi-formula" data-sim="../assets/sim-chemi-candidati.js"><h3>Figura 30.1 Quante formule restano?</h3>
<p class="note nota">Mostra quante formule restano dopo ogni indizio: tolleranza, elementi, isotopi e regole. Dati sintetici, a scopo didattico.</p></div>
```

## Dalla formula ai candidati

Una formula non è una struttura: ne ammette in genere molte, tutte isomere. Per elencarle si interroga una banca dati di strutture note, per formula o per massa. Il risultato è una lista di candidati, che ha due limiti.

- Contiene solo ciò che la banca dati conosce: un composto assente non può essere trovato.
- L'ordine dipende dalla banca dati scelta e dai suoi contenuti, e cambia se si cambia banca.

Per ordinare i candidati si ricorre allo spettro MS2, confrontandolo con quello che ciascun candidato produrrebbe: è la frammentazione in silico. Un candidato in cima alla lista, senza altre prove, è al più di livello 3 ([capitolo 31](31-confidenza.html)).

```html
<div class="box warn"><b>Non fidarsi del solo primo posto</b><p>Gli isomeri non si distinguono dalla formula e spesso nemmeno dall'MS2. L'ordine cambia con la banca dati e con il programma. Il primo della lista è un candidato, non un'identificazione.</p></div>
```

## Frammentazione in silico

Il calcolatore prevede come ogni candidato si romperebbe e confronta la previsione con i picchi misurati. I tre approcci differiscono nel prevedere.

### MetFrag: rompere legami

MetFrag (Wolf et al., 2010) rompe i legami in modo combinatorio; la versione rilanciata (Ruttkies et al., 2016) aggiunge termini di punteggio facoltativi, come il tempo di ritenzione. Il procedimento:

1. si prendono i candidati di una banca dati, per formula o per massa;
2. per ciascuno si rompono i legami in tutte le combinazioni, fino a una profondità fissata;
3. si abbina la massa di ogni frammento ai picchi entro la tolleranza;
4. il punteggio cresce con i picchi spiegati e cala con le rotture meno probabili, penalizzate per energia di legame.

### CFM-ID: prevedere lo spettro

CFM-ID usa un modello probabilistico della frammentazione, addestrato su spettri misurati (Allen et al., 2015). Per ogni candidato prevede uno spettro a energia di collisione bassa, media e alta; i candidati si ordinano per somiglianza con lo spettro misurato (Allen et al., 2014). La versione 4.0 è più accurata (Wang et al., 2021).

### SIRIUS e CSI:FingerID: alberi di frammentazione e impronte

SIRIUS (Dührkop et al., 2019) costruisce un albero di frammentazione, in cui ogni frammento ha una formula contenuta in quella del precursore, e lo combina con il pattern isotopico per ordinare le formule. ZODIAC (Ludwig et al., 2020) ne migliora la scelta senza banca dati.

CSI:FingerID (Dührkop et al., 2015) prevede dallo spettro, con l'apprendimento automatico, un'impronta molecolare e cerca nelle banche dati le strutture con impronta più simile. CANOPUS (Dührkop et al., 2021) ne ricava la classe del composto. Blaženović et al. (2018) li confrontano con altri strumenti.

```html
<details class="poe"><summary style="color:var(--ink)">Prima di provare: tre isomeri, uno spettro. Possono avere punteggi molto diversi?</summary>
<p>Dipende dai frammenti predetti: isomeri che si rompono nello stesso modo pareggiano. Cambia il peso dell'intensità e guarda.</p></details>
```

```html
<div class="sim" id="sim-chemi-candidati" data-sim="../assets/sim-chemi-candidati.js"><h4>Figura 30.2 Tre isomeri, uno spettro</h4>
<p class="note nota">Confronta tre isomeri sintetici con uno stesso spettro e mostra che i punteggi possono pareggiare. Dati sintetici, a scopo didattico.</p></div>
```

## Verifica

```html
<details class="q"><summary>Un ione [M+H]<sup>+</sup> è misurato a m/z 216,1011. Quale massa neutra cerchi?</summary><p>216,1011 − 1,00728 = 215,0938. Se lo ione fosse [M+Na]<sup>+</sup> bisognerebbe togliere 22,98922 e tutte le formule risulterebbero diverse.</p></details>
```

```html
<details class="q"><summary>Il pattern teorico è 100 : 10,64 : 32,51 : 3,42 e quello misurato 100 : 10,0 : 30,0 : 3,0. Quanto vale il punteggio (30.2)?</summary><p>Scarti: 0,64 + 2,51 + 0,42 = 3,57. Somma teorica: 10,64 + 32,51 + 3,42 = 46,57. <i>S</i> = 1 − 3,57/46,57 = 0,923.</p></details>
```

```html
<details class="q"><summary>Perché con ppm molto stretti la formula vera può sparire dalla lista?</summary><p>Perché l'errore di massa reale può superare la finestra. La tolleranza va scelta sull'errore osservato dello strumento, non sul valore più basso possibile.</p></details>
```

```html
<details class="q"><summary>Tre isomeri spiegano lo stesso 90 % del segnale. Che cosa si può concludere?</summary><p>Che lo spettro non li distingue. Servono altre prove: il tempo di ritenzione, uno standard, un altro tipo di dato. Senza di esse il livello resta 3.</p></details>
```

```html
<details class="q"><summary>Il primo candidato di CSI:FingerID è identificato?</summary><p>No: è un candidato provvisorio, al più livello 3. Per salire serve almeno un confronto con uno standard misurato con lo stesso metodo (capitolo 31).</p></details>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Kind T., Fiehn O. (2007) Seven Golden Rules for heuristic filtering of molecular formulas obtained by accurate mass spectrometry. <i>BMC Bioinformatics</i> 8, 105. <a href="https://doi.org/10.1186/1471-2105-8-105" target="_blank" rel="noopener">doi:10.1186/1471-2105-8-105</a></li>
<li><span class="tag">articolo</span>Wolf S. et al. (2010) In silico fragmentation for computer assisted identification of metabolite mass spectra (MetFrag). <i>BMC Bioinformatics</i> 11, 148. <a href="https://doi.org/10.1186/1471-2105-11-148" target="_blank" rel="noopener">doi:10.1186/1471-2105-11-148</a></li>
<li><span class="tag">articolo</span>Ruttkies C. et al. (2016) MetFrag relaunched. <i>J. Cheminform.</i> 8, 3. <a href="https://doi.org/10.1186/s13321-016-0115-9" target="_blank" rel="noopener">doi:10.1186/s13321-016-0115-9</a></li>
<li><span class="tag">articolo</span>Allen F. et al. (2014) CFM-ID: a web server for annotation, spectrum prediction and metabolite identification from tandem mass spectra. <i>Nucleic Acids Res.</i> 42, W94-W99. <a href="https://doi.org/10.1093/nar/gku436" target="_blank" rel="noopener">doi:10.1093/nar/gku436</a></li>
<li><span class="tag">articolo</span>Allen F. et al. (2015) Competitive fragmentation modeling of ESI-MS/MS spectra for putative metabolite identification. <i>Metabolomics</i> 11, 98-110. <a href="https://doi.org/10.1007/s11306-014-0676-4" target="_blank" rel="noopener">doi:10.1007/s11306-014-0676-4</a></li>
<li><span class="tag">articolo</span>Wang F. et al. (2021) CFM-ID 4.0: more accurate ESI-MS/MS spectral prediction and compound identification. <i>Anal. Chem.</i> 93, 11692-11700. <a href="https://doi.org/10.1021/acs.analchem.1c01465" target="_blank" rel="noopener">doi:10.1021/acs.analchem.1c01465</a></li>
<li><span class="tag">articolo</span>Dührkop K. et al. (2015) Searching molecular structure databases with tandem mass spectra using CSI:FingerID. <i>PNAS</i> 112, 12580-12585. <a href="https://doi.org/10.1073/pnas.1509788112" target="_blank" rel="noopener">doi:10.1073/pnas.1509788112</a></li>
<li><span class="tag">articolo</span>Dührkop K. et al. (2019) SIRIUS 4: a rapid tool for turning tandem mass spectra into metabolite structure information. <i>Nat. Methods</i> 16, 299-302. <a href="https://doi.org/10.1038/s41592-019-0344-8" target="_blank" rel="noopener">doi:10.1038/s41592-019-0344-8</a></li>
<li><span class="tag">articolo</span>Ludwig M. et al. (2020) Database-independent molecular formula annotation using Gibbs sampling through ZODIAC. <i>Nat. Mach. Intell.</i> 2, 629-641. <a href="https://doi.org/10.1038/s42256-020-00234-6" target="_blank" rel="noopener">doi:10.1038/s42256-020-00234-6</a></li>
<li><span class="tag">articolo</span>Dührkop K. et al. (2021) Systematic classification of unknown metabolites using high-resolution fragmentation mass spectra (CANOPUS). <i>Nat. Biotechnol.</i> 39, 462-471. <a href="https://doi.org/10.1038/s41587-020-0740-8" target="_blank" rel="noopener">doi:10.1038/s41587-020-0740-8</a></li>
<li><span class="tag">articolo</span>Blaženović I. et al. (2018) Software tools and approaches for compound identification of LC-MS/MS data in metabolomics. <i>Metabolites</i> 8, 31. <a href="https://doi.org/10.3390/metabo8020031" target="_blank" rel="noopener">doi:10.3390/metabo8020031</a></li>
</ul>
```
