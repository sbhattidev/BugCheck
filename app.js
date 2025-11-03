/* -------------------------
   Templates loaded from bugs.js
   ------------------------- */
// templates variable comes from bugs.js

const STORAGE_KEY = "bb_subdomain_mode_v3";
let state = loadState();
let currentSub = null;
let currentTab = Object.keys(templates)[0];
let inSummary = false;


/* -------------------------
   Load / Save
   ------------------------- */
function loadState(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { subdomains:{} }; }
  catch(e){ return { subdomains:{} }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }


/* -------------------------
   Ensure subdomain structure
   ------------------------- */
function ensureSubdomain(name){
  if(!state.subdomains[name]){
    state.subdomains[name] = { tabs:{} };
    for(const t of Object.keys(templates)){
      state.subdomains[name].tabs[t] = { checked:{}, notes:"" };
    }
    saveState();
  }
}


/* -------------------------
   UI actions
   ------------------------- */
function addSub(){
  const v=document.getElementById('subInput').value.trim();
  if(!v) return;
  ensureSubdomain(v);
  currentSub=v;
  document.getElementById('subInput').value='';
  inSummary = false;
  render();
}

function renderSubList(){
  const wrap=document.getElementById('subList'); wrap.innerHTML='';
  const keys = Object.keys(state.subdomains);
  if(keys.length===0){
    const hint = document.createElement('div');
    hint.className = 'small muted';
    hint.textContent = 'Add a subdomain to start.';
    wrap.appendChild(hint);
    return;
  }
  keys.forEach(s=>{
    const d=document.createElement('div');
    d.className='sub-item'+(s===currentSub?' active':'' );
    d.textContent=s;
    d.onclick=()=>{ currentSub=s; inSummary = false; render(); };
    wrap.appendChild(d);
  });
}


/* -------------------------
   Tabs
   ------------------------- */
function renderTabs(){
  const tb=document.getElementById('tabButtons'); tb.innerHTML='';
  if(inSummary) return; // hide tabs in summary view
  Object.keys(templates).forEach(t=>{
    const b=document.createElement('button');
    b.textContent=t;
    b.className = (t===currentTab? 'active' : '');
    b.onclick = ()=> { currentTab=t; render(); };
    tb.appendChild(b);
  });
}


/* -------------------------
   Checklist
   ------------------------- */
function renderChecklist(){
  const root=document.getElementById('list'); root.innerHTML='';
  if(inSummary) return;
  if(!currentSub) return;

  const data = state.subdomains[currentSub].tabs[currentTab];

  for(const sec in templates[currentTab]){
    const box = document.createElement('div'); box.className='section';
    box.innerHTML = `<h3>${sec}</h3>`;

    templates[currentTab][sec].forEach(item=>{
      if(!data.checked[item]) data.checked[item] = { scanned:false, found:false };

      const row = document.createElement('div');
      row.className = 'check-row';
      row.innerHTML = `
        <label class="label-check">
          <input type="checkbox" ${data.checked[item].scanned?"checked":""}
            onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${item}'].scanned = this.checked; saveState();">
          Scanned
        </label>
        <label class="label-check">
          <input type="checkbox" ${data.checked[item].found?"checked":""}
            onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${item}'].found = this.checked; saveState();">
          Found
        </label>
        <span class="item-text">${item}</span>
      `;
      box.appendChild(row);
    });

    root.appendChild(box);
  }
}


/* -------------------------
   Notes
   ------------------------- */
function renderNotes(){
  const notesEl = document.getElementById('notesArea');
  if(inSummary){ notesEl.value = ''; notesEl.disabled = true; return; }
  if(!currentSub) { notesEl.value = ''; notesEl.disabled = true; return; }
  notesEl.disabled = false;
  notesEl.value = state.subdomains[currentSub].tabs[currentTab].notes || '';
  notesEl.oninput = () => { 
    state.subdomains[currentSub].tabs[currentTab].notes = notesEl.value; 
    saveState(); 
  };
}


/* -------------------------
   Summary
   ------------------------- */
function showSummary(){
  inSummary = true;
  render();
}

function renderSummary(){
  const root = document.getElementById('list'); root.innerHTML='';

  const container = document.createElement('div');
  container.className = 'section';

  const title = document.createElement('h3');
  title.textContent = 'Summary';
  container.appendChild(title);

  const overall = { totalItems:0, scanned:0, found:0 };

  Object.keys(state.subdomains).forEach(domain=>{
    const domBox = document.createElement('div');
    domBox.style.marginBottom = '12px';
    const dh = document.createElement('div');
    dh.style.fontWeight = '700';
    dh.style.marginBottom = '6px';
    dh.textContent = domain;
    domBox.appendChild(dh);

    Object.keys(templates).forEach(tab=>{
      const tabRow = document.createElement('div');
      tabRow.style.display = 'flex';
      tabRow.style.gap = '12px';
      tabRow.style.alignItems = 'center';
      tabRow.style.marginBottom = '6px';

      const tabTitle = document.createElement('div');
      tabTitle.style.width = '120px';
      tabTitle.textContent = tab;
      tabTitle.style.fontWeight = '600';
      tabRow.appendChild(tabTitle);

      let tabTotal = 0, tabScanned = 0, tabFound = 0;
      const tabState = state.subdomains[domain].tabs[tab] || { checked:{} };
      Object.keys(templates[tab]).forEach(section=>{
        templates[tab][section].forEach(item=>{
          tabTotal++;
          if(tabState.checked && tabState.checked[item]){
            if(tabState.checked[item].scanned) tabScanned++;
            if(tabState.checked[item].found) tabFound++;
          }
        });
      });

      overall.totalItems += tabTotal;
      overall.scanned += tabScanned;
      overall.found += tabFound;

      const counts = document.createElement('div');
      counts.textContent = `Items: ${tabTotal} • Scanned: ${tabScanned} • Found: ${tabFound}`;
      tabRow.appendChild(counts);
      domBox.appendChild(tabRow);
    });

    container.appendChild(domBox);
  });

  const totalBox = document.createElement('div');
  totalBox.style.marginTop = '12px';
  totalBox.style.fontWeight = '700';
  totalBox.textContent = `Overall — Items: ${overall.totalItems} • Scanned: ${overall.scanned} • Found: ${overall.found}`;
  container.appendChild(totalBox);

  const back = document.createElement('div');
  back.style.marginTop = '14px';
  const btn = document.createElement('button');
  btn.textContent = 'Back to checklist';
  btn.onclick = ()=>{ inSummary = false; render(); };
  btn.className = 'back-btn';
  back.appendChild(btn);
  container.appendChild(back);

  root.appendChild(container);
}


/* -------------------------
   Export / Import / Reset
   ------------------------- */
function exportJSON(){
  const a=document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type:'application/json' }));
  a.download = 'bb_subdomains_full.json';
  a.click();
}

function importJSON(){
  const i=document.createElement('input'); i.type='file'; i.accept='application/json';
  i.onchange = e => {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = () => {
      try{
        const parsed = JSON.parse(r.result);
        state = parsed;
        saveState();
        inSummary = false;
        render();
      }catch(err){
        alert('Invalid JSON file.');
      }
    };
    r.readAsText(f);
  };
  i.click();
}

function resetAll(){
  if(confirm('Reset everything?')) {
    state = { subdomains:{} };
    currentSub = null;
    inSummary = false;
    saveState();
    render();
  }
}


/* -------------------------
   Render everything
   ------------------------- */
function render(){
  renderSubList();
  renderTabs();
  if(inSummary){
    renderSummary();
  } else {
    renderChecklist();
  }
  renderNotes();
}

/* Initialize */
render();
