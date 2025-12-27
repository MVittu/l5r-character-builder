# L5R 5e (IT) — Builder automatico personaggi (Gioco delle 20 Domande)

Builder online per creare personaggi di **La Leggenda dei Cinque Anelli – 5ª Edizione** in **italiano**, a partire dal **1° grado**, seguendo il flusso del **“Gioco delle 20 Domande”**.

Sito (GitHub Pages): `[L5R 5e • Builder](https://mvittu.github.io/l5r-character-builder/)`

---

## Mission

Non avendo trovato un builder che soddisfacesse queste esigenze, l’obiettivo del progetto è creare un **builder automatico online** in italiano per L5R 5e che:

- guidi l’utente passo-passo con le **20 domande**
- lasci manuali solo i punti in cui le regole richiedono una **scelta** (liste, alternative “O”, selezioni vincolate)
- calcoli automaticamente tutto il resto per un personaggio di **primo grado** della sua scuola (con riepilogo e breakdown)

---

## Cosa fa (oggi)

- Creazione personaggio via “20 domande”
- Calcolo Anelli con breakdown delle fonti (Clan / Famiglia o Regione / Scuola / Q4)
- Calcolo derivate (Tenacia, Compostezza, Concentrazione, Vigilanza, Vuoto)
- Scelte alternative “O” (se implementate nelle singole domande) come selezione esclusiva
- Scelte abilità (incrementi) da liste definite
- Filtri di coerenza (es. scuole filtrate per clan quando disponibile nel dataset)
- Salvataggio locale (LocalStorage)
- Import/Export JSON

Nota: il progetto è “no-backend”: nessun account, nessun server, nessuna persistenza remota.

---

## Come usare

1. Apri il sito.
2. Seleziona le opzioni a lista (Clan, Famiglia/Regione, Scuola, ecc.).
3. Nei punti con alternative “O”, seleziona una sola ricompensa.
4. Usa Salva/Carica (LocalStorage) oppure Esporta/Importa JSON.
5. Trascrivi i risultati sulla scheda ufficiale (vedi sezione “Trascrizione sulla scheda”, in roadmap).

---

## Pubblicazione su GitHub Pages

Impostazione standard consigliata:

1. Repository → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`
4. **Folder**: `/ (root)`

Documentazione GitHub:
- Configurare la sorgente di pubblicazione: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Nota: se non possiedi un dominio, non impostare “Custom domain”. Per troubleshooting:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages

---

## Struttura del progetto

Per semplicità (e per gestire modifiche anche via interfaccia web GitHub), attualmente i file sono in **root**.

### File principali
- `index.html` — entry point
- `style.css` — stile
- `app.js` — stato applicazione + rendering + orchestrazione eventi
- `ui.js` — helper DOM (componenti base)
- `storage.js` — salvataggio/caricamento + import/export JSON
- `rules.js` — logica regole e calcoli (Anelli, derivate, social stats, ecc.)

### Dataset (front-end)
- `lookups.js`
- `clans.js`
- `families_or_regions.js`
- `schools.js`
- `traits.js`
- `skills.js`
- `school_starting_skills.js`

---

## Prossimi passi (breve periodo)

1. Riordinare i file in cartelle:
   - `src/` (app, ui, rules, storage)
   - `data/` (dataset)
2. Aggiornare `index.html` per puntare ai nuovi path
3. Completare le parti mancanti dei Rōnin (Sentiero delle Onde):
   - dati e vincoli specifici
   - differenze di flusso (gloria/status/onore per ronin se applicabili nel dataset)
   - scuole/percorsi ronin e relative scelte

---

## Miglioramento a lungo termine (bottom line)

Obiettivo: implementare tutto ciò che è descritto almeno dai manuali di riferimento (base + ronin), includendo progressione oltre il primo grado.

- Supporto progressione oltre il 1° grado di scuola (avanzamenti, tecniche, vincoli)
- Wiki consultabile durante la creazione:
  - regole contestuali per ogni domanda
  - spiegazioni brevi e riferimenti rapidi
- Guida completa “Trascrizione sulla scheda ufficiale”:
  - mappatura output builder → campi scheda (es. Passione → sezione Passione)
  - istruzioni pratiche per riportare Anelli/Abilità/Tecniche/Onore/Gloria/Status
  - note su eventuali differenze di terminologia tra builder e scheda

---

## Contribuire

Contributi benvenuti, in particolare su:
- correzione/normalizzazione dataset
- vincoli di coerenza (filtri clan/famiglie/scuole, scelte “O”, scelte anelli)
- UX (accessibilità, chiarezza, performance, stabilità focus/scroll)
- test manuali e casi limite

### Regole base per contribuire (standard)
1. Apri una Issue prima di grandi cambiamenti (dataset estesi, refactor strutturali).
2. Usa PR piccole e mirate.
3. Mantieni compatibilità: browser moderni, niente dipendenze backend.
4. Niente testo “copiato” dai manuali oltre il minimo indispensabile per calcolo e selezione.
5. Aggiorna sempre il README quando introduci nuove regole/feature visibili.

### Stile e qualità
- JavaScript: vanilla, leggibile, funzioni piccole, nomi chiari
- Evita side-effects nascosti; preferisci calcoli puri in `rules.js`
- Mantieni i nomi nel dataset coerenti (stringhe identiche tra `skills.js` e riferimenti scuola)
- Se tocchi dataset, aggiungi un controllo manuale minimo (aprire la pagina e verificare flusso)

### Convenzioni commit
- Messaggi al presente e descrittivi:
  - `Fix focus loss on free text inputs`
  - `Add school starting skills for Crane schools`
  - `Refactor: move datasets into data/ folder`

### File utili per contributor
GitHub permette di mostrare automaticamente le linee guida se presenti:
- `CONTRIBUTING.md` in root / `docs/` / `.github/`
Documentazione: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors

---

## Note legali (importanti)

Questo progetto è un’opera realizzata da fan e non è affiliata, sponsorizzata o approvata dai titolari dei diritti di **Legend of the Five Rings**.

- I nomi dei prodotti e i marchi citati appartengono ai rispettivi proprietari.
- Possedere una copia fisica dei manuali non implica automaticamente il diritto di ridistribuire contenuti coperti da copyright.
- Scopo del progetto: fornire uno strumento di calcolo/compilazione, evitando la riproduzione di testo esteso dei manuali.

Linee guida interne per restare su un terreno prudente:
- includere nel repository solo dati minimi necessari (identificativi, valori numerici, liste brevi di opzioni)
- evitare scansioni, estratti lunghi, descrizioni complete di tecniche, tabelle testuali estese
- evitare la pubblicazione di materiale che sostituisca di fatto il manuale

Se sei titolare di diritti e ritieni che un contenuto violi i tuoi diritti, apri una Issue o contatta i maintainer per la rimozione/correzione.

---

## Licenza del codice

Salvo diversa indicazione, il codice di questo repository è rilasciato sotto **GNU General Public License v3.0 (GPL-3.0)**.

- Il testo completo della licenza è nel file `/License/LICENSE.md`.
- La GPL consente anche l’uso commerciale, ma richiede che le redistribuzioni e le modifiche rispettino i termini della licenza (copyleft).
- Questa licenza riguarda esclusivamente il **codice** di questo repository.

## Note su proprietà intellettuale e manuali

Questo progetto è un’opera realizzata da fan e non è affiliata né approvata dai titolari dei diritti di *Legend of the Five Rings*.

- Nomi e marchi citati appartengono ai rispettivi proprietari.
- Il repository non intende sostituire i manuali: include soltanto dati minimi necessari al funzionamento del builder (valori, liste e metadati), evitando la riproduzione di testo esteso.
- Il maintainer possiede una copia fisica dei manuali usati come riferimento; ciò non trasferisce diritti di ridistribuzione dei contenuti protetti.
