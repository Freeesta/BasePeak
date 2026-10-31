<!-- script: storia.js -->
# Campi a radiofrequenza: quadrupolo e trappola ionica {kicker: Capitolo 38}

{.lead} Nel 1953 a Bonn si scopre che un campo elettrico che cambia segno circa un milione di volte al secondo può filtrare gli ioni per massa, senza magnete. Da quell'idea nascono il quadrupolo e la trappola ionica.

## Paul e Steinwedel (1953): il filtro di massa a quadrupolo

Nel 1953 Wolfgang Paul e H. Steinwedel pubblicano sulla *Zeitschrift für Naturforschung* una nota di tre pagine intitolata «Un nuovo spettrometro di massa senza campo magnetico». Il lavoro nasce nell'Istituto di Fisica dell'Università di Bonn, che Paul dirige dal 1952.

Nel suo racconto autobiografico per il Nobel, Paul scrive che lo spettrometro a quadrupolo e la trappola ionica furono concepiti e studiati a Bonn da giovani ricercatori del suo gruppo. Steinwedel vi faceva da teorico di casa.

L'idea fu protetta con un brevetto: priorità tedesca del 23 dicembre 1953, domanda americana del 21 dicembre 1954, concessione il 7 giugno 1960 con il numero US 2.939.952.

### Stabile o instabile: l'equazione di Mathieu

Il filtro ha quattro barre parallele collegate a coppie. Le due barre opposte portano il potenziale *U* − *V* cos Ω*t*, le altre due il potenziale di segno contrario.

Il campo risultante ha la forma di una sella. In ogni istante spinge lo ione verso l'asse in una direzione e lo allontana nell'altra, e a ogni mezzo periodo della radiofrequenza i due ruoli si scambiano.

Il moto di uno ione in ciascun piano segue l'equazione di Mathieu, scritta qui con τ = Ω*t*/2 e con la posizione *u* misurata in unità del raggio del campo:

```html
<span class="eq">d<sup>2</sup><i>u</i>/d&tau;<sup>2</sup> + (<i>a</i> &minus; 2<i>q</i> cos 2&tau;) <i>u</i> = 0<span class="no">(38.1)</span></span>
```

I parametri *a* e *q* crescono con *U* e con *V* e diminuiscono al crescere di *m*/*z*. Per certe coppie (*a*, *q*) lo ione oscilla restando vicino all'asse; per altre l'oscillazione cresce finché lo ione tocca una barra e si perde.

Con *U* e *V* in rapporto fisso, in un dato istante attraversa il filtro solo una stretta banda di masse. Variando *V* si fa scorrere la banda lungo lo spettro, senza parti in movimento. Il diagramma di stabilità completo è nel [capitolo 7](07-quadrupolo.html).

```html
<div class="sim storia-fig" id="sf-rf"><h4>Tre masse nel filtro e nella trappola</h4>
<p class="note">Scegli «Filtro di massa» o «Trappola 3D», poi avvia l'animazione o avanza un passo alla volta. Le traiettorie sono calcolate al momento con l'equazione (38.1). Prova a portare <i>V</i> da 100% a 95%: la massa intermedia, prima stabile, esce dal filtro.</p>
<figure>
<img src="../assets/img/storia/schemi/quadrupolo-sezione.svg" loading="lazy" decoding="async" width="720" height="380" alt="Sezione di un quadrupolo con quattro barre a coppie di segno opposto, una traiettoria stabile al centro e una instabile che cresce fino a toccare una barra">
<figcaption><b>Figura 38.1</b> Il filtro di massa a quadrupolo. Ogni linea è una massa: continua per la intermedia, tratteggiata per la leggera, a punti per la pesante. Nel filtro la traiettoria è calcolata con <i>a</i> = 0,32 <i>q</i>, nella trappola con <i>a</i> = 0. Senza JavaScript resta il disegno statico. Disegno originale, CC BY 4.0.</figcaption>
<details class="figdesc" id="fd-38-0"><summary>Descrizione della figura</summary><p>Tre masse attraversano un quadrupolo visto di lato, tra due barre. La massa intermedia oscilla vicino all'asse e passa. La leggera e la pesante oscillano con ampiezza crescente fino a toccare una barra, dove la linea finisce con una croce. Scegliendo la trappola, gli stessi ioni sono mostrati come puntini attorno al centro di un anello con due calotte.</p></details>
</figure></div>
```

## Dal laboratorio all'industria

### Piccolo, economico, veloce: il quadrupolo per la GC-MS

Il quadrupolo non ha magnete. Servono quattro barre, un generatore di radiofrequenza e tensioni continue ben controllate: poco peso, poca potenza, costi contenuti.

La scansione si fa cambiando tensioni, quindi in modo elettronico e rapido. Uno spettro completo si ottiene in tempi abbastanza brevi da seguire un picco gascromatografico, e la risoluzione unitaria basta per leggere spettri EI e confrontarli con le librerie.

Per questo il quadrupolo è diventato l'analizzatore degli spettrometri da banco accoppiati alla GC e poi alla LC. Tre quadrupoli in serie, con una cella di collisione al centro, formano il triplo quadrupolo ([capitolo 8](08-qqq.html)).

```html
<!-- to verify against source: year and manufacturer of the first commercial quadrupole GC-MS instrument -->
```

## La trappola di Paul

### Chiudere il campo in tre dimensioni

La trappola usa lo stesso principio con un'altra geometria: un elettrodo ad anello e due calotte, come nella Figura 38.2. Il campo a radiofrequenza ha ancora la forma di una sella, ma ora è chiuso in tre dimensioni.

```html
<figure>
<img src="../assets/img/storia/schemi/trappola-paul.svg" loading="lazy" decoding="async" width="720" height="380" alt="Sezione della trappola di Paul con un elettrodo ad anello, due calotte e una nuvola di ioni al centro">
<figcaption><b>Figura 38.2</b> La trappola di Paul in sezione: elettrodo ad anello, due calotte e la nuvola di ioni al centro. Disegno originale, CC BY 4.0.</figcaption>
</figure>
```

Gli ioni non attraversano più il dispositivo: restano in una nuvola vicino al centro. Il loro moto ha due parti, una oscillazione lenta attorno al centro e un tremolio rapido alla frequenza della radiofrequenza. Scegli «Trappola 3D» nella Figura 38.1 per vederle.

Anche qui conta la stabilità: se *q* supera circa 0,91, lo ione diventa instabile lungo l'asse e esce attraverso una calotta. Il valore dipende dalla massa, e questo sarà utile fra poco.

```html
<figure>
<img src="../assets/img/storia/foto/trappola-paul-demo.webp" loading="lazy" decoding="async" width="720" height="480" alt="Granelli di farina carichi sospesi al centro di una trappola quadrupolare in una dimostrazione">
<figcaption><b>Figura 38.3</b> Una trappola quadrupolare di dimostrazione, con granelli di farina carichi che restano sospesi al centro. Jan Pavelka, CC BY 4.0, via Wikimedia Commons.</figcaption>
</figure>
```

### Il premio Nobel 1989

Nel 1989 il premio Nobel per la fisica è diviso in due. Una metà va a Norman F. Ramsey per il metodo dei campi oscillanti separati, usato negli orologi atomici. L'altra metà va a Hans G. Dehmelt e a Wolfgang Paul «per lo sviluppo della tecnica della trappola ionica».

È un premio di fisica, non di chimica: la trappola serviva a isolare singoli atomi e ioni per periodi lunghi, per misurarne le proprietà con grande precisione. Paul ne ripercorre la storia nella conferenza Nobel dell'8 dicembre 1989.

## La trappola ionica come spettrometro (anni '80)

### Espulsione per instabilità di massa

Per molti anni la trappola resta uno strumento della fisica atomica. Nel 1984 G.C. Stafford e collaboratori pubblicano un articolo sui progressi della tecnologia della trappola ionica e sulle sue applicazioni analitiche.

Il metodo che ne nasce si chiama espulsione per instabilità di massa. Si accumulano gli ioni nella trappola e poi si alza la radiofrequenza: gli ioni diventano instabili uno dopo l'altro, quelli con *q* maggiore per primi, cioè i più leggeri. Escono dalle calotte verso un rivelatore, e l'ordine di uscita costruisce lo spettro.

Nella Figura 38.1 alza *V* in modalità trappola: la massa leggera, che era già instabile, esce per prima, poi tocca alle altre. Una trappola può inoltre isolare uno ione, frammentarlo e ripetere l'operazione sui frammenti. Si chiama MS^n^, e si fa in un solo dispositivo piccolo.

```html
<!-- to verify against source: first commercial ion trap detector (year, manufacturer) and the exact contribution of Stafford 1984 versus earlier mass-selective instability work -->
```

### Le trappole lineari

Nel 2002 J.C. Schwartz, M.W. Senko e J.E.P. Syka descrivono uno spettrometro con una trappola quadrupolare bidimensionale: una trappola lineare. È un quadrupolo allungato in cui gli ioni sono chiusi anche lungo l'asse, da elettrodi alle due estremità.

## Chi era

```html
<details class="storia-chi"><summary>Wolfgang Paul (1913-1993)</summary>
<p>Nato a Lorenzkirch, in Sassonia, il 10 agosto 1913, morto a Bonn il 7 dicembre 1993. Studiò a Monaco e a Berlino, lavorò con Hans Kopfermann a Kiel e a Gottinga e nel 1944 fu docente all'Università di Gottinga. Dal 1952 fu professore a Bonn e direttore dell'Istituto di Fisica, e fu a lungo attivo anche al CERN. Il suo contributo alla spettrometria di massa è il filtro a quadrupolo e la trappola ionica, che gli valsero il Nobel per la fisica 1989.</p></details>
```

```html
<details class="storia-chi"><summary>Hans G. Dehmelt (1922-2017)</summary>
<p>Nato a Görlitz il 9 settembre 1922, morto a Seattle il 7 marzo 2017. Studiò fisica a Gottinga, dove seguì un corso di laboratorio tenuto da Paul, e lavorò poi all'Università di Washington a Seattle. Studiò come intrappolare ioni ed elettroni isolati con campi elettrici e magnetici; già nel 1956 indicò l'utilità di intrappolare gli ioni per la spettroscopia ad alta risoluzione. Divise il Nobel per la fisica 1989 con Paul.</p></details>
```

## Perché contava

```html
<div class="box key"><b>Perché contava</b>
<ul>
<li>Il filtro a quadrupolo seleziona le masse con soli campi elettrici: niente magnete, costi bassi, scansione elettronica rapida.</li>
<li>Questo rese possibili gli spettrometri da banco per la GC-MS e poi per la LC-MS, e il triplo quadrupolo.</li>
<li>La trappola ionica porta in un dispositivo piccolo l'accumulo, la selezione e la frammentazione ripetuta (MS<sup>n</sup>).</li>
</ul></div>
```

## Per capire meglio

```html
<p class="storia-link">Per capire meglio: <a href="07-quadrupolo.html">Capitolo 7, Il quadrupolo: la teoria vera</a> (equazioni di Mathieu e diagramma di stabilità).</p>
```

```html
<p class="storia-link">Per capire meglio: <a href="08-qqq.html">Capitolo 8, Il triplo quadrupolo e la dissociazione per collisione</a> (due filtri e una cella di collisione).</p>
```

```html
<p class="storia-link">Per capire meglio: <a href="21-tempi.html">Capitolo 21, I tempi degli analizzatori: dwell time, sweep e duty cycle</a> (quanto dura una scansione).</p>
```

## Fonti

```html
<ul class="refs">
<li><span class="tag">articolo</span>Paul W., Steinwedel H. (1953) Ein neues Massenspektrometer ohne Magnetfeld. <i>Z. Naturforsch. A</i> 8, 448-450. <a href="https://doi.org/10.1515/zna-1953-0710" target="_blank" rel="noopener">doi:10.1515/zna-1953-0710</a></li>
<li><span class="tag">storico</span>Paul W., Steinwedel H. (1960) Apparatus for separating charged particles of different specific charges. Brevetto US 2.939.952. <a href="https://patents.google.com/patent/US2939952A/en" target="_blank" rel="noopener">patents.google.com/patent/US2939952A</a></li>
<li><span class="tag">storico</span>Nobel Prize in Physics 1989: Ramsey, Dehmelt, Paul. <a href="https://www.nobelprize.org/prizes/physics/1989/summary/" target="_blank" rel="noopener">nobelprize.org</a>; biografia di Paul: <a href="https://www.nobelprize.org/prizes/physics/1989/paul/biographical/" target="_blank" rel="noopener">nobelprize.org</a>; biografia di Dehmelt: <a href="https://www.nobelprize.org/prizes/physics/1989/dehmelt/biographical/" target="_blank" rel="noopener">nobelprize.org</a></li>
<li><span class="tag">articolo</span>Paul W. (1990) Electromagnetic traps for charged and neutral particles (conferenza Nobel). <i>Rev. Mod. Phys.</i> 62, 531-540. <a href="https://doi.org/10.1103/RevModPhys.62.531" target="_blank" rel="noopener">doi:10.1103/RevModPhys.62.531</a></li>
<li><span class="tag">articolo</span>Stafford G.C., Kelley P.E., Syka J.E.P., Reynolds W.E., Todd J.F.J. (1984) Recent improvements in and analytical applications of advanced ion trap technology. <i>Int. J. Mass Spectrom. Ion Processes</i> 60, 85-98. <a href="https://doi.org/10.1016/0168-1176(84)80077-4" target="_blank" rel="noopener">doi:10.1016/0168-1176(84)80077-4</a></li>
<li><span class="tag">articolo</span>March R.E. (1997) An introduction to quadrupole ion trap mass spectrometry. <i>J. Mass Spectrom.</i> 32, 351-369. <a href="https://doi.org/10.1002/(SICI)1096-9888(199704)32:4%3C351::AID-JMS512%3E3.0.CO;2-Y" target="_blank" rel="noopener">doi:10.1002/(SICI)1096-9888(199704)32:4&lt;351::AID-JMS512&gt;3.0.CO;2-Y</a></li>
<li><span class="tag">articolo</span>Schwartz J.C., Senko M.W., Syka J.E.P. (2002) A two-dimensional quadrupole ion trap mass spectrometer. <i>J. Am. Soc. Mass Spectrom.</i> 13, 659-669. <a href="https://doi.org/10.1016/S1044-0305(02)00384-7" target="_blank" rel="noopener">doi:10.1016/S1044-0305(02)00384-7</a></li>
</ul>
```

