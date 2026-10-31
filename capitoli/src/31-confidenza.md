<!-- script: chemi-common.js -->
<!-- title: Livelli di confidenza -->
# Livelli di confidenza dell'identificazione {kicker: Capitolo 31}

{.lead} Dire che un composto è identificato richiede di dire con quale prova. Qui si impara a assegnare un livello di confidenza e a non confonderlo con un punteggio.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Nel 2007 la Metabolomics Standards Initiative propose livelli minimi per riportare l'identificazione di un composto (Sumner et al., 2007). Nel 2014 Creek e colleghi chiesero come i laboratori misurino la propria sicurezza, e Sumner e colleghi proposero misure quantitative e alfanumeriche (Creek et al., 2014; Sumner et al., 2014).</p><p>Nello stesso anno Schymanski e colleghi pubblicarono la scala a cinque livelli, messa alla prova nel 2015 con una prova collaborativa sull'analisi dell'acqua (Schymanski et al., 2014; 2015). Seguirono estensioni per i PFAS (Charbonnet et al., 2022) e guide alla comunicazione dei risultati (Alseekh et al., 2021; Hollender et al., 2023).</p></details>
```

## Perché serve un livello

«Identificato» può voler dire cose molto diverse: un nome preso dal primo risultato di una ricerca in libreria, oppure un composto confermato con lo standard puro. Un livello di confidenza dice con quali prove si sostiene il nome.

Le scale in uso sono due. Sumner et al. (2007) hanno definito livelli minimi per la metabolomica. Schymanski et al. (2014) hanno proposto una scala a cinque livelli per la spettrometria di massa ad alta risoluzione; Schymanski et al. (2015) l'hanno poi messa alla prova in una prova collaborativa. Creek et al. (2014) e Sumner et al. (2014) hanno discusso come esprimere la sicurezza in modo più quantitativo.

Il livello non dipende da quanto un programma si dichiara sicuro, ma da quali dati esistono. Il collegamento con la ricerca in libreria è nel capitolo [29](29-librerie.html); la sintesi di base è già nel capitolo [18](18-disegno.html).

## La scala di Schymanski (2014)

```html
<!-- to verify against source: Schymanski 2014 level names, translation and minimum data per level (abstract has no level text; full text not reachable) -->
```

I nomi sono tradotti dall'inglese; l'originale è tra parentesi. La traduzione è nostra.

```html
<table>
<caption>Livelli di Schymanski et al. (2014) e prove minime</caption>
<tr><th scope="col">Livello</th><th scope="col">Nome</th><th scope="col">Prove minime</th></tr>
<tr><td>1</td><td>Struttura confermata da standard di riferimento (<i>Confirmed structure by reference standard</i>)</td><td>MS, MS2 e tempo di ritenzione coincidono con lo standard</td></tr>
<tr><td>2a</td><td>Struttura probabile per corrispondenza con lo spettro di libreria (<i>Probable structure by library spectrum match</i>)</td><td>MS e MS2 confrontati con lo spettro di libreria</td></tr>
<tr><td>2b</td><td>Struttura probabile per evidenza diagnostica (<i>Probable structure by diagnostic evidence</i>)</td><td>MS, MS2 ed evidenza diagnostica (frammenti, contesto)</td></tr>
<tr><td>3</td><td>Candidato o candidati provvisori (<i>Tentative candidate(s)</i>)</td><td>MS, MS2 o altri dati compatibili con uno o più candidati</td></tr>
<tr><td>4</td><td>Formula molecolare univoca (<i>Unequivocal molecular formula</i>)</td><td>MS con isotopi o addotti che fissano la formula</td></tr>
<tr><td>5</td><td>Massa esatta di interesse (<i>Exact mass of interest</i>)</td><td>MS: il solo valore di massa</td></tr>
</table>
```

Dal livello 2 in giù non basta un nome: il livello 2 ha due sottolivelli, uno per ciascun tipo di prova. Solo il livello 1 richiede uno standard di riferimento.

## La scala MSI (2007)

```html
<!-- to verify against source: Sumner 2007 MSI level names and level-1 wording (abstract has no level text; full text not reachable) -->
```

Sumner et al. (2007) distinguono quattro livelli. Il livello 1 richiede che almeno due proprietà ortogonali, per esempio tempo di ritenzione e spettro, coincidano con quelle di uno standard autentico misurato nelle stesse condizioni.

1. Composti identificati (*Identified compounds*);
2. Composti annotati in via provvisoria (*Putatively annotated compounds*);
3. Classi di composti caratterizzate in via provvisoria (*Putatively characterised compound classes*);
4. Composti sconosciuti (*Unknown compounds*).

```html
<table>
<caption>Corrispondenza approssimata, a scopo didattico</caption>
<tr><th scope="col">Schymanski</th><td>1</td><td>2a, 2b</td><td>3</td><td>4, 5</td></tr>
<tr><th scope="col">MSI</th><td>1</td><td>2</td><td>2–3</td><td>4</td></tr>
</table>
```

Le due scale non sono equivalenti: la tabella è un'indicazione, non una regola. Altre proposte più specifiche esistono, per esempio quella per i PFAS (Charbonnet et al., 2022).

## Un punteggio non è un livello

Un coseno di 0,95 con una libreria non porta oltre il livello 2a: senza il confronto con lo standard misurato con lo stesso metodo (stesso laboratorio, stessa colonna, stesse condizioni) il livello 1 non si raggiunge. Il punteggio dice quanto due spettri si somigliano, non che il composto sia quello.

```html
<div class="box warn"><b>Errori frequenti</b><p>Scrivere «livello 1» perché lo spettro coincide con uno di libreria. Dare lo stesso livello a tutti i risultati di una tabella. Dimenticare di dire con quale scala è stato assegnato il livello.</p></div>
```

```html
<details class="poe"><summary style="color:var(--ink)">Prima di provare: con un punteggio 0,99 e 8 picchi in comune, ma senza standard, quale livello ottieni?</summary>
<p>Il livello 2a. Alza il punteggio quanto vuoi: senza lo standard iniettato con lo stesso metodo non si passa al livello 1.</p></details>
```

```html
<div class="sim" id="sim-chemi-livelli" data-sim="../assets/sim-chemi-confidenza.js"><h3>Figura 31.1 Che livello ho?</h3>
<p class="note nota">Ricava il livello di confidenza dalle prove disponibili e dice che cosa manca per salire. Dati sintetici, a scopo didattico.</p></div>
```

## Che cosa riportare

Perché un risultato si possa verificare, accanto al nome vanno scritte le prove. Alseekh et al. (2021) e Hollender et al. (2023) danno indicazioni dettagliate per la comunicazione dei risultati.

```html
<table>
<caption>Informazioni minime da riportare per ogni composto</caption>
<tr><th scope="col">Voce</th><th scope="col">Che cosa scrivere</th></tr>
<tr><td>Massa e ione</td><td>m/z misurato, tipo di ione, tempo di ritenzione</td></tr>
<tr><td>Formula</td><td>formula proposta, errore in ppm, accordo con il pattern isotopico</td></tr>
<tr><td>Evidenza MS2</td><td>libreria usata, punteggio, picchi in comune, energia di collisione</td></tr>
<tr><td>GC</td><td>indice di ritenzione, se la separazione è in GC</td></tr>
<tr><td>Standard</td><td>fornitore e lotto, solo per il livello 1</td></tr>
<tr><td>Livello</td><td>il livello e la scala usata (Schymanski, MSI)</td></tr>
<tr><td>Software</td><td>programma, versione e parametri</td></tr>
</table>
```

## Verifica

```html
<details class="q"><summary>Hai massa esatta, formula univoca e uno spettro MS2 che coincide con la libreria (coseno 0,95, 6 picchi). Quale livello di Schymanski?</summary><p>Livello 2a. Per il livello 1 manca lo standard di riferimento misurato con lo stesso metodo.</p></details>
```

```html
<details class="q"><summary>Hai solo la massa esatta e la formula ricavata dal pattern isotopico. Quale livello?</summary><p>Livello 4 (formula molecolare univoca), che corrisponde in modo approssimato al livello 4 della scala MSI.</p></details>
```

```html
<details class="q"><summary>Perché il livello 1 richiede lo standard e non basta un punteggio molto alto?</summary><p>Perché il punteggio misura la somiglianza fra spettri, mentre lo standard misurato con lo stesso metodo confronta anche il tempo di ritenzione e controlla le condizioni.</p></details>
```

```html
<details class="q"><summary>Che cosa manca a un candidato di livello 3 per salire al livello 2?</summary><p>Una corrispondenza con lo spettro di libreria (2a) oppure un'evidenza diagnostica, per esempio frammenti caratteristici (2b).</p></details>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Sumner L.W. et al. (2007) Proposed minimum reporting standards for chemical analysis. <i>Metabolomics</i> 3, 211-221. <a href="https://doi.org/10.1007/s11306-007-0082-2" target="_blank" rel="noopener">doi:10.1007/s11306-007-0082-2</a></li>
<li><span class="tag">articolo</span>Schymanski E.L. et al. (2014) Identifying small molecules via high resolution mass spectrometry: communicating confidence. <i>Environ. Sci. Technol.</i> 48, 2097-2098. <a href="https://doi.org/10.1021/es5002105" target="_blank" rel="noopener">doi:10.1021/es5002105</a></li>
<li><span class="tag">articolo</span>Creek D.J. et al. (2014) Metabolite identification: are you sure? And how do your peers gauge your confidence? <i>Metabolomics</i> 10, 350-353. <a href="https://doi.org/10.1007/s11306-014-0656-8" target="_blank" rel="noopener">doi:10.1007/s11306-014-0656-8</a></li>
<li><span class="tag">articolo</span>Sumner L.W. et al. (2014) Proposed quantitative and alphanumeric metabolite identification metrics. <i>Metabolomics</i> 10, 1047-1049. <a href="https://doi.org/10.1007/s11306-014-0739-6" target="_blank" rel="noopener">doi:10.1007/s11306-014-0739-6</a></li>
<li><span class="tag">articolo</span>Schymanski E.L. et al. (2015) Non-target screening with high-resolution mass spectrometry: critical review using a collaborative trial on water analysis. <i>Anal. Bioanal. Chem.</i> 407, 6237-6255. <a href="https://doi.org/10.1007/s00216-015-8681-7" target="_blank" rel="noopener">doi:10.1007/s00216-015-8681-7</a></li>
<li><span class="tag">articolo</span>Charbonnet J.A. et al. (2022) Communicating confidence of per- and polyfluoroalkyl substance identification via HRMS. <i>Environ. Sci. Technol. Lett.</i> 9, 473-481. <a href="https://doi.org/10.1021/acs.estlett.2c00206" target="_blank" rel="noopener">doi:10.1021/acs.estlett.2c00206</a></li>
<li><span class="tag">articolo</span>Alseekh S. et al. (2021) Mass spectrometry-based metabolomics: a guide for annotation, quantification and best reporting practices. <i>Nat. Methods</i> 18, 747-756. <a href="https://doi.org/10.1038/s41592-021-01197-1" target="_blank" rel="noopener">doi:10.1038/s41592-021-01197-1</a></li>
<li><span class="tag">articolo</span>Hollender J. et al. (2017) Nontarget screening with high resolution mass spectrometry in the environment: ready to go? <i>Environ. Sci. Technol.</i> 51, 11505-11512. <a href="https://doi.org/10.1021/acs.est.7b02184" target="_blank" rel="noopener">doi:10.1021/acs.est.7b02184</a></li>
<li><span class="tag">articolo</span>Hollender J. et al. (2023) NORMAN guidance on suspect and non-target screening in environmental monitoring. <i>Environ. Sci. Eur.</i> 35, 75. <a href="https://doi.org/10.1186/s12302-023-00779-4" target="_blank" rel="noopener">doi:10.1186/s12302-023-00779-4</a></li>
</ul>
```
