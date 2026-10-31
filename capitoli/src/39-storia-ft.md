<!-- script: storia-fig-ft.js -->
<!-- title: Ioni che girano: ICR, FT-ICR, Orbitrap -->
# Ioni che girano: ICR, FT-ICR, Orbitrap {kicker: Capitolo 39}

{.lead} Se uno ione gira in un campo con una frequenza che dipende solo dalla sua massa, misurare una massa diventa misurare una frequenza: la cosa che la fisica sa fare meglio.

## La risonanza ciclotronica (anni '40-'50)

### Frequenza e massa: f = qB/(2πm)

Uno ione di carica *q* e massa *m* in un campo magnetico uniforme *B* viene deviato dalla forza di Lorentz e descrive un cerchio, in un piano perpendicolare al campo. Se è più veloce il cerchio è più largo, ma il giro dura lo stesso tempo.

```html
<span class="eq"><i>f</i> = <span class="frac"><span><i>qB</i></span><span>2π<i>m</i></span></span><span class="no">(39.1)</span></span>
```

La frequenza dipende solo dal rapporto carica/massa e dal campo. Con un campo di 7 T, uno ione con una carica elementare e massa 300 u gira circa 360 000 volte al secondo. Lo stesso principio, nel ciclotrone di Lawrence e Livingston (1932), serviva ad accelerare ioni leggeri senza tensioni elevate.

```html
<figure><img src="../assets/img/storia/schemi/cella-icr.svg" loading="lazy" decoding="async" style="max-width:100%;height:auto" width="720" height="410" alt="Cella cubica in un campo magnetico, con piastre di eccitazione e di rivelazione e l'orbita circolare di uno ione"><figcaption><b>Figura 39.1</b> Cella cubica per la risonanza ciclotronica ionica. Le piastre laterali eccitano gli ioni, quelle sopra e sotto rivelano il segnale. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption></figure>
```

### L'omegatron di Hipple, Sommer e Thomas (1949)

Nel 1949 Hipple, Sommer e Thomas descrissero un metodo per determinare il faraday con la risonanza magnetica. Due anni dopo gli stessi autori pubblicarono la misura di *e*/*M* con la risonanza ciclotronica.

<!-- to verify against source: the name "omegatron" and the details of the apparatus (RF field, collector) are not in the titles of the 1949 and 1951 papers; check the full text -->

Il principio è questo: se un campo oscillante ha la frequenza giusta, entrano in risonanza solo gli ioni con la massa corrispondente. Per scegliere una massa non si misura più una deviazione, si regola una frequenza. È l'idea da cui parte tutta la famiglia ICR.

## Comisarow e Marshall (1974): la trasformata di Fourier

### Tutti gli ioni insieme: il transiente

Nel 1974 Comisarow e Marshall pubblicarono una breve nota di due pagine sulla spettroscopia di risonanza ciclotronica con trasformata di Fourier. L'idea era smettere di cercare una frequenza alla volta.

<!-- to verify against source: how ICR spectra were recorded before 1974 (one frequency at a time) and the broadband excitation pulse; check Comisarow-Marshall 1974 and the Marshall 1998 primer -->

Un breve impulso a radiofrequenza eccita insieme tutti gli ioni della cella. Poi si registra la corrente che gli ioni in moto inducono nelle piastre di rivelazione. Questo segnale si chiama **transiente**: è la somma di tante sinusoidi, una per ogni valore di m/z, che si spengono piano piano.

Un calcolatore applica al transiente la **trasformata di Fourier**, che scompone un segnale nelle sue frequenze. Ogni picco dello spettro di frequenze diventa un picco di massa, perché la formula (39.1) lega le due grandezze. Tutte le masse si misurano nello stesso tempo e con gli stessi ioni.

### Più tempo, più risoluzione

Due frequenze vicine si separano solo se il segnale dura abbastanza da farle «battere». La larghezza di un picco è circa l'inverso della durata *T* della registrazione, quindi il potere risolutivo cresce con i cicli registrati.

```html
<span class="eq"><i>R</i> = <span class="frac"><span><i>f</i></span><span>Δ<i>f</i></span></span> ≈ <i>f T</i><span class="no">(39.2)</span></span>
```

Per questo la cella lavora in un vuoto molto spinto: gli urti con le molecole del gas spengono il segnale e accorciano il transiente. La figura mostra l'effetto con numeri ridotti: prova ad accorciare il transiente e guarda i due ioni vicini fondersi in un solo picco.

```html
<div class="sim storia-fig" id="sf-ft"><h4>Dal moto al transiente allo spettro</h4>
<figure><img src="../assets/img/storia/schemi/cella-icr.svg" loading="lazy" decoding="async" style="max-width:100%;height:auto" width="720" height="410" alt="Cella cubica in un campo magnetico, con piastre di eccitazione e di rivelazione e l'orbita circolare di uno ione"><figcaption><b>Figura 39.2</b> Tre ioni (m/z 300, 308 e 450; 312 al posto di 308 per l'Orbitrap) con frequenze ottenute dalle formule (39.1) e (39.3); il transiente è la loro somma e lo spettro è calcolato dal browser con una trasformata di Fourier. Le scale sono ridotte, i rapporti tra le frequenze sono quelli veri; la finestra di calcolo e lo smorzamento allargano i picchi, quindi R resta sotto <i>f T</i>. Senza JavaScript resta il disegno della cella, di BasePeak, licenza CC BY 4.0.</figcaption></figure></div>
```

## Kingdon (1923) e Makarov (2000): l'Orbitrap

### Una trappola solo elettrostatica

Per far girare gli ioni non serve per forza un magnete. Già nel 1923 Kingdon studiava cariche tenute in orbita da campi elettrostatici in un gas a pressione bassissima.

<!-- to verify against source: the geometry of the Kingdon trap (central wire in a cylinder) and that the 1923 paper describes ions orbiting; the title only mentions neutralization of electron space charge -->

Nel 2000 Makarov descrisse una trappola di questo tipo come analizzatore di massa: la chiamò trappola orbitale elettrostatica con campo armonico lungo l'asse. Un elettrodo centrale a forma di fuso e un elettrodo esterno a forma di barile creano un potenziale in cui gli ioni girano attorno al fuso.

Nello stesso tempo gli ioni oscillano avanti e indietro lungo l'asse. Questa oscillazione è armonica, e la sua frequenza dipende solo da m/z:

```html
<span class="eq">ω<sub>z</sub> = √(<i>k</i> · <i>z</i>/<i>m</i>)<span class="no">(39.3)</span></span>
```

Qui *k* dipende dalla forma degli elettrodi e dalla tensione. Una corrente immagine nelle due metà dell'elettrodo esterno registra l'oscillazione, e la trasformata di Fourier fa il resto, come nella cella ICR. La frequenza scende con la radice quadrata della massa, non con la massa intera.

```html
<figure><img src="../assets/img/storia/schemi/orbitrap.svg" loading="lazy" decoding="async" style="max-width:100%;height:auto" width="720" height="370" alt="Sezione dell'Orbitrap con l'elettrodo centrale a fuso, l'elettrodo esterno a barile e la traiettoria a spirale degli ioni"><figcaption><b>Figura 39.3</b> Sezione dell'Orbitrap: gli ioni ruotano attorno al fuso e oscillano lungo l'asse z. Disegno originale di BasePeak, licenza CC BY 4.0.</figcaption></figure>
```

### Dal prototipo allo strumento commerciale

L'articolo del 2000 viene da un'azienda di Manchester, la HD Technologies. Nel 2006 Makarov e colleghi, della Thermo Electron di Brema, valutarono le prestazioni di uno strumento ibrido con una trappola ionica lineare e un Orbitrap.

<!-- to verify against source: the year of the first commercial Orbitrap (2005?) is not stated in the verified titles; leave undated until the full text of Makarov et al. 2006 is read -->

Nel 2011 Michalski e colleghi descrissero il Q Exactive, uno strumento da banco con un quadrupolo davanti all'Orbitrap, usato per la proteomica. Era l'idea del 2000 diventata un apparecchio di laboratorio comune.

## Chi era

```html
<details class="storia-chi"><summary>Melvin B. Comisarow</summary>
<p>Fu il primo autore della nota del 1974 che applicò la trasformata di Fourier alla risonanza ciclotronica ionica. La sua idea fu registrare tutti gli ioni insieme invece di scansionare una frequenza alla volta.</p>
<!-- to verify against source: birth and death dates, institution (Crossref has no affiliation for the 1974 paper) -->
</details>
```

```html
<details class="storia-chi"><summary>Alan G. Marshall</summary>
<p>Fu coautore della nota del 1974 e, con Hendrickson e Jackson, scrisse nel 1998 una guida alla spettrometria di massa FT-ICR (un «primer»). Da allora il suo nome si associa a questa tecnica.</p>
<!-- to verify against source: birth date, institution, role in the field (Crossref has no affiliation for the 1974 and 1998 papers) -->
</details>
```

```html
<details class="storia-chi"><summary>Alexander Makarov</summary>
<p>Nel 2000 scrisse da solo l'articolo sulla trappola orbitale elettrostatica, lavorando presso la HD Technologies di Manchester. Nel 2006 firmava le prestazioni dello strumento ibrido con trappola lineare e Orbitrap come autore della Thermo Electron di Brema.</p>
<!-- to verify against source: birth date and nationality; career details outside the affiliations printed on the 2000 and 2006 papers -->
</details>
```

## Perché contava

```html
<div class="box key"><b>Perché contava</b>
<ul>
<li>Misurare una frequenza dà il potere risolutivo e l'accuratezza di massa più alti: servono per le miscele complesse, come petrolio, proteomica e analisi non mirata.</li>
<li>Con la trasformata di Fourier un solo transiente contiene tutte le masse, e allungarlo affina i picchi.</li>
<li>L'Orbitrap porta questa potenza in uno strumento da banco, senza magnete superconduttore.</li>
</ul></div>
```

## Per capire meglio

```html
<p class="storia-link">Per capire meglio: <a href="09-risoluzione.html">capitolo 9, Risoluzione, accuratezza e analizzatori ad alta risoluzione</a> (Orbitrap, trappola ionica e FT-ICR).</p>
```

## Fonti

```html
<ul class="refs">
<li><span class="tag">articolo</span>Lawrence E.O., Livingston M.S. (1932) The production of high speed light ions without the use of high voltages. <i>Phys. Rev.</i> 40, 19-35. <a href="https://doi.org/10.1103/PhysRev.40.19" target="_blank" rel="noopener">doi:10.1103/PhysRev.40.19</a></li>
<li><span class="tag">articolo</span>Hipple J.A., Sommer H., Thomas H.A. (1949) A precise method of determining the Faraday by magnetic resonance. <i>Phys. Rev.</i> 76, 1877-1878. <a href="https://doi.org/10.1103/PhysRev.76.1877.2" target="_blank" rel="noopener">doi:10.1103/PhysRev.76.1877.2</a></li>
<li><span class="tag">articolo</span>Sommer H., Thomas H.A., Hipple J.A. (1951) The measurement of e/M by cyclotron resonance. <i>Phys. Rev.</i> 82, 697-702. <a href="https://doi.org/10.1103/PhysRev.82.697" target="_blank" rel="noopener">doi:10.1103/PhysRev.82.697</a></li>
<li><span class="tag">articolo</span>Comisarow M.B., Marshall A.G. (1974) Fourier transform ion cyclotron resonance spectroscopy. <i>Chem. Phys. Lett.</i> 25, 282-283. <a href="https://doi.org/10.1016/0009-2614(74)89137-2" target="_blank" rel="noopener">doi:10.1016/0009-2614(74)89137-2</a></li>
<li><span class="tag">articolo</span>Marshall A.G., Hendrickson C.L., Jackson G.S. (1998) Fourier transform ion cyclotron resonance mass spectrometry: a primer. <i>Mass Spectrom. Rev.</i> 17, 1-35. <a href="https://doi.org/10.1002/(SICI)1098-2787(1998)17:1%3C1::AID-MAS1%3E3.0.CO;2-K" target="_blank" rel="noopener">doi:10.1002/(SICI)1098-2787(1998)17:1&lt;1::AID-MAS1&gt;3.0.CO;2-K</a></li>
<li><span class="tag">articolo</span>Kingdon K.H. (1923) A method for the neutralization of electron space charge by positive ionization at very low gas pressures. <i>Phys. Rev.</i> 21, 408-418. <a href="https://doi.org/10.1103/PhysRev.21.408" target="_blank" rel="noopener">doi:10.1103/PhysRev.21.408</a></li>
<li><span class="tag">articolo</span>Makarov A. (2000) Electrostatic axially harmonic orbital trapping: a high-performance technique of mass analysis. <i>Anal. Chem.</i> 72, 1156-1162. <a href="https://doi.org/10.1021/ac991131p" target="_blank" rel="noopener">doi:10.1021/ac991131p</a></li>
<li><span class="tag">articolo</span>Makarov A., Denisov E., Kholomeev A., Balschun W., Lange O., Strupat K., Horning S. (2006) Performance evaluation of a hybrid linear ion trap/Orbitrap mass spectrometer. <i>Anal. Chem.</i> 78, 2113-2120. <a href="https://doi.org/10.1021/ac0518811" target="_blank" rel="noopener">doi:10.1021/ac0518811</a></li>
<li><span class="tag">articolo</span>Michalski A. et al. (2011) Mass spectrometry-based proteomics using Q Exactive, a high-performance benchtop quadrupole Orbitrap mass spectrometer. <i>Mol. Cell. Proteomics</i> 10, M111.011015. <a href="https://doi.org/10.1074/mcp.M111.011015" target="_blank" rel="noopener">doi:10.1074/mcp.M111.011015</a></li>
</ul>
```
