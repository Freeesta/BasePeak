<!-- script: chemi-common.js -->
<!-- title: File e formati aperti -->
# I file dei dati: mzML e gli altri formati aperti {kicker: Capitolo 23}

{.lead} Aprire un file mzML con un editor di testo aiuta a capire che cosa contiene davvero. Qui si guarda dentro i formati aperti e si decide quali informazioni devono sopravvivere alla conversione.

```html
<details class="q storia"><summary>Un po' di storia</summary><p>I formati aperti nascono per non dipendere dai file dei costruttori: mzXML (Pedrioli et al., 2004) per la proteomica. Un unico formato unificante fu annunciato nel 2008 (Deutsch, 2008) e pubblicato come mzML nel 2011 (Martens et al., 2011). Nel 2014 arrivano la compressione MS-Numpress (Teleman et al.) e mzTab per i risultati (Griss et al.), esteso alla metabolomica nel 2019 (mzTab-M, Hoffmann et al.). JCAMP-DX nacque per gli spettri infrarossi nel 1988 (McDonald e Wilks) e fu esteso alla spettrometria di massa nel 1994 (Lampen et al.).</p></details>
```

## Che cosa c'è in un file di dati

Un file contiene molto più degli spettri ([capitolo 10](10-dati.html), «Che cosa contiene un file»). Per ogni scansione ci sono i parametri di acquisizione (tempo, livello MS, polarità, precursore) e due array, m/z e intensità. In più ci sono lo strumento e i programmi che hanno elaborato i dati.

Conviene distinguere tre famiglie: i **dati** (mzML, mzXML), gli **elenchi di spettri** (MGF, MSP), che servono a cercare e alle librerie, e i **risultati** (mzTab-M), che dicono che cosa si è trovato.

## mzML dall'interno

mzML è un file XML, cioè testo (Martens et al., 2011). Le sue parti, nell'ordine:

- <code>cvList</code> e <code>fileDescription</code>: vocabolari e contenuto;
- <code>softwareList</code>, <code>instrumentConfigurationList</code>, <code>dataProcessingList</code>: programmi, strumento, elaborazioni;
- <code>run</code>: una <code>spectrumList</code> con uno <code>spectrum</code> per scansione, e i cromatogrammi.

### Il vocabolario controllato

Quasi ogni informazione è un <code>cvParam</code> con codice e nome del vocabolario PSI-MS, uguali in ogni programma.

```html
<table>
<caption>Alcuni termini del vocabolario PSI-MS usati negli spettri</caption>
<tr><th>Codice</th><th>Nome</th></tr>
<tr><td>MS:1000511</td><td>ms level</td></tr>
<tr><td>MS:1000016</td><td>scan start time</td></tr>
<tr><td>MS:1000127, MS:1000128</td><td>centroid spectrum, profile spectrum</td></tr>
<tr><td>MS:1000744, MS:1000041</td><td>selected ion m/z, charge state</td></tr>
<tr><td>MS:1000514, MS:1000515</td><td>m/z array, intensity array</td></tr>
</table>
```

### Gli array binari: base64, precisione, compressione

Gli array sono scritti in tre passaggi:

1. i numeri diventano byte: float a 32 bit (MS:1000521) o a 64 bit (MS:1000523), sempre in ordine little-endian;
2. facoltativa, la compressione: zlib (MS:1000574, senza perdita) o MS-Numpress (MS:1002312-4; Teleman et al., 2014), in parte con perdita; nessuna è MS:1000576;
3. i byte diventano testo base64: 3 byte in 4 caratteri.

```html
<span class="eq">caratteri = 4 · ⌈<i>n</i> / 3⌉<span class="no">(23.1)</span></span>
```

con *n* byte. Esempio: 500 m/z a 64 bit sono 4000 byte e 5336 caratteri. Un float a 32 bit ha 24 bit di mantissa, quindi un errore relativo fino a 2^−24^, circa 0,06 ppm: piccolo rispetto agli errori di misura, ma la figura lo calcola.

```html
<details class="poe"><summary>Prima di provare: con la previsione lineare, 500 m/z di un profilo occupano più o meno di 500 centroidi irregolari?</summary>
<p>Meno: in un profilo i punti sono equidistanti, la previsione è quasi perfetta e basta circa un byte per valore (510 byte contro 4000). Con centroidi irregolari servono più byte (circa 1500). Provalo nella figura.</p></details>
```

```html
<div class="sim" id="sim-chemi-codifica" data-sim="../assets/sim-chemi-formati.js"><h4>Figura 23.1 Come si scrive uno spettro in un file</h4>
<p class="note nota">Mostra che cosa fanno precisione, compressione e base64 alla dimensione e ai numeri di un array. Dati sintetici, a scopo didattico.</p></div>
```

### L'indice

Il file <code>indexedmzML</code> avvolge il resto con l'elenco delle posizioni in byte di ogni spettro: un programma salta allo spettro 12 345 senza leggere i precedenti. Se si modifica il file a mano le posizioni non tornano: conviene rigenerare l'indice.

## Gli altri formati

Altri formati servono ad altri scopi, dai dati grezzi ai risultati.

### mzXML

Precede mzML (Pedrioli et al., 2004) e si trova ancora negli archivi. Le coppie (m/z, intensità) stanno intercalate in un solo array, in ordine di byte di rete (big-endian). Usa nomi di attributo propri, non il vocabolario controllato.

### MGF e MSP: elenchi di spettri

Sono file di testo che elencano spettri MS2 uno dopo l'altro. MGF usa le righe <code>BEGIN IONS</code>, <code>PEPMASS=</code>, <code>CHARGE=</code>, <code>RTINSECONDS=</code>, i picchi, <code>END IONS</code>. MSP è il formato testuale delle librerie NIST: <code>Name:</code>, <code>Num Peaks:</code>, i picchi. Senza vocabolario controllato, polarità, unità del tempo ed energia di collisione dipendono dal programma.

### JCAMP-DX e netCDF (ANDI)

JCAMP-DX nacque per gli spettri infrarossi (McDonald e Wilks, 1988) e fu esteso alla spettrometria di massa (Lampen et al., 1994): testo con campi etichettati. netCDF (ANDI) è un formato binario storico, usato soprattutto per la gascromatografia.

### mzTab-M: i risultati, non i dati

Non contiene spettri ma risultati: una tabella di testo, con righe <code>MTD</code> per i metadati e <code>SML</code> per i composti (Griss et al., 2014, per mzTab; Hoffmann et al., 2019, per la versione per piccole molecole).

```html
<details class="poe"><summary>Prima di provare: quali metadati si perdono passando da mzML a MGF?</summary>
<p>Si perdono la dichiarazione profilo o centroide, il software di conversione e l'energia di collisione; la polarità resta solo nel segno della carica e l'unità del tempo solo nel nome della chiave. Controlla la tabella sotto lo spettro.</p></details>
```

```html
<div class="sim" id="sim-chemi-formati" data-sim="../assets/sim-chemi-formati.js"><h4>Figura 23.2 Lo stesso spettro in cinque formati</h4>
<p class="note nota">Mostra lo stesso spettro scritto in cinque formati e quali metadati ciascuno conserva. Spettro sintetico, a scopo didattico.</p></div>
```

## Dal formato del costruttore al formato aperto

I costruttori usano formati propri: file <code>.raw</code> (Thermo), cartelle <code>.d</code> (Agilent, Bruker), <code>.wiff</code> e <code>.wiff2</code> (Sciex), cartelle <code>.raw</code> (Waters). Per usare i dati altrove si convertono.

### Conversione

ProteoWizard e il suo programma <code>msconvert</code> (Kessner et al., 2008; Chambers et al., 2012) leggono molti formati; ThermoRawFileParser (Hulstaert et al., 2020) converte i file Thermo. Dopo la conversione si controllano il numero di spettri, la polarità, l'unità del tempo e la dichiarazione profilo o centroide ([capitolo 10](10-dati.html), «Che cosa controllare quando si importa un file»).

### Centroidare durante la conversione?

Convertire già in centroidi riduce molto la dimensione, ma è irreversibile: il profilo non si recupera e l'algoritmo è quello del costruttore ([capitolo 22](22-segnale.html), «Tre modi di calcolare un centroide»). Conviene conservare il profilo se si vuole scegliere il metodo, e annotare sempre quale scelta è stata fatta.

## I metadati che contano

Alcune informazioni, se si perdono, cambiano il risultato senza avvisare.

```html
<table>
<caption>Metadati da controllare dopo ogni conversione</caption>
<tr><th>Metadato</th><th>Che cosa verificare</th></tr>
<tr><td>Polarità, livello MS</td><td>presenti per ogni spettro</td></tr>
<tr><td>Tempo di inizio scansione</td><td>unità: secondi o minuti</td></tr>
<tr><td>Profilo o centroide</td><td>dichiarato, e se la conversione ha centroidato</td></tr>
<tr><td>Precursore</td><td>m/z, finestra di isolamento, carica</td></tr>
<tr><td>Energia di collisione</td><td>valore e tipo (eV oppure NCE)</td></tr>
<tr><td>Risoluzione, strumento, sorgente</td><td>modello e impostazioni</td></tr>
<tr><td>Software e filtri</td><td>nome, versione, peak picking applicato</td></tr>
</table>
```

```html
<div class="box warn"><b>Errori frequenti</b>
<ul>
<li>Il centroide del costruttore applicato in conversione senza che nessuno lo noti.</li>
<li>Tempo in secondi in un file e in minuti in un altro; MGF non fissa l'unità.</li>
<li>Polarità persa nel passaggio a MGF.</li>
<li>File della stessa serie convertiti con versioni diverse del programma.</li>
</ul></div>
```

## Per approfondire

```html
<ul class="refs">
<li><span class="tag">articolo</span>Pedrioli P.G.A. et al. (2004) A common open representation of mass spectrometry data and its application to proteomics research (mzXML). <i>Nat. Biotechnol.</i> 22, 1459-1466. <a href="https://doi.org/10.1038/nbt1031" target="_blank" rel="noopener">doi:10.1038/nbt1031</a></li>
<li><span class="tag">articolo</span>Deutsch E. (2008) mzML: a single, unifying data format for mass spectrometer output. <i>Proteomics</i> 8, 2776-2777. <a href="https://doi.org/10.1002/pmic.200890049" target="_blank" rel="noopener">doi:10.1002/pmic.200890049</a></li>
<li><span class="tag">articolo</span>Martens L. et al. (2011) mzML - a community standard for mass spectrometry data. <i>Mol. Cell. Proteomics</i> 10, R110.000133. <a href="https://doi.org/10.1074/mcp.R110.000133" target="_blank" rel="noopener">doi:10.1074/mcp.R110.000133</a></li>
<li><span class="tag">articolo</span>Teleman J. et al. (2014) Numerical compression schemes for proteomics mass spectrometry data (MS-Numpress). <i>Mol. Cell. Proteomics</i> 13, 1537-1542. <a href="https://doi.org/10.1074/mcp.O114.037879" target="_blank" rel="noopener">doi:10.1074/mcp.O114.037879</a></li>
<li><span class="tag">articolo</span>Griss J. et al. (2014) The mzTab data exchange format. <i>Mol. Cell. Proteomics</i> 13, 2765-2775. <a href="https://doi.org/10.1074/mcp.O113.036681" target="_blank" rel="noopener">doi:10.1074/mcp.O113.036681</a></li>
<li><span class="tag">articolo</span>Hoffmann N. et al. (2019) mzTab-M: a data standard for sharing quantitative results in mass spectrometry metabolomics. <i>Anal. Chem.</i> 91, 3302-3310. <a href="https://doi.org/10.1021/acs.analchem.8b04310" target="_blank" rel="noopener">doi:10.1021/acs.analchem.8b04310</a></li>
<li><span class="tag">articolo</span>McDonald R.S., Wilks P.A. (1988) JCAMP-DX: a standard form for exchange of infrared spectra in computer readable form. <i>Appl. Spectrosc.</i> 42, 151-162. <a href="https://doi.org/10.1366/0003702884428734" target="_blank" rel="noopener">doi:10.1366/0003702884428734</a></li>
<li><span class="tag">articolo</span>Lampen P. et al. (1994) JCAMP-DX for mass spectrometry. <i>Appl. Spectrosc.</i> 48, 1545-1552. <a href="https://doi.org/10.1366/0003702944027840" target="_blank" rel="noopener">doi:10.1366/0003702944027840</a></li>
<li><span class="tag">articolo</span>Kessner D. et al. (2008) ProteoWizard: open source software for rapid proteomics tools development. <i>Bioinformatics</i> 24, 2534-2536. <a href="https://doi.org/10.1093/bioinformatics/btn323" target="_blank" rel="noopener">doi:10.1093/bioinformatics/btn323</a></li>
<li><span class="tag">articolo</span>Chambers M.C. et al. (2012) A cross-platform toolkit for mass spectrometry and proteomics (ProteoWizard). <i>Nat. Biotechnol.</i> 30, 918-920. <a href="https://doi.org/10.1038/nbt.2377" target="_blank" rel="noopener">doi:10.1038/nbt.2377</a></li>
<li><span class="tag">articolo</span>Hulstaert N. et al. (2020) ThermoRawFileParser: modular, scalable, and cross-platform RAW file conversion. <i>J. Proteome Res.</i> 19, 537-542. <a href="https://doi.org/10.1021/acs.jproteome.9b00328" target="_blank" rel="noopener">doi:10.1021/acs.jproteome.9b00328</a></li>
<li><span class="tag">risorsa</span>HUPO-PSI, vocabolario controllato PSI-MS (<code>psi-ms.obo</code>): <a href="https://github.com/HUPO-PSI/psi-ms-CV" target="_blank" rel="noopener">github.com/HUPO-PSI/psi-ms-CV</a></li>
</ul>
```
