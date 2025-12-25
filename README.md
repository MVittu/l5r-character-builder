# L5R 5e – Character Builder (Gioco delle 20 Domande)

Web app **statica** (solo front-end) per guidare la creazione personaggi con le **20 domande**:
- *Manuale Base* (samurai)
- *Sentiero delle Onde* (rōnin: Regione al posto della Famiglia)

## Avvio in locale

Apri `index.html` con un browser moderno.

> Nota: per funzionare anche da `file://`, la pagina carica i dati da `data/*.js` (wrapper dei JSON).  
> Se preferisci usare fetch sui JSON, avvia un server locale:
```bash
python -m http.server 8000
# poi apri http://localhost:8000/
```

## Pubblicazione su GitHub Pages

1. Crea un repo e carica questi file nella root.
2. GitHub → **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / folder: **/** (root)

## Dati (JSON)

I dataset sono in `data/`:
- `clans.json`
- `families_or_regions.json`
- `schools.json`
- `traits.json`
- `lookups.json`

Per compatibilità con `file://` trovi anche gli equivalenti `*.js`.

### Stato dei dati
- **Clan** e **Regioni rōnin**: popolati.
- **Famiglie**: popolati (estrazione automatica; consigliata una verifica a campione).
- **Scuole/Ordini** (*Manuale Base*): popolati (estrazione automatica; consigliata una verifica a campione).
- **Tratti**: placeholder (da completare).

## Pubblicazione su GitHub Pages (gratis)

### 1) Metti i file su GitHub
Se hai già una repo:
```bash
git clone https://github.com/<TUO-USERNAME>/<NOME-REPO>.git
cd <NOME-REPO>

# copia qui dentro i file di questa cartella (index.html, style.css, data/, src/)
# oppure sostituisci quelli esistenti

git add .
git commit -m "Pubblica builder L5R"
git push
```

### 2) Attiva GitHub Pages
Su GitHub: **Settings → Pages**
- **Source**: “Deploy from a branch”
- **Branch**: `main`
- **Folder**: `/ (root)`

Dopo il deploy, il sito sarà:
- `https://<TUO-USERNAME>.github.io/<NOME-REPO>/`

> Non serve (e non conviene) impostare un **Custom domain** se non possiedi davvero un dominio: altrimenti vedrai errori DNS tipo `NXDOMAIN/InvalidDNSError`.

### 3) Aggiorna il sito
Ogni volta che fai `git push`, GitHub Pages ridistribuisce automaticamente.

## Calcoli

- Anelli base 1
- Bonus da Clan
- Famiglia (samurai) o Regione (rōnin)
- 2 bonus da Scuola (manuale, finché `schools.json` è vuoto)
- Q4: +1 a un anello della scuola

Derivati:
- Tenacia = (Terra + Fuoco) * 2
- Compostezza = (Terra + Acqua) * 2
- Concentrazione = Aria + Fuoco
- Vigilanza = ceil((Aria + Acqua)/2)

## File principali
- `src/rules.js` – calcoli
- `src/ui.js` – helper DOM
- `src/storage.js` – LocalStorage + import/export JSON
- `src/app.js` – stato + rendering UI


## Script di estrazione (Manuale Base → scuole/ordini)

Se vuoi rigenerare `data/schools.json` e `data/schools.js` dal PDF in locale, c'è uno script Python:
```bash
python scripts/extract_schools_base.py "/percorso/La leggenda dei cinque anelli - manuale base.pdf"
```

Lo script produce:
- `data/schools.json`
- `data/schools.js` (wrapper per usare anche `file://`)


## Variante senza cartelle (tutti i file in root)
Questa versione è pronta per essere caricata su GitHub anche senza creare cartelle `data/` e `src/`: gli script sono tutti nella root.
