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
    state.subdomains[name] = { tabs:{} };
    for(const t of Object.keys(templates)){
      state.subdomains[name].tabs[t] = { checked:{}, notes:"" };
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
  const wrap=subList;
  wrap.innerHTML="";

  Object.keys(state.subdomains).forEach(s=>{
    const row=document.createElement("div");
    row.className="sub-item"+(s===currentSub?" active":"");

    const nameSpan=document.createElement("span");
    nameSpan.textContent=s;
    nameSpan.style.cursor="pointer";
    nameSpan.onclick=()=>{ currentSub=s; inSummary=false; render(); };

    const btns=document.createElement("div");
    btns.style.display="flex";
    btns.style.gap="4px";

    const edit=document.createElement("button");
    edit.textContent="✏";
    edit.style.padding="2px 6px";
    edit.onclick=()=>renameSub(s);

    const del=document.createElement("button");
    del.textContent="🗑";
    del.style.padding="2px 6px";
    del.onclick=()=>deleteSub(s);

    btns.append(edit,del);
    row.append(nameSpan,btns);
    row.style.display="flex";
    row.style.justifyContent="space-between";
    row.style.alignItems="center";

    wrap.appendChild(row);
  });
}

/* Tabs */
function renderTabs(){
  const tb=tabButtons;
  tb.innerHTML="";
  if(inSummary) return;

  Object.keys(templates).forEach(t=>{
    const b=document.createElement("button");
    b.textContent=t;
    b.className=(t===currentTab?"active":"");
    b.onclick=()=>{ currentTab=t; render(); };
    tb.appendChild(b);
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
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].scanned=this.checked; saveState();"> Scanned</label>

        <label><input type="checkbox" ${data.checked[key].found?"checked":""}
          onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].found=this.checked; saveState();"> Found</label>

        <span class="item-text">${bug.text}
          <span class="sev-tag ${bug.severity.toLowerCase()}">${bug.severity}</span>
        </span>
      `;
      box.appendChild(row);
    });

    list.appendChild(box);
  }
}

/* Notes */
function renderNotes(){
  if(inSummary || !currentSub){
    notesArea.value="";
    notesArea.disabled=true;
    return;
  }
  notesArea.disabled=false;
  notesArea.value=state.subdomains[currentSub].tabs[currentTab].notes||"";
  notesArea.oninput=()=>{
    state.subdomains[currentSub].tabs[currentTab].notes=notesArea.value;
    saveState();
  };
}

/* Summary */
function showSummary(){ inSummary=true; render(); }

function renderSummary() {
  const root = document.getElementById("list");
  root.innerHTML = "";

  const container = document.createElement("div");
  container.className = "section";
  container.innerHTML = `<h3>Summary</h3>`;

  let totalAll = 0, scannedAll = 0, foundAll = 0;

  Object.keys(state.subdomains).forEach((domain) => {
    const subBox = document.createElement("div");
    subBox.className = "summary-subdomain";

    const title = document.createElement("h4");
    title.textContent = domain;
    subBox.appendChild(title);

    Object.keys(templates).forEach((tab) => {
      let total = 0, scanned = 0, found = 0;
      const tabState = state.subdomains[domain].tabs[tab] || { checked: {} };

      Object.keys(templates[tab]).forEach(section => {
        templates[tab][section].forEach(bug => {
          total++;
          const key = bug.text;
          if (tabState.checked[key]) {
            if (tabState.checked[key].scanned) scanned++;
            if (tabState.checked[key].found) found++;
          }
        });
      });

      totalAll += total;
      scannedAll += scanned;
      foundAll += found;

      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `
        <div class="summary-label">${tab} — Scanned: ${scanned}/${total} • Found: ${found}</div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${total ? (scanned / total) * 100 : 0}%"></div>
        </div>
      `;
      subBox.appendChild(row);
    });

    container.appendChild(subBox);
  });

  const totalBox = document.createElement("div");
  totalBox.className = "summary-total";
  const percent = totalAll ? Math.round((scannedAll / totalAll) * 100) : 0;
  totalBox.textContent = `TOTAL PROGRESS — ${percent}%  (Scanned ${scannedAll}/${totalAll} • Found ${foundAll})`;
  container.appendChild(totalBox);

  const back = document.createElement("button");
  back.textContent = "← Back to Checklist";
  back.className = "back-btn";
  back.style.marginTop = "14px";
  back.onclick = () => { inSummary = false; render(); };

  container.appendChild(back);
  root.appendChild(container);
}


/* Export / Import / Reset */
function exportJSON(){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)]));
  a.download="bugcheck.json"; a.click();
}
function importJSON(){
  const i=document.createElement("input");
  i.type="file"; i.accept="application/json";
  i.onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      state=JSON.parse(r.result);
      saveState(); inSummary=false; render();
    };
    r.readAsText(f);
  };
  i.click();
}
function resetAll(){
  if(confirm("Reset everything?")){
    state={subdomains:{}}; currentSub=null;
    saveState(); render();
  }
}

/* Render */
function render(){
  renderSubList();
  renderTabs();
  inSummary ? renderSummary() : renderChecklist();
  renderNotes();
}
render();
