/* Templates come from bugs.js */
const STORAGE_KEY = "bb_subdomain_mode_v5";

let state = loadState();
let currentSub = null;
let currentTab = Object.keys(templates)[0];
let inSummary = false;

/* ---------------- Load & Save ---------------- */

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { subdomains: {} };
  } catch {
    return { subdomains: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Data Structure ---------------- */

function ensureSubdomain(name) {
  if (!state.subdomains[name]) {
    state.subdomains[name] = {
      notes: "",
      tabs: {}
    };

    Object.keys(templates).forEach(tab => {
      state.subdomains[name].tabs[tab] = { checked: {} };
    });

    saveState();
  }
}

/* ---------------- Subdomain CRUD ---------------- */

function addSub() {
  const v = subInput.value.trim();
  if (!v) return;

  ensureSubdomain(v);
  currentSub = v;
  subInput.value = "";
  inSummary = false;
  render();
}

function renameSub(oldName) {
  const n = prompt("Rename subdomain:", oldName);
  if (!n || n === oldName) return;

  state.subdomains[n] = state.subdomains[oldName];
  delete state.subdomains[oldName];

  if (currentSub === oldName) currentSub = n;

  saveState();
  render();
}

function deleteSub(name) {
  if (!confirm("Delete " + name + "?")) return;

  delete state.subdomains[name];
  if (currentSub === name) currentSub = null;

  saveState();
  render();
}

/* ---------------- Sidebar ---------------- */

function renderSubList() {
  subList.innerHTML = "";

  Object.keys(state.subdomains).forEach(name => {
    const row = document.createElement("div");
    row.className = "sub-item" + (name === currentSub ? " active" : "");

    const label = document.createElement("span");
    label.textContent = name;
    label.onclick = () => {
      currentSub = name;
      inSummary = false;
      render();
    };

    const edit = document.createElement("button");
    edit.textContent = "✏";
    edit.onclick = () => renameSub(name);

    const del = document.createElement("button");
    del.textContent = "🗑";
    del.onclick = () => deleteSub(name);

    row.append(label, edit, del);
    subList.appendChild(row);
  });
}

/* ---------------- Tabs ---------------- */

function renderTabs() {
  tabButtons.innerHTML = "";
  if (inSummary) return;

  Object.keys(templates).forEach(tab => {
    const b = document.createElement("button");
    b.textContent = tab;
    b.className = tab === currentTab ? "active" : "";
    b.onclick = () => {
      currentTab = tab;
      render();
    };
    tabButtons.appendChild(b);
  });
}

/* ---------------- Checklist ---------------- */

function renderChecklist() {
  list.innerHTML = "";
  if (inSummary || !currentSub) return;

  const tabData = state.subdomains[currentSub].tabs[currentTab];

  Object.keys(templates[currentTab]).forEach(section => {
    const box = document.createElement("div");
    box.className = "section";
    box.innerHTML = `<h3>${section}</h3>`;

    templates[currentTab][section].forEach(bug => {
      const key = bug.text;

      if (!tabData.checked[key]) {
        tabData.checked[key] = { scanned: false, found: false };
      }

      const row = document.createElement("div");
      row.className = "check-row";
      row.innerHTML = `
        <label>
          <input type="checkbox" ${tabData.checked[key].scanned ? "checked" : ""}
            onchange="state.subdomains['${currentSub}'].tabs['${currentTab}'].checked['${key}'].scanned=this.checked; saveState();">
          Scanned
        </label>

        <label>
          <input type="checkbox" ${tabData.checked[key].found ? "checked" : ""}
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
  });
}

/* ---------------- Notes (SINGLE, SHARED) ---------------- */

function renderNotes() {
  if (inSummary || !currentSub) {
    notesArea.value = "";
    notesArea.disabled = true;
    return;
  }

  notesArea.disabled = false;
  notesArea.value = state.subdomains[currentSub].notes;

  notesArea.oninput = () => {
    state.subdomains[currentSub].notes = notesArea.value;
    saveState();
  };
}

/* ---------------- Summary ---------------- */

function showSummary() {
  inSummary = true;
  render();
}

function renderSummary() {
  list.innerHTML = "";

  const box = document.createElement("div");
  box.className = "section";
  box.innerHTML = `<h3>Summary</h3>`;

  Object.keys(state.subdomains).forEach(domain => {
    const h = document.createElement("h4");
    h.textContent = domain;
    box.appendChild(h);
  });

  const back = document.createElement("button");
  back.textContent = "← Back";
  back.onclick = () => {
    inSummary = false;
    render();
  };

  box.appendChild(back);
  list.appendChild(box);
}

/* ---------------- Import / Export ---------------- */

function exportJSON() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(state, null, 2)])
  );
  a.download = "bugcheck.json";
  a.click();
}

function importJSON() {
  const i = document.createElement("input");
  i.type = "file";
  i.accept = "application/json";

  i.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = () => {
      state = JSON.parse(r.result);
      saveState();
      inSummary = false;
      render();
    };
    r.readAsText(f);
  };

  i.click();
}

function resetAll() {
  if (!confirm("Reset everything?")) return;
  state = { subdomains: {} };
  currentSub = null;
  saveState();
  render();
}

/* ---------------- Render ---------------- */

function render() {
  renderSubList();
  renderTabs();
  inSummary ? renderSummary() : renderChecklist();
  renderNotes();
}

render();
