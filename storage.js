(function(){
  const KEY = "l5r_builder_v1";

  function save(state){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function load(){
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function downloadJson(obj, filename){
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
  }

  function readFileJson(file){
    return new Promise((resolve,reject)=>{
      const fr = new FileReader();
      fr.onload = () => {
        try { resolve(JSON.parse(fr.result)); } catch(e){ reject(e); }
      };
      fr.onerror = reject;
      fr.readAsText(file);
    });
  }

  window.STORAGE = { save, load, downloadJson, readFileJson };
})();
