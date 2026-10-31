<!-- script: chemi-common.js -->
<!-- title: Somiglianza spettrale -->
# Spettri MS2 e somiglianza spettrale {kicker: Capitolo 28}

{.lead} Per dire che due spettri MS2 si somigliano serve un numero. Qui si calcolano a mano il coseno, il coseno pesato, quello modificato e l'entropia spettrale.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Nel 1971 Hertz, Hites e Biemann descrissero l'identificazione di uno spettro cercandolo, con il calcolatore, in un archivio di spettri noti (Hertz et al., 1971). Nel 1974 McLafferty e colleghi proposero un confronto basato sulla probabilità, pensato per le miscele (McLafferty et al., 1974). Nel 1994 Stein e Scott ottimizzarono e misero alla prova gli algoritmi di ricerca in libreria (Stein e Scott, 1994). Il coseno modificato è del 2012, nel lavoro sulle reti molecolari (Watrous et al., 2012); l'entropia spettrale è del 2021 (Li et al., 2021).</p></details>
```

## Da dove vengono gli spettri MS2

Uno spettro MS2 è l'elenco dei frammenti di uno ione precursore: di ogni picco si conoscono il rapporto m/z e l'intensità. Per confrontare due spettri conviene sapere come sono stati ottenuti e quanto sono puri.

### DDA e DIA

In [DDA](10-dati.html) lo strumento sceglie al momento gli ioni più intensi di una scansione MS1 e li isola uno alla volta in una finestra stretta: ogni spettro MS2 nasce da un solo precursore. In [DIA](10-dati.html) si frammentano invece tutti gli ioni di ampi intervalli di m/z, e separare gli spettri spetta al programma. Le finestre di isolamento sono nel [capitolo 17](17-hr-dda.html); la frammentazione CID nel [capitolo 12](12-frammentazione-esi.html).

### Purezza del precursore e spettri chimerici

Se nella finestra entra anche un secondo ione, i frammenti dei due composti si sommano e lo spettro è **chimerico**. La **purezza del precursore** è la quota della corrente ionica della finestra dovuta allo ione bersaglio:

```html
<span class="eq">purezza = <span class="frac"><span><i>I</i><sub>bersaglio</sub></span><span><i>I</i><sub>bersaglio</sub> + <i>I</i><sub>altri ioni</sub></span></span><span class="no">(28.1)</span></span>
```

Più la purezza scende, più lo spettro misurato si allontana da quello di libreria. Nella figura 28.1 si allarga la finestra, si avvicina un ione che esce insieme al bersaglio e si guarda quanto cala il coseno.

```html
<details class="poe"><summary>Prima di provare: un ione intenso a 0,8 m/z dal bersaglio entra in una finestra di 0,4 m/z? E in una di 2 m/z? Che purezza resta?</summary><p>Con 0,4 m/z la finestra arriva a ±0,2 e il co-eluente resta fuori: purezza 100 %. Con 2 m/z (±1) entra, e a intensità uguale la purezza scende verso il 50-60 %, secondo il punto del picco in cui si acquisisce.</p></details>
```

```html
<div class="sim" id="sim-chemi-purezza" data-sim="../assets/sim-chemi-somiglianza.js"><h4>Figura 28.1 Quando la finestra di isolamento prende due ioni</h4>
<p class="note nota">Mostra come la larghezza di isolamento e uno ione vicino rendono lo spettro una miscela. Dati sintetici, a scopo didattico.</p></div>
```

## Preparare uno spettro

Prima del confronto i due spettri si puliscono nello stesso modo, con passi in ordine fisso:

1. **Togliere il precursore**: via i picchi con m/z oltre la massa del precursore meno un piccolo margine (nella figura 1,5 m/z; il valore giusto dipende dal programma). Il precursore, spesso il picco più alto, altrimenti domina il coseno.
2. **Soglia relativa**: si scartano i picchi sotto una frazione del picco base, per esempio l'1 %.
3. **Picchi più alti per finestra** (facoltativo): si tengono solo i *k* picchi più intensi di ogni intervallo di m/z.
4. **Normalizzare**: il picco più alto vale 1, oppure la somma delle intensità vale 1.
5. **Trasformare** l'intensità: *I* → *I*^*p*^. Con *p* = 0,5 (radice quadrata, scelta comune) i picchi grandi pesano meno.

Due punteggi si confrontano solo se calcolati con la stessa preparazione.

## Accoppiare i picchi

Un picco della query e uno della libreria sono **candidati** all'accoppiamento se i loro m/z differiscono meno della tolleranza, in dalton o in ppm:

```html
<span class="eq">|(m/z)<sub>A</sub> − (m/z)<sub>B</sub>| ≤ tol, &nbsp; tol = <span class="frac"><span>(m/z) · ppm</span><span>10<sup>6</sup></span></span><span class="no">(28.2)</span></span>
```

Dieci ppm valgono 0,002 Da a m/z 200 e 0,008 Da a m/z 800.

Un picco può avere più candidati ma si accoppia una volta sola. Watrous et al. (2012) scelgono l'insieme di coppie che rende massimo il coseno: è un problema di assegnazione, che si risolve in modo esatto, per esempio con l'algoritmo ungherese.

Molti programmi, e la figura, usano una regola più rapida: si ordinano tutte le coppie per prodotto decrescente delle due intensità e si prende ciascuna se nessuno dei due picchi è già stato usato (regola *greedy*). Quasi sempre il risultato è lo stesso; quando cambia, il coseno greedy è un po' più basso. Bittremieux et al. (2022) confrontano coseno, coseno modificato e perdite neutre con l'accoppiamento esatto.

## I punteggi di somiglianza

### Prodotto scalare e coseno

Il coseno è il prodotto scalare dei vettori di intensità diviso per le loro lunghezze; i picchi senza partner restano nelle lunghezze:

```html
<span class="eq">cos = <span class="frac"><span>Σ <i>a</i><sub><i>i</i></sub> <i>b</i><sub><i>i</i></sub></span><span>√(Σ <i>a</i><sup>2</sup>) · √(Σ <i>b</i><sup>2</sup>)</span></span><span class="no">(28.3)</span></span>
```

Esempio: A = 100 (1,0), 150 (0,5), 200 (0,2); B = 100 (0,8), 150 (0,4), 250 (0,6). Numeratore 1,0 × 0,8 + 0,5 × 0,4 = 1,0; lunghezze 1,136 e 1,077; coseno 0,82.

### Coseno pesato

Nel prodotto scalare pesato le intensità ricevono un peso che premia le masse alte.

```html
<span class="eq"><i>w</i> = (m/z)<sup><i>n</i></sup> · <i>I</i><sup><i>m</i></sup><span class="no">(28.4)</span></span>
```

Gli esponenti dipendono dal programma: Stein e Scott (1994), su spettri EI, trovarono ottimali *n* = 3 e *m* = 0,6; la figura usa *n* = 1 e *m* = 0,5.

### Coseno modificato

Per un analogo (per esempio con un CH~2~ in più, 14,0157) i frammenti modificati sono spostati di Δ = M~query~ − M~libreria~. Nel coseno modificato (Watrous et al., 2012) un picco si accoppia anche spostato di Δ.

### Entropia spettrale

Li et al. (2021) propongono un punteggio basato sull'informazione:

1. intensità a somma 1 (*p*~*i*~); entropia *S* = −Σ *p*~*i*~ ln *p*~*i*~;
2. se *S* &lt; 3: *p*~*i*~ → *p*~*i*~^*w*^, con *w* = 0,25 + 0,25 *S*, e di nuovo somma 1;
3. spettro medio M = (A + B)/2;
4. similarità (versione pesata):

```html
<span class="eq">similarità = 1 − <span class="frac"><span>2 <i>S</i><sub>M</sub> − <i>S</i><sub>A</sub> − <i>S</i><sub>B</sub></span><span>ln 4</span></span><span class="no">(28.5)</span></span>
```

Vale 1 per spettri uguali, 0 senza picchi in comune. Esempio: A e B con intensità (50, 30, 20), ma l'ultimo picco in posti diversi. *S* = 1,03, *w* = 0,51, entropia pesata 1,08, entropia dello spettro medio 1,26: similarità = 1 − (2 × 1,26 − 2 × 1,08)/1,386 = 0,74.

```html
<details class="poe"><summary>Con «analogo +CH₂», quali punteggi salgono con il coseno modificato?</summary><p>Solo il coseno modificato: accoppia i picchi spostati. Gli altri restano bassi.</p></details>
```

```html
<div class="sim" id="sim-chemi-specchio" data-sim="../assets/sim-chemi-somiglianza.js"><h4>Figura 28.2 Specchio: due spettri, quattro punteggi</h4>
<p class="note nota">Quattro punteggi su due spettri sintetici. Dati sintetici, a scopo didattico.</p></div>
```

## Ricerca diretta e inversa

Cercare uno spettro in un archivio di spettri noti è un'idea degli anni Settanta (Hertz et al., 1971); McLafferty et al. (1974) ne proposero una versione basata sulla probabilità, pensata per le miscele.

Nella ricerca **diretta** contano tutti i picchi della query. Nella **inversa** si ignorano quelli assenti nello spettro di libreria: è più robusta con query impure o chimeriche, perché i picchi dell'interferente non abbassano il punteggio, ma può dare falsi positivi con spettri di libreria poveri di picchi. Prova l'interruttore nella figura 28.2 con la coppia «rumore aggiunto».

```html
<div class="box warn"><b>Errori frequenti</b>
<ul>
<li>confrontare spettri a energie di collisione o strumenti diversi;</li>
<li>dimenticare che gli spettri chimerici abbassano il punteggio anche se il composto è giusto;</li>
<li>fidarsi di un coseno alto con pochi picchi accoppiati: può essere un caso, quindi si chiede un numero minimo di picchi;</li>
<li>lasciare il precursore nello spettro;</li>
<li>usare una tolleranza in dalton alle masse alte invece che in ppm;</li>
<li>confrontare punteggi con trasformazioni diverse (radice o lineare).</li>
</ul></div>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Hertz H.S., Hites R.A., Biemann K. (1971) Identification of mass spectra by computer-searching a file of known spectra. <i>Anal. Chem.</i> 43, 681-691 <a href="https://doi.org/10.1021/ac60301a009" target="_blank" rel="noopener">doi:10.1021/ac60301a009</a></li>
<li><span class="tag">articolo</span>McLafferty F.W. et al. (1974) Probability based matching of mass spectra. Rapid identification of specific compounds in mixtures. <i>Org. Mass Spectrom.</i> 9, 690-702 <a href="https://doi.org/10.1002/oms.1210090710" target="_blank" rel="noopener">doi:10.1002/oms.1210090710</a></li>
<li><span class="tag">articolo</span>Stein S.E., Scott D.R. (1994) Optimization and testing of mass spectral library search algorithms for compound identification. <i>J. Am. Soc. Mass Spectrom.</i> 5, 859-866 <a href="https://doi.org/10.1016/1044-0305(94)87009-8" target="_blank" rel="noopener">doi:10.1016/1044-0305(94)87009-8</a></li>
<li><span class="tag">articolo</span>Watrous J. et al. (2012) Mass spectral molecular networking of living microbial colonies. <i>PNAS</i> 109, E1743-E1752 <a href="https://doi.org/10.1073/pnas.1203689109" target="_blank" rel="noopener">doi:10.1073/pnas.1203689109</a></li>
<li><span class="tag">articolo</span>Bittremieux W. et al. (2022) Comparison of cosine, modified cosine, and neutral loss based spectrum alignment for discovery of structurally related molecules. <i>J. Am. Soc. Mass Spectrom.</i> 33, 1733-1744 <a href="https://doi.org/10.1021/jasms.2c00153" target="_blank" rel="noopener">doi:10.1021/jasms.2c00153</a></li>
<li><span class="tag">articolo</span>Li Y. et al. (2021) Spectral entropy outperforms MS/MS dot product similarity for small-molecule compound identification. <i>Nat. Methods</i> 18, 1524-1531 <a href="https://doi.org/10.1038/s41592-021-01331-z" target="_blank" rel="noopener">doi:10.1038/s41592-021-01331-z</a></li>
</ul>
```
