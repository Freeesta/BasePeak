<!-- script: chemi-common.js -->
<!-- title: File e formati aperti -->
# I file dei dati: mzML e gli altri formati aperti {kicker: Capitolo 23}

{.lead} Aprire un file mzML con un editor di testo aiuta a capire che cosa contiene davvero. Qui si guarda dentro i formati aperti e si decide quali informazioni devono sopravvivere alla conversione.

```html
<div class="box key"><b>Capitolo in costruzione</b><p>Questo capitolo è ancora in scrittura: per ora trovi la scaletta, con una riga per ogni sezione, e il posto delle figure interattive.</p></div>
<details class="q storia"><summary>Un po' di storia</summary><p>I formati aperti sono nati per non dipendere dai file dei costruttori; il capitolo racconterà come si è arrivati a mzML.</p></details>
```

## Che cosa c'è in un file di dati

Spettri, cromatogrammi e informazioni sullo strumento stanno nello stesso file.

## mzML dall'interno

Come è fatto un file mzML, blocco per blocco.

### Il vocabolario controllato

Ogni informazione ha un nome e un codice fissati, uguali per tutti i programmi.

### Gli array binari: base64, precisione, compressione

I numeri sono scritti come byte, eventualmente compressi, e poi trasformati in testo.

### L'indice

Un elenco di posizioni permette di leggere uno spettro senza scorrere tutto il file.

```html
<div class="sim" id="sim-chemi-codifica" data-sim="../assets/sim-chemi-formati.js"><h4>Figura 23.1 Come si scrive uno spettro in un file</h4>
<p class="note nota">Mostra che cosa fanno precisione, compressione e base64 alla dimensione e ai numeri di un array. Dati sintetici, a scopo didattico.</p></div>
```

## Gli altri formati

Altri formati aperti servono ad altri scopi, dai dati grezzi ai risultati.

### mzXML

Il formato che ha preceduto mzML e che si trova ancora in molti archivi.

### MGF e MSP: elenchi di spettri

File di testo che raccolgono molti spettri MS2 uno dopo l'altro.

### JCAMP-DX e netCDF (ANDI)

Due formati storici, ancora usati soprattutto per la gascromatografia.

### mzTab-M: i risultati, non i dati

Una tabella di composti identificati, non di spettri.

```html
<div class="sim" id="sim-chemi-formati" data-sim="../assets/sim-chemi-formati.js"><h4>Figura 23.2 Lo stesso spettro in cinque formati</h4>
<p class="note nota">Mostra lo stesso spettro scritto in cinque formati e quali metadati ciascuno conserva. Spettro sintetico, a scopo didattico.</p></div>
```

## Dal formato del costruttore al formato aperto

Ogni costruttore ha un suo formato; per usarlo altrove si converte.

### Conversione

Quali programmi convertono e che cosa conviene controllare dopo.

### Centroidare durante la conversione?

Scegliere se ridurre il profilo a centroidi subito o più tardi.

## I metadati che contano

Le informazioni da non perdere: polarità, livello MS, tempi, energie e software.

## Verifica

Qualche domanda per controllare di avere capito i punti principali.

## Per approfondire

Le letture consigliate sui formati aperti e sulla loro storia.
