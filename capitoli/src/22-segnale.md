<!-- script: chemi-common.js -->
<!-- title: Segnale, profilo e centroide -->
# Dal rivelatore allo spettro: profilo, centroide e accuratezza {kicker: Capitolo 22}

{.lead} Prima di cercare un composto bisogna sapere che numero registra davvero lo strumento. Qui si vede come un picco in profilo diventa un centroide e che cosa separa l'accuratezza dalla precisione.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Il modo di registrare uno spettro è cambiato più volte. Wiley e McLaren (1955) descrissero un tempo di volo con risoluzione migliorata. Nel 1974 Comisarow e Marshall applicarono la trasformata di Fourier alla risonanza ciclotronica ionica: il segnale diventa un transiente digitale, da cui un calcolo ricava lo spettro. Makarov (2000) propose l'Orbitrap, la trappola orbitale elettrostatica. I termini sono stati fissati dalle raccomandazioni IUPAC del 2013 (Murray et al., 2013).</p></details>
```

## Dal rivelatore al numero

Lo strumento non scrive subito masse e intensità. Un rivelatore ([capitolo 9, «Il rivelatore»](09-risoluzione.html)) trasforma gli ioni in un segnale elettrico e un'elettronica lo trasforma in numeri. Il percorso dipende dall'analizzatore; Gross (2017) lo descrive nei testi di base.

### Contare gli ioni: il TDC

Nel tempo di volo ([capitolo 9, «Tempo di volo (TOF)»](09-risoluzione.html); Wiley e McLaren, 1955, ne migliorarono la risoluzione) il convertitore tempo-digitale, o TDC, segna l'istante in cui un impulso supera una soglia. A ogni spinta il TDC registra al più un arrivo per intervallo di tempo (*bin*). Migliaia di spinte si sommano in un istogramma dei tempi, che la taratura converte in m/z.

### Misurare una corrente: l'ADC

Il convertitore analogico-digitale, o ADC, campiona la corrente del rivelatore a intervalli regolari e la scrive come numero intero. Il valore è proporzionale alla corrente, ma porta con sé il rumore elettronico anche quando non arriva nessuno ione. Il TDC conta gli ioni, l'ADC misura una carica: sono due strade diverse verso l'intensità.

### Orbitrap: dalla corrente immagine allo spettro (FFT)

Nell'Orbitrap gli ioni oscillano lungo l'elettrodo centrale con una frequenza che dipende da m/z (Makarov, 2000). La corrente indotta sugli elettrodi esterni, registrata nel tempo, è un **transiente**. La trasformata di Fourier lo scompone in frequenze, come già nella risonanza ciclotronica ionica (Comisarow e Marshall, 1974). Per l'Orbitrap vale:

```html
<span class="eq">ω = √(k · z / m)<span class="no">(22.1)</span></span>
```

con *k* costante dello strumento: la frequenza cresce al diminuire di m/z. Un transiente più lungo dà picchi di frequenza più stretti, cioè più risoluzione ([capitolo 9, «Orbitrap»](09-risoluzione.html)).

## Profilo e centroide: quanti punti servono

Un picco in **profilo** è una curva campionata; il **centroide** la riduce a una coppia (m/z, intensità), come spiega il [capitolo 10, «Profilo e centroide»](10-dati.html). La larghezza a metà altezza dipende dal potere risolutivo *R* ([capitolo 9, «Potere risolutivo e risoluzione»](09-risoluzione.html)):

```html
<span class="eq">FWHM = (m/z) / <i>R</i><span class="no">(22.2)</span></span>
```

A m/z 300 con *R* = 50 000 la FWHM è 6 mDa; con *R* = 240 000 scende a 1,25 mDa. I punti che cadono nel picco dipendono dal passo di campionamento *d*:

```html
<span class="eq">punti per FWHM = FWHM / <i>d</i><span class="no">(22.3)</span></span>
```

Con pochi punti il più alto può cadere lontano dal centro vero: l'errore arriva a mezzo passo. Nel modello della Figura 22.1, a *R* = 50 000 e con il picco a metà tra due punti, il massimo locale sbaglia fino a 5,0 ppm con 2 punti per FWHM, 2,0 con 5 e 1,0 con 10. Come intensità un file può salvare l'altezza del vertice o la somma dei punti (simile all'area): controlla quale.

```html
<div class="box warn"><b>Errori frequenti</b>
<ul>
<li>Centroidare dati già centroidati: il secondo passaggio lavora su pochi punti isolati.</li>
<li>Dare profili a un programma che aspetta centroidi, o il contrario.</li>
<li>Pochi punti per FWHM: la parabola perde accuratezza.</li>
</ul></div>
```

## Tre modi di calcolare un centroide

Dal profilo di un picco isolato il centro si ricava in tre modi, ciascuno con un errore sistematico (*bias*) e una dispersione propri.

### Il massimo locale

Il punto *i* è un picco se supera il precedente, non è sotto il successivo e supera la soglia. Il centro è il suo m/z: errore fino a mezzo passo.

### L'interpolazione su tre punti

Si prendono il massimo e i due vicini, con intensità *a*, *b*, *c* e passo uniforme *d*. Il vertice della parabola per i tre punti dista dal massimo di

```html
<span class="eq">δ = <span class="frac"><span><i>a</i> − <i>c</i></span><span>2 (<i>a</i> − 2<i>b</i> + <i>c</i>)</span></span>, &nbsp; m/z* = m/z<sub><i>i</i></sub> + δ · <i>d</i><span class="no">(22.4)</span></span>
```

Con m/z 200,11; 200,12; 200,13 e intensità 4; 8; 6: δ = (4 − 6) / (2 · (4 − 16 + 6)) = 0,167 e il centro è 200,1217. La variante «gaussiana» usa i logaritmi di *a*, *b*, *c*: è esatta per una gaussiana senza rumore, perché il suo logaritmo è una parabola.

### Il baricentro dell'area

Si prendono i punti contigui attorno al vertice con intensità almeno *f* volte quella del vertice (di solito 0,5) e si pesano gli m/z con le intensità:

```html
<span class="eq">m/z* = <span class="frac"><span>Σ m/z<sub><i>j</i></sub> · <i>y</i><sub><i>j</i></sub></span><span>Σ <i>y</i><sub><i>j</i></sub></span></span><span class="no">(22.5)</span></span>
```

Nello stesso esempio il risultato è 200,1211.

### Che cosa fa il software dello strumento

Ogni costruttore applica un suo algoritmo, descritto solo in parte. Il file dice se i dati sono in profilo o in centroidi, non come sono stati calcolati ([capitolo 23, «I metadati che contano»](23-formati.html)).

```html
<details class="poe"><summary>Prima di provare: con 5 punti per FWHM e il picco a 0,3 passi dal punto più vicino, quale algoritmo sbaglia meno in media?</summary>
<p>Parabola e gaussiana (+0,01 e −0,03 ppm, dispersione 0,2 ppm a S/N 100). Il massimo dà +1,2 ppm, il baricentro +0,75 ppm. Verifica con «Ripeti 200 volte».</p></details>
```

```html
<div class="sim" id="sim-chemi-centroide" data-sim="../assets/sim-chemi-segnale.js"><h4>Figura 22.1 Dal profilo al centroide</h4>
<p class="note nota">Confronta i quattro algoritmi al variare di risoluzione, punti per picco e rumore. Dati sintetici, a scopo didattico.</p></div>
```

## Rumore e soglie

Il rumore decide quali picchi entrano nella lista e con quale precisione.

### La statistica degli ioni

Il numero di ioni contati *N* fluttua come una variabile di Poisson:

```html
<span class="eq">σ<sub><i>N</i></sub> = √(N)<span class="no">(22.6)</span></span>
```

Con 100 ioni l'incertezza relativa è 10%, con 10 000 è 1%. Anche il centro ne risente: per *N* ioni in un picco gaussiano la dispersione del centroide non scende sotto circa

```html
<span class="eq">σ<sub>c</sub> ≈ <span class="frac"><span>FWHM</span><span>2,355 √(N)</span></span><span class="no">(22.7)</span></span>
```

È una stima statistica approssimata. A m/z 300 con *R* = 50 000 e 10 000 ioni vale 0,085 ppm. Solo chi usa tutti gli ioni la raggiunge: nella Figura 22.1, con 2000 ioni, il limite è 0,19 ppm ma la parabola su tre punti dà circa 1 ppm.

### Rumore elettronico e linea di base

Anche senza ioni il segnale non è zero. Una soglia decide che cosa è picco: troppo bassa lascia passare il rumore, troppo alta cancella segnali veri. Nel modello, con 5 punti per FWHM, la dispersione della parabola è 1,8 ppm a S/N 10, 0,20 ppm a S/N 100 e 0,02 ppm a S/N 1000. Una soglia che elimina M+1 e M+2 rende impossibile giudicare il profilo isotopico (capitolo 30).

### Saturazione e tempo morto

Nel TDC un bin non registra due ioni della stessa spinta. Nel modello didattico, semplificato, con *k* ioni in media per bin e per spinta (Poisson) se ne vedono

```html
<span class="eq"><i>k</i><sub>oss</sub> = 1 − e<sup>−<i>k</i></sup><span class="no">(22.8)</span></span>
```

Con *k* = 0,1 se ne vedono 0,095 (perso il 4,8%); con *k* = 1, 0,632 (perso il 37%). I bin più alti si saturano per primi: l'intensità è sottostimata e il centroide si sposta verso il lato che arriva prima. Un ADC invece si ferma al valore massimo del convertitore.

## Accuratezza, precisione e taratura

### Errore in ppm e in mDa

```html
<span class="eq">ppm = <span class="frac"><span>m<sub>mis</sub> − m<sub>teo</sub></span><span>m<sub>teo</sub></span></span> × 10<sup>6</sup><span class="no">(22.9)</span></span>
```

Lo stesso scarto in mDa vale ppm diversi: 1 mDa sono 10 ppm a m/z 100 e 1 ppm a m/z 1000 (Brenton e Godfrey, 2010, trattano convenzioni ed errori). L'**accuratezza** è la vicinanza al valore vero, la **precisione** la dispersione di misure ripetute; i termini sono fissati da Murray et al. (2013) e usati nel [capitolo 9, «Accuratezza di massa»](09-risoluzione.html). Kind et al. (2018) mostrano come l'accuratezza di massa entri nella ricerca di spettri MS/MS di piccole molecole (capitolo 29).

### Taratura esterna, lock mass e ricalibrazione

Un TOF converte il tempo in massa con una legge quadratica, i cui parametri *A* e *t*~0~ si stimano su calibranti noti prima della corsa:

```html
<span class="eq">m/z = <i>A</i> (<i>t</i> − <i>t</i><sub>0</sub>)<sup>2</sup><span class="no">(22.10)</span></span>
```

Poi la scala deriva. La **massa di riferimento** (*lock mass*) è un composto noto presente in ogni scansione. Lo schema più semplice moltiplica tutti gli m/z per

```html
<span class="eq"><span class="frac"><span>m<sub>teo,rif</sub></span><span>m<sub>mis,rif</sub></span></span><span class="no">(22.11)</span></span>
```

Corregge bene un errore uguale in ppm per tutte le masse, meno bene se cambia con m/z. Toglie la deriva, non la dispersione casuale.

```html
<details class="poe"><summary>Prima di provare: con una deriva di 4 ppm/ora e senza errore casuale, quanto vale l'errore assoluto medio in un'ora? E con la massa di riferimento?</summary>
<p>L'errore cresce da 0 a 4 ppm: la media è 2,0 ppm. Con la massa di riferimento torna a 0. Nella figura l'errore casuale resta, quindi i valori dopo la correzione non sono zero.</p></details>
```

```html
<div class="sim" id="sim-chemi-taratura" data-sim="../assets/sim-chemi-segnale.js"><h4>Figura 22.2 Taratura e lock mass</h4>
<p class="note nota">Mostra l'errore di massa in 60 minuti, prima e dopo la correzione con una massa di riferimento. Dati sintetici, a scopo didattico.</p></div>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">libro</span>Gross J.H. (2017) <i>Mass Spectrometry: A Textbook</i>, 3ª ed., Springer. <a href="https://doi.org/10.1007/978-3-319-54398-7" target="_blank" rel="noopener">doi:10.1007/978-3-319-54398-7</a></li>
<li><span class="tag">articolo</span>Murray K.K. et al. (2013) Definitions of terms relating to mass spectrometry (IUPAC Recommendations 2013). <i>Pure Appl. Chem.</i> 85, 1515-1609. <a href="https://doi.org/10.1351/PAC-REC-06-04-06" target="_blank" rel="noopener">doi:10.1351/PAC-REC-06-04-06</a></li>
<li><span class="tag">articolo</span>Brenton A.G., Godfrey A.R. (2010) Accurate mass measurement: terminology and treatment of data. <i>J. Am. Soc. Mass Spectrom.</i> 21, 1821-1835. <a href="https://doi.org/10.1016/j.jasms.2010.06.006" target="_blank" rel="noopener">doi:10.1016/j.jasms.2010.06.006</a></li>
<li><span class="tag">articolo</span>Wiley W.C., McLaren I.H. (1955) Time-of-flight mass spectrometer with improved resolution. <i>Rev. Sci. Instrum.</i> 26, 1150-1157. <a href="https://doi.org/10.1063/1.1715212" target="_blank" rel="noopener">doi:10.1063/1.1715212</a></li>
<li><span class="tag">articolo</span>Comisarow M.B., Marshall A.G. (1974) Fourier transform ion cyclotron resonance spectroscopy. <i>Chem. Phys. Lett.</i> 25, 282-283. <a href="https://doi.org/10.1016/0009-2614(74)89137-2" target="_blank" rel="noopener">doi:10.1016/0009-2614(74)89137-2</a></li>
<li><span class="tag">articolo</span>Makarov A. (2000) Electrostatic axially harmonic orbital trapping: a high-performance technique of mass analysis. <i>Anal. Chem.</i> 72, 1156-1162. <a href="https://doi.org/10.1021/ac991131p" target="_blank" rel="noopener">doi:10.1021/ac991131p</a></li>
<li><span class="tag">articolo</span>Kind T. et al. (2018) Identification of small molecules using accurate mass MS/MS search. <i>Mass Spectrom. Rev.</i> 37, 513-532. <a href="https://doi.org/10.1002/mas.21535" target="_blank" rel="noopener">doi:10.1002/mas.21535</a></li>
</ul>
```
