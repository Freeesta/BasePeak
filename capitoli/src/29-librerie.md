<!-- script: chemi-common.js -->
<!-- title: Librerie e falsi positivi -->
# Ricerca in libreria e falsi positivi {kicker: Capitolo 29}

{.lead} Il miglior risultato di una ricerca in libreria non è ancora un'identificazione. Qui si vede come stimare i falsi positivi e come i punteggi costruiscono una rete molecolare.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>Le librerie di spettri sono cresciute dalle raccolte EI a quelle MS/MS aperte; il capitolo racconterà le tappe principali.</p></details>
```

## Le librerie spettrali

Quali raccolte di spettri esistono, che cosa contengono e a quali condizioni si usano.

## Ricerca EI: match factor e indice di ritenzione

In EI si combinano il punteggio dello spettro e l'indice di ritenzione.

## Ricerca MS/MS: precursore, energia, punteggio

In MS/MS contano anche il precursore, la polarità e l'energia di collisione.

## Quanti risultati sono falsi?

Un punteggio alto non basta: bisogna stimare la quota di errori.

### L'approccio target-decoy

Si cerca anche in una libreria di spettri falsi per contare gli errori.

### FDR e q-value

La quota di falsi nella lista e il valore associato a ogni soglia.

```html
<div class="sim" id="sim-chemi-libreria" data-sim="../assets/sim-chemi-librerie.js"><h4>Figura 29.1 Classifica dei risultati e falsi positivi</h4>
<p class="note nota">Stima la quota di falsi con una libreria di spettri falsi e la confronta con quella vera. Dati sintetici, a scopo didattico.</p></div>
```

## Le reti molecolari

Gli spettri simili si collegano in famiglie di molecole imparentate.

```html
<div class="sim" id="sim-chemi-rete" data-sim="../assets/sim-chemi-librerie.js"><h3>Figura 29.2 Una rete molecolare</h3>
<p class="note nota">Collega quattordici spettri sintetici in famiglie secondo soglia di coseno e picchi in comune. Spettri sintetici, a scopo didattico.</p></div>
```

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate su librerie, falsi positivi e reti molecolari.
