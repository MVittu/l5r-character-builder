(function(){
  const db = {
    clans: window.DB.clans || [],
    families_or_regions: window.DB.families_or_regions || [],
    schools: window.DB.schools || [],
    traits: window.DB.traits || {distinctions:[], passions:[], adversities:[], anxieties:[]},
    lookups: window.DB.lookups || {}
  };

  const defaultState = ()=>({
    // Q1
    clanId: "",
    // Q2
    familyId: "",
    familyRingChoice: "",
    regionId: "",
    // Q3
    schoolId: "",
    schoolNameFree: "",
    schoolRing1: "",
    schoolRing2: "",
    honor: "",
    // Q4
    schoolDistinctionRing: "",
    // 5-8
    lordAndDuties: "",
    ninjo: "",
    clanRelation: "",
    bushidoView: "",
    // 9-13
    achievement: "",
    obstacle: "",
    peaceActivity: "",
    anxiety: "",
    mentor: "",
    // 14-16
    firstImpression: "",
    stressReaction: "",
    relations: "",
    // 17-20
    parentsView: "",
    nameHonor: "",
    personalName: "",
    death: "",
    // extras
    freeNotes: "",
    // Optional manual for glory/status
    statusOverride: "",
    gloryOverride: ""
  });

  let state = defaultState();

  const $q = document.getElementById("questions");
  const $summary = document.getElementById("summary");
  const $breakdown = document.getElementById("breakdown");

  function setState(patch){
    state = {...state, ...patch};
    render();
  }

  function resetDependentOnClan(){
    setState({
      familyId:"",
      familyRingChoice:"",
      regionId:"",
      schoolId:"",
      schoolNameFree:"",
      schoolRing1:"",
      schoolRing2:"",
      schoolDistinctionRing:"",
      honor:"",
    });
  }

  function familiesForClan(clanId){
    return db.families_or_regions.filter(x=>x.type==="family" && x.clan && x.clan.toLowerCase()===clanId);
  }

  function regions(){
    return db.families_or_regions.filter(x=>x.type==="region");
  }

  
  function ringSelectFromList(rings, placeholder="Seleziona..."){
    const s=document.createElement("select");
    const o=document.createElement("option");
    o.value=""; o.textContent=placeholder;
    s.appendChild(o);
    (rings||[]).forEach(r=>{
      const op=document.createElement("option");
      op.value=r; op.textContent=r;
      s.appendChild(op);
    });
    return s;
  }

  function getSelectedSchool(){
    return db.schools.find(s=>s.id===state.schoolId) || null;
  }

function schoolsForClan(clanId){
    return db.schools.filter(s => (s.clanId||"") === clanId);
  }

  function getStatus(){
    const clan=db.clans.find(c=>c.id===state.clanId);
    if(state.statusOverride) return Number(state.statusOverride)||0;
    if(state.clanId==="ronin") return null;
    return clan?.status ?? null;
  }

  function getGlory(){
    if(state.gloryOverride) return Number(state.gloryOverride)||0;

    let base = null;
    if(state.clanId==="ronin"){
      const r=regions().find(x=>x.id===state.regionId);
      base = r?.glory ?? null;
    } else {
      const f=db.families_or_regions.find(x=>x.type==="family" && x.id===state.familyId);
      base = f?.glory ?? null;
    }

    if(base==null) return null;
    const bonus = (state.q7Reward==="glory") ? 5 : 0;
    return base + bonus;
  }

  function renderSummary(){
    const {rings, breakdown, over} = window.RULES.computeRings(state, db);
    const d = window.RULES.computeDerived(rings);

    const clan = db.clans.find(c=>c.id===state.clanId);
    const family = db.families_or_regions.find(x=>x.type==="family" && x.id===state.familyId);
    const region = db.families_or_regions.find(x=>x.type==="region" && x.id===state.regionId);

    const status=getStatus();
    const glory=getGlory();

    const items = [
      ["Clan/Tipo", clan ? clan.name : "—"],
      ["Famiglia", state.clanId && state.clanId!=="ronin" ? (family?.name || "—") : "—"],
      ["Regione", state.clanId==="ronin" ? (region?.name || "—") : "—"],
      ["Onore (Q3)", state.honor || "—"],
      ["Gloria (Q2/Q1 Ronin)", glory ?? "—"],
      ["Status (Q1/Q2 Ronin)", status ?? "—"],
      ["Abilità (incrementi)", formatSkillRanks(skillRanks)],
      ["Aria", rings.Aria],
      ["Acqua", rings.Acqua],
      ["Fuoco", rings.Fuoco],
      ["Terra", rings.Terra],
      ["Vuoto", rings.Vuoto],
      ["Tenacia", d.tenacia],
      ["Compostezza", d.compostezza],
      ["Concentrazione", d.concentrazione],
      ["Vigilanza", d.vigilanza],
    ];

    $summary.innerHTML = "";
    items.forEach(([k,v])=>{
      const row = UI.el("div",{class:"kv"},[
        UI.el("span",{html:k}),
        UI.el("strong",{html:String(v)})
      ]);
      $summary.appendChild(row);
    });

    $breakdown.innerHTML = "";
    Object.entries(breakdown).forEach(([ring, parts])=>{
      const row = UI.el("div",{class:"kv"},[
        UI.el("span",{html:ring}),
        UI.el("div",{},[
          UI.el("div",{class:"mono", html: parts.map(p=>`${p.amount>0?"+":""}${p.amount} ${p.source}`).join(" • ")})
        ])
      ]);
      $breakdown.appendChild(row);
    });
    if(over.length){
      $breakdown.appendChild(UI.el("div",{class:"badge warn", style:"margin-top:10px;"},[
        document.createTextNode("Attenzione: durante la creazione un anello non dovrebbe superare 3. Ora: "),
        UI.el("span",{class:"mono", html: over.map(o=>`${o.ring}=${o.value}`).join(", ")})
      ]));
    }
  }

  function renderQuestions(){
    $q.innerHTML = "";

    // Q1
    const clanSel = UI.selectFrom(db.clans, c=>c.id, c=>c.name, "Seleziona...");
    clanSel.value = state.clanId;
    clanSel.addEventListener("change", ()=>{
      setState({clanId: clanSel.value});
      resetDependentOnClan();
    });

    const q1 = UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"1"}),
      UI.el("div",{},[
        UI.field("A quale clan appartiene il personaggio? (oppure Ronin)", clanSel),
        UI.el("div",{class:"row"},[
          UI.field("Status (auto se possibile, oppure inserisci)", UI.text("es. 35")),
          UI.field("Gloria (solo override manuale)", UI.text("es. 40")),
        ])
      ])
    ]);
    q1.querySelectorAll("input")[0].value = state.statusOverride;
    q1.querySelectorAll("input")[1].value = state.gloryOverride;
    q1.querySelectorAll("input")[0].addEventListener("input", e=>setState({statusOverride:e.target.value}));
    q1.querySelectorAll("input")[1].addEventListener("input", e=>setState({gloryOverride:e.target.value}));
    $q.appendChild(q1);

    // Q2 - family or region
    let q2Body;
    if(state.clanId==="ronin"){
      const regSel = UI.selectFrom(regions(), r=>r.id, r=>r.name, "Seleziona regione...");
      regSel.value = state.regionId;
      regSel.addEventListener("change", ()=>setState({regionId: regSel.value}));
      q2Body = UI.el("div",{},[
        UI.field("Da quale regione proviene il personaggio? (Ronin)", regSel),
        renderSkillPickList("q2SkillPicks", 2, "Incremento abilità (Q2)")
      ]);
    } else {
      const fams=familiesForClan(state.clanId || "");
      const famSel = UI.selectFrom(fams, f=>f.id, f=>f.name, "Seleziona famiglia...");
      famSel.value = state.familyId;
      famSel.addEventListener("change", ()=>{
        const fam = fams.find(x=>x.id===famSel.value);
        setState({
          familyId: famSel.value,
          familyRingChoice: ""
        });
      });

      const selectedFam = fams.find(x=>x.id===state.familyId);
      const famRingOptions = selectedFam?.ringBonusOptions || [];
      // Se la famiglia offre una sola opzione, selezionala automaticamente
      if(selectedFam && famRingOptions.length===1 && state.familyRingChoice !== famRingOptions[0]){
        setState({familyRingChoice: famRingOptions[0]});
      }
      const ringChoice = ringSelectFromList(famRingOptions, "Seleziona anello (+1)...");
      ringChoice.value = state.familyRingChoice;
      ringChoice.addEventListener("change", ()=>setState({familyRingChoice: ringChoice.value}));
q2Body = UI.el("div",{},[
        UI.field("A quale famiglia appartiene il personaggio? (Samurai)", famSel),
        UI.field("Scelta anello famiglia (manuale, perché dipende dalla famiglia)", ringChoice),
        renderSkillPickList("q2SkillPicks", 2, "Incremento abilità (Q2)"),
        UI.el("div",{class:"badge warn"},[
          document.createTextNode("Nota: alcune famiglie nel dataset sono 'best-effort'. Se vuoi, puoi ignorare il dato e scegliere manualmente qui.")
        ])
      ]);
    }

    $q.appendChild(UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"2"}),
      UI.el("div",{},[q2Body])
    ]));

    // Q3 - school
    const schoolOptions = schoolsForClan(state.clanId || "");
    const schoolSel = UI.selectFrom(schoolOptions, s=>s.id, s=>s.name, "Seleziona scuola...");
    schoolSel.value = state.schoolId;

    // Auto-seleziona se c'è una sola possibilità
    if(!state.schoolId && schoolOptions.length===1){
      setState({schoolId: schoolOptions[0].id});
    }

    schoolSel.addEventListener("change", ()=>{
      const selected = schoolOptions.find(s=>s.id===schoolSel.value) || null;
      const patch = {schoolId: schoolSel.value, schoolDistinctionRing:""};
      if(selected){
        patch.honor = String(selected.honor ?? "");
        if(selected.ringBonuses?.mode === "fixed"){
          patch.schoolRing1 = selected.ringBonuses.rings?.[0] || "";
          patch.schoolRing2 = selected.ringBonuses.rings?.[1] || "";
        } else {
          patch.schoolRing1 = "";
          patch.schoolRing2 = "";
        }
      } else {
        patch.honor = "";
        patch.schoolRing1 = "";
        patch.schoolRing2 = "";
      }
      setState(patch);
    });

    const school = getSelectedSchool();
    // Auto-allinea onore/anelli se il personaggio viene caricato da JSON
    if(school){
      const expectedHonor = String(school.honor ?? "");
      if(state.honor !== expectedHonor){
        setState({honor: expectedHonor});
      }
      if(school.ringBonuses?.mode === "fixed"){
        const rA = school.ringBonuses.rings?.[0] || "";
        const rB = school.ringBonuses.rings?.[1] || "";
        if(state.schoolRing1 !== rA || state.schoolRing2 !== rB){
          setState({schoolRing1: rA, schoolRing2: rB});
        }
      }
    }

    const schoolRingMode = school?.ringBonuses?.mode || "fixed";
    const fixedRings = (schoolRingMode==="fixed" ? (school?.ringBonuses?.rings || []) : []);

    // UI per gli anelli scuola (solo se serve una scelta)
    const schoolRingRow = UI.el("div",{class:"row"},[]);
    if(school && schoolRingMode==="choose_two_distinct"){
      const r1 = ringSelectFromList(school.ringBonuses.options, "Anello scuola #1 (+1)...");
      r1.value = state.schoolRing1;
      r1.addEventListener("change", ()=>setState({schoolRing1: r1.value, schoolDistinctionRing:""}));

      const remaining = school.ringBonuses.options.filter(r=>r!==state.schoolRing1);
      const r2 = ringSelectFromList(remaining, "Anello scuola #2 (+1)...");
      r2.value = state.schoolRing2;
      r2.addEventListener("change", ()=>setState({schoolRing2: r2.value, schoolDistinctionRing:""}));

      schoolRingRow.appendChild(UI.field("Scelta anelli scuola (2 distinti)", UI.el("div",{},[r1, r2])));
    } else if(school && fixedRings.length){
      // visualizzazione read-only
      schoolRingRow.appendChild(UI.el("div",{class:"badge"},[
        `Anelli scuola: +1 ${fixedRings.join(" , +1 ")}`
      ]));
    }

    const honorBadge = UI.el("div",{class:"badge"},[
      `Onore scuola: ${school?.honor ?? "—"}`
    ]);

    $q.appendChild(UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"3"}),
      UI.el("div",{},[
        UI.field("Qual è la scuola/ordine del personaggio? (filtrata per clan)", schoolSel),
        schoolRingRow,
        honorBadge
      ])
    ]));

// Q4 - school distinction ring
    const schoolQ4 = getSelectedSchool();
    let allowed = [];
    if(schoolQ4){
      if(schoolQ4.ringBonuses?.mode === "fixed"){
        allowed = schoolQ4.ringBonuses.rings || [];
      } else if(schoolQ4.ringBonuses?.mode === "choose_two_distinct"){
        allowed = [state.schoolRing1, state.schoolRing2].filter(Boolean);
      }
    }
    const sd = ringSelectFromList([...new Set(allowed)], "Seleziona anello scuola (+1)...");
    sd.value = state.schoolDistinctionRing;
    sd.disabled = allowed.length===0;
    sd.addEventListener("change", ()=>setState({schoolDistinctionRing: sd.value}));

    $q.appendChild(UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"4"}),
      UI.el("div",{},[
        UI.field("Come si distingue il personaggio all'interno della sua scuola? (+1 a un anello della scuola)", sd),
      ])
    ]));

// Q5-8
    const makeTextQ = (num, label, key, placeholder="")=>{
      const t = UI.text(placeholder);
      t.value = state[key] || "";
      t.addEventListener("input", e=>setState({[key]: e.target.value}));
      return UI.el("div",{class:"q"},[
        UI.el("div",{class:"qnum", html:String(num)}),
        UI.el("div",{},[ UI.field(label, t) ])
      ]);
    };

    $q.appendChild(makeTextQ(5, "Chi è il suo signore e quali doveri ha nei suoi confronti?", "lordAndDuties"));
    $q.appendChild(makeTextQ(6, "Cosa desidera ardentemente (Ninjō) e come ostacola il dovere?", "ninjo"));
    (function(){
      const base = makeTextQ(7, "Qual è il rapporto con il suo clan/comunità?", "clanRelation");
      const body = base.children[1];
      body.appendChild(renderRewardChoice("q7Reward", [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"glory", label:"Incremento Gloria (+5)"}
      ]));
      const skillWrap = UI.el("div",{},[]);
      const sel = skillSelect(state["q7SkillPick"], (v)=>setState({q7SkillPick: v}), "Seleziona abilità...");
      skillWrap.appendChild(UI.field("Scegli abilità da aumentare", sel));
      body.appendChild(skillWrap);
      // show/hide
      const sync = ()=>{ skillWrap.style.display = (state["q7Reward"]==="skill") ? "" : "none"; };
      sync();
      // re-sync on render: handled because render() recreates DOM
      $q.appendChild(base);
    })();
    (function(){
      const base = makeTextQ(8, "Cosa pensa del Bushidō?", "bushidoView");
      const body = base.children[1];
      body.appendChild(renderRewardChoice("q8Reward", [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"honor", label:"Incremento Onore (+10)"}
      ]));
      const skillWrap = UI.el("div",{},[]);
      const sel = skillSelect(state["q8SkillPick"], (v)=>setState({q8SkillPick: v}), "Seleziona abilità...");
      skillWrap.appendChild(UI.field("Scegli abilità da aumentare", sel));
      body.appendChild(skillWrap);
      // show/hide
      const sync = ()=>{ skillWrap.style.display = (state["q8Reward"]==="skill") ? "" : "none"; };
      sync();
      // re-sync on render: handled because render() recreates DOM
      $q.appendChild(base);
    })();

    // 9-13
    $q.appendChild(makeTextQ(9, "Qual è il traguardo più grande raggiunto finora?", "achievement"));
    $q.appendChild(makeTextQ(10, "Cosa è di maggiore ostacolo nella vita?", "obstacle"));
    $q.appendChild(makeTextQ(11, "Quale attività lo fa sentire in pace?", "peaceActivity"));
    $q.appendChild(makeTextQ(12, "Quale dubbio/paura/debolezza lo preoccupa di più?", "anxiety"));
    (function(){
      const base = makeTextQ(13, "Da chi ha imparato maggiormente?", "mentor");
      const body = base.children[1];
      body.appendChild(UI.el("div",{class:"badge warn"},[document.createTextNode("Ricorda: qui hai sempre 1 Svantaggio (1).")]));
      body.appendChild(renderRewardChoice("q13Reward", [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"adv", label:"Vantaggio (1)"}
      ]));
      const skillWrap = UI.el("div",{});
      const sel = skillSelect(state.q13SkillPick, (v)=>setState({q13SkillPick:v}), "Seleziona abilità...");
      skillWrap.appendChild(UI.field("Scegli abilità da aumentare", sel));
      body.appendChild(skillWrap);
      const advNote = UI.el("div",{class:"badge warn"},[document.createTextNode("Vantaggio: per ora scegli manualmente (dataset vantaggi da popolare).")]);
      body.appendChild(advNote);
      skillWrap.style.display = (state.q13Reward==="skill") ? "" : "none";
      advNote.style.display = (state.q13Reward==="adv") ? "" : "none";
      $q.appendChild(base);
    })();

    // 14-16
    $q.appendChild(makeTextQ(14, "Che cosa notano prima le persone che lo incontrano?", "firstImpression"));
    $q.appendChild(makeTextQ(15, "Come reagisce alle situazioni stressanti?", "stressReaction"));
    const rel = UI.textarea("Clans/famiglie/organizzazioni/tradizioni…");
    rel.value = state.relations;
    rel.addEventListener("input", e=>setState({relations:e.target.value}));
    $q.appendChild(UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"16"}),
      UI.el("div",{},[
        UI.field("Precedenti relazioni con altri clan/famiglie/organizzazioni/tradizioni", rel)
      ])
    ]));

    // 17-20
    $q.appendChild(makeTextQ(17, "Come lo descriverebbero i genitori?", "parentsView"));
    $q.appendChild(makeTextQ(18, "Chi si intende onorare tramite il nome scelto?", "nameHonor"));
    $q.appendChild(makeTextQ(19, "Qual è il nome proprio del personaggio?", "personalName", "es. Akodo Haru"));
    $q.appendChild(makeTextQ(20, "Come dovrebbe morire il personaggio?", "death"));
  }

  function render(){
    renderQuestions();
    renderSummary();
  }

  // Buttons
  document.getElementById("btnNew").addEventListener("click", ()=>{
    state = defaultState();
    render();
  });

  document.getElementById("btnSave").addEventListener("click", ()=>{
    window.STORAGE.save(state);
  });

  document.getElementById("btnLoad").addEventListener("click", ()=>{
    const loaded = window.STORAGE.load();
    if(loaded){
      state = {...defaultState(), ...loaded};
      render();
    }
  });

  document.getElementById("btnExport").addEventListener("click", ()=>{
    window.STORAGE.downloadJson(state, `l5r-personaggio-${(state.personalName||"senza-nome").toLowerCase().replace(/\s+/g,'-')}.json`);
  });

  document.getElementById("fileImport").addEventListener("change", async (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    try{
      const obj = await window.STORAGE.readFileJson(file);
      state = {...defaultState(), ...obj};
      render();
    }catch(err){
      alert("JSON non valido.");
    }finally{
      e.target.value="";
    }
  });

  // init
  render();
})();
