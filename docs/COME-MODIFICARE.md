# Come modificare la Teoria

Non c'è niente da compilare: modifichi, salvi, ricarichi la pagina nel browser.

## Com'è organizzato il sito

| Cartella | Contenuto |
|---|---|
| `index.html` | introduzione e mappa del percorso (pagina iniziale) |
| `capitoli/` | un file HTML per capitolo; `capitoli/src/` ha i sorgenti Markdown |
| `pratica/` | le pagine della Pratica (`index.html`, `ei.html`, ...) e il codice e i dati dei giochi |
| `assets/` | stile, motore JavaScript, caratteri, icone, librerie di terzi (`vendor/`), indice di ricerca e glossario generati |
| `tools/`, `tests/`, `tests_e2e/`, `docs/` | script, controlli, guide: non fanno parte del sito |
| `editor/` | editor dei capitoli: **non è pubblicato** (vedi in fondo) |

Sul sito (https://freeesta.github.io/BasePeak/) arrivano solo `index.html`, `capitoli/`, `pratica/` e `assets/`. I collegamenti sono sempre relativi (`../assets/teoria.css`, mai `/assets/...`): così le pagine si aprono anche con doppio clic dal disco.

## Quale file aprire

| Che cosa | File |
|---|---|
| Introduzione e mappa | `index.html` |
| Capitoli 3–23 | `capitoli/03-cromatografia.html` … `capitoli/23-tempi.html` (i capitoli 1 e 2, Prodotti di trasformazione e Fotocatalisi, sono stati tolti; il numero è nel nome; i vecchi nomi, come `capitoli/06-quadrupolo.html`, sono rimandi automatici al nuovo capitolo) |
| Pratica (giochi ed esercizi) | `pratica/index.html` (pagina iniziale), `pratica/ei.html`, `pratica/orale.html`, `pratica/perdite.html`, `pratica/isotopi.html`, `pratica/formula.html`, `pratica/strumento.html`, `pratica/quadrupolo.html`, `pratica/tp.html`; codice e dati negli stessi file `.js` di `pratica/` |
| Domande di ripasso (testo e punti della risposta) | `pratica/domande.js` |
| Spettri EI dei capitoli 15-16 e del gioco | `pratica/ei-dati.js` e `pratica/ei-dati-l1.js`…`l5.js` (da MassBank Europe; struttura e come aggiungerne uno a mano: `docs/DATI-EI.md`) |
| Glossario (parole sottolineate nel testo) | `capitoli/21-glossario.html`, poi `python3 tools/genera_glossario.py` (crea `assets/glossario-dati.js`) e `python3 tools/genera_indice_teoria.py` (ricerca: `assets/indice-ricerca.js`) |
| Elenco dei capitoli nel menu laterale | `assets/teoria.js`, in alto: lista `CHAPTERS` (i file sono scritti a partire dalla cartella principale: `capitoli/04-lc.html`, `pratica/ei.html`) |
| Colori, caratteri, aspetto dei riquadri | `assets/teoria.css` |
| Figure interattive (calcoli e grafici) | in `assets/`: `sim-quad.js`, `sim-esi.js`, `sim-qqq.js`, `sim-frag.js`, `sim-misc.js`, `sim-chrom.js` (cromatografia), `sim-ei.js` (EI), `sim-hr.js` (risoluzione e formule) |

Per il testo servono solo i file `.html` di `capitoli/`. I `.js` vanno toccati solo per cambiare le figure interattive.

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
<div class="box oral"><b>Domande di ripasso</b><p>Testo.</p></div>     quesiti e concetti chiave di verifica
<div class="box lr">…</div> <div class="box hr">…</div>              bassa / alta risoluzione (dentro <div class="duo"> stanno affiancati)
<details class="poe"><summary>Prevedi, poi guarda</summary><p>…</p></details>   domanda prima di una figura
<div class="eispec" data-ei="2-esanone" data-keys="1"></div>        spettro EI vero (id in pratica/ei-dati.js)

<span class="eq">a = b + c<span class="no">(6.1)</span></span>         equazione centrata con numero
<span class="frac"><span>numeratore</span><span>denominatore</span></span>   frazione

<table>
<tr><th>Colonna 1</th><th class="n">Numeri</th></tr>
<tr><td>testo</td><td class="n">1,23</td></tr>
</table>                                         class="n" allinea i numeri a destra

<details class="q"><summary>Domanda di verifica?</summary>
<p>Risposta, nascosta finché lo studente non clicca.</p></details>

<li><span class="tag">articolo</span>Autore A. (anno) Titolo. <i>Rivista</i> vol, pagine. <a href="https://doi.org/..." target="_blank" rel="noopener">doi:...</a></li>
```

## Figure

- Gli schemi disegnati (`<svg>` … `</svg>`) sono dentro i capitoli. Le scritte sono nei `<text …>testo</text>`: si possono correggere; le coordinate (`x=`, `y=`) spostano le scritte.
- Le figure interattive sono i riquadri `<div class="sim" id="sim-...">`: nel capitolo si cambiano titolo (`<h4>`) e nota; il calcolo sta nel file `sim-*.js` indicato in fondo al capitolo (`<script src="../assets/sim-....js">`).
- Per aggiungere un'immagine: metti il file (`.png` o `.svg`) in `assets/img/` (la cartella si crea al primo uso) e scrivi
  `<figure><img src="../assets/img/nome.png" alt="descrizione" style="max-width:100%"><figcaption><b>Figura X</b> Didascalia.</figcaption></figure>`

## Aggiungere o togliere un capitolo

1. Copia un capitolo esistente in `capitoli/`, rinominalo (es. `capitoli/12-nuovo.html`), cambia `kicker`, `<h1>` e testo. Oppure `python3 tools/nuovo_capitolo.py 12 nuovo "Titolo"` crea lo scheletro.
2. In `assets/teoria.js` aggiungi una riga alla lista `CHAPTERS`: `["capitoli/12-nuovo.html", "12", "Titolo nel menu", "IV. Analizzare gli ioni"],` (l'ultimo campo è la parte del percorso: il menu mette un titoletto quando cambia)
3. Se vuoi, aggiungi una scheda in `index.html` (sezione "I capitoli").
4. Rigenera la ricerca: `python3 tools/genera_indice_teoria.py` (e il glossario, se l'hai toccato).

Menu laterale, indice della pagina e pulsanti avanti/indietro si aggiornano da soli.

## L'icona del sito

Sta in `assets/icone/` (`icon.svg` scritta a mano, più i PNG), con `assets/favicon.ico` e `assets/site.webmanifest`. Ogni pagina ha nell'`<head>` i link all'icona (un capitolo creato con `tools/nuovo_capitolo.py` li ha già; se copi un capitolo a mano restano quelli del capitolo copiato). Per cambiarla: modifica `assets/icone/icon.svg` e lancia `python3 tools/genera_icone.py` (serve Pillow, solo qui): rigenera PNG e `.ico`, che si committano. `python3 -m pytest -q tests/test_icone.py` controlla link e dimensioni.

## Da non cambiare

- Le prime righe (`<!doctype …>` … `<main>`) e le ultime (`</main>` … `</html>`) di ogni capitolo, e i percorsi `../assets/...` e `../pratica/...` che contengono.
- Gli `id="sim-..."` delle figure interattive: li usano i file `.js`.

## Se qualcosa si rompe

- Pagina vuota o figure sparite: di solito un tag non chiuso o un `"` mancante vicino all'ultima modifica.
- In Visual Studio Code i tag non chiusi sono evidenziati.
- Prima di modifiche grosse, fai un commit git (o copia il file): così puoi sempre tornare indietro.
- Controllo automatico (opzionale): `python3 -m pytest -q tests` dalla cartella del programma verifica, tra l'altro, che ogni collegamento (`href`, `src`, `@import`) di ogni pagina, foglio di stile e script del sito punti a un file che esiste (`tests/test_integrita_sito.py`). Per il controllo dei capitoli: `python3 tools/controlla_teoria.py`.

## La Pratica

- Ogni gioco (in `pratica/`) salva i progressi solo nel browser (`localStorage`, chiave `qqq.pratica`): nessun dato esce dal computer, nessuna classifica.
- Il motore comune è `pratica/motore.js` (livello per competenza con una regola tipo Elo, ripasso distanziato 1-3-7-21 giorni, codici sfida, conti chimici). I giochi brevi sono in `pratica/giochi.js`, il gioco EI in `pratica/gioco-ei.js`.
- Le domande di ripasso si gestiscono in `pratica/domande.js`: ogni domanda ha un `id` (non cambiarlo: i progressi sono salvati per id), un'area, il capitolo dove sta la risposta (scritto come `capitoli/NN-nome.html`) e i punti di una risposta completa.
- Il gioco EI e l'editor di strutture funzionano dal sito (o da un server locale, per esempio `python3 -m http.server` dalla cartella principale), non da un file aperto con doppio clic (il browser blocca i moduli JavaScript da `file://`). I capitoli e gli altri giochi funzionano anche da disco.
- Spettri: solo da MassBank (licenza CC BY-NC-SA, fonte indicata sotto ogni spettro), mai dalla libreria NIST. Mai usare composti dei metodi del laboratorio.

## L'editor dei capitoli (`editor/`)

La cartella `editor/` contiene l'editor dei capitoli (pagina `editor/teoria.html`), spostato qui senza modifiche. **Non è pubblicato** sul sito: il workflow `pages.yml` copia solo `index.html`, `capitoli/`, `pratica/` e `assets/`. I suoi file scrivono ancora i percorsi del vecchio layout (`mzlab/web/teoria/...`) e cercano le librerie in `vendor/libro/`, che non è nel repository: va adattato prima di usarlo con questa struttura.

## Server locale per modificare nel browser

`python3 tools/server_teoria.py` serve il sito su http://127.0.0.1:8765 (solo `index.html`, `capitoli/`, `pratica/`, `assets/`) e permette di salvare le pagine di `capitoli/` e `pratica/` dal modo modifica (Alt+E).
