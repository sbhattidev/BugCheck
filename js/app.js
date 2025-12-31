/* ------------------------- STATE & STORAGE ------------------------- */
const STORAGE_KEY = "bb_subdomain_mode_v5";
let state = loadState();
let currentSub = null;
let currentTab = "Javascript";
let inSummary = false;

/* Load & Save */
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { subs: {} }; }
  catch(e){ return { subs: {} }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ------------------------- SUBDOMAINS ------------------------- */
function ensureSubdomain(name){
  if(!state.subs[name]){
    state.subs[name] = { tabs: {}, notes: "" };
    for(const t of Object.keys(templates)){
      state.subs[name].tabs[t] = { checked: {} };
    }
    saveState();
  }
}

function addSub(){
  const v = document.getElementById("subInput").value.trim();
  if(!v) return;
  ensureSubdomain(v);
  currentSub = v;
  document.getElementById("subInput").value = "";
  inSummary = false;
  render();
}

function editSub(old){
  const n = prompt("Rename subdomain:", old);
  if(!n || n.trim()==="" || n===old) return;
  state.subs[n] = state.subs[old];
  delete state.subs[old];
  if(currentSub===old) currentSub=n;
  saveState();
  render();
}

function deleteSub(name){
  if(!confirm("Delete " + name + "?")) return;
  delete state.subs[name];
  if(currentSub===name) currentSub=null;
  saveState();
  render();
}

/* Render subdomain list */
function renderSubs(){
  const wrap = document.getElementById("subList");
  wrap.innerHTML = "";

  Object.keys(state.subs).forEach(sub=>{
    const row = document.createElement("div");
    row.className = "sub-item" + (sub === currentSub ? " active" : "");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";

    const nameSpan = document.createElement("div");
    nameSpan.textContent = sub;
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = ()=>{ currentSub=sub; inSummary=false; render(); };

    const btns = document.createElement("div");
    const edit = document.createElement("button");
    edit.textContent="✏"; edit.onclick=()=>editSub(sub);
    const del = document.createElement("button");
    del.textContent="🗑"; del.onclick=()=>deleteSub(sub);
    btns.append(edit,del);

    row.append(nameSpan, btns);
    wrap.appendChild(row);
  });
}

/* ------------------------- TABS ------------------------- */
function switchTab(tab){
  if(tab==="javascript") currentTab="Javascript";
  else if(tab==="api") currentTab="API";
  else if(tab==="logic") currentTab="BusinessLogic";
  render();
  updateTabHighlight();
}

function updateTabHighlight(){
  const tabs = document.querySelectorAll(".tabs button");
  tabs.forEach(btn=>btn.classList.remove("active"));
  if(currentTab==="Javascript") tabs[0].classList.add("active");
  else if(currentTab==="API") tabs[1].classList.add("active");
  else if(currentTab==="BusinessLogic") tabs[2].classList.add("active");
}

/* ------------------------- CHECKLIST ------------------------- */
function renderChecklist(){
  const list = document.getElementById("list");
  list.innerHTML="";
  if(!currentSub || inSummary) return;

  const data = state.subs[currentSub].tabs[currentTab];

  for(const sec in templates[currentTab]){
    const box = document.createElement("div");
    box.className="section";
    box.innerHTML=`<h3>${sec}</h3>`;

    templates[currentTab][sec].forEach(bug=>{
      const key = bug.text;
      if(!data.checked[key]) data.checked[key]={scanned:false,found:false};

      const row = document.createElement("div");
      row.className="check-row";

      row.innerHTML = `
        <label><input type="checkbox" ${data.checked[key].scanned?"checked":""}
          onchange="state.subs['${currentSub}'].tabs['${currentTab}'].checked['${key}'].scanned=this.checked; saveState();"> Scanned</label>

        <label><input type="checkbox" ${data.checked[key].found?"checked":""}
          onchange="state.subs['${currentSub}'].tabs['${currentTab}'].checked['${key}'].found=this.checked; saveState();"> Found</label>

        <span class="item-text">${bug.text}
          <span class="sev-tag ${bug.severity.toLowerCase()}">${bug.severity}</span>
        </span>
      `;
      box.appendChild(row);
    });

    list.appendChild(box);
  }
}

/* ------------------------- NOTES ------------------------- */
function renderNotes(){
  const notesArea = document.getElementById("notesArea");
  if(!currentSub || inSummary){ notesArea.value=""; notesArea.disabled=true; return; }
  notesArea.disabled=false;
  notesArea.value = state.subs[currentSub].notes || "";
  notesArea.oninput=()=>{
    state.subs[currentSub].notes = notesArea.value;
    saveState();
  };
}

/* ------------------------- SUMMARY ------------------------- */
function showSummary(){ inSummary=true; render(); }

function renderSummary(){
  const root = document.getElementById("list");
  root.innerHTML="";
  const container = document.createElement("div");
  container.className="section";
  container.innerHTML=`<h3>Summary</h3>`;

  let totalAll=0, scannedAll=0, foundAll=0;

  Object.keys(state.subs).forEach(domain=>{
    const subBox = document.createElement("div");
    subBox.className="summary-subdomain";

    const title = document.createElement("h4");
    title.textContent=domain;
    subBox.appendChild(title);

    Object.keys(templates).forEach(tab=>{
      let total=0, scanned=0, found=0;
      const tabState = state.subs[domain].tabs[tab] || { checked:{} };

      Object.keys(templates[tab]).forEach(section=>{
        templates[tab][section].forEach(bug=>{
          total++;
          const key = bug.text;
          if(tabState.checked[key]){
            if(tabState.checked[key].scanned) scanned++;
            if(tabState.checked[key].found) found++;
          }
        });
      });

      totalAll+=total;
      scannedAll+=scanned;
      foundAll+=found;

      const row = document.createElement("div");
      row.className="summary-row";
      row.innerHTML = `
        <div class="summary-label">${tab} — Scanned: ${scanned}/${total} • Found: ${found}</div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${total?(scanned/total)*100:0}%"></div>
        </div>
      `;
      subBox.appendChild(row);
    });

    container.appendChild(subBox);
  });

  const totalBox = document.createElement("div");
  totalBox.className="summary-total";
  const percent = totalAll?Math.round((scannedAll/totalAll)*100):0;
  totalBox.textContent=`TOTAL PROGRESS — ${percent}%  (Scanned ${scannedAll}/${totalAll} • Found ${foundAll})`;
  container.appendChild(totalBox);

  const back = document.createElement("button");
  back.textContent="← Back to Checklist";
  back.className="back-btn";
  back.style.marginTop="14px";
  back.onclick=()=>{ inSummary=false; render(); };
  container.appendChild(back);

  root.appendChild(container);
}

/* ------------------------- IMPORT / EXPORT / RESET ------------------------- */
function exportJSON(){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)]));
  a.download = "bugcheck.json";
  a.click();
}
function importJSON(){
  const i = document.createElement("input");
  i.type="file";
  i.accept="application/json";
  i.onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload=()=>{
      state = JSON.parse(r.result);
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
    state={subs:{}};
    currentSub=null;
    saveState();
    render();
  }
}

/* ------------------------- RENDER ------------------------- */
function render(){
  renderSubs();
  renderChecklist();
  renderNotes();
  updateTabHighlight();
}

// Initial render
render();
