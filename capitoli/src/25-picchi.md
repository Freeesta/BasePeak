<!-- script: chemi-common.js -->
<!-- title: Trovare i picchi -->
# Trovare i picchi cromatografici {kicker: Capitolo 25}

{.lead} Un cromatogramma rumoroso va trasformato in una lista di picchi con tempo, altezza e area. Qui si confrontano le famiglie di algoritmi e si vede che cosa succede con picchi sovrapposti.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>La levigatura per minimi quadrati e i filtri adattati hanno una storia lunga; il capitolo racconterà come sono arrivati ai programmi attuali.</p></details>
```

## Che cosa cerca un algoritmo di picchi

Che cosa deve riconoscere un programma per dire che qui c'è un picco.

## Lisciare il segnale

Una media sui punti vicini riduce il rumore ma allarga il picco.

## Tre famiglie di algoritmi

Tre modi diversi di decidere dove sta un picco.

### Massimi e minimi locali

Il picco è un massimo sopra una soglia, delimitato dai minimi vicini.

### Il filtro adattato

Il segnale è confrontato con la forma attesa di un picco.

### La trasformata wavelet continua (centWave)

Il segnale è esaminato a più larghezze insieme.

```html
<div class="sim" id="sim-chemi-picchi" data-sim="../assets/sim-chemi-picchi.js"><h4>Figura 25.1 Cercare i picchi in un cromatogramma rumoroso</h4>
<p class="note nota">Applica tre algoritmi a un cromatogramma con picchi noti e conta quelli trovati, mancati e falsi. Dati sintetici, a scopo didattico.</p></div>
```

## Segnale, rumore e linea di base

Il rapporto segnale/rumore ha più definizioni, e non sono confrontabili.

## La qualità di un picco

Larghezza, simmetria e numero di punti dicono se il picco è affidabile.

```html
<div class="sim" id="sim-chemi-qualita" data-sim="../assets/sim-chemi-picchi.js"><h3>Figura 25.2 Quanto è buono questo picco?</h3>
<p class="note nota">Mostra come i punti per picco e la coda cambiano larghezza, asimmetria e area. Dati sintetici, a scopo didattico.</p></div>
```

## Picchi sovrapposti

Quando due picchi si toccano, l'area di ognuno è incerta.

### Valle e minimo locale

Si divide il segnale nel punto più basso fra i due massimi.

### Somma di curve

Si adattano due curve insieme per separare le aree.

### Deconvoluzione degli spettri in GC-EI

In GC-EI i frammenti con lo stesso andamento sono attribuiti allo stesso composto.

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate su levigatura, rilevamento dei picchi e software aperti.
