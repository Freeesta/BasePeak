<!-- script: sim-misc.js -->
<!-- title: I dati: file, scansioni e modi di acquisizione -->
# I dati: file, scansioni e modi di acquisizione {kicker: Capitolo 10}

{.lead} Che cosa contiene un file di spettrometria di massa, come si controlla quando lo si apre e come il modo di acquisizione ne cambia la forma.

## Che cosa contiene un file

Un file di dati è una sequenza di scansioni. Ogni scansione è uno spettro. Uno spettro è un elenco di coppie *m/z* e intensità. Ogni scansione ha il suo tempo di ritenzione.

### Scansione, tempo di ritenzione e livello

Ogni scansione porta con sé alcune informazioni, oltre alle coppie *m/z*–intensità:

```html
<ul>
<li><b>Scan</b>: il numero d'ordine della scansione nel file.</li>
<li><b>Tempo di ritenzione</b> (RT): il momento dell'analisi in cui lo spettro è stato registrato.</li>
<li><b>Livello MS</b>: MS1 se lo spettro descrive gli ioni intatti, MS2 se descrive i frammenti di uno ione isolato (precursore).</li>
<li><b>Polarità</b>: ioni positivi o negativi.</li>
<li><b>Per l'MS2</b>: <i>m/z</i> del precursore, larghezza della finestra di isolamento ed energia di collisione.</li>
</ul>
```

Il tempo di ritenzione può essere in minuti o in secondi. Va letto con l'unità scritta nel file.

### Profilo e centroide

Lo stesso spettro può essere salvato in due forme.

```html
<table>
<caption>Profilo e centroide a confronto</caption>
<tr><th>Forma</th><th>Che cosa contiene</th><th>Quando serve</th></tr>
<tr><td><b>Profilo</b></td><td>Tutti i punti del segnale, con la forma del picco</td><td>Valutare risoluzione, forma e saturazione dei picchi</td></tr>
<tr><td><b>Centroide</b></td><td>Un solo punto per picco: <i>m/z</i> al centro e intensità</td><td>Lavoro di routine: file più piccoli, ricerca nelle banche dati</td></tr>
</table>
```

Il passaggio da profilo a centroide si chiama _peak picking_. Non si può invertire. Dal centroide non si recupera la forma del picco. Per questo si conserva sempre il file originale. Approfondimento: <a href="22-segnale.html">capitolo 22 (Segnale, profilo e centroide)</a>.

### Cromatogrammi: TIC, BPC, XIC

Mettendo in fila gli spettri si ottiene un cubo di dati: tempo × *m/z* × intensità. Un cromatogramma è una sua fetta.

```html
<ul>
<li><b>TIC</b> (total ion current): somma di tutte le intensità di ogni spettro. Dominato dal fondo e dalle specie più abbondanti: utile per un colpo d'occhio, quasi inutile per trovare un TP minore.</li>
<li><b>BPC</b> (base peak chromatogram): per ogni spettro, l'intensità dello ione più intenso. Fa emergere meglio i picchi stretti sul fondo diffuso.</li>
<li><b>XIC</b> o EIC (extracted ion chromatogram): intensità entro una finestra di m/z attorno a un valore scelto. È lo strumento principale: un m/z = una traccia nel tempo.</li>
</ul>
```

### La finestra di estrazione

Con risoluzione unitaria il profilo di uno ione è largo ~0,7 Da a metà altezza e va da circa −0,5 a +0,5 Da dal centro. Una finestra di ±0,5 Da centrata sul valore _osservato_ raccoglie quasi tutto il segnale senza prendere i vicini.

Se l'asse di massa è spostato, la finestra va allargata. Esempio: con uno spostamento di +0,3 Da, centrare la finestra sul valore teorico taglia il picco. Si usa ±1 Da sul valore teorico, oppure ±0,5 Da sul valore osservato nello spettro dello standard.

Con l'alta risoluzione la finestra si esprime in ppm (di solito 5–10 ppm). Approfondimento: <a href="24-tracce.html">capitolo 24 (Tracce di massa e ROI)</a>.

### Spettro di un picco e sottrazione del fondo

Lo spettro "di un composto" si ottiene mediando gli spettri lungo il picco cromatografico e sottraendo quelli di una zona vicina senza picchi (o lo stesso intervallo nel bianco). Senza sottrazione, ioni del fondo (plastificanti, polisilossani, cluster della fase mobile) contaminano lo spettro e possono sembrare frammenti o addotti.

```html
<div class="box warn"><b>Errori frequenti nel full scan</b>
<ul>
<li>Considerare TP un m/z presente anche nel bianco o a t0 con intensità simile: è fondo o un'impurezza dello standard.</li>
<li>Considerare TP isotopi, addotti o frammenti in sorgente del parent: hanno lo stesso RT e la stessa forma di picco del parent (capitoli 2 e 4).</li>
<li>Confrontare le altezze di TP diversi come se fossero concentrazioni: la risposta ESI cambia da molecola a molecola.</li>
<li>Integrare XIC con picchi saturi (appiattiti in cima): l'area è sottostimata.</li>
</ul></div>
```

## Formati dei file

### Formati aperti: mzML e mzXML

I formati aperti sono scritti in XML. Sono leggibili da molti programmi diversi e non dipendono da uno strumento.

```html
<ul>
<li><b>mzML</b>: lo standard attuale, definito dalla comunità (HUPO-PSI). Contiene spettri e cromatogrammi, con metadati e vocabolario controllato.</li>
<li><b>mzXML</b>: il formato più vecchio. Ancora diffuso, ma meno completo e non più sviluppato.</li>
</ul>
```

Negli stessi file gli array di *m/z* e di intensità sono codificati in binario e di solito compressi. Il file è molto più piccolo di quello che si vede aprendolo in un editor di testo.

In mzML, full scan e MS2 sono serie di spettri. I dati di MRM sono salvati come cromatogrammi (SRM), uno per transizione.

Per la GC-MS esiste anche il vecchio formato CDF (ANDI-MS), ancora letto da molti programmi di deconvoluzione. Approfondimento: <a href="23-formati.html">capitolo 23 (File e formati aperti)</a>.

### Formati dei costruttori e conversione

Ogni costruttore salva i dati nel proprio formato. Spesso è una cartella e non un singolo file.

```html
<table>
<caption>Formati dei costruttori</caption>
<tr><th>Costruttore</th><th>Formato tipico</th></tr>
<tr><td>Thermo Fisher</td><td>.raw (file)</td></tr>
<tr><td>Waters</td><td>.raw (cartella)</td></tr>
<tr><td>Agilent</td><td>.d (cartella)</td></tr>
<tr><td>Bruker</td><td>.d (cartella)</td></tr>
<tr><td>Sciex</td><td>.wiff con il file .wiff.scan</td></tr>
<tr><td>Shimadzu</td><td>.lcd</td></tr>
</table>
```

I formati dei costruttori contengono tutto, comprese le calibrazioni e il metodo di acquisizione. Si leggono bene solo con il programma del costruttore. Per usare programmi di terzi si converte in mzML.

ProteoWizard (programma _msconvert_) è lo strumento libero più usato. Alcune scelte da fare, e da annotare, durante la conversione:

```html
<ul>
<li><b>Centroide o profilo</b>: se si converte in centroide, l'algoritmo di peak picking è quello del costruttore (di solito il migliore) o uno generico.</li>
<li><b>Livelli MS e polarità</b>: tenere tutti i livelli. Eventuali filtri vanno scritti nel registro.</li>
<li><b>Precisione</b>: 64 bit per <i>m/z</i> se serve l'alta risoluzione.</li>
<li><b>Compressione</b>: la compressione zlib non perde informazione.</li>
<li><b>Nome del file</b>: uguale all'originale, per poter risalire alla corsa.</li>
</ul>
```

## Che cosa controllare quando si importa un file

Prima di interpretare, si guarda il file. Pochi controlli evitano errori lunghi da trovare.

```html
<ul>
<li><b>Il file si apre per intero.</b> Un file troncato (analisi interrotta, copia incompleta) ha meno scansioni del previsto.</li>
<li><b>Profilo o centroide.</b> Dipende dall'uso: per valutare la risoluzione serve il profilo.</li>
<li><b>Livelli MS presenti.</b> Un file di sola MS1 non permette di studiare i frammenti.</li>
<li><b>Polarità.</b> Positiva, negativa o alternata. Uno spettro in negativo non si confronta con uno in positivo.</li>
<li><b>Intervallo di <i>m/z</i> e di tempo.</b> Il segnale cercato deve cadere dentro entrambi.</li>
<li><b>Unità del tempo.</b> Minuti o secondi? Un errore di fattore 60 sposta tutti i picchi.</li>
<li><b>Punti per picco.</b> Servono almeno 10–12 scansioni su un picco cromatografico per descriverne la forma e integrarlo bene.</li>
<li><b>Asse di massa.</b> Con uno standard noto si controlla che <i>m/z</i> osservato e teorico coincidano (entro pochi ppm in alta risoluzione, entro pochi decimi di Da in risoluzione unitaria).</li>
<li><b>Saturazione.</b> Picchi appiattiti in cima segnalano un rivelatore saturo.</li>
<li><b>Scansioni vuote.</b> Nei file MS2 sono normali prima e dopo il picco.</li>
<li><b>Bianco e standard nello stesso lotto.</b> Senza il bianco non si distingue il fondo dal segnale.</li>
<li><b>Nome e ordine delle corse.</b> Il nome deve dire campione, replica e ordine di iniezione (capitolo 18).</li>
</ul>
```

```html
<div class="box key"><b>Regola pratica</b><p>Conservare sempre il file originale del costruttore. I file convertiti si possono rifare. Gli originali no.</p></div>
```

## Modi di acquisizione

Lo stesso strumento può registrare cose diverse. Il modo di acquisizione decide che forma ha il dato e quale domanda si può fare. I nomi sono quelli generali: i costruttori usano sigle proprie per gli stessi concetti.

```html
<table>
<caption>Modi di acquisizione a confronto</caption>
<tr><th>Modo</th><th>Che cosa registra</th><th>Forma del dato</th><th>Domanda a cui risponde</th></tr>
<tr><td><b>Full scan</b></td><td>Uno spettro completo in un intervallo di <i>m/z</i></td><td>Cubo tempo × <i>m/z</i> × intensità</td><td>Che cosa c'è? Che cosa cambia nel tempo?</td></tr>
<tr><td><b>SIM</b></td><td>Pochi <i>m/z</i> scelti</td><td>Una traccia per <i>m/z</i></td><td>Quanto ce n'è di questo ione?</td></tr>
<tr><td><b>Product ion scan</b> (MS2)</td><td>Frammenti di un precursore scelto</td><td>Spettri dei frammenti nel tempo</td><td>Com'è fatto questo ione?</td></tr>
<tr><td><b>MRM</b> (SRM)</td><td>Poche transizioni precursore → frammento</td><td>Un cromatogramma per transizione, nessuno spettro</td><td>Quanto ce n'è, con selettività?</td></tr>
<tr><td><b>DDA</b></td><td>MS1, poi MS2 sugli ioni più intensi</td><td>Spettri MS1 e MS2 alternati</td><td>Che cosa sono i picchi principali?</td></tr>
<tr><td><b>DIA</b></td><td>MS2 di tutti gli ioni, per finestre larghe</td><td>MS1 e MS2 composti, alternati</td><td>Che cosa c'è, senza perdere nulla?</td></tr>
</table>
```

### Full scan

Lo strumento registra tutto l'intervallo di *m/z* a ogni ciclo, di solito circa una volta al secondo. È il modo giusto per cercare l'ignoto. Il prezzo è la sensibilità: il tempo di misura si divide su tutto l'intervallo.

### SIM

Nel _selected ion monitoring_ lo strumento misura solo alcuni *m/z* scelti in anticipo. Ogni ione è misurato più a lungo. Il segnale sale e il rumore scende. Gli ioni non scelti non si vedono. Non si ottiene uno spettro.

### Product ion scan (MS2)

Un product ion scan registra i frammenti di un precursore isolato con risoluzione unitaria. Alcuni punti pratici:

```html
<ul>
<li><b>Che cosa entra in cella</b>: solo il picco isotopico selezionato (di solito il monoisotopico). Se isolate invece l'M+2 di un composto clorurato, i frammenti che contengono il cloro risultano spostati di +2, quelli senza cloro no: un trucco elegante per localizzare l'alogeno.</li>
<li><b>Precursore residuo</b>: all'energia di collisione scelta parte del precursore sopravvive e compare nello spettro; serve a confermare che si sta guardando lo ione giusto.</li>
<li><b>Coeluenti isobari</b>: se allo stesso RT ci sono due molecole con la stessa massa nominale, lo spettro MS2 è la somma dei loro frammenti. Guardate gli XIC dei singoli frammenti: frammenti dello stesso precursore hanno profili cromatografici identici.</li>
<li><b>Spettri vuoti</b>: nei file MS2 molti scan sono vuoti (prima e dopo il picco). È normale; ciò che conta è lo spettro mediato sul picco.</li>
<li><b>Confronto con il parent</b>: si registrano frammento per frammento le differenze. Frammenti uguali = porzione intatta; frammenti spostati di Δ = porzione modificata (capitolo 16).</li>
</ul>
```

### MRM

Nel _multiple reaction monitoring_ si scelgono transizioni: coppie precursore → frammento. Per ogni transizione lo strumento misura per un tempo breve (_dwell time_) e passa alla successiva. Il risultato è un cromatogramma per transizione.

Il metodo è molto sensibile e selettivo. È il modo della quantificazione. Non dà spettri e non scopre ciò che non è stato scelto. Per ogni analita si usano di solito due transizioni, una per quantificare e una per confermare (capitolo 8).

Il numero di transizioni e il dwell time fissano il tempo di ciclo. Un ciclo troppo lungo lascia pochi punti su un picco stretto.

### DDA

Nella _data-dependent acquisition_ lo strumento alterna due passi. Prima un full scan (MS1). Poi sceglie da solo gli ioni più intensi di quella scansione e ne registra l'MS2.

Alcune regole servono a non ripetersi:

```html
<ul>
<li><b>Top-N</b>: si seleziona un numero fisso di precursori per ciclo.</li>
<li><b>Soglia di intensità</b>: sotto una certa intensità lo ione non è scelto.</li>
<li><b>Esclusione dinamica</b>: uno ione già frammentato è escluso per un po', così lo strumento passa a quelli meno intensi.</li>
<li><b>Lista di inclusione</b>: si possono forzare ioni di interesse, anche se deboli.</li>
</ul>
```

Gli spettri MS2 sono puliti perché il precursore è isolato in una finestra stretta. Il limite è che la scelta dipende dall'intensità: ioni deboli o coeluenti possono non essere frammentati, e due corse della stessa miscela non scelgono sempre gli stessi ioni. Un esempio di uso è nel capitolo 17. Approfondimento: <a href="28-somiglianza.html">capitolo 28 (Somiglianza spettrale)</a>.

### DIA

Nella _data-independent acquisition_ non c'è scelta. Lo strumento divide l'intervallo di *m/z* in finestre larghe (per esempio 20–25 Da) e frammenta tutto ciò che entra in ogni finestra, a ogni ciclo.

```html
<ul>
<li><b>Vantaggio</b>: ogni ione è frammentato in ogni corsa, anche se debole. I risultati sono più riproducibili.</li>
<li><b>Svantaggio</b>: ogni spettro MS2 contiene frammenti di più precursori. Per assegnarli si usano il profilo cromatografico (frammenti e precursore sono nello stesso picco) e programmi di deconvoluzione.</li>
</ul>
```

I costruttori hanno nomi commerciali diversi per le varianti della DIA. Il principio è lo stesso.

## Spettri a risoluzione unitaria: che cosa si può dedurre

Qui un riassunto pratico per i vostri dati; la teoria completa (masse, isotopi, regola dell'azoto, RDB, regola del 13 e il confronto con l'alta risoluzione) è nel capitolo 11.

### Pattern isotopici

Anche senza massa accurata, il **cluster isotopico** porta informazione sulla composizione:

```html
<table>
<caption>Effetto degli isotopi pesanti sul cluster</caption>
<tr><th>Elemento</th><th>Isotopo pesante</th><th>Effetto sul cluster</th></tr>
<tr><td>C</td><td><sup>13</sup>C, 1,07%</td><td>M+1 ≈ 1,1% × numero di atomi di C (stima grossolana di n<sub>C</sub>)</td></tr>
<tr><td>Cl</td><td><sup>37</sup>Cl, 24,2%</td><td>M+2 ≈ 32% per ogni Cl (rapporto ~3:1); due Cl: 100:65:10</td></tr>
<tr><td>Br</td><td><sup>81</sup>Br, 49,3%</td><td>M+2 ≈ 97% per ogni Br (rapporto ~1:1)</td></tr>
<tr><td>S</td><td><sup>34</sup>S, 4,25%</td><td>M+2 ≈ 4,4% per ogni S</td></tr>
<tr><td>N, O</td><td>piccoli</td><td>Contributi minori a M+1 (N) e M+2 (O)</td></tr>
</table>
```

Per i TP è un controllo potentissimo: se il parent contiene un cloro e il candidato mostra ancora M+2 al ~32%, il cloro è rimasto; se il pattern scompare e la massa è calata di 18 (−Cl +OH), la declorurazione idrossilativa è un'ipotesi coerente. Approfondimento: <a href="26-gruppi.html">capitolo 26 (Isotopi, addotti, frammenti)</a>.

```html
<div class="sim" id="sim-iso"><h4>Cluster isotopico a risoluzione unitaria</h4>
<p class="note">Scrivete una formula bruta (elementi C, H, N, O, S, P, F, Cl, Br, I, Si, Na, K). Il calcolo convolve le distribuzioni isotopiche per massa nominale. L'esempio è l'atrazina, un erbicida usato come esempio svolto nel capitolo 16.</p></div>
```

### Regola dell'azoto e insaturazioni

```html
<ul>
<li><b>Regola dell'azoto</b>: una molecola neutra con massa nominale dispari contiene un numero dispari di atomi di N. Per lo ione [M+H]<sup>+</sup> vale il contrario: m/z pari ⇒ numero dispari di N. Utile per scartare formule incompatibili e per capire se una trasformazione ha tolto o aggiunto azoto.</li>
<li><b>RDBE</b> (anelli + doppi legami) = C − H/2 − X/2 + N/2 + 1 per la molecola neutra (X = alogeni). Deve essere intero e ≥ 0. Un'apertura d'anello o un'idratazione lo riducono; un'ossidazione a carbonile no.</li>
</ul>
```

## Dal dato alla quantità

### Correggere il fondo e integrare

L'area di un picco è la quantità che si porta in una retta di taratura. Prima di integrare si sceglie come trattare il fondo. Tre strade, da usare una alla volta:

```html
<ul>
<li><b>Sottrarre un bianco</b>: segue il tempo, quindi è utile quando il fondo cambia lungo la corsa.</li>
<li><b>Sottrarre il fondo di un tratto</b>: un solo numero, la media di un tratto senza picchi. Utile se il fondo è piatto.</li>
<li><b>Linea di base automatica</b> (per esempio SNIP): toglie la base che sale sotto i picchi.</li>
</ul>
```

Aiutano sui picchi piccoli. Vanno usate con lo stesso criterio su tutti i campioni e tutti i tempi, altrimenti l'andamento è un artefatto.

L'integrazione automatica segue quattro passi:

```html
<ol>
<li><b>Smoothing di Savitzky-Golay.</b> In ogni finestra scorrevole i punti vengono interpolati con un polinomio di secondo grado: il picco si ripulisce dal rumore senza abbassarsi e allargarsi come con una media mobile. La finestra è circa il 60% della larghezza del picco a metà altezza.</li>
<li><b>Apice dalla derivata.</b> La derivata prima passa da positiva a negativa nel massimo del picco.</li>
<li><b>Bordi.</b> Si cammina dall'apice verso i due lati e ci si ferma dove il segnale scende sotto la linea di base locale più il 3% dell'altezza del picco (e comunque sopra 3 volte il rumore), oppure dove la derivata cambia segno per un tratto continuo: è la valle che separa dal picco vicino.</li>
<li><b>Area.</b> Regola dei trapezi sui dati originali (non smussati), meno la linea di base retta tra i due bordi.</li>
</ol>
```

Limiti: due picchi sovrapposti vengono separati solo se tra i due c'è una valle. Una deriva forte della linea di base sposta i bordi. Si guardano sempre i bordi proposti prima di fidarsi dell'area.

### Figure del picco

```html
<ul>
<li><b>S/N</b>: altezza del picco sopra la linea di base, divisa per la deviazione standard del segnale in una zona senza picchi (tolta la deriva).</li>
<li><b>w<sub>½</sub></b>: larghezza a metà altezza.</li>
<li><b>N</b> = 5,54 (t<sub>R</sub> / w<sub>½</sub>)<sup>2</sup>: piatti teorici.</li>
<li><b>Coda USP</b> T = W<sub>0,05</sub> / 2f, con W<sub>0,05</sub> la larghezza e f la parte anteriore del picco al 5% dell'altezza (T = 1 per un picco simmetrico).</li>
</ul>
```

### La retta di taratura

Si iniettano standard a concentrazione nota (ad esempio, una serie scalare dal decimo di mg/L a decine di mg/L) e si costruisce area contro concentrazione. Per una retta affidabile:

- almeno 5–6 livelli che coprano l'intervallo dei campioni (non estrapolare);
- controllare i **residui** (area misurata − area dalla retta) in funzione della concentrazione: un andamento sistematico (a "U" o a gomito) indica non linearità, tipicamente saturazione dell'ESI o del rivelatore ai livelli alti; R^2^ = 0,99 non basta a escluderla;
- su intervalli ampi, la varianza cresce con la concentrazione: una regressione pesata (1/*x* o 1/*x*^2^) evita che i punti alti dominino e che quelli bassi siano sbagliati del 50%;
- il campione che cade sopra l'ultimo standard va diluito e reiniettato.

```html
<span class="eq">LOD ≈ <span class="frac"><span>3,3 <i>s</i></span><span><i>b</i></span></span>, &nbsp;&nbsp; LOQ ≈ <span class="frac"><span>10 <i>s</i></span><span><i>b</i></span></span><span class="no">(10.1)</span></span>
```

con *b* pendenza della retta e *s* deviazione standard della risposta (del bianco o dell'intercetta). In alternativa si usa il rapporto segnale/rumore (3 e 10) su standard di bassa concentrazione.

Come pianificare i livelli, i bianchi e la sequenza è nel capitolo 18.

### Conferma dell'identità

L'identità dell'analita è confermata se: RT coincide con quello dello standard (entro pochi secondi), entrambe le transizioni sono presenti, rapporto qual/quant entro la tolleranza (capitolo 8).

### Dalla quantificazione alla cinetica

Con le concentrazioni del parent si traccia *C*/*C*~0~ e ln(*C*~0~/*C*) in funzione del tempo. Per i TP, senza standard, si tracciano le aree degli XIC (dal full scan) o delle transizioni MRM, eventualmente normalizzate al loro massimo: si confronta la forma della curva, non l'altezza tra TP diversi.

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">formato</span>Martens L. et al. (2011) mzML—a community standard for mass spectrometry data. <i>Mol. Cell. Proteomics</i> 10, R110.000133. <a href="https://doi.org/10.1074/mcp.R110.000133" target="_blank" rel="noopener">doi:10.1074/mcp.R110.000133</a></li>
<li><span class="tag">terminologia</span>Murray K.K. et al. (2013) Definitions of terms relating to mass spectrometry (IUPAC Recommendations 2013). <i>Pure Appl. Chem.</i> 85, 1515–1609. <a href="https://doi.org/10.1351/PAC-REC-06-04-06" target="_blank" rel="noopener">doi:10.1351/PAC-REC-06-04-06</a></li>
<li><span class="tag">libro</span>McLafferty F.W., Tureček F. <i>Interpretation of Mass Spectra</i>, 4ª ed., University Science Books, 1993.</li>
<li><span class="tag">validazione</span>Eurachem, guida <i>The Fitness for Purpose of Analytical Methods</i> (validazione, LOD, LOQ, linearità): <a href="https://www.eurachem.org" target="_blank" rel="noopener">eurachem.org</a></li>
<li><span class="tag">banche dati</span><a href="https://massbank.eu/MassBank/" target="_blank" rel="noopener">MassBank Europe</a> (spettri MS/MS liberi, molti di contaminanti ambientali); <a href="https://pubchem.ncbi.nlm.nih.gov" target="_blank" rel="noopener">PubChem</a> (formule, masse, proprietà).</li>
</ul>
```
