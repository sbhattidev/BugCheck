/* -------------------------
   Templates & storage
   ------------------------- */
const templates = {
  "Web": {
    "Recon": [
      "Find staging/dev sites (exposed staging endpoints)",
      "Search JS files for secrets (API keys, endpoints, tokens) — public assets",
      "Directory brute-force for hidden admin or UI paths",
      "Check robots.txt & sitemap for sensitive URLs"
    ],
    "Injection": [
      "SQL Injection — auth bypass / data exfiltration (UI forms, search fields)",
      "Command injection / RCE via unsanitized input (file import, admin panels)",
      "Server-Side Template Injection (SSTI) in rendered inputs",
      "Insecure deserialization leading to RCE or auth bypass (file uploads, object endpoints)"
    ],
    "AuthAndSession": [
      "Token not invalidated after logout (session reuse / replay)",
      "JWT / SAML signature bypass or replay (weak validation)",
      "Broken or bypassable MFA",
      "Password reset abuse / unlimited multiple-email links (spammable endpoint, account enumeration)"
    ],
    "AccessControl": [
      "Authenticated IDOR — read other user's data (exposure of PII)",
      "IDOR — modify/delete another user's object via UI (orders, profiles)",
      "Broken Access Control — privilege escalation to admin (call admin UI/actions with low-priv token)",
      "Mass assignment / parameter pollution in UI flows leading to privilege change",
      "Authorization bypass via forgotten UI endpoints (exposed staging/admin pages)"
    ],
    "SSRF": [
      "SSRF via URL fetch features reachable from web UI (can reach metadata/internal services)"
    ],
    "FileHandling": [
      "File upload to executable location (web shell upload → RCE)",
      "File upload bypass via double extension / content-type / magic-bytes bypass"
    ],
    "BusinessLogic": [
      "Price manipulation / free goods via tampered client-side values",
      "Order/state replay or race condition leading to double-spend or inventory theft",
      "Coupon / gift-card abuse allowing unauthorized discounts or refunds"
    ],
    "OAuthAndRedirect": [
      "OAuth/Open Redirect accepting arbitrary redirect_uri (token/code theft)",
      "Open redirect in application flows enabling phishing/token capture"
    ],
    "SensitiveData": [
      "Exposed backups or internal docs (s3, /backup, /internal/docs accessible from web)",
      "Secrets in JS bundles or .env leaked via public assets"
    ],
    "ClientSide": [
      "DOM-based XSS that can be chained to account takeover",
      "High-impact client-side chains / WebKit sandbox escape (WebView/WebKit inputs)"
    ]
  },
  "API": {
    "Discovery": [
      "Directory brute-force for hidden API endpoints (admin, internal, debug)",
      "Discover staging/internal APIs via certificate transparency, historical DNS, or JS",
      "Enumerate API docs (swagger/openapi) exposed in production"
    ],
    "AuthAndSession": [
      "Unauthenticated endpoints (no auth on sensitive APIs)",
      "Token not invalidated after logout for API tokens (replay with bearer token)",
      "JWT / SAML signature bypass or replay on API token validation",
      "Broken or bypassable MFA via API flows",
      "Password-reset/email endpoints that allow unlimited sends or user enumeration via API"
    ],
    "AccessControlAndIDOR": [
      "API IDOR — read other user's data by changing object id in URL or JSON",
      "API IDOR — modify/delete another user's object by changing id in request body",
      "Mass assignment / parameter pollution via API leading to privilege change",
      "Privilege escalation via API endpoints (call admin APIs with low-priv token)",
      "Internal/staging API endpoints accessible from production without auth"
    ],
    "RateLimitingAndDoS": [
      "Improper rate limiting on sensitive API endpoints (password reset, invites, expensive ops)",
      "Resource exhaustion via large payloads or expensive query params",
      "Mass email / password-reset API spammable (multiple-email links abuse)"
    ],
    "InjectionAndProcessing": [
      "SQL Injection via API parameters (data exfiltration/auth bypass)",
      "Insecure deserialization in API payloads leading to RCE",
      "Command injection via API-backed operations (import/execute features)"
    ],
    "SSRFAndServerCalls": [
      "SSRF via API endpoints that fetch attacker-controlled URLs (internal metadata, internal services)"
    ],
    "BusinessLogic": [
      "API business-logic flaws (price calculation done client-side, refund/order replay)",
      "Race conditions via API causing double-spend or inventory issues",
      "Refund/credit API abuse (issue refunds without proper authorization)"
    ],
    "SensitiveData": [
      "Sensitive PII returned by API endpoints without proper auth/filters",
      "Secrets, keys, or config leaked in JSON responses or error messages"
    ],
    "OAuthAndRedirect": [
      "OAuth API accepting arbitrary redirect_uri (authorization code/token theft)",
      "Open redirect endpoints reachable via API flows"
    ],
    "Misc": [
      "Improper CORS on APIs allowing unwanted origins",
      "Inconsistent auth between UI and API (UI blocks but API accepts)"
    ]
  }
};



const STORAGE_KEY = "bb_subdomain_mode_v2";
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
   Checklist (with scanned + found)
   ------------------------- */
function renderChecklist(){
  const root=document.getElementById('list'); root.innerHTML='';
  if(inSummary) return; // don't show checklist in summary mode
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
  notesEl.oninput = () => { state.subdomains[currentSub].tabs[currentTab].notes = notesEl.value; saveState(); };
}

/* -------------------------
   Summary view
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

  // build per-subdomain summary
  Object.keys(state.subdomains).forEach(domain=>{
    const domBox = document.createElement('div');
    domBox.style.marginBottom = '12px';
    const dh = document.createElement('div');
    dh.style.fontWeight = '700';
    dh.style.marginBottom = '6px';
    dh.textContent = domain;
    domBox.appendChild(dh);

    // per-tab table
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

      // compute counts for this tab
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

  // overall totals
  const totalBox = document.createElement('div');
  totalBox.style.marginTop = '12px';
  totalBox.style.fontWeight = '700';
  totalBox.textContent = `Overall — Items: ${overall.totalItems} • Scanned: ${overall.scanned} • Found: ${overall.found}`;
  container.appendChild(totalBox);

  // Back button
  const back = document.createElement('div');
  back.style.marginTop = '14px';
  const btn = document.createElement('button');
  btn.textContent = 'Back to checklist';
  btn.onclick = ()=>{ inSummary = false; render(); };
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '6px';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.background = '#222';
  btn.style.color = '#fff';
  back.appendChild(btn);
  container.appendChild(back);

  root.appendChild(container);

  // ensure tabs hidden and notes disabled handled by render()
}

/* -------------------------
   Export / Import
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

/* -------------------------
   Reset
   ------------------------- */
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
