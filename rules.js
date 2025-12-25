// rules.js
(function () {
  const RINGS = ["Aria", "Acqua", "Fuoco", "Terra", "Vuoto"];

  function emptyRings() {
    const r = {};
    RINGS.forEach((k) => (r[k] = 1));
    return r;
  }

  function add(rings, ringName, amount, source, breakdown) {
    if (!ringName || !RINGS.includes(ringName)) return;
    rings[ringName] += amount;
    breakdown[ringName] = breakdown[ringName] || [];
    breakdown[ringName].push({ amount, source });
  }

  function getClan(state, db) {
    return db?.clans?.find((c) => c.id === state.clanId) || null;
  }

  function getFamily(state, db) {
    return (
      db?.families_or_regions?.find(
        (x) => x.type === "family" && x.id === state.familyId
      ) || null
    );
  }

  function getRegion(state, db) {
    return (
      db?.families_or_regions?.find(
        (x) => x.type === "region" && x.id === state.regionId
      ) || null
    );
  }

  function getSchool(state, db) {
    return db?.schools?.find((s) => s.id === state.schoolId) || null;
  }

  // Auto: se ho 1 sola opzione e l’utente non ha scelto, prendo quella
  function resolveSingleOption(choice, options) {
    if (choice && RINGS.includes(choice)) return choice;
    if (Array.isArray(options) && options.length === 1 && RINGS.includes(options[0])) {
      return options[0];
    }
    return null;
  }

  // --- BONUS ANELLI ---
  function computeRings(state, db) {
    const rings = emptyRings();
    const breakdown = {};

    // Q1 Clan
    const clan = getClan(state, db);
    if (clan && clan.ringBonus) {
      add(rings, clan.ringBonus, 1, `Clan: ${clan.name}`, breakdown);
    }

    // Q2 Famiglia (Samurai) / Regione (Rōnin)
    if (state.clanId === "ronin") {
      const region = getRegion(state, db);
      if (region) {
        // region.ringBonusOptions: ["Aria","Terra"] ecc.
        const chosen = resolveSingleOption(state.regionRingChoice, region.ringBonusOptions);
        if (chosen) {
          add(rings, chosen, 1, `Regione: ${region.name}`, breakdown);
        }
      }
    } else {
      const fam = getFamily(state, db);
      if (fam) {
        // fam.ringBonusOptions: ["Aria","Terra"] ecc.
        const chosen = resolveSingleOption(state.familyRingChoice, fam.ringBonusOptions);
        if (chosen) {
          add(rings, chosen, 1, `Famiglia: ${fam.name}`, breakdown);
        }
      }
    }

    // Q3 Scuola / Ordine
    const school = getSchool(state, db);
    if (school) {
      const rb = school.ringBonuses || {};

      // rb.mode può essere: "fixed", "choose_two_distinct", "fixed_plus_any_other",
      // "fixed_plus_choose_one", "choose_one" ecc. (gestione robusta)
      if (rb.mode === "fixed") {
        (rb.rings || []).forEach((r) =>
          add(rings, r, 1, `Scuola: ${school.name}`, breakdown)
        );
      } else if (rb.mode === "choose_two_distinct") {
        const r1 = state.schoolRing1;
        const r2 = state.schoolRing2;
        if (r1) add(rings, r1, 1, `Scuola: ${school.name} (scelta 1)`, breakdown);
        if (r2 && r2 !== r1)
          add(rings, r2, 1, `Scuola: ${school.name} (scelta 2)`, breakdown);
      } else if (rb.mode === "choose_one") {
        // scelta singola da rb.options
        const chosen = resolveSingleOption(state.schoolRingChoice, rb.options);
        if (chosen) add(rings, chosen, 1, `Scuola: ${school.name}`, breakdown);
      } else if (rb.mode === "fixed_plus_any_other") {
        // es: +1 Terra e +1 a un anello qualsiasi diverso
        const fixed = Array.isArray(rb.fixed) ? rb.fixed : (rb.rings || []);
        (fixed || []).forEach((r) =>
          add(rings, r, 1, `Scuola: ${school.name}`, breakdown)
        );
        const other = state.schoolRingOther;
        if (other) add(rings, other, 1, `Scuola: ${school.name} (scelta)`, breakdown);
      } else if (rb.mode === "fixed_plus_choose_one") {
        // es: +1 Fuoco fisso e +1 tra [Aria,Terra]
        const fixed = Array.isArray(rb.fixed) ? rb.fixed : [];
        fixed.forEach((r) => add(rings, r, 1, `Scuola: ${school.name}`, breakdown));
        const chosen = resolveSingleOption(state.schoolRingChoice, rb.options);
        if (chosen) add(rings, chosen, 1, `Scuola: ${school.name} (scelta)`, breakdown);
      } else {
        // fallback: se il dataset usa rb.rings fissi senza mode
        if (Array.isArray(rb.rings) && rb.rings.length) {
          rb.rings.forEach((r) => add(rings, r, 1, `Scuola: ${school.name}`, breakdown));
        }
      }
    }

    // Q4: +1 a uno dei due anelli della scuola
    if (state.schoolDistinctionRing) {
      add(
        rings,
        state.schoolDistinctionRing,
        1,
        "Q4: Distinzione nella scuola",
        breakdown
      );
    }

    // Limiti creazione (max 3) - segnala ma non forza
    const over = Object.entries(rings)
      .filter(([, v]) => v > 3)
      .map(([k, v]) => ({ ring: k, value: v }));

    return { rings, breakdown, over };
  }

  // --- DERIVATE ---
  function computeDerived(rings) {
    const tenacia = (rings.Terra + rings.Fuoco) * 2;
    const compostezza = (rings.Terra + rings.Acqua) * 2;
    const concentrazione = rings.Aria + rings.Fuoco;
    const vigilanza = Math.ceil((rings.Aria + rings.Acqua) / 2);
    const vuoto = rings.Vuoto;
    return { tenacia, compostezza, concentrazione, vigilanza, vuoto };
  }

  // --- STATUS / GLORIA / ONORE (automatici) ---
  // Samurai: Status da Clan, Gloria da Famiglia, Onore da Scuola
  // Ronin: usa Regione (glory/status se presenti nel tuo db) + Onore da Scuola
  function computeSocialStats(state, db) {
    let status = 0, glory = 0, honor = 0;

    const school = getSchool(state, db);
    if (school && typeof school.honor === "number") honor = school.honor;

    if (state.clanId === "ronin") {
      const region = getRegion(state, db);
      if (region) {
        if (typeof region.status === "number") status = region.status;
        if (typeof region.glory === "number") glory = region.glory;
      }
    } else {
      const clan = getClan(state, db);
      const fam = getFamily(state, db);
      if (clan && typeof clan.status === "number") status = clan.status;
      if (fam && typeof fam.glory === "number") glory = fam.glory;
    }

    return { status, glory, honor };
  }

  // --- ABILITÀ DI PARTENZA SCUOLA: definizione (da school_starting_skills.js) ---
  function getSchoolStartingSkillsDef(state, db) {
    const school = getSchool(state, db);
    if (!school) return null;
    const name = school.name;
    const map = window.SCHOOL_STARTING_SKILLS || {};
    return map[name] || null; // {pick, options}
  }

  // --- Somma incrementi abilità selezionati (se li salvi in array nello state) ---
  // Atteso: state.<qualcosa> = ["Cortesia","Cortesia","Governo"] ecc.
  function computeSkillIncrements(state) {
    const buckets = [
      "q2SkillPicks",
      "q7SkillPicks",
      "q8SkillPicks",
      "q13SkillPicks",
      "schoolSkillPicks",
    ];

    const counts = {}; // skill -> totale +N

    buckets.forEach((k) => {
      const arr = state?.[k];
      if (!Array.isArray(arr)) return;
      arr.forEach((skill) => {
        if (!skill) return;
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });

    return counts;
  }

  window.RULES = {
    RINGS,
    computeRings,
    computeDerived,

    // extra helpers (non rompono nulla se non usati)
    getClan,
    getFamily,
    getRegion,
    getSchool,
    computeSocialStats,
    getSchoolStartingSkillsDef,
    computeSkillIncrements,
  };
})();
