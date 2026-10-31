# Il modo più semplice per cambiare una pagina

Non serve installare niente. Non serve il terminale. Non serve nessuna password o «token».

## I 5 passi

1. **Apri la pagina** sul sito (https://freeesta.github.io/BasePeak/) e vai a quella che vuoi cambiare.
2. **Sblocca la modifica** (solo la prima volta): premi 5 volte sul logo in alto a sinistra. Compare «Sbloccato». Poi premi **«Modifica questa pagina»** nella barra in alto (oppure Alt+E).
3. **Cambia il testo** come lo vedi, come in Word. Con i bottoni in alto puoi:
   - mettere grassetto, corsivo, pedice (H₂O), apice (10⁻⁵) e collegamenti;
   - fare titoli, sottotitoli ed elenchi;
   - inserire i riquadri pronti: **Concetto chiave**, **Errore frequente**, **In laboratorio**, **Domande di ripasso**;
   - annullare e ripetere.

   Il bottone **«Codice»** mostra il testo con i tag. Dice se hai dimenticato di chiudere un tag.
4. **Premi «Salva e proponi la modifica».** Il file della pagina si scarica da solo e il suo testo viene copiato. Si apre una scheda di GitHub.
5. **Su GitHub** (serve il tuo account):
   1. seleziona tutto il testo (Ctrl+A, su Mac Cmd+A);
   2. incolla (Ctrl+V, su Mac Cmd+V);
   3. scrivi in alto che cosa hai cambiato;
   4. premi «Commit changes…», poi «Propose changes», poi «Create pull request».

Fatto. Il controllo automatico guarda la pagina. Se è tutto a posto, il COO la pubblica. Se compare una X rossa, leggi il messaggio: dice che cosa correggere.

**Caso normale:** se hai cambiato un **titolo** o una **parola del glossario**, la X rossa dice che l'indice di ricerca o il glossario non sono aggiornati. Non hai sbagliato niente. Scrivi a Claude: «rigenera gli indici della mia modifica (PR n)» (al posto di n il numero della tua pull request). Il COO li aggiorna. Se cambi solo il testo dei paragrafi, questo non succede.

## Se preferisci scrivere a Claude

Puoi anche **non toccare niente**. Scrivi nella chat del COO che cosa vuoi cambiare. Per esempio:

> Nel capitolo 5, nella sezione «La sorgente EI», cambia «vuoto» in «alto vuoto» e aggiungi un riquadro «Errore frequente» su …

Claude fa la modifica, il controllo automatico la guarda, il COO la pubblica.

## Se qualcosa non va

- **Non vedo «Modifica questa pagina».** Premi 5 volte sul logo. Se hai già sbloccato, premi di nuovo 5 volte: è un interruttore.
- **Ho aperto la pagina dal disco (doppio clic).** Va bene. Quando salvi, la pagina ti chiede di scegliere una volta il suo file nella cartella BasePeak del tuo computer.
- **Il pulsante dice «Correggi gli errori».** Il testo ha un errore (per esempio un tag aperto e mai chiuso). Il messaggio dice la riga e che cosa fare.
- **Non hai cambiato niente?** Il pulsante lo dice: non c'è niente da proporre.
- **Le figure interattive non si cambiano qui.** Sono segnate «Figura interattiva: qui non si modifica». Il resto della pagina sì.
- **Ho lasciato «Scrivi qui il testo.» in un riquadro.** Il controllo se ne accorge: sostituisci la frase o togli il riquadro.
- **Il controllo automatico dice che l'indice di ricerca o il glossario non sono aggiornati.** È normale dopo aver cambiato un titolo o una parola del glossario. Scrivi a Claude: «rigenera gli indici della mia modifica (PR n)».
- **Opzionale, per chi ha il server locale.** Con `python3 tools/server_teoria.py` compare anche **«Salva su questo computer»**: scrive il file nella cartella, senza pubblicare niente. Senza server non serve.

---

# Per chi modifica i file a mano

Il resto di questa guida serve se preferisci un editor di testo. Non c'è niente da compilare: modifichi, salvi, ricarichi la pagina nel browser.

## Com'è organizzato il sito

| Cartella | Contenuto |
|---|---|
| `index.html` | introduzione e mappa del percorso (pagina iniziale) |
| `capitoli/` | un file HTML per capitolo: **è l'unica fonte del testo**. `capitoli/src/` ha i vecchi gemelli Markdown: non si aggiornano più, non servono a niente e si cancelleranno |
| `pratica/` | le pagine della Pratica (`index.html`, `ei.html`, ...) e il codice e i dati dei giochi |
| `assets/` | stile, motore JavaScript, caratteri, icone, librerie di terzi (`vendor/`), indice di ricerca e glossario generati |
| `tools/`, `tests/`, `tests_e2e/`, `docs/` | script, controlli, guide: non fanno parte del sito |
| `editor/` | editor dei capitoli: **non è pubblicato** (vedi in fondo) |

Sul sito (https://freeesta.github.io/BasePeak/) arrivano solo `index.html`, `capitoli/`, `pratica/` e `assets/`. I collegamenti sono sempre relativi (`../assets/teoria.css`, mai `/assets/...`): così le pagine si aprono anche con doppio clic dal disco.

## Quale file aprire

| Che cosa | File |
|---|---|
| Introduzione e mappa | `index.html` |
| Capitoli 1–21 | `capitoli/01-cromatografia.html` … `capitoli/21-tempi.html` (il numero del capitolo è nel nome del file e va da 1 a 32 senza buchi, contando anche la parte VII; i vecchi nomi, come `capitoli/04-lc.html` o `capitoli/06-quadrupolo.html`, sono rimandi automatici al nuovo capitolo) |
| Pratica (giochi ed esercizi) | `pratica/index.html` (pagina iniziale), `pratica/ei.html`, `pratica/perdite.html`, `pratica/isotopi.html`, `pratica/formula.html`, `pratica/strumento.html`, `pratica/quadrupolo.html`, `pratica/tp.html`; codice e dati negli stessi file `.js` di `pratica/` |
| Spettri EI dei capitoli 13-14 e del gioco | `pratica/ei-dati.js` e `pratica/ei-dati-l1.js`…`l5.js` (da MassBank Europe; struttura e come aggiungerne uno a mano: `docs/DATI-EI.md`) |
| Glossario (parole sottolineate nel testo) | `capitoli/19-glossario.html`, poi `python3 tools/genera_glossario.py` (crea `assets/glossario-dati.js`) e `python3 tools/genera_indice_teoria.py` (ricerca: `assets/indice-ricerca.js`) |
| Elenco dei capitoli nel menu laterale | `assets/teoria.js`, in alto: lista `CHAPTERS` (i file sono scritti a partire dalla cartella principale: `capitoli/02-lc.html`, `pratica/ei.html`) |
| Menu laterale (a tutta altezza, con logo e nome in cima; la barra degli strumenti sta alla sua destra) | l'ordine di `CHAPTERS` è l'ordine del menu e dei link Precedente/Successivo: prima la Teoria (con le parti «Guida», «II. …», … «VII. …», ognuna chiudibile con il suo pulsante), poi le pagine di `pratica/` («Pratica»), poi i capitoli con parte `"Reference"` (glossario, formulario, tempi). Si apre da sola la parte del capitolo che stai leggendo, con le sue sezioni; le altre sono chiuse; «Apri tutto / Chiudi tutto» le apre o chiude tutte; la scelta resta per la durata della scheda (`sessionStorage`). Le sezioni (h2 e h3) del capitolo aperto, le ancore `#` sui titoli e le briciole di pane sono generate da `assets/teoria.js` dai titoli della pagina: nei capitoli non c'è niente da scrivere |
| Pulsante «Scarica» (menu laterale) | `assets/esporta.js`: capitolo singolo o tutta la Teoria in PDF (finestra di stampa), Markdown, Word (`.doc`) e HTML (un solo file, leggibile offline); i file sono generati dalle pagine così come si vedono (i sorgenti `capitoli/src/` non sono pubblicati). Il pacchetto completo si crea solo dal sito (o dal server locale): dal disco con doppio clic il browser non lascia leggere gli altri capitoli, e il pulsante lo dice senza creare file a metà |
| Parte VII, Chemioinformatica (capitoli 22–32) | `capitoli/22-segnale.html`, `23-formati`, `24-tracce`, `25-picchi`, `26-gruppi`, `27-tabella`, `28-somiglianza`, `29-librerie`, `30-candidati`, `31-confidenza`, `32-esempio` (sorgenti Markdown in `capitoli/src/`). Il disegno è in `docs/piani/chemioinformatica.md`; le letture verificate in `docs/piani/riferimenti-chemioinformatica.tsv` |
| Figure della parte VII | `assets/chemi-common.js` (funzioni comuni e caricamento al bisogno) e un file per capitolo: `sim-chemi-segnale.js` e `sim-chemi-formati.js` (cap. 22-23), `sim-chemi-tracce.js` e `sim-chemi-picchi.js` (24-25), `sim-chemi-gruppi.js`, `sim-chemi-tabella.js` e `sim-chemi-esplora.js` (26-27), `sim-chemi-somiglianza.js` e `sim-chemi-librerie.js` (28-29), `sim-chemi-candidati.js` e `sim-chemi-confidenza.js` (30-31), `sim-chemi-esempio.js` (32) |
| Colori, caratteri, aspetto dei riquadri | `assets/teoria.css` |
| Figure interattive (calcoli e grafici) | in `assets/`: `sim-quad.js`, `sim-esi.js`, `sim-qqq.js`, `sim-frag.js`, `sim-misc.js`, `sim-chrom.js` (cromatografia), `sim-ei.js` (EI), `sim-hr.js` (risoluzione e formule) |

Per il testo servono solo i file `.html` di `capitoli/`. I `.js` vanno toccati solo per cambiare le figure interattive. I file `capitoli/src/*.md` non vanno modificati: nessun controllo li legge più come fonte.

## Con che cosa

Un editor di testo semplice: Visual Studio Code (consigliato, colora i tag e segnala gli errori), BBEdit, oppure TextEdit **in modalità testo semplice** (Formato > Converti in testo normale; in Preferenze, "Apri file HTML come codice HTML"). Non Word.

Per vedere la modifica: apri il file con doppio clic e ricarica con Cmd+R.

## Dove sta il testo

Il testo è tra i "tag" `<…>`. Si cambia il testo, si lasciano i tag. Ogni tag aperto va chiuso: `<p>` … `</p>`.

```html
<h2>Titolo di sezione</h2>
<h3>Sottotitolo</h3>
<p>Un paragrafo con <b>grassetto</b>, <i>corsivo</i>, H<sub>2</sub>O, 10<sup>−5</sup>.</p>
<ul><li>punto elenco</li><li>altro punto</li></ul>       (<ol> per l'elenco numerato)
<a href="06-quadrupolo.html">link a un capitolo</a>
<a href="https://doi.org/..." target="_blank" rel="noopener">link esterno</a>
```

Caratteri speciali: si possono scrivere direttamente (à è ≈ → Δ λ ±), il file è UTF-8. Gli unici da evitare nel testo sono `<` e `&`: scrivi `&lt;` e `&amp;`.

## I blocchi già pronti (copia e incolla)

```html
<div class="box key"><b>Concetto chiave</b><p>Testo.</p></div>        riquadro blu
<div class="box warn"><b>Errore frequente</b><p>Testo.</p></div>      riquadro arancione
<div class="box lab"><b>In laboratorio</b><p>Testo.</p></div>         riquadro verde
<div class="box math"><b>Derivazione</b><p>Testo.</p></div>           riquadro viola
<div class="box lr">…</div> <div class="box hr">…</div>              bassa / alta risoluzione (dentro <div class="duo"> stanno affiancati)
<details class="poe"><summary>Prevedi, poi guarda</summary><p>…</p></details>   domanda prima di una figura
<div class="eispec" data-ei="2-esanone" data-keys="1"></div>        spettro EI vero (id in pratica/ei-dati.js)

<span class="eq">a = b + c<span class="no">(6.1)</span></span>         equazione centrata con numero
<span class="frac"><span>numeratore</span><span>denominatore</span></span>   frazione

<table>
<tr><th>Colonna 1</th><th class="n">Numeri</th></tr>
<tr><td>testo</td><td class="n">1,23</td></tr>
</table>                                         class="n" allinea i numeri a destra

<details class="q"><summary>Domanda?</summary>
<p>Risposta, nascosta finché lo studente non clicca.</p></details>

<li><span class="tag">articolo</span>Autore A. (anno) Titolo. <i>Rivista</i> vol, pagine. <a href="https://doi.org/..." target="_blank" rel="noopener">doi:...</a></li>
```

## Figure

- Gli schemi disegnati (`<svg>` … `</svg>`) sono dentro i capitoli. Le scritte sono nei `<text …>testo</text>`: si possono correggere; le coordinate (`x=`, `y=`) spostano le scritte.
- Le figure interattive sono i riquadri `<div class="sim" id="sim-...">`: nel capitolo si cambiano titolo (`<h4>`) e nota; il calcolo sta nel file `sim-*.js` indicato in fondo al capitolo (`<script src="../assets/sim-....js">`).
- Per aggiungere un'immagine: metti il file (`.png` o `.svg`) in `assets/img/` (la cartella si crea al primo uso) e scrivi
  `<figure><img src="../assets/img/nome.png" alt="descrizione" style="max-width:100%"><figcaption><b>Figura X</b> Didascalia.</figcaption></figure>`

## Aggiungere o togliere un capitolo

1. Copia un capitolo esistente in `capitoli/`, rinominalo (es. `capitoli/22-nuovo.html`), cambia `kicker`, `<h1>` e testo. Oppure `python3 tools/nuovo_capitolo.py 22 nuovo "Titolo"` crea lo scheletro.
2. In `assets/teoria.js` aggiungi una riga alla lista `CHAPTERS`: `["capitoli/22-nuovo.html", "22", "Titolo nel menu", "IV. Analizzare gli ioni"],` (l'ultimo campo è la parte del percorso: il menu mette un titoletto quando cambia)
3. Se vuoi, aggiungi una scheda in `index.html` (sezione "I capitoli").
4. Rigenera la ricerca: `python3 tools/genera_indice_teoria.py` (e il glossario, se l'hai toccato).

Menu laterale, indice della pagina e pulsanti avanti/indietro si aggiornano da soli.

### Capitoli in bozza (visibili solo all'amministratore)

Un capitolo non finito non deve vedersi ai lettori, e non deve mai contenere un riquadro «in costruzione». Per nasconderlo basta un quinto campo `true` nella sua riga di `CHAPTERS`: `["capitoli/22-segnale.html", "22", "Titolo", "VII. Chemioinformatica", true],`. Con la modalità amministratore spenta (chiave `mzlab.admin` in `localStorage`, 5 clic sul logo) il capitolo sparisce da menu, percorso, avanti/indietro, schede della home (con il titolo della parte, se resta senza schede, e il conto «Sei parti di teoria», che per i lettori diventa «Cinque»), ricerca e rimandi del glossario; chi ne apre l'indirizzo a mano trova solo l'avviso «Questa pagina non è ancora pubblicata» con il collegamento alla home (l'avviso lo scrive `teoria.js`, non il capitolo). Per **pubblicare** il capitolo si toglie `true` dalla riga: nient'altro da cambiare. Il test `tests/test_numerazione.py` rifiuta la pubblicazione se il file contiene «in costruzione».

## L'icona del sito

Sta in `assets/icone/` (`icon.svg` scritta a mano, più i PNG), con `assets/favicon.ico` e `assets/site.webmanifest`. Ogni pagina ha nell'`<head>` i link all'icona (un capitolo creato con `tools/nuovo_capitolo.py` li ha già; se copi un capitolo a mano restano quelli del capitolo copiato). Per cambiarla: modifica `assets/icone/icon.svg` e lancia `python3 tools/genera_icone.py` (serve Pillow, solo qui): rigenera PNG e `.ico`, che si committano. `python3 -m pytest -q tests/test_icone.py` controlla link e dimensioni.

## Da non cambiare

- Le prime righe (`<!doctype …>` … `<main>`) e le ultime (`</main>` … `</html>`) di ogni capitolo, e i percorsi `../assets/...` e `../pratica/...` che contengono.
- Gli `id="sim-..."` delle figure interattive: li usano i file `.js`.

## Figure caricate al bisogno (parte VII)

Nei capitoli 22–32 il file di una figura non si collega in fondo alla pagina: il riquadro dichiara dove sta il suo codice e `assets/chemi-common.js` lo carica solo quando il lettore scorre vicino alla figura (circa 600 px prima).

```html
<div class="sim" id="sim-chemi-xic" data-sim="../assets/sim-chemi-tracce.js" data-preset="esempio"><h4>Figura 24.1 La finestra in ppm</h4>
<p class="note nota">Che cosa mostra la figura. Dati sintetici, a scopo didattico.</p></div>
```

- `data-sim` è il percorso del file `.js` (mai un `<script src="../assets/sim-chemi-...">` nel capitolo: un test lo rifiuta); più figure possono usare lo stesso file, che viene caricato una volta sola.
- `data-preset` è facoltativo: il nome di un gruppo di valori iniziali, registrato con `CHEMI.preset("nome", {...})` e passato alla figura come secondo argomento.
- Il file della figura registra ogni suo riquadro con `CHEMI.register("sim-chemi-xic", (el, preset) => { ... })`. Quando il file è caricato il riquadro riceve `data-ready="1"` (anche se il file non ha registrato nulla ancora).
- I dati sono sempre sintetici e generati con `CHEMI.rng(seme)`: stesso seme, stessi numeri. Ogni grafico ha un'alternativa testuale (`CHEMI.table`) e una riga di sintesi in `div.readout`.
- Limiti controllati dai test (`tests/test_chemi.py`): `chemi-common.js` al massimo 4 KB compresso, ogni file `sim-chemi-*.js` al massimo 15 KB compresso, ogni capitolo al massimo 40 KB, niente indirizzi `http://` o `https://` nei file `.js`.

## Se qualcosa si rompe

- Pagina vuota o figure sparite: di solito un tag non chiuso o un `"` mancante vicino all'ultima modifica.
- In Visual Studio Code i tag non chiusi sono evidenziati.
- Prima di modifiche grosse, fai un commit git (o copia il file): così puoi sempre tornare indietro.
- Controllo veloce degli errori tipici di chi scrive a mano (tag non chiusi, id doppi, collegamenti rotti, salti di titolo, immagini senza `alt`, «in costruzione»; messaggi in italiano): `python3 tools/controlla_modifica.py`. Controllo completo (opzionale): `python3 -m pytest -q tests` dalla cartella del programma verifica, tra l'altro, che ogni collegamento (`href`, `src`, `@import`) di ogni pagina, foglio di stile e script del sito punti a un file che esiste (`tests/test_integrita_sito.py`). Per il controllo dei capitoli: `python3 tools/controlla_teoria.py`.

## La Pratica

- Ogni gioco (in `pratica/`) salva i progressi solo nel browser (`localStorage`, chiave `qqq.pratica`): nessun dato esce dal computer, nessuna classifica.
- Il motore comune è `pratica/motore.js` (livello per competenza con una regola tipo Elo, ripasso distanziato 1-3-7-21 giorni, codici sfida, conti chimici). I giochi brevi sono in `pratica/giochi.js`, il gioco EI in `pratica/gioco-ei.js`.
- Il gioco EI e l'editor di strutture funzionano dal sito (o da un server locale, per esempio `python3 -m http.server` dalla cartella principale), non da un file aperto con doppio clic (il browser blocca i moduli JavaScript da `file://`). I capitoli e gli altri giochi funzionano anche da disco.
- Spettri: solo da MassBank (licenza CC BY-NC-SA, fonte indicata sotto ogni spettro), mai dalla libreria NIST. Mai usare composti dei metodi del laboratorio.

## L'editor dei capitoli (`editor/`)

La cartella `editor/` contiene l'editor dei capitoli (pagina `editor/teoria.html`), spostato qui senza modifiche. **Non è pubblicato** sul sito: il workflow `pages.yml` copia solo `index.html`, `capitoli/`, `pratica/` e `assets/`. I suoi file scrivono ancora i percorsi del vecchio layout (`mzlab/web/teoria/...`) e cercano le librerie in `vendor/libro/`, che non è nel repository: va adattato prima di usarlo con questa struttura.

## Server locale per modificare nel browser

`python3 tools/server_teoria.py` serve il sito su http://127.0.0.1:8765 (solo `index.html`, `capitoli/`, `pratica/`, `assets/`). **È facoltativo**: l'editor funziona anche senza. Se c'è, e apri la pagina con l'indirizzo con il token che stampa all'avvio, compare il pulsante «Salva su questo computer» (scrive il file nella cartella, senza `git` e senza pubblicare).
