<!-- script: chemi-common.js -->
<!-- title: La tabella delle feature -->
# Dalla serie di campioni alla tabella delle feature {kicker: Capitolo 27}

{.lead} Per confrontare molti campioni bisogna rendere uguali i tempi, trovare gli stessi composti in ogni corsa e riempire i vuoti. Qui si segue questo percorso fino alla tabella finale.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>L'allineamento dei tempi viene dal riconoscimento del parlato; il capitolo racconterà come è arrivato alla spettrometria di massa.</p></details>
```

## Perché il tempo di ritenzione si sposta

Da una corsa all'altra lo stesso composto esce a tempi leggermente diversi.

## Allineare i campioni

Si corregge l'asse dei tempi di ogni corsa rispetto a una di riferimento.

### Picchi di riferimento e curva LOWESS

Alcuni picchi sicuri guidano una curva di correzione.

### Deformare l'asse dei tempi (DTW, OBI-Warp)

Altri metodi stirano l'asse dei tempi confrontando interi profili.

### Come controllare l'allineamento

Lo scarto residuo dopo la correzione dice se l'allineamento è buono.

```html
<div class="sim" id="sim-chemi-allinea" data-sim="../assets/sim-chemi-tabella.js"><h4>Figura 27.1 Allineare due corse</h4>
<p class="note nota">Allinea due corse sintetiche con una curva LOWESS e mostra lo scarto residuo. Dati sintetici, a scopo didattico.</p></div>
```

## Corrispondenza fra campioni

Si decide quali picchi di corse diverse sono lo stesso composto.

## Riempire i buchi

Dove un picco manca si misura comunque il segnale presente.

```html
<div class="sim" id="sim-chemi-corrispondenza" data-sim="../assets/sim-chemi-tabella.js"><h3>Figura 27.2 Lo stesso composto in sei campioni</h3>
<p class="note nota">Raggruppa i picchi di sei campioni e mostra come i parametri dividono o fondono i composti. Dati sintetici, a scopo didattico.</p></div>
```

## Filtrare: bianchi, repliche, QC

I controlli permettono di scartare i segnali poco affidabili.

## Normalizzare

Si rendono confrontabili le intensità di campioni diversi.

## La tabella delle feature

Che cosa significa ogni colonna della tabella finale.

```html
<div class="sim" id="sim-chemi-tabella" data-sim="../assets/sim-chemi-esplora.js"><h3>Figura 27.3 Esplora la tabella delle feature</h3>
<p class="note nota">Applica filtri e normalizzazioni a una tabella sintetica e mostra quali artefatti spariscono. Dati sintetici, a scopo didattico.</p></div>
```

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate su allineamento, corrispondenza e normalizzazione.
