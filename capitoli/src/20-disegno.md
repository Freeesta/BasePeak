<!-- title: Disegno sperimentale e rappresentazione delle strutture -->
# Disegno sperimentale e rappresentazione delle strutture {kicker: Capitolo 20}

{.lead} Come pianificare una serie di analisi perché i risultati si possano interpretare: bianchi, controlli di qualità, repliche, taratura, ordine di iniezione. In fondo, come scrivere le strutture in un rapporto.

## Dalla domanda al disegno

Un buon disegno parte da una domanda. Esempio: "la concentrazione dell'analita cambia con il trattamento, e di quanto?". Ogni campione serve a rispondere, oppure a escludere una spiegazione alternativa.

Prima di iniettare, si scrive:

```html
<ul>
<li>che cosa si vuole misurare (un analita, più analiti, composti sconosciuti);</li>
<li>quali fattori cambiano (tempo, dose, trattamento, matrice);</li>
<li>quali controlli dicono che l'effetto è reale;</li>
<li>quanti campioni, in quale ordine, con quale metodo.</li>
</ul>
```

Il disegno non si cambia a metà corsa. Si cambia prima.

## Bianchi e controlli

Un bianco è un campione senza l'analita. Dice da dove viene il segnale che non è l'analita.

```html
<table>
<caption>Campioni di controllo e che cosa verificano</caption>
<tr><th>Campione</th><th>Che cosa contiene</th><th>Che cosa verifica</th></tr>
<tr><td><b>Bianco di solvente</b></td><td>Solo il solvente di iniezione</td><td>Fondo dello strumento, trasporto da una corsa all'altra (carry-over)</td></tr>
<tr><td><b>Bianco di processo</b></td><td>Tutti i reagenti, senza analita</td><td>Contaminazioni da vetreria, reagenti, filtri, plastiche</td></tr>
<tr><td><b>Bianco di matrice</b></td><td>La matrice reale, senza analita</td><td>Interferenze della matrice e soppressione ionica</td></tr>
<tr><td><b>Controllo a t0</b></td><td>Il campione prima del trattamento</td><td>Segnali già presenti: non sono effetto del trattamento</td></tr>
<tr><td><b>Controllo senza trattamento</b></td><td>Il campione trattato allo stesso modo, ma senza il fattore studiato (per esempio senza reagente o senza la fase di prova)</td><td>Perdite che non dipendono dal trattamento: adsorbimento, volatilità, idrolisi</td></tr>
</table>
```

L'ultima riga è la più importante quando si cerca un effetto. Senza questo controllo, una perdita per adsorbimento sulle pareti della vial si scambia per un effetto del trattamento.

```html
<div class="box warn"><b>Errore frequente</b><p>Un segnale presente nel bianco, o a t0 con la stessa intensità, non è un effetto del trattamento. Va tolto dalla lista dei candidati (capitolo 12).</p></div>
```

## Repliche

Le repliche misurano la variabilità. Non sono tutte uguali.

```html
<ul>
<li><b>Replica strumentale</b>: la stessa vial iniettata più volte. Misura la ripetibilità dello strumento.</li>
<li><b>Replica di preparazione</b>: lo stesso campione preparato più volte (diluizione, estrazione). Misura anche la preparazione.</li>
<li><b>Replica indipendente</b>: l'intero esperimento ripetuto da capo, anche in giorni diversi. Misura la variabilità vera dell'esperimento.</li>
</ul>
```

Tre repliche indipendenti sono un minimo ragionevole per dare una media e una deviazione standard. Iniettare tre volte la stessa vial non è una replica indipendente: dà una buona ripetibilità e nasconde la variabilità del resto.

## Controlli di qualità (QC)

I QC sono campioni uguali tra loro, iniettati a intervalli regolari. Se la risposta cambia nel tempo, i QC lo mostrano.

```html
<ul>
<li><b>QC di condizionamento</b>: alcune iniezioni all'inizio, scartate, per stabilizzare colonna e sorgente.</li>
<li><b>QC di controllo</b>: uno standard a concentrazione nota, iniettato ogni 5–10 campioni. Dice se la risposta è rimasta nel limite scelto (di solito ±15–20%).</li>
<li><b>QC combinato</b> (<i>pooled</i>): una miscela di piccole parti di tutti i campioni. Serve per vedere la deriva del tempo di ritenzione e della risposta di tutti i segnali.</li>
<li><b>Standard interno</b>: un composto aggiunto in quantità uguale a ogni campione. Corregge le variazioni di iniezione e di ionizzazione.</li>
</ul>
```

Il limite di accettazione si decide prima, nel metodo. Un QC fuori limite segnala che i campioni iniettati intorno a lui vanno guardati con sospetto.

## Taratura

La retta di taratura mette in relazione area e concentrazione (capitolo 12). Al disegno spetta decidere come prepararla.

```html
<ul>
<li><b>Livelli</b>: almeno 5–6, ben distribuiti, con il livello più basso vicino al limite di quantificazione.</li>
<li><b>Intervallo</b>: i campioni cadono dentro, mai fuori. Se superano l'ultimo livello si diluiscono e si iniettano di nuovo.</li>
<li><b>Solvente o matrice</b>: gli standard nella matrice reale (o simile) compensano la soppressione ionica. In solvente puro il segnale può risultare più alto.</li>
<li><b>Preparazione indipendente</b>: i livelli si preparano da diluizioni separate, non tutti dalla stessa soluzione di partenza a catena. Un errore sul primo si propagherebbe a tutti.</li>
<li><b>Posizione</b>: una taratura all'inizio e una alla fine della sequenza (<i>bracketing</i>) mostrano se la risposta è derivata.</li>
</ul>
```

## Randomizzazione e blocchi

Se i campioni sono iniettati nell'ordine del tempo di prelievo (t0, poi t1, poi t2...), la deriva dello strumento si confonde con l'effetto del tempo. Una sorgente che si sporca lentamente sembra una perdita di analita.

La soluzione è la randomizzazione.

```html
<ul>
<li><b>Ordine casuale</b>: i campioni di tempi e condizioni diverse sono mescolati con un generatore di numeri casuali, non a mano.</li>
<li><b>Blocchi</b>: se l'esperimento è lungo (più giorni, più lotti), ogni blocco contiene tutte le condizioni, in ordine casuale al suo interno. Le differenze tra giorni non si sommano a quelle tra condizioni.</li>
<li><b>Repliche vicine</b>: le repliche dello stesso campione non vanno iniettate una dopo l'altra.</li>
</ul>
```

Un'eccezione sensata: standard di taratura in ordine di concentrazione crescente, per ridurre il carry-over.

Un campione prelevato da un processo in corso va fermato (_quenched_) al momento del prelievo, se il processo continua nella vial. Altrimenti il tempo di attesa nell'autocampionatore diventa un fattore nascosto.

## La sequenza di iniezione

Un esempio di sequenza. È un modello da adattare, non una regola.

```html
<table>
<caption>Esempio di sequenza di iniezione</caption>
<tr><th>Passo</th><th>Campioni</th><th>Scopo</th></tr>
<tr><td>1</td><td>Condizionamento (2–3 QC)</td><td>Stabilizzare lo strumento; si scartano</td></tr>
<tr><td>2</td><td>Bianco di solvente</td><td>Fondo di partenza</td></tr>
<tr><td>3</td><td>Taratura, dal livello più basso al più alto</td><td>Retta; carry-over ridotto</td></tr>
<tr><td>4</td><td>Bianco di solvente</td><td>Carry-over dopo il livello più alto</td></tr>
<tr><td>5</td><td>QC</td><td>Prima verifica</td></tr>
<tr><td>6</td><td>5–10 campioni in ordine casuale, poi QC (si ripete)</td><td>Dati, con controllo della deriva</td></tr>
<tr><td>7</td><td>Bianco di solvente</td><td>Carry-over finale</td></tr>
<tr><td>8</td><td>Taratura finale (alcuni livelli) e QC</td><td>Deriva sull'intera sequenza</td></tr>
</table>
```

```html
<div class="box lab"><b>Registro</b><p>Per ogni corsa si annotano: nome del file, campione, replica, blocco, posizione in vial, ordine di iniezione, data, metodo e versione. Il nome del file deve permettere di ricostruire tutto questo senza aprire il file (capitolo 12).</p></div>
```

## Controllo prima di iniziare

```html
<ul>
<li>La domanda è scritta e ogni campione serve a rispondere.</li>
<li>Ci sono bianchi di solvente, di processo e, se serve, di matrice.</li>
<li>C'è un controllo senza trattamento.</li>
<li>Le repliche indipendenti sono almeno tre.</li>
<li>I QC e i limiti di accettazione sono decisi.</li>
<li>La taratura copre l'intervallo dei campioni.</li>
<li>L'ordine è casuale, con blocchi se l'esperimento è lungo.</li>
<li>Il registro è pronto.</li>
</ul>
```

## Rappresentare le strutture in un rapporto

Il rapporto deve dire in modo chiaro e verificabile quale struttura si propone. Qualunque programma di disegno va bene, purché si rispettino alcune regole.

### Molecola o ione?

Due schemi diversi hanno significati diversi.

```html
<div class="box"><b>Due schemi, due significati</b><p>Nello schema di <b>trasformazione</b> i prodotti sono <i>molecole</i> (neutre: quelle che si formano in soluzione) e la freccia è una reazione chimica. L'<i>m/z</i> scritto sopra un prodotto è quello dell'ione che si sceglie di osservare, di solito [M+H]<sup>+</sup>. Nello schema di <b>frammentazione</b> tutto avviene in fase gassosa dentro lo strumento: il precursore e ogni frammento sono <i>ioni</i> (a numero pari di elettroni), tutti con la carica, e la freccia è una dissociazione. Sopra la freccia va la <b>perdita neutra</b> (−NH<sub>3</sub>, −H<sub>2</sub>O, −CO ...), che nello spettro non si vede.</p></div>
```

La posizione dei gruppi nuovi (per esempio gli OH in un prodotto ossidato) è un'ipotesi plausibile, non l'unica possibile. A risoluzione unitaria l'*m/z* non la decide. Nel rapporto si scrive "ipotesi" e si dice su che cosa si basa.

### SMILES

Lo SMILES è una riga di testo che descrive una struttura. È facile da copiare nel rapporto e da leggere con qualunque programma di chimica.

```html
<table>
<caption>Esempi di SMILES</caption>
<tr><th>Composto</th><th>SMILES</th></tr>
<tr><td>Paracetamolo</td><td><code>CC(=O)Nc1ccc(O)cc1</code></td></tr>
<tr><td>Atrazina</td><td><code>CCNc1nc(Cl)nc(NC(C)C)n1</code></td></tr>
</table>
```

Alcune regole:

```html
<ul>
<li>Un atomo carico si scrive tra parentesi quadre con la carica: <code>[NH4+]</code>, <code>[O-]</code>.</li>
<li>Uno ione si scrive con la carica sull'atomo giusto. Il simbolo [M+H]<sup>+</sup> è una notazione di massa, non una struttura.</li>
<li>Lo stesso composto ha più SMILES validi. Per confrontare e cercare si usa lo SMILES canonico del programma, e si scrive quale.</li>
<li>Per gli isomeri si indicano stereochimica e doppi legami (<code>@</code>, <code>/</code>, <code>\</code>), se sono noti. Se non sono noti si lascia la struttura senza e si dice che non è nota.</li>
<li>Insieme allo SMILES si possono dare formula bruta, massa monoisotopica e un identificatore (InChIKey, numero CAS, CID di PubChem).</li>
</ul>
```

### Figure e tabelle di strutture

```html
<ul>
<li><b>Un solo stile</b>: stessa lunghezza dei legami, stesso carattere, stesso orientamento della parte comune a tutte le molecole.</li>
<li><b>Etichette</b>: nome o codice del composto (composto di partenza, prodotto 1, prodotto 2), formula, <i>m/z</i> osservato dell'ione e, se si vuole, errore in ppm.</li>
<li><b>Frammenti</b>: per ogni frammento, la carica e gli H spostati; la perdita neutra sopra la freccia.</li>
<li><b>Formato</b>: grafica vettoriale (SVG o PDF) quando possibile; altrimenti PNG ad almeno 300 dpi. Sfondo bianco, o trasparente se la figura va su un fondo colorato.</li>
<li><b>Accessibilità</b>: contrasto alto, testo non troppo piccolo, descrizione della figura nella didascalia.</li>
</ul>
```

### Quanto è sicura la struttura?

Una struttura proposta non è tutta uguale. Conviene scrivere il livello di confidenza dell'identificazione: confermata con standard, probabile da spettro, solo candidata per formula. Una scala condivisa (Schymanski e collaboratori) è indicata sotto.

## Verifica

??? Perché, in una serie nel tempo, i campioni non si iniettano nell'ordine dei tempi di prelievo?
Perché la deriva dello strumento (sorgente che si sporca, risposta che cala) si confonderebbe con l'effetto del tempo. Si randomizza l'ordine, con i QC a intervalli regolari per vedere la deriva.

??? Hai tre iniezioni dello stesso vial. Sono tre repliche?
Sono repliche strumentali, non indipendenti. Misurano la ripetibilità dello strumento, non la variabilità dell'esperimento. Servono repliche dell'esperimento intero.

??? Un segnale a m/z 168 compare a t0, nel controllo senza trattamento e nel bianco di processo. È un prodotto del trattamento?
No. È fondo, contaminazione o impurezza. Un prodotto del trattamento deve comparire con il trattamento e mancare, o essere molto più basso, nei controlli.

??? Che differenza c'è tra uno schema di trasformazione e uno di frammentazione?
Nel primo i prodotti sono molecole neutre che si formano in soluzione; nel secondo precursore e frammenti sono ioni in fase gassosa e le frecce portano le perdite neutre.

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">identificazione</span>Schymanski E.L. et al. (2014) Identifying small molecules via high resolution mass spectrometry: communicating confidence. <i>Environ. Sci. Technol.</i> 48, 2097–2098. <a href="https://doi.org/10.1021/es5002105" target="_blank" rel="noopener">doi:10.1021/es5002105</a></li>
<li><span class="tag">validazione</span>Eurachem, guida <i>The Fitness for Purpose of Analytical Methods</i> (bianchi, repliche, controlli di qualità): <a href="https://www.eurachem.org" target="_blank" rel="noopener">eurachem.org</a></li>
<li><span class="tag">banche dati</span><a href="https://pubchem.ncbi.nlm.nih.gov" target="_blank" rel="noopener">PubChem</a> (strutture, SMILES, InChIKey, masse).</li>
</ul>
```
