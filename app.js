(function(){
  const db = {
    clans: window.DB.clans || [],
    families_or_regions: window.DB.families_or_regions || [],
    schools: window.DB.schools || [],
    traits: window.DB.traits || {distinctions:[], passions:[], adversities:[], anxieties:[]},
    lookups: window.DB.lookups || {},
    skills: window.DB.skills || []
  };

  const defaultState = ()=>({
    // Q1
    clanId: "",
    // Q2
    familyId: "",
    familyRingChoice: "",
    q2SkillPicks: ["",""],
    regionId: "",
    // Q3
    schoolId: "",
    schoolNameFree: "",
    schoolRing1: "",
    schoolRing2: "",
    honor: "",
    schoolSkillPicks: [], // NUOVO: abilità di partenza scuola
    // Q4
    schoolDistinctionRing: "",
    // 5-8
    lordAndDuties: "",
    ninjo: "",
    clanRelation: "",
    q7Reward: "skill",
    q7Skill: "",
    bushidoView: "",
    q8Reward: "skill",
    q8Skill: "",
    // 9-13
    achievement: "",
    obstacle: "",
    peaceActivity: "",
    anxiety: "",
    mentor: "",
    q13Reward: "skill",
    q13Skill: "",
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
  });

  let state = defaultState();

  const $q = document.getElementById("questions");
  const $summary = document.getElementById("summary");
  const $breakdown = document.getElementById("breakdown");

  function setState(patch){
    state = {...state, ...patch};
    render();
  }

  function setStateText(patch){
    state = {...state, ...patch};
    renderSummary(); // niente renderQuestions()
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
      schoolSkillPicks: [] // reset anche abilità scuola
    });
  }

  function familiesForClan(clanId){
    return db.families_or_regions.filter(x=>x.type==="family" && x.clan && x.clan.toLowerCase()===clanId);
  }

  function regions(){
    return db.families_or_regions.filter(x=>x.type==="region");
  }

  function skills(){
    return db.skills || [];
  }

  // helper: name -> id (serve perché SCHOOL_STARTING_SKILLS usa nomi abilità)
  function skillIdByName(name){
    const s = skills().find(x => (x.name||"").trim() === (name||"").trim());
    return s ? s.id : null;
  }

  function makeSkillSelect(placeholder="Seleziona abilità...", allowedIds=null){
    const pool = Array.isArray(allowedIds) && allowedIds.length
      ? skills().filter(sk => allowedIds.includes(sk.id))
      : skills();
    const s = UI.selectFrom(pool, sk=>sk.id, sk=>sk.name, placeholder);
    return s;
  }

  // Renders N skill picks bound to state[key] = array of skill ids (length N)
  // allowedIds (opzionale) limita le abilità selezionabili
  function renderSkillPicks(key, count, label, allowedIds=null){
    const wrap = UI.el("div",{class:"section"},[]);
    const arr = Array.isArray(state[key]) ? state[key].slice() : Array(count).fill("");
    while(arr.length < count) arr.push("");
    while(arr.length > count) arr.pop();

    const rows = UI.el("div",{class:"row"},[]);
    for(let i=0;i<count;i++){
      const sel = makeSkillSelect(`${label} ${i+1}/${count}`, allowedIds);
      sel.value = arr[i] || "";
      sel.addEventListener("change", ()=>{
        const next = Array.isArray(state[key]) ? state[key].slice() : Array(count).fill("");
        // normalizza lunghezza
        while(next.length < count) next.push("");
        while(next.length > count) next.pop();
        next[i] = sel.value;

        setState({[key]: next});
      });

      rows.appendChild(UI.el("div",{style:"flex:1; min-width:220px;"},[
        UI.field(`${label} (${i+1}/${count})`, sel)
      ]));
    }
    wrap.appendChild(rows);
    return wrap;
  }

  function countSkillIncrements(){
    const counts = new Map(); // name -> count
    const byId = new Map(skills().map(s=>[s.id, s.name]));
    const add = (id)=>{
      if(!id) return;
      const name = byId.get(id) || id;
      counts.set(name, (counts.get(name)||0)+1);
    };
    // Q2 (2 picks)
    (state.q2SkillPicks||[]).forEach(add);
    // Q3 (abilita scuola)
    (state.schoolSkillPicks||[]).forEach(add);
    // Q7/Q8/Q13 conditional picks
    if(state.q7Reward==="skill") add(state.q7Skill);
    if(state.q8Reward==="skill") add(state.q8Skill);
    if(state.q13Reward==="skill") add(state.q13Skill);
    return counts;
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
    if(state.clanId==="ronin") return null;
    return clan?.status ?? null;
  }

  function getGlory(){
    if(state.clanId==="ronin"){
      const r=regions().find(x=>x.id===state.regionId);
      return r?.glory ?? null;
    }
    const f=db.families_or_regions.find(x=>x.type==="family" && x.id===state.familyId);
    return f?.glory ?? null;
  }

  function renderSummary(){
    const {rings, breakdown, over} = window.RULES.computeRings(state, db);
    const d = window.RULES.computeDerived(rings);

    const clan = db.clans.find(c=>c.id===state.clanId);
    const family = db.families_or_regions.find(x=>x.type==="family" && x.id===state.familyId);
    const region = db.families_or_regions.find(x=>x.type==="region" && x.id===state.regionId);

    const status = getStatus();
    const gloryBase = getGlory();
    const gloryBonus = (state.q7Reward==="glory") ? 5 : 0;
    const glory = (gloryBase==null ? null : gloryBase + gloryBonus);

    const honorBase = state.honor ? Number(state.honor) : null;
    const honorBonus = (state.q8Reward==="honor") ? 10 : 0;
    const honor = (honorBase==null ? null : honorBase + honorBonus);

    const skillCounts = countSkillIncrements();
    const skillsSummary = skillCounts.size
      ? Array.from(skillCounts.entries()).map(([n,c])=>`${n} +${c}`).join(", ")
      : "—";

    const items = [
      ["Clan/Tipo", clan ? clan.name : "—"],
      ["Famiglia", state.clanId && state.clanId!=="ronin" ? (family?.name || "—") : "—"],
      ["Regione", state.clanId==="ronin" ? (region?.name || "—") : "—"],
      ["Onore (totale)", honor ?? "—"],
      ["Gloria (totale)", glory ?? "—"],
      ["Status (Q1/Q2 Ronin)", status ?? "—"],
      ["Incrementi abilità (selezionati)", skillsSummary],
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

    const baseStatus = getStatus();
    const baseGlory = getGlory();
    const q1 = UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"1"}),
      UI.el("div",{},[
        UI.field("A quale clan appartiene il personaggio? (oppure Ronin)", clanSel),
        UI.el("div",{class:"row"},[
          UI.el("div",{class:"badge"},[document.createTextNode("Status: " + (baseStatus ?? "—"))]),
          UI.el("div",{class:"badge"},[document.createTextNode("Gloria base: " + (baseGlory ?? "—"))]),
        ]),
        UI.el("div",{class:"badge warn", style:"margin-top:8px;"},[
          document.createTextNode("Nota: Status/Gloria sono calcolati automaticamente da Clan e Famiglia/Regione.")
        ])
      ])
    ]);
    $q.appendChild(q1);

    // Q2 - family or region
    let q2Body;
    if(state.clanId==="ronin"){
      const regSel = UI.selectFrom(regions(), r=>r.id, r=>r.name, "Seleziona regione...");
      regSel.value = state.regionId;
      regSel.addEventListener("change", ()=>setState({regionId: regSel.value}));
      q2Body = UI.el("div",{},[
        UI.field("Da quale regione proviene il personaggio? (Ronin)", regSel),
        renderSkillPicks("q2SkillPicks", 2, "Incremento abilità (Q2)")
      ]);
    } else {
      const fams=familiesForClan(state.clanId || "");
      const famSel = UI.selectFrom(fams, f=>f.id, f=>f.name, "Seleziona famiglia...");
      famSel.value = state.familyId;
      famSel.addEventListener("change", ()=>{
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
        renderSkillPicks("q2SkillPicks", 2, "Incremento abilità (Q2)"),
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

      const patch = {
        schoolId: schoolSel.value,
        schoolDistinctionRing:"",
        schoolSkillPicks: [] // reset abilità scuola quando cambi scuola
      };

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
      schoolRingRow.appendChild(UI.el("div",{class:"badge"},[
        `Anelli scuola: +1 ${fixedRings.join(" , +1 ")}`
      ]));
    }

    const honorBadge = UI.el("div",{class:"badge"},[
      `Onore scuola: ${school?.honor ?? "—"}`
    ]);

    // Abilità di partenza scuola (vincolate)
    let schoolSkillsBlock = null;
    if(school && window.SCHOOL_STARTING_SKILLS){
      const def = window.SCHOOL_STARTING_SKILLS[school.name];
      if(def && Array.isArray(def.options)){
        const allowedIds = def.options
          .map(skillIdByName)
          .filter(Boolean);

        // normalizza lunghezza array nello state quando è selezionata una scuola
        const count = Number(def.pick || 0);
        if(count > 0){
          const cur = Array.isArray(state.schoolSkillPicks) ? state.schoolSkillPicks : [];
          if(cur.length !== count){
            const next = cur.slice(0, count);
            while(next.length < count) next.push("");
            setState({ schoolSkillPicks: next });
          }
          schoolSkillsBlock = renderSkillPicks("schoolSkillPicks", count, "Abilità di partenza (Scuola)", allowedIds);
        }
      }
    }

    $q.appendChild(UI.el("div",{class:"q"},[
      UI.el("div",{class:"qnum", html:"3"}),
      UI.el("div",{},[
        UI.field("Qual è la scuola/ordine del personaggio? (filtrata per clan)", schoolSel),
        schoolRingRow,
        honorBadge,
        ...(schoolSkillsBlock ? [schoolSkillsBlock] : [])
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
      t.addEventListener("input", e=>setStateText({[key]: e.target.value}));
      return UI.el("div",{class:"q"},[
        UI.el("div",{class:"qnum", html:String(num)}),
        UI.el("div",{},[ UI.field(label, t) ])
      ]);
    };

    const makeTextQWithChoice = (num, label, textKey, choiceKey, choices, extraRender=null)=>{
      const t = document.createElement("textarea");
      t.rows = 2;
      t.placeholder = "";
      t.value = state[textKey] || "";
      t.addEventListener("input", e=>setStateText({[textKey]: e.target.value}));

      const picked = state[choiceKey] || choices[0].id;
      const radioWrap = UI.el("div",{class:"choice-group"},[
        UI.el("div",{class:"label", html:"Scegli UNA ricompensa:"}),
        ...choices.map(ch=>{
          const lab = UI.el("label",{class:"radio"},[]);
          const r = document.createElement("input");
          r.type="radio";
          r.name = `choice_${choiceKey}`;
          r.value = ch.id;
          r.checked = (picked===ch.id);
          r.addEventListener("change", ()=>setState({[choiceKey]: ch.id}));
          lab.appendChild(r);
          lab.appendChild(document.createTextNode(" " + ch.label));
          return lab;
        })
      ]);

      const extras = extraRender ? extraRender(picked) : null;

      return UI.el("div",{class:"q"},[
        UI.el("div",{class:"qnum", html:String(num)}),
        UI.el("div",{},[
          UI.field(label, t),
          radioWrap,
          ...(extras ? [extras] : [])
        ])
      ]);
    };

    $q.appendChild(makeTextQ(5, "Chi è il suo signore e quali doveri ha il personaggio nei suoi confronti? (scegliere giri)", "lordAndDuties"));
    $q.appendChild(makeTextQ(6, "Cosa desidera ardentemente (Ninjō) e come ostacola il dovere?", "ninjo"));

    $q.appendChild(makeTextQWithChoice(
      7,
      "Qual è il rapporto con il suo clan/comunità?",
      "clanRelation",
      "q7Reward",
      [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"glory", label:"Incremento Gloria (+5)"}
      ],
      (picked)=>{
        if(picked!=="skill") return null;
        const sel = makeSkillSelect("Seleziona abilità...");
        sel.value = state.q7Skill || "";
        sel.addEventListener("change", ()=>setState({q7Skill: sel.value}));
        return UI.field("Incremento abilità (Q7)", sel);
      }
    ));

    $q.appendChild(makeTextQWithChoice(
      8,
      "Cosa pensa del Bushidō?",
      "bushidoView",
      "q8Reward",
      [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"honor", label:"Incremento Onore (+10)"}
      ],
      (picked)=>{
        if(picked!=="skill") return null;
        const sel = makeSkillSelect("Seleziona abilità...");
        sel.value = state.q8Skill || "";
        sel.addEventListener("change", ()=>setState({q8Skill: sel.value}));
        return UI.field("Incremento abilità (Q8)", sel);
      }
    ));

    // 9-13
    $q.appendChild(makeTextQ(9, "Qual è il traguardo più grande raggiunto finora?", "achievement"));
    $q.appendChild(makeTextQ(10, "Cosa è di maggiore ostacolo nella vita?", "obstacle"));
    $q.appendChild(makeTextQ(11, "Quale attività lo fa sentire in pace?", "peaceActivity"));
    $q.appendChild(makeTextQ(12, "Quale dubbio/paura/debolezza lo preoccupa di più?", "anxiety"));

    $q.appendChild(makeTextQWithChoice(
      13,
      "Da chi ha imparato maggiormente?",
      "mentor",
      "q13Reward",
      [
        {id:"skill", label:"Incremento Abilità (1)"},
        {id:"advantage", label:"Vantaggio (1) (da scegliere manualmente)"}
      ],
      (picked)=>{
        if(picked==="skill"){
          const sel = makeSkillSelect("Seleziona abilità...");
          sel.value = state.q13Skill || "";
          sel.addEventListener("change", ()=>setState({q13Skill: sel.value}));
          return UI.field("Incremento abilità (Q13)", sel);
        }
        return UI.el("div",{class:"badge warn"},[
          document.createTextNode("Nota: la lista dei Vantaggi ufficiali non è ancora nel dataset. Inseriscilo manualmente nelle note o implementalo nel dataset.")
        ]);
      }
    ));

    // 14-16
    $q.appendChild(makeTextQ(14, "Che cosa notano prima le persone che lo incontrano?", "firstImpression"));
    $q.appendChild(makeTextQ(15, "Come reagisce alle situazioni stressanti?", "stressReaction"));

    const rel = UI.textarea("Clans/famiglie/organizzazioni/tradizioni…");
    rel.value = state.relations;
    rel.addEventListener("input", e=>setStateText({relations:e.target.value}));
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
