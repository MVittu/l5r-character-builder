# L5R 5e – Character Builder (Gioco delle 20 Domande)

Web app **statica** per guidare la creazione personaggi con le **20 domande**:
- *Manuale Base* (samurai)
- *Sentiero delle Onde* (rōnin: Regione al posto della Famiglia)

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
