<!-- script: chemi-common.js -->
<!-- title: Somiglianza spettrale -->
# Spettri MS2 e somiglianza spettrale {kicker: Capitolo 28}

{.lead} Per dire che due spettri MS2 si somigliano serve un numero. Qui si calcolano a mano il coseno, il coseno pesato, quello modificato e l'entropia spettrale.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>Confrontare uno spettro con un archivio di spettri noti è un'idea degli anni Settanta; il capitolo racconterà come sono cambiati i punteggi.</p></details>
```

## Da dove vengono gli spettri MS2

Come lo strumento sceglie gli ioni da frammentare.

### DDA e DIA

Nella DDA si sceglie lo ione, nella DIA si frammenta tutto un intervallo.

### Purezza del precursore e spettri chimerici

Se la finestra contiene due ioni, lo spettro è una miscela.

```html
<div class="sim" id="sim-chemi-purezza" data-sim="../assets/sim-chemi-somiglianza.js"><h4>Figura 28.1 Quando la finestra di isolamento prende due ioni</h4>
<p class="note nota">Mostra come la larghezza di isolamento e uno ione vicino rendono lo spettro una miscela. Dati sintetici, a scopo didattico.</p></div>
```

## Preparare uno spettro

Prima del confronto si tolgono il precursore e i picchi più piccoli.

## Accoppiare i picchi

Ogni picco di uno spettro è abbinato a quello dell'altro entro una tolleranza.

## I punteggi di somiglianza

Quattro modi di trasformare l'accoppiamento in un numero.

### Prodotto scalare e coseno

Il punteggio base: un coseno tra due vettori di intensità.

### Coseno pesato

Le masse alte e le intensità contano in modo diverso.

### Coseno modificato

Permette di accoppiare anche picchi spostati da una modifica nota.

### Entropia spettrale

Un punteggio che si basa sulla quantità di informazione degli spettri.

```html
<div class="sim" id="sim-chemi-specchio" data-sim="../assets/sim-chemi-somiglianza.js"><h4>Figura 28.2 Specchio: due spettri, quattro punteggi</h4>
<p class="note nota">Confronta due spettri sintetici in uno specchio e calcola quattro punteggi di somiglianza. Spettri sintetici, a scopo didattico.</p></div>
```

## Ricerca diretta e inversa

La ricerca inversa ignora i picchi dello spettro cercato assenti in libreria.

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate sulla somiglianza fra spettri.
