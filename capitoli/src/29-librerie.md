<!-- script: chemi-common.js -->
<!-- title: Librerie e falsi positivi -->
# Ricerca in libreria e falsi positivi {kicker: Capitolo 29}

{.lead} Il miglior risultato di una ricerca in libreria non è ancora un'identificazione. Qui si vede come stimare i falsi positivi e come i punteggi costruiscono una rete molecolare.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>Le librerie di spettri nascono dagli archivi EI; Stein (2012) ne ripercorre la crescita fino alle raccolte attuali. MassBank, repository pubblico di spettri di riferimento, è descritto nel 2010 (Horai et al., 2010); GNPS, con la condivisione e la cura da parte della comunità, nel 2016 (Wang et al., 2016); un protocollo per reti molecolari riproducibili nel 2020 (Aron et al., 2020). L'idea delle esche (<i>decoy</i>) viene dalla proteomica (Elias e Gygi, 2007) e fu adattata alle piccole molecole nel 2017 (Scheubert et al., 2017).</p></details>
```

## Le librerie spettrali

Una libreria è una raccolta di spettri di riferimento: di ognuno si conoscono composto, strumento, polarità, energia e, per l'EI, l'indice di ritenzione. Le raccolte principali:

```html
<table>
<caption>Le principali librerie di spettri</caption>
<tr><th>Libreria</th><th>Contenuto</th><th>Licenza</th></tr>
<tr><td>NIST</td><td>spettri EI e MS/MS</td><td>commerciale: i suoi spettri non sono riprodotti in questo manuale</td></tr>
<tr><td>MassBank (Horai et al., 2010)</td><td>repository pubblico di spettri di riferimento</td><td>indicata per ogni record: si legge nel record</td></tr>
<tr><td>GNPS (Wang et al., 2016)</td><td>librerie MS/MS condivise e curate dalla comunità</td><td>condizioni d'uso sul sito</td></tr>
<tr><td>MoNA</td><td>spettri raccolti da fonti diverse</td><td>per ogni record</td></tr>
</table>
```

Stein (2012) e Vinaixa et al. (2016) passano in rassegna le raccolte e le banche dati per GC-MS e LC-MS; Kind et al. (2018) trattano la ricerca MS/MS in accurata. Programmi come MS-DIAL integrano la ricerca in libreria nell'elaborazione dei dati (Tsugawa et al., 2015) e, nella versione 4, l'annotazione dei lipidi (Tsugawa et al., 2020).

## Ricerca EI: match factor e indice di ritenzione

In EI il programma confronta lo spettro cercato con quelli di libreria e dà un **match factor** e un **match factor inverso** su una scala da 0 a 999 (programma NIST MS Search); il calcolo preciso è nel manuale del programma. Il secondo ignora i picchi dello spettro cercato assenti in libreria, come la ricerca inversa del capitolo 28.

Allo spettro si aggiunge l'**indice di ritenzione** (RI, [capitolo 3](03-gc.html)): si scartano i candidati il cui RI differisce da quello misurato oltre una finestra (nella figura ±35 unità). Vale solo se la fase della colonna è la stessa. L'idea di associare una probabilità a ciascun risultato risale a McLafferty et al. (1974). Se il composto manca, lo spettro può comunque indicare sottostrutture (Stein, 1995). L'interpretazione a mano è nel [capitolo 13](13-ei-metodo.html).

## Ricerca MS/MS: precursore, energia, punteggio

In MS/MS la libreria si filtra prima: massa del precursore entro la tolleranza, polarità, addotto, classe di strumento, energia di collisione. Poi si calcola un punteggio (capitolo 28) e si richiede un numero minimo di picchi accoppiati. Una libreria con una sola energia per composto può non riconoscere uno spettro misurato a un'altra energia: conviene guardare più di un risultato. Per una rassegna della ricerca MS/MS ad accurata, Kind et al. (2018).

## Quanti risultati sono falsi?

Il miglior risultato esiste sempre, anche per un composto assente: è il meno diverso. Più la libreria è grande, più è facile trovarne uno somigliante per caso.

### L'approccio target-decoy

L'idea viene dalla proteomica (Elias e Gygi, 2007) ed è stata adattata alle piccole molecole da Scheubert et al. (2017):

1. si costruisce una libreria di **esche** (*decoy*): spettri falsi, per esempio con picchi riassegnati o mescolati, oppure costruiti dagli alberi di frammentazione, come in Scheubert et al.;
2. ogni query si cerca nei bersagli e nelle esche insieme, e si tiene il miglior risultato;
3. le esche che vincono contano i risultati sbagliati che vincono fra i bersagli.

Tutto dipende dalla qualità delle esche: esche troppo facili da riconoscere fanno stimare troppo pochi errori.

### FDR e q-value

Il tasso di falsi scoperti (FDR; Benjamini e Hochberg, 1995, ne hanno definito il controllo) alla soglia *t* si stima con D esche e T bersagli che hanno il miglior risultato con punteggio ≥ *t*:

```html
<span class="eq">FDR(<i>t</i>) ≈ <span class="frac"><span><i>D</i>(<i>t</i>)</span><span><i>T</i>(<i>t</i>)</span></span><span class="no">(29.1)</span></span>
```

Il **q-value** di un risultato di punteggio *s* è la FDR minima a cui verrebbe accettato:

```html
<span class="eq"><i>q</i>(<i>s</i>) = min<sub><i>t</i> ≤ <i>s</i></sub> FDR(<i>t</i>)<span class="no">(29.2)</span></span>
```

Di solito si tengono i risultati con q ≤ 0,01 o 0,05.

```html
<details class="poe"><summary>Prima di provare: a parità di soglia ci sono più risultati sbagliati con 100 voci o con 2000? Con esche casuali, la FDR stimata è più alta o più bassa di quella vera?</summary><p>Con più voci crescono i risultati sbagliati sopra la stessa soglia. Le esche casuali sono troppo facili da riconoscere: la FDR stimata scende sotto quella vera.</p></details>
```

```html
<div class="sim" id="sim-chemi-libreria" data-sim="../assets/sim-chemi-librerie.js"><h4>Figura 29.1 Classifica dei risultati e falsi positivi</h4>
<p class="note nota">Stima la quota di falsi con una libreria di esche e la confronta con quella vera. Dati sintetici, a scopo didattico.</p></div>
```

## Le reti molecolari

Nel modello di Watrous et al. (2012) ogni **nodo** è uno spettro MS2 di consenso; due nodi si collegano se il coseno modificato supera una soglia e hanno abbastanza picchi in comune. Ogni nodo tiene al più i K legami migliori (nella figura il legame resta se è fra i K migliori di entrambi).

Watrous et al. (2012) usavano un coseno di almeno 0,7, almeno 6 picchi in comune e al più 10 legami per spettro. Le componenti connesse sono **famiglie** di molecole imparentate, e l'annotazione di un nodo trovato in libreria si propaga ai vicini.

GNPS e il suo protocollo (Wang et al., 2016; Aron et al., 2020) rendono la procedura riproducibile. Le soglie decidono tutto: permissive, collegano ogni cosa; strette, spezzano le famiglie. I valori predefiniti dei programmi vanno letti nella loro documentazione.

```html
<details class="poe"><summary>Prima di provare: passando dal coseno modificato al semplice, le famiglie di analoghi restano unite?</summary><p>No: il coseno semplice non accoppia i frammenti spostati dalla modifica e i legami cadono. Con soglie molto basse ricompare invece un legame fra famiglie diverse.</p></details>
```

```html
<div class="sim" id="sim-chemi-rete" data-sim="../assets/sim-chemi-librerie.js"><h3>Figura 29.2 Una rete molecolare</h3>
<p class="note nota">Collega quattordici spettri sintetici in famiglie secondo soglia di coseno e picchi in comune. Spettri sintetici, a scopo didattico.</p></div>
```

```html
<div class="box warn"><b>Errori frequenti</b>
<ul>
<li>prendere il primo risultato per un'identificazione;</li>
<li>usare un RI misurato su una fase di colonna diversa;</li>
<li>cercare in una libreria con una sola energia di collisione;</li>
<li>leggere «nessun risultato» come «composto assente»;</li>
<li>stimare la FDR con esche scadenti;</li>
<li>costruire reti con soglie permissive, che collegano tutto.</li>
</ul></div>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Hertz H.S., Hites R.A., Biemann K. (1971) Identification of mass spectra by computer-searching a file of known spectra. <i>Anal. Chem.</i> 43, 681-691 <a href="https://doi.org/10.1021/ac60301a009" target="_blank" rel="noopener">doi:10.1021/ac60301a009</a></li>
<li><span class="tag">articolo</span>McLafferty F.W. et al. (1974) Probability based matching of mass spectra. Rapid identification of specific compounds in mixtures. <i>Org. Mass Spectrom.</i> 9, 690-702 <a href="https://doi.org/10.1002/oms.1210090710" target="_blank" rel="noopener">doi:10.1002/oms.1210090710</a></li>
<li><span class="tag">articolo</span>Stein S.E. (1995) Chemical substructure identification by mass spectral library searching. <i>J. Am. Soc. Mass Spectrom.</i> 6, 644-655 <a href="https://doi.org/10.1016/1044-0305(95)00291-K" target="_blank" rel="noopener">doi:10.1016/1044-0305(95)00291-K</a></li>
<li><span class="tag">articolo</span>Stein S. (2012) Mass spectral reference libraries: an ever-expanding resource for chemical identification. <i>Anal. Chem.</i> 84, 7274-7282 <a href="https://doi.org/10.1021/ac301205z" target="_blank" rel="noopener">doi:10.1021/ac301205z</a></li>
<li><span class="tag">articolo</span>Horai H. et al. (2010) MassBank: a public repository for sharing mass spectral data for life sciences. <i>J. Mass Spectrom.</i> 45, 703-714 <a href="https://doi.org/10.1002/jms.1777" target="_blank" rel="noopener">doi:10.1002/jms.1777</a></li>
<li><span class="tag">articolo</span>Wang M. et al. (2016) Sharing and community curation of mass spectrometry data with GNPS. <i>Nat. Biotechnol.</i> 34, 828-837 <a href="https://doi.org/10.1038/nbt.3597" target="_blank" rel="noopener">doi:10.1038/nbt.3597</a></li>
<li><span class="tag">articolo</span>Aron A.T. et al. (2020) Reproducible molecular networking of untargeted mass spectrometry data using GNPS. <i>Nat. Protoc.</i> 15, 1954-1991 <a href="https://doi.org/10.1038/s41596-020-0317-5" target="_blank" rel="noopener">doi:10.1038/s41596-020-0317-5</a></li>
<li><span class="tag">articolo</span>Tsugawa H. et al. (2015) MS-DIAL: data-independent MS/MS deconvolution for comprehensive metabolome analysis. <i>Nat. Methods</i> 12, 523-526 <a href="https://doi.org/10.1038/nmeth.3393" target="_blank" rel="noopener">doi:10.1038/nmeth.3393</a></li>
<li><span class="tag">articolo</span>Tsugawa H. et al. (2020) A lipidome atlas in MS-DIAL 4. <i>Nat. Biotechnol.</i> 38, 1159-1163 <a href="https://doi.org/10.1038/s41587-020-0531-2" target="_blank" rel="noopener">doi:10.1038/s41587-020-0531-2</a></li>
<li><span class="tag">articolo</span>Vinaixa M. et al. (2016) Mass spectral databases for LC/MS- and GC/MS-based metabolomics: state of the field and future prospects. <i>TrAC</i> 78, 23-35 <a href="https://doi.org/10.1016/j.trac.2015.09.005" target="_blank" rel="noopener">doi:10.1016/j.trac.2015.09.005</a></li>
<li><span class="tag">articolo</span>Kind T. et al. (2018; online 2017) Identification of small molecules using accurate mass MS/MS search. <i>Mass Spectrom. Rev.</i> 37, 513-532 <a href="https://doi.org/10.1002/mas.21535" target="_blank" rel="noopener">doi:10.1002/mas.21535</a></li>
<li><span class="tag">articolo</span>Elias J.E., Gygi S.P. (2007) Target-decoy search strategy for increased confidence in large-scale protein identifications by mass spectrometry. <i>Nat. Methods</i> 4, 207-214 <a href="https://doi.org/10.1038/nmeth1019" target="_blank" rel="noopener">doi:10.1038/nmeth1019</a></li>
<li><span class="tag">articolo</span>Scheubert K. et al. (2017) Significance estimation for large scale metabolomics annotations by spectral matching. <i>Nat. Commun.</i> 8, 1494 <a href="https://doi.org/10.1038/s41467-017-01318-5" target="_blank" rel="noopener">doi:10.1038/s41467-017-01318-5</a></li>
<li><span class="tag">articolo</span>Benjamini Y., Hochberg Y. (1995) Controlling the false discovery rate. <i>J. R. Stat. Soc. B</i> 57, 289-300 <a href="https://doi.org/10.1111/j.2517-6161.1995.tb02031.x" target="_blank" rel="noopener">doi:10.1111/j.2517-6161.1995.tb02031.x</a></li>
</ul>
```
