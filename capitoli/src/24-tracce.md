<!-- script: chemi-common.js -->
<!-- title: Tracce di massa e ROI -->
# Tracce di massa: XIC e regioni d'interesse {kicker: Capitolo 24}

{.lead} Un'analisi LC-HRMS è una nuvola di punti con tempo, m/z e intensità. Qui si impara a scegliere la finestra di un XIC e a costruire le tracce di massa passo per passo.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>Leggere al calcolatore le scansioni continue è un'idea dei primi anni Settanta; il capitolo racconterà come si è passati dalle finestre fisse alle regioni d'interesse.</p></details>
```

## I dati come nuvola di punti

Ogni punto ha un tempo, un valore di m/z e un'intensità.

## La finestra di estrazione in ppm

Quanto larga va la finestra con cui si estrae una traccia.

### Quanto larga: errore di massa e risoluzione

La larghezza segue l'errore di massa reale dello strumento.

### Isobari vicini

Due ioni con massa quasi uguale possono finire nella stessa finestra.

```html
<div class="sim" id="sim-chemi-xic" data-sim="../assets/sim-chemi-tracce.js"><h4>Figura 24.1 La finestra in ppm</h4>
<p class="note nota">Mostra come una finestra troppo stretta perde segnale e una troppo larga include un isobaro. Dati sintetici, a scopo didattico.</p></div>
```

## Costruire le tracce di massa

Un algoritmo collega i centroidi di scansioni successive in tracce.

### L'algoritmo passo per passo

Ogni centroide si aggiunge a una traccia esistente o ne apre una nuova.

### I parametri

Tolleranza in ppm, lunghezza minima e intensità minima decidono il risultato.

### Quando sbaglia: tracce spezzate o fuse

Parametri poco adatti spezzano una traccia o ne uniscono due.

```html
<div class="sim" id="sim-chemi-roi" data-sim="../assets/sim-chemi-tracce.js"><h4>Figura 24.2 Costruire una traccia, scansione per scansione</h4>
<p class="note nota">Costruisce le tracce una scansione alla volta e spiega perché ognuna è tenuta o scartata. Dati sintetici, a scopo didattico.</p></div>
```

## L'alternativa a bin fissi

Dividere l'asse m/z in intervalli fissi è più semplice ma meno adatto all'alta risoluzione.

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate sulla costruzione delle tracce di massa.
