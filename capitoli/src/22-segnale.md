<!-- script: chemi-common.js -->
<!-- title: Segnale, profilo e centroide -->
# Dal rivelatore allo spettro: profilo, centroide e accuratezza {kicker: Capitolo 22}

{.lead} Prima di cercare un composto bisogna sapere che numero registra davvero lo strumento. Qui si vede come un picco in profilo diventa un centroide e che cosa separa l'accuratezza dalla precisione.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>Il modo di registrare uno spettro è cambiato dagli strumenti a scansione ai transienti digitali; il capitolo racconterà le tappe principali.</p></details>
```

## Dal rivelatore al numero

Che cosa esce dal rivelatore e come diventa un valore di intensità nel file.

### Contare gli ioni: il TDC

Il convertitore tempo-digitale conta gli arrivi degli ioni uno per uno.

### Misurare una corrente: l'ADC

Il convertitore analogico-digitale campiona una corrente e ne fa un numero.

### Orbitrap: dalla corrente immagine allo spettro (FFT)

Nell'Orbitrap lo spettro nasce dalla trasformata di Fourier di un segnale nel tempo.

## Profilo e centroide: quanti punti servono

Quanti punti per picco bastano a descrivere bene la forma e a trovarne il centro.

## Tre modi di calcolare un centroide

Tre algoritmi danno centri leggermente diversi dallo stesso profilo.

### Il massimo locale

Il centro è il punto più alto: semplice, ma legato al passo di campionamento.

### L'interpolazione su tre punti

Una curva passa per il massimo e i due vicini e ne indica il vertice.

### Il baricentro dell'area

Il centro è la media delle masse pesata per le intensità dei punti del picco.

### Che cosa fa il software dello strumento

Ogni costruttore applica una sua regola e non sempre la dichiara.

```html
<div class="sim" id="sim-chemi-centroide" data-sim="../assets/sim-chemi-segnale.js"><h4>Figura 22.1 Dal profilo al centroide</h4>
<p class="note nota">Confronta tre modi di trovare il centro di un picco al variare della risoluzione, dei punti per picco e del rumore. Dati sintetici, a scopo didattico.</p></div>
```

## Rumore e soglie

Il rumore decide quali picchi entrano nella lista e quali no.

### La statistica degli ioni

Con pochi ioni l'intensità fluttua per semplice statistica di conteggio.

### Rumore elettronico e linea di base

Anche senza ioni il rivelatore dà un segnale di fondo.

### Saturazione e tempo morto

Quando gli ioni sono troppi, l'intensità si comprime e il centro si sposta.

## Accuratezza, precisione e taratura

L'errore sistematico e quello casuale si distinguono e si correggono in modo diverso.

### Errore in ppm e in mDa

Lo stesso scarto si esprime in milionesimi o in millesimi di dalton.

### Taratura esterna, lock mass e ricalibrazione

Una massa nota permette di correggere la scala delle masse durante l'analisi.

```html
<div class="sim" id="sim-chemi-taratura" data-sim="../assets/sim-chemi-segnale.js"><h4>Figura 22.2 Taratura e lock mass</h4>
<p class="note nota">Mostra l'errore di massa in 60 minuti, prima e dopo la correzione con una massa di riferimento. Dati sintetici, a scopo didattico.</p></div>
```

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate su rivelatori, centroidi e accuratezza di massa.
