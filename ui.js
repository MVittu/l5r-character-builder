(function(){
  const el = (tag, attrs={}, children=[])=>{
    const n=document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==="class") n.className=v;
      else if(k==="html") n.innerHTML=v;
      else if(k.startsWith("on") && typeof v==="function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k,v);
    });
    children.forEach(c=> n.appendChild(typeof c==="string" ? document.createTextNode(c) : c));
    return n;
  };

  function option(value, label){
    const o=document.createElement("option");
    o.value=value;
    o.textContent=label;
    return o;
  }

  function selectFrom(items, getValue, getLabel, placeholder){
    const s=document.createElement("select");
    if(placeholder){
      s.appendChild(option("", placeholder));
    }
    items.forEach(it=> s.appendChild(option(getValue(it), getLabel(it))));
    return s;
  }

  function field(labelText, inputEl){
    return el("div",{},[
      el("label",{html:labelText}),
      inputEl
    ]);
  }

  function textarea(placeholder=""){
    const t=el("textarea",{placeholder});
    return t;
  }

  function text(placeholder=""){
    return el("input",{type:"text", placeholder});
  }

  function ringSelect(placeholder="Seleziona anello"){
    const s=document.createElement("select");
    s.appendChild(option("", placeholder));
    window.RULES.RINGS.forEach(r=> s.appendChild(option(r,r)));
    return s;
  }

  window.UI = { el, field, text, textarea, selectFrom, ringSelect };
})();
