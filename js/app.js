/* Templates come from bugs.js */
const STORAGE_KEY = "bb_subdomain_mode_v5";
let state = loadState();
let currentSub = null;
let currentTab = Object.keys(templates)[0];
let inSummary = false;

/* Load & Save */
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { subdomains:{} }; }
  catch(e){ return { subdomains:{} }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* Ensure structure */
function ensureSubdomain(name){
  if(!state.subdomains[name]){
    state.subdomains[name] = {
      notes: "",          // ✅ SINGLE NOTE PER DOMAIN
      tabs: {}
    };
    for(const t of Object.keys(templates)){
      state.subdomains[name].tabs[t] = { checked:{} };
    }
    saveState();
  }
}

/* Add */
function addSub(){
  const v = subInput.value.trim();
  if(!v) return;
  ensureSubdomain(v);
  currentSub = v;
  subInput.value = "";
  inSummary = false;
  render();
}

/* Rename */
function renameSub(old){
  const n = prompt("Rename subdomain:", old);
  if(!n || n.trim()==="" || n===old) return;
  state.subdomains[n] = state.subdomains[old];
  delete state.subdomains[old];
  if(currentSub===old) currentSub=n;
  saveState();
  render();
}

/* Delete */
function deleteSub(name){
  if(!confirm("Delete " + name + "?")) return;
  delete state.subdomains[name];
  if(currentSub===name) currentSub=null;
  saveState();
  render();
}

/* Sidebar list */
function renderSubList(){
  subList.innerHTML="";
  Object.keys(state.subdomains).forEach(s=>{
    const row=document.createElement("div");
    row.className="sub-item"+(s===currentSub?" active":"");

    const nameSpan=document.createElement("span");
    nameSpan.textContent=s;
    nameSpan.onclick=()=>{ currentSub=s; inSummary=false; render(); };

    const del=document.createElement("button");
    del.textContent="🗑";
    del.onclick=()=>deleteSub(s);

    row.append(nameSpan,del);
    subList.appendChild(row);
  });
}

/* ✅ HTML tabs compatibility (NO LOGIC CHANGE) */
function switchTab(tab){
  currentTab = tab;
  inSummary = false;
  render();
}

/* Checklist */
function renderChecklist(){
  list.innerHTML="";
  if(inSummary || !currentSub) return;

  const data = state.subdomains[currentSub].tabs[currentTab];

  for(const sec in templates[currentTab]){
    const box=document.createElement("div");
    box.className="section";
    box.innerHTML=`<h3>${sec}</h3>`;

    templates[currentTab][sec].forEach(bug=>{
      const key=bug.text;
      if(!data.checked[key]) data.checked[key]={scanned:false,found:false};

      const row=document.createElement("div");
      row.className="check-row";
      row.innerHTML=`
        <label>
          <input type="checkbox" ${data.checked[key].scanned?"checked":""}
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].scanned=this.checked; saveState();">
          Scanned
        </label>

        <label>
          <input type="checkbox" ${data.checked[key].found?"checked":""}
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].found=this.checked; saveState();">
          Found
        </label>

        <span class="item-text">
          ${bug.text}
          <span class="sev-tag ${bug.severity.toLowerCase()}">${bug.severity}</span>
        </span>
      `;
      box.appendChild(row);
    });

    list.appendChild(box);
  }
}

/* ✅ FIXED NOTES (ONE NOTE EVERYWHERE) */
function renderNotes(){
  if(inSummary || !currentSub){
    notesArea.value="";
    notesArea.disabled=true;
    return;
  }

  notesArea.disabled=false;
  notesArea.value = state.subdomains[currentSub].notes;

  notesArea.oninput = () => {
    state.subdomains[currentSub].notes = notesArea.value;
    saveState();
  };
}

/* Summary */
function showSummary(){ inSummary=true; render(); }

/* Export / Import / Reset (UNCHANGED) */
function exportJSON(){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)]));
  a.download="bugcheck.json";
  a.click();
}

function importJSON(){
  const i=document.createElement("input");
  i.type="file";
  i.accept="application/json";
  i.onchange=e=>{
    const f=e.target.files[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      state=JSON.parse(r.result);
      saveState();
      inSummary=false;
      render();
    };
    r.readAsText(f);
  };
  i.click();
}

function resetAll(){
  if(confirm("Reset everything?")){
    state={subdomains:{}};
    currentSub=null;
    saveState();
    render();
  }
}

/* Render */
function render(){
  renderSubList();
  inSummary ? renderSummary?.() : renderChecklist();
  renderNotes();
}

render();
