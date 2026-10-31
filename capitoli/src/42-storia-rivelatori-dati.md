<!-- script: storia-dati.js storia-fig-linea.js storia-fig-rivelatore.js -->
# Rivelatori, dati, applicazioni {kicker: Capitolo 42}

{.lead} Un rivelatore trasforma gli ioni in un segnale, un calcolatore trasforma il segnale in una risposta. Anche qui la storia è fatta di salti.

## Dalla lastra fotografica alla corrente

Ogni spettrometro finisce con un rivelatore: il pezzo che dice quanti ioni sono arrivati e dove. I primi strumenti lo facevano con una lastra fotografica. Poi arrivò la misura elettrica della corrente.

### Lastra fotografica (Thomson, Aston)

Le parabole di Thomson e le righe dello spettrografo di Aston si registravano su una lastra. La posizione di una riga dice il rapporto m/z dello ione; più la riga è scura, più ioni sono arrivati.

La lastra ha un grande pregio: registra tutte le masse nello stesso istante. Ha anche un limite pratico, perché va sviluppata e poi letta a occhio o con uno strumento di misura. Lo spettrografo di Aston e i suoi spettri sono nel capitolo <a href="35-storia-aston-dempster.html">35</a>.

<!-- to verify against source: how plate darkening was converted to intensity (densitometry) in Aston's work -->

```html
<figure>
<img src="../assets/img/storia/foto/aston-spettri.webp" loading="lazy" decoding="async" width="360" height="509" alt="Fotografia di una tavola con gli spettri di massa di neon, cloro, argon e kripton su lastra fotografica">
<figcaption><b>Figura 42.1</b> Spettri di massa di Aston su lastra fotografica: neon, cloro, argon e kripton. F.W. Aston, Isotopes, 1922; Science History Institute; pubblico dominio.</figcaption>
</figure>
```

### Elettrometro e coppa di Faraday (Dempster, Nier)

Con lo spettrometro a 180° di Dempster (1918) gli ioni vengono contati come corrente elettrica. Gli ioni cadono in un elettrodo collettore, spesso una piccola coppa metallica, e la carica che arriva si legge come una corrente.

Questo metodo è la base degli strumenti di Nier per i rapporti isotopici di routine (1940): il rapporto fra due isotopi è il rapporto fra due correnti. Ma uno ione che arriva ogni secondo porta una corrente di circa 1,6×10⁻¹⁹ ampere, troppo piccola per qualsiasi strumento. Serviva qualcosa che la moltiplicasse.

<!-- to verify against source: which detector (electrometer, Faraday cup) Dempster 1918 and Nier 1940 used -->

## Moltiplicare gli elettroni

### Il moltiplicatore a dinodi

Il moltiplicatore di elettroni risolve il problema così: uno ione colpisce un elettrodo, il dinodo, e ne stacca alcuni elettroni. Questi, accelerati da un campo, colpiscono il dinodo successivo e ne staccano altri.

Se a ogni dinodo ogni elettrone ne libera in media δ, dopo n dinodi un solo ione diventa δⁿ elettroni. Con δ = 3 e 12 dinodi sono circa 5,3×10⁵ elettroni: un impulso abbastanza grande da essere contato. Nel 1947 J.S. Allen descrisse un contatore di particelle a moltiplicatore di elettroni migliorato.

Prova nella figura: cambia il numero di dinodi e la resa, e guarda come cresce il guadagno. Il rivelatore del triplo quadrupolo è descritto nel capitolo <a href="08-qqq.html">8</a>.

```html
<div class="sim storia-fig" id="sf-moltiplicatore"><h4>Uno ione diventa moltissimi elettroni</h4>
<figure>
<img src="../assets/img/storia/schemi/moltiplicatore.svg" loading="lazy" decoding="async" width="720" height="340" alt="Moltiplicatore a dinodi: la cascata di elettroni raddoppia a ogni dinodo fino all'anodo">
<figcaption><b>Figura 42.2</b> Il moltiplicatore a dinodi: dopo n dinodi con resa δ il guadagno è δⁿ. Nella versione animata le barre mostrano il numero di elettroni su scala logaritmica. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption>
</figure>
</div>
```

### Le piastre a microcanali

Una piastra a microcanali è un disco sottile attraversato da moltissimi canali minuscoli. Ogni canale lavora come un moltiplicatore continuo: la sua parete fa da dinodo, e gli elettroni rimbalzano da un punto all'altro lungo il canale.

Nel 1979 J.L. Wiza ne scrisse una rassegna. Una piastra è piatta e veloce, e per questo si adatta bene al tempo di volo, dove l'arrivo degli ioni va registrato con grande precisione. La risoluzione e il tempo di risposta sono nel capitolo <a href="09-risoluzione.html">9</a>.

```html
<figure>
<img src="../assets/img/storia/schemi/mcp.svg" loading="lazy" decoding="async" width="720" height="340" alt="Piastra a microcanali in sezione con la cascata di elettroni in un canale">
<figcaption><b>Figura 42.3</b> Una piastra a microcanali in sezione: nel canale un elettrone innesca la cascata. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption>
</figure>
```

## Dai registratori a carta ai calcolatori

### Misurare a mano i picchi

Per molto tempo uno spettro era un tracciato su carta. Per ricavarne le abbondanze relative si misuravano le altezze dei picchi e si riportavano su una tabella. Identificare una sostanza voleva dire confrontare quella tabella con quelle già note.

<!-- to verify against source: chart recorder and manual peak-height measurement era, dates and instruments -->

### Le librerie di spettri e la ricerca automatica

Nel 1971 Hertz, Hites e Biemann descrissero l'identificazione di spettri di massa con la ricerca al calcolatore in un file di spettri noti. L'idea è semplice: il calcolatore confronta lo spettro sconosciuto con tutti quelli della libreria e propone i più simili.

La ricerca funziona bene con gli spettri EI, perché sono molto riproducibili da uno strumento all'altro. Le librerie EI e il modo di leggerle sono nel capitolo <a href="05-ei-ci.html">5</a>; la teoria dei dati è nel capitolo <a href="10-dati.html">10</a>.

### Le tappe in fila

Qui sotto trovi le tappe di questo capitolo sulla linea del tempo, già filtrate sui rivelatori e sui dati. Senza JavaScript vale l'elenco.

```html
<div class="sim storia-fig" id="sf-linea" data-storia="linea" data-filtro="dati"><h4>Le tappe di rivelatori e dati</h4>
<div class="storia-statico">
<ol class="storia-elenco">
<li><b>1947 · Moltiplicatore di elettroni migliorato</b>. J.S. Allen. Contare ioni singoli. <a href="42-storia-rivelatori-dati.html">Rivelatori e dati (capitolo 42)</a></li>
<li><b>1971 · Ricerca in libreria al calcolatore</b>. H.S. Hertz, R.A. Hites, K. Biemann. Identificare uno spettro confrontandolo con migliaia di spettri noti. <a href="42-storia-rivelatori-dati.html">Rivelatori e dati (capitolo 42)</a></li>
<li><b>1979 · Piastre a microcanali</b>. J.L. Wiza (rassegna). Rivelatori piatti e veloci, adatti al TOF. <a href="42-storia-rivelatori-dati.html">Rivelatori e dati (capitolo 42)</a></li>
<li><b>1994 · SEQUEST</b>. J.K. Eng, A.L. McCormack, J.R. Yates III. Spettri MS/MS collegati alle sequenze di una banca dati: proteomica. <a href="42-storia-rivelatori-dati.html">Rivelatori e dati (capitolo 42)</a></li>
</ol>
</div></div>
```

## Cinque campi che la MS ha cambiato

Ogni passo tecnico di questa storia ha aperto un campo di applicazione. Qui ne scegliamo cinque, in ordine più o meno cronologico.

### Geochimica isotopica e datazioni

Nel 1950 Nier misurò di nuovo le abbondanze relative degli isotopi di carbonio, azoto, ossigeno, argon e potassio. Con uno strumento a settore e un rivelatore a corrente si ottennero rapporti isotopici molto più accurati di prima.

Questi valori servono ancora da riferimento per la geochimica isotopica e per le datazioni. La storia dei settori e degli strumenti di Nier è nel capitolo <a href="36-storia-settori.html">36</a>.

<!-- to verify against source: how Nier 1950 abundances were used in isotope geochemistry and dating (e.g. K-Ar) -->

### Petrolio

Il petrolio è una miscela di un numero enorme di composti, in gran parte idrocarburi. È il tipo di campione per cui servono due cose insieme: separare prima, con la gascromatografia, e distinguere poi molte masse vicine, con un'alta risoluzione.

<!-- to verify against source: petroleum: history of GC-MS and high-resolution MS (FT-ICR) applied to crude oil; no dated claim without a verified review -->

### Proteomica

Nel 1994 Eng, McCormack e Yates descrissero un metodo per collegare gli spettri MS/MS dei peptidi alle sequenze di aminoacidi di una banca dati: è il programma SEQUEST. Il calcolatore confronta lo spettro misurato con quelli che le sequenze della banca dati farebbero prevedere e propone la sequenza che corrisponde meglio.

Così un solo esperimento identifica molte proteine insieme. Le sorgenti dolci del capitolo <a href="40-storia-sorgenti.html">40</a> portano i peptidi in fase gas, gli ibridi del capitolo <a href="41-storia-accoppiamenti.html">41</a> li frammentano, il calcolatore li legge. Yates ha raccontato questo percorso nella rassegna del 2011.

<!-- to verify against source: details of the SEQUEST scoring function (Eng 1994) -->

### Metabolomica

La metabolomica cerca di misurare le molecole piccole di un organismo, molte delle quali non sono note. Qui il lavoro sui dati conta quanto lo strumento: serve una libreria da cui partire e un modo onesto di dire quanto è sicura un'identificazione. Nel 2007 un gruppo di ricercatori propose standard minimi per riportare l'analisi chimica (Sumner e colleghi).

<!-- to verify against source: history and milestones of metabolomics by MS; no dated claim without a verified review -->

### Analisi ambientale

Nell'analisi ambientale le sostanze da trovare sono poche e in tracce, in matrici complesse come acqua e suolo. La sensibilità del rivelatore e la selettività dell'MS/MS decidono quali composti si vedono. Una scala di livelli di confidenza, proposta da Schymanski e colleghi nel 2014, aiuta a dichiarare quanto è solida ogni identificazione.

Come si organizza un lavoro di questo tipo è nel capitolo <a href="16-strategia.html">16</a>.

<!-- to verify against source: history of environmental MS (GC-MS and LC-MS of contaminants); no dated claim without a verified review -->

## Chi era

```html
<details class="storia-chi"><summary>K. Biemann</summary>
<p>K. Biemann è tra gli autori dell'articolo del 1971 su <i>Analytical Chemistry</i> che descrive l'identificazione di spettri di massa con la ricerca al calcolatore in un file di spettri noti: il lavoro da cui discendono le librerie di spettri che usiamo ancora.</p>
</details>
<!-- to verify against source: Biemann birth/death years, workplace and career (no verified biography in the plan) -->
<details class="storia-chi"><summary>J.R. Yates III</summary>
<p>J.R. Yates III è coautore dell'articolo del 1994 su SEQUEST, il programma che collega gli spettri MS/MS dei peptidi alle sequenze di una banca dati. Nel 2011 ha firmato la rassegna «A century of mass spectrometry: from atoms to proteomes», una delle fonti di questa parte.</p>
</details>
<!-- to verify against source: Yates affiliation and dates -->
```

## Perché contava

```html
<div class="box key"><b>Perché contava</b>
<ul>
<li>Il rivelatore a moltiplicazione portò la spettrometria di massa a contare ioni singoli: oggi è il rivelatore generale più sensibile.</li>
<li>I calcolatori e le librerie trasformarono gli spettri in identificazioni, su migliaia di campioni.</li>
<li>Geochimica, petrolio, proteomica, metabolomica e ambiente mostrano che cosa ha reso possibile ogni passo tecnico.</li>
</ul></div>
```

## Per capire meglio

```html
<p class="storia-link">Per capire meglio: <a href="08-qqq.html">il rivelatore del triplo quadrupolo</a>, <a href="09-risoluzione.html">risoluzione e rivelatore</a>, <a href="10-dati.html">dati</a>, <a href="05-ei-ci.html">librerie EI</a>, <a href="16-strategia.html">strategia di analisi</a>.</p>
```

## Fonti

```html
<ul class="refs">
<li><span class="tag">articolo</span>Allen J.S. (1947) An improved electron multiplier particle counter. <i>Rev. Sci. Instrum.</i> 18, 739-749. <a href="https://doi.org/10.1063/1.1740838" target="_blank" rel="noopener">doi:10.1063/1.1740838</a></li>
<li><span class="tag">articolo</span>Wiza J.L. (1979) Microchannel plate detectors. <i>Nucl. Instrum. Methods</i> 162, 587-601. <a href="https://doi.org/10.1016/0029-554X(79)90734-1" target="_blank" rel="noopener">doi:10.1016/0029-554X(79)90734-1</a></li>
<li><span class="tag">articolo</span>Hertz H.S., Hites R.A., Biemann K. (1971) Identification of mass spectra by computer-searching a file of known spectra. <i>Anal. Chem.</i> 43, 681-691. <a href="https://doi.org/10.1021/ac60301a009" target="_blank" rel="noopener">doi:10.1021/ac60301a009</a></li>
<li><span class="tag">articolo</span>Eng J.K., McCormack A.L., Yates J.R. III (1994) An approach to correlate tandem mass spectral data of peptides with amino acid sequences in a protein database. <i>J. Am. Soc. Mass Spectrom.</i> 5, 976-989. <a href="https://doi.org/10.1016/1044-0305(94)80016-2" target="_blank" rel="noopener">doi:10.1016/1044-0305(94)80016-2</a></li>
<li><span class="tag">articolo</span>Nier A.O. (1950) A redetermination of the relative abundances of the isotopes of carbon, nitrogen, oxygen, argon, and potassium. <i>Phys. Rev.</i> 77, 789-793. <a href="https://doi.org/10.1103/PhysRev.77.789" target="_blank" rel="noopener">doi:10.1103/PhysRev.77.789</a></li>
<li><span class="tag">articolo</span>Sumner L.W. et al. (2007) Proposed minimum reporting standards for chemical analysis. <i>Metabolomics</i> 3, 211-221. <a href="https://doi.org/10.1007/s11306-007-0082-2" target="_blank" rel="noopener">doi:10.1007/s11306-007-0082-2</a></li>
<li><span class="tag">articolo</span>Schymanski E.L. et al. (2014) Identifying small molecules via high resolution mass spectrometry: communicating confidence. <i>Environ. Sci. Technol.</i> 48, 2097-2098. <a href="https://doi.org/10.1021/es5002105" target="_blank" rel="noopener">doi:10.1021/es5002105</a></li>
<li><span class="tag">articolo</span>Yates J.R. III (2011) A century of mass spectrometry: from atoms to proteomes. <i>Nat. Methods</i> 8, 633-637. <a href="https://doi.org/10.1038/nmeth.1659" target="_blank" rel="noopener">doi:10.1038/nmeth.1659</a></li>
<li><span class="tag">articolo</span>Griffiths J. (2008) A brief history of mass spectrometry. <i>Anal. Chem.</i> 80, 5678-5683. <a href="https://doi.org/10.1021/ac8013065" target="_blank" rel="noopener">doi:10.1021/ac8013065</a></li>
</ul>
```

```html
<script>STORIA_UI.lazy(document.getElementById("sf-moltiplicatore"), "../assets/storia-fig-rivelatore.js");STORIA_UI.lazy(document.getElementById("sf-linea"), "../assets/storia-fig-linea.js");</script>
```
