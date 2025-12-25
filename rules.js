(function(){
  const RINGS = ["Aria","Acqua","Fuoco","Terra","Vuoto"];

  function emptyRings(){
    const r={}; RINGS.forEach(k=>r[k]=1);
    return r;
  }

  function add(rings, ringName, amount, source, breakdown){
    if(!ringName || !RINGS.includes(ringName)) return;
    rings[ringName] += amount;
    breakdown[ringName] = breakdown[ringName] || [];
    breakdown[ringName].push({amount, source});
  }

  function computeRings(state, db){
    const rings = emptyRings();
    const breakdown = {};

    const clan = db.clans.find(c=>c.id===state.clanId);
    if(clan && clan.ringBonus){
      add(rings, clan.ringBonus, 1, `Clan: ${clan.name}`, breakdown);
    }

    // Famiglia (samurai) / Regione (ronin)
    if(state.clanId === "ronin"){
      const region = db.families_or_regions.find(x=>x.type==="region" && x.id===state.regionId);
      if(region && region.ringBonusOptions && region.ringBonusOptions[0]){
        add(rings, region.ringBonusOptions[0], 1, `Regione: ${region.name}`, breakdown);
      }
    } else {
      const fam = db.families_or_regions.find(x=>x.type==="family" && x.id===state.familyId);
      const chosen = state.familyRingChoice;
      if(fam && chosen){
        add(rings, chosen, 1, `Famiglia: ${fam.name}`, breakdown);
      }
    }

    // Scuola (dataset ufficiale)
    const school = db.schools.find(s=>s.id===state.schoolId);
    if(school){
      const rb = school.ringBonuses || {};
      if(rb.mode === "fixed"){
        (rb.rings||[]).forEach((r,idx)=> add(rings, r, 1, `Scuola: ${school.name}`, breakdown));
      } else if(rb.mode === "choose_two_distinct"){
        const r1 = state.schoolRing1;
        const r2 = state.schoolRing2;
        if(r1) add(rings, r1, 1, `Scuola: ${school.name} (scelta 1)`, breakdown);
        if(r2 && r2 !== r1) add(rings, r2, 1, `Scuola: ${school.name} (scelta 2)`, breakdown);
      }
    }

    // Q4: +1 a uno dei due anelli della scuola
    if(state.schoolDistinctionRing){
      add(rings, state.schoolDistinctionRing, 1, `Q4: Distinzione nella scuola`, breakdown);
    }

    // Limiti creazione (max 3) - se supera, segnala ma non forza
    const over = Object.entries(rings).filter(([,v])=>v>3).map(([k,v])=>({ring:k,value:v}));

    return {rings, breakdown, over};
  }

  function computeDerived(rings){
    const tenacia = (rings.Terra + rings.Fuoco) * 2;
    const compostezza = (rings.Terra + rings.Acqua) * 2;
    const concentrazione = rings.Aria + rings.Fuoco;
    const vigilanza = Math.ceil((rings.Aria + rings.Acqua) / 2);
    const vuoto = rings.Vuoto;

    return {tenacia, compostezza, concentrazione, vigilanza, vuoto};
  }

  window.RULES = { RINGS, computeRings, computeDerived };
})();
