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
      notes: "",
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

    const name=document.createElement("span");
    name.textContent=s;
    name.onclick=()=>{ currentSub=s; inSummary=false; render(); };

    const edit=document.createElement("button");
    edit.textContent="✏";
    edit.onclick=()=>renameSub(s);

    const del=document.createElement("button");
    del.textContent="🗑";
    del.onclick=()=>deleteSub(s);

    row.append(name,edit,del);
    subList.appendChild(row);
  });
}

/* Tabs */
function renderTabs(){
  tabButtons.innerHTML="";
  if(inSummary) return;
  Object.keys(templates).forEach(t=>{
    const b=document.createElement("button");
    b.textContent=t;
    b.className=(t===currentTab?"active":"");
    b.onclick=()=>{ currentTab=t; render(); };
    tabButtons.appendChild(b);
  });
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
        <label><input type="checkbox" ${data.checked[key].scanned?"checked":""}
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].scanned=this.checked; saveState();">
          Scanned</label>

        <label><input type="checkbox" ${data.checked[key].found?"checked":""}
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].found=this.checked; saveState();">
          Found</label>

        <span class="item-text">${bug.text}
          <span class="sev-tag ${bug.severity.toLowerCase()}">${bug.severity}</span>
        </span>
      `;
      box.appendChild(row);
    });

    list.appendChild(box);
  }
}

/* ✅ SINGLE SHARED NOTES */
function renderNotes(){
  if(inSummary || !currentSub){
    notesArea.value="";
    notesArea.disabled=true;
    return;
  }

  notesArea.disabled=false;
  notesArea.value = state.subdomains[currentSub].notes || "";

  notesArea.oninput = () => {
    state.subdomains[currentSub].notes = notesArea.value;
    saveState();
  };
}

/* Summary */
function showSummary(){ inSummary=true; render(); }

/* Render */
function render(){
  renderSubList();
  renderTabs();
  inSummary ? renderSummary() : renderChecklist();
  renderNotes();
}
render();
