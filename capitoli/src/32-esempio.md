<!-- script-before: masse.js -->
<!-- script: chemi-common.js -->
<!-- title: Esempio completo -->
# Un esempio dall'inizio alla fine {kicker: Capitolo 32}

{.lead} Un solo esempio sintetico percorre tutta la catena, dal file al livello di confidenza. Qui si vede che l'uscita di ogni passo è l'ingresso del successivo.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>L'analisi non mirata con la spettrometria di massa ad alta risoluzione è diventata un flusso di lavoro vero e proprio nel corso degli anni 2010. Hollender et al. (2017) si chiesero se fosse pronta per l'uso nell'ambiente, e Hollender et al. (2023) hanno poi pubblicato le linee guida NORMAN per le analisi sospette e non mirate.</p><p>Nel frattempo piattaforme aperte hanno messo in sequenza i passi che qui si vedono uno a uno; patRoon, per esempio, è descritta da Helmus et al. (2021).</p></details>
```

## Il problema

Un estratto sintetico di acqua superficiale è stato iniettato in un sistema LC-MS ad alta risoluzione, in tre repliche (C1, C2, C3) e in un bianco. Contiene tre composti da trovare e un contaminante. Tutti i dati di questo capitolo sono sintetici: servono a seguire la catena, non a descrivere una misura vera.

1. Il composto A è un farmaco, la carbamazepina (C<sub>15</sub>H<sub>12</sub>N<sub>2</sub>O): è un sospetto e si ha lo standard di riferimento.
2. Il composto B è un pesticida sintetico, un sospetto senza standard; c'è però uno spettro nella libreria sintetica.
3. Il composto C è un incognito: si arriverà soltanto a una formula.
4. Il contaminante compare anche nel bianco e va scartato.

Il percorso ha sei passi: centroidi, tracce, picchi, tabella, spettro MS2, livello. L'uscita di ciascuno è l'ingresso del successivo. Per la teoria di ogni passo si rimanda ai capitoli indicati; qui si guarda solo come si concatenano. Hollender et al. (2023) descrivono il flusso completo per l'ambiente, Schymanski et al. (2015) lo hanno messo alla prova in una prova collaborativa sull'analisi dell'acqua.

```html
<details class="poe"><summary>Prima di provare: quale dei tre composti avrà il livello più basso, e perché?</summary>
<p>Il composto C. Ha un'altezza troppo bassa per scegliere il suo ione per la frammentazione, quindi non ha spettro MS2 e resta alla formula.</p></details>
```

```html
<div class="sim" id="sim-chemi-esempio" data-sim="../assets/sim-chemi-esempio.js" data-preset="esempio"><h3>Figura 32.1 Il percorso completo, un passo alla volta</h3>
<p class="note nota">Percorre in sei passi un esempio sintetico, dal file al livello di confidenza. Dati sintetici, a scopo didattico.</p></div>
```

## 1. Dal file agli spettri centroidati

Il file contiene, per ogni scansione, un profilo: una successione di punti m/z-intensità. Il formato è trattato nel capitolo [23](23-formati.html). Il primo passo riduce ogni picco del profilo a un solo valore, il centroide (capitolo [22](22-segnale.html)).

1. Si cercano i massimi locali sopra una soglia.
2. Per ogni massimo si adatta una parabola ai tre punti più vicini.
3. Il vertice della parabola è il m/z del centroide; l'altezza del vertice è la sua intensità.

Per il composto A il profilo ha 810 punti e dà due centroidi: m/z 237,1025 e 238,1060. Il valore teorico calcolato con masse.js per [M+H]<sup>+</sup> è 237,1022, l'errore è quindi di 1,2 ppm.

```html
<span class="eq">errore (ppm) = <span class="frac"><span><i>m</i><sub>mis</sub> − <i>m</i><sub>teo</sub></span><span><i>m</i><sub>teo</sub></span></span> × 10<sup>6</sup><span class="no">(32.1)</span></span>
```

Il secondo centroide è il primo isotopo (M+1), a 1,7 ppm dal valore atteso. I due centroidi sono la lista di partenza del passo successivo.

## 2. Dalle tracce ai picchi

Dai centroidi di tutte le scansioni si costruisce, per ogni m/z di interesse, una traccia di massa: l'intensità in una finestra di ±5 ppm in funzione del tempo (capitolo [24](24-tracce.html)). Per A la finestra va da 237,1013 a 237,1037.

Sulla traccia si cercano i picchi cromatografici (capitolo [25](25-picchi.html)).

1. Si leviga la traccia con una media mobile su cinque punti.
2. Si stima il rumore dalle differenze tra punti vicini: qui 3,1·10<sup>3</sup>.
3. Un massimo è un picco se supera la linea di base di almeno 10 volte il rumore.
4. I bordi sono dove la traccia scende sotto il 5 % dell'altezza; l'area è l'integrale tra i bordi, tolta la linea di base.

Il picco di A nel campione C1 è a 8,20 min, alto 7,4·10<sup>5</sup>, con S/N 238 e area 9,7·10<sup>4</sup> (unità arbitrarie · min). Lo stesso si fa per ogni campione e per ogni composto.

```html
<div class="box warn"><b>Errori frequenti</b><p>Una soglia di S/N troppo bassa trasforma il rumore in picchi; troppo alta fa perdere i composti in traccia. Una finestra di massa troppo stretta spezza il picco, una troppo larga somma composti diversi.</p></div>
```

## 3. Dai picchi alla tabella delle feature

Un picco, in un campione, non è ancora una feature. Si raggruppano i picchi dei diversi campioni che hanno lo stesso m/z (entro 5 ppm) e lo stesso tempo di ritenzione (entro 0,1 min), capitoli [26](26-gruppi.html) e [27](27-tabella.html). Ogni gruppo diventa una riga.

```html
<table>
<caption>Tabella delle feature (aree in unità arbitrarie)</caption>
<tr><th scope="col">Feature</th><th scope="col">m/z</th><th scope="col">RT (min)</th><th scope="col">C1</th><th scope="col">C2</th><th scope="col">C3</th><th scope="col">Bianco</th><th scope="col">Tenuta</th></tr>
<tr><td>F1</td><td>279,1456</td><td>5,44</td><td>13 305</td><td>12 170</td><td>14 051</td><td>0</td><td>✓ sì</td></tr>
<tr><td>F2</td><td>252,0896</td><td>7,16</td><td>33 611</td><td>36 795</td><td>31 428</td><td>0</td><td>✓ sì</td></tr>
<tr><td>F3</td><td>237,1025</td><td>8,20</td><td>97 366</td><td>93 536</td><td>102 151</td><td>0</td><td>✓ sì</td></tr>
<tr><td>F4</td><td>307,1654</td><td>10,51</td><td>23 640</td><td>25 589</td><td>22 555</td><td>24 754</td><td>✗ no</td></tr>
</table>
```

Si tiene una feature se l'area media dei campioni è almeno 3 volte quella del bianco e se la variabilità tra repliche (CV) è sotto il 30 %. F1, F2 e F3 hanno CV tra 4 e 8 % e nulla nel bianco. F4 ha un'area di 0,97 volte quella del bianco: è un contaminante e si scarta.

```html
<span class="eq">rapporto = <span class="frac"><span>area media dei campioni</span><span>area nel bianco</span></span> ≥ 3<span class="no">(32.2)</span></span>
```

## 4. Dallo spettro MS2 al candidato

Per le feature tenute l'acquisizione dipendente dai dati sceglie gli ioni più intensi e ne registra lo spettro MS2. Qui la soglia è 2·10<sup>5</sup>: A e B la superano, C (circa 1,1·10<sup>5</sup>) no. Per C quindi non esiste uno spettro MS2.

Per A e B si cerca nella libreria sintetica (capitolo [29](29-librerie.html)).

1. Si tengono le voci con il precursore entro 5 ppm.
2. Si accoppia ogni picco dello spettro misurato al più vicino della voce, entro 0,01 Da, senza usare due volte lo stesso.
3. Si calcola il coseno (capitolo [28](28-somiglianza.html)).

È il coseno della (28.3) calcolato sulle radici delle intensità (*p* = 0,5):

```html
<span class="eq">coseno = <span class="frac"><span>Σ √(<i>I</i><sub>mis</sub> · <i>I</i><sub>lib</sub>)</span><span>√(Σ <i>I</i><sub>mis</sub>) · √(Σ <i>I</i><sub>lib</sub>)</span></span><span class="no">(32.3)</span></span>
```

Per A ci sono due voci con lo stesso precursore: lo spettro di A, con coseno 0,999 e 4 picchi in comune, e un isomero sintetico con coseno 0,15 e 1 picco in comune. Per B la sola voce compatibile dà 0,998. Il coseno distingue gli isomeri; il solo precursore non può.

Sulla massa si controlla anche la formula (capitolo [30](30-candidati.html)): per C, entro 3 ppm e con C, H, N, O e fino a due Cl, l'unica formula è C<sub>13</sub>H<sub>18</sub>N<sub>4</sub>O<sub>3</sub> e il suo profilo isotopico (M+1 circa 16 %, nessun M+2 da cloro) concorda con quello misurato. Per B il rapporto M+2/M di circa 33 % indica un atomo di cloro.

## 5. Il livello di confidenza

Alla fine si assegna a ogni composto un livello, secondo la scala di Schymanski et al. (2014), capitolo [31](31-confidenza.html). Il livello dipende dalle prove raccolte, non dal punteggio.

```html
<table>
<caption>Prove e livello dei tre composti</caption>
<tr><th scope="col">Composto</th><th scope="col">Massa e formula</th><th scope="col">MS2</th><th scope="col">Libreria</th><th scope="col">Standard</th><th scope="col">Livello</th></tr>
<tr><td>A</td><td>✓</td><td>✓</td><td>✓ (0,999)</td><td>✓ (RT 8,20 contro 8,19 min)</td><td>1</td></tr>
<tr><td>B</td><td>✓</td><td>✓</td><td>✓ (0,998)</td><td>✗</td><td>2a</td></tr>
<tr><td>C</td><td>✓</td><td>✗</td><td>✗</td><td>✗</td><td>4</td></tr>
</table>
```

A ha il livello 1 perché lo standard, misurato con lo stesso metodo, coincide per tempo di ritenzione, massa e MS2. B ha un coseno alto come A ma il livello 2a, perché manca lo standard. C ha il livello 4: massa e profilo isotopico fissano la formula, ma senza MS2 non c'è nessun candidato.

```html
<div class="box warn"><b>Errori frequenti</b><p>Scrivere «livello 1» per B perché il coseno è alto. Dimenticare che le soglie di questo esempio (S/N 10, rapporto 3, coseno 0,7) sono scelte didattiche e vanno fissate e dichiarate in ogni studio.</p></div>
```

## Che cosa scrivere nel rapporto

Il risultato si può verificare solo se il rapporto dice come ci si è arrivati. Per ogni composto vanno riportati, come nel capitolo [31](31-confidenza.html), il m/z, il tipo di ione, il tempo di ritenzione, la formula con l'errore in ppm, le prove MS2 (libreria, punteggio, picchi in comune) e il livello con la scala usata. Hollender et al. (2023) danno indicazioni per l'ambiente.

1. I parametri di ogni passo: finestra di massa, soglia di S/N, tolleranze di raggruppamento, filtro del bianco.
2. I campioni di controllo: bianco e repliche.
3. Il programma e la sua versione.
4. Le librerie usate e la loro versione.

Il flusso si può eseguire con programmi aperti: MZmine (Pluskal et al., 2010; Schmid et al., 2023), MS-DIAL (Tsugawa et al., 2015) e OpenMS (Röst et al., 2016). patRoon (Helmus et al., 2021) li collega in un solo ambiente per l'analisi non mirata ambientale. Winkler (2020) è un volume dedicato ai programmi aperti per questi dati.

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Hollender J. et al. (2017) Nontarget screening with high resolution mass spectrometry in the environment: ready to go? <i>Environ. Sci. Technol.</i> 51, 11505-11512. <a href="https://doi.org/10.1021/acs.est.7b02184" target="_blank" rel="noopener">doi:10.1021/acs.est.7b02184</a></li>
<li><span class="tag">articolo</span>Hollender J. et al. (2023) NORMAN guidance on suspect and non-target screening in environmental monitoring. <i>Environ. Sci. Eur.</i> 35, 75. <a href="https://doi.org/10.1186/s12302-023-00779-4" target="_blank" rel="noopener">doi:10.1186/s12302-023-00779-4</a></li>
<li><span class="tag">articolo</span>Schymanski E.L. et al. (2015) Non-target screening with high-resolution mass spectrometry: critical review using a collaborative trial on water analysis. <i>Anal. Bioanal. Chem.</i> 407, 6237-6255. <a href="https://doi.org/10.1007/s00216-015-8681-7" target="_blank" rel="noopener">doi:10.1007/s00216-015-8681-7</a></li>
<li><span class="tag">articolo</span>Helmus R. et al. (2021) patRoon: open source software platform for environmental mass spectrometry based non-target screening. <i>J. Cheminform.</i> 13, 1. <a href="https://doi.org/10.1186/s13321-020-00477-w" target="_blank" rel="noopener">doi:10.1186/s13321-020-00477-w</a></li>
<li><span class="tag">libro</span>Winkler R. (ed.) (2020) <i>Processing Metabolomics and Proteomics Data with Open Software</i>. Royal Society of Chemistry. <a href="https://doi.org/10.1039/9781788019880" target="_blank" rel="noopener">doi:10.1039/9781788019880</a></li>
<li><span class="tag">articolo</span>Pluskal T. et al. (2010) MZmine 2. <i>BMC Bioinformatics</i> 11, 395. <a href="https://doi.org/10.1186/1471-2105-11-395" target="_blank" rel="noopener">doi:10.1186/1471-2105-11-395</a></li>
<li><span class="tag">articolo</span>Schmid R. et al. (2023) Integrative analysis of multimodal mass spectrometry data in MZmine 3. <i>Nat. Biotechnol.</i> 41, 447-449. <a href="https://doi.org/10.1038/s41587-023-01690-2" target="_blank" rel="noopener">doi:10.1038/s41587-023-01690-2</a></li>
<li><span class="tag">articolo</span>Tsugawa H. et al. (2015) MS-DIAL: data-independent MS/MS deconvolution for comprehensive metabolome analysis. <i>Nat. Methods</i> 12, 523-526. <a href="https://doi.org/10.1038/nmeth.3393" target="_blank" rel="noopener">doi:10.1038/nmeth.3393</a></li>
<li><span class="tag">articolo</span>Röst H.L. et al. (2016) OpenMS. <i>Nat. Methods</i> 13, 741-748. <a href="https://doi.org/10.1038/nmeth.3959" target="_blank" rel="noopener">doi:10.1038/nmeth.3959</a></li>
<li><span class="tag">articolo</span>Schymanski E.L. et al. (2014) Identifying small molecules via high resolution mass spectrometry: communicating confidence. <i>Environ. Sci. Technol.</i> 48, 2097-2098. <a href="https://doi.org/10.1021/es5002105" target="_blank" rel="noopener">doi:10.1021/es5002105</a></li>
</ul>
```
