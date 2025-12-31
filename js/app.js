/* -------------------------
   Constants
------------------------- */

const STORAGE_KEY = "bug_bounty_data";

/* -------------------------
   Global State
------------------------- */

let currentTab = "Javascript";
let currentSub = null;
let inSummary = false;

let state = {
  subs: {}
};

/* -------------------------
   Storage
------------------------- */

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    state = JSON.parse(raw);
    const subs = Object.keys(state.subs);
    if (subs.length) currentSub = subs[0];
  }
}

/* -------------------------
   Subdomain Logic
------------------------- */

function addSub() {
  const input = document.getElementById("subInput");
  const sub = input.value.trim();
  if (!sub) return;

  if (!state.subs[sub]) {
    state.subs[sub] = { notes: "", checks: {} };
    saveState();
  }

  currentSub = sub;
  input.value = "";
  renderSubs();
  render();
}

function editSub(oldName) {
  const newName = prompt("Rename subdomain:", oldName);
  if (!newName) return;

  const name = newName.trim();
  if (!name || name === oldName) return;

  if (state.subs[name]) {
    alert("Subdomain already exists");
    return;
  }

  state.subs[name] = state.subs[oldName];
  delete state.subs[oldName];

  if (currentSub === oldName) currentSub = name;

  saveState();
  renderSubs();
  render();
}

function deleteSub(sub) {
  if (!state.subs[sub]) return;

  if (!confirm(`Delete subdomain "${sub}"?\nAll data will be lost.`)) return;

  delete state.subs[sub];

  const keys = Object.keys(state.subs);
  currentSub = keys.length ? keys[0] : null;

  saveState();
  renderSubs();
  render();
}

/* -------------------------
   Sidebar Render
------------------------- */

function renderSubs() {
  const box = document.getElementById("subList");
  box.innerHTML = "";

  Object.keys(state.subs).forEach(sub => {
    const row = document.createElement("div");
    row.className = "sub-item";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";

    const name = document.createElement("span");
    name.textContent = sub;
    name.style.cursor = "pointer";
    name.onclick = () => {
      currentSub = sub;
      render();
    };

    const actions = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏";
    editBtn.onclick = () => editSub(sub);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.onclick = () => deleteSub(sub);

    actions.append(editBtn, delBtn);
    row.append(name, actions);
    box.appendChild(row);
  });
}

/* -------------------------
   Tabs
------------------------- */

function switchTab(tab) {
  if (tab === "javascript") currentTab = "Javascript";
  else if (tab === "api") currentTab = "API";
  else if (tab === "logic") currentTab = "BusinessLogic";

  render();
}

/* -------------------------
   Checklist Render
------------------------- */

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  if (!currentSub) {
    list.innerHTML = "<p>Add or select a subdomain</p>";
    return;
  }

  const data = templates[currentTab];
  if (!data) return;

  Object.keys(data).forEach(section => {
    const box = document.createElement("div");
    box.className = "section";

    const h3 = document.createElement("h3");
    h3.textContent = section;
    box.appendChild(h3);

    data[section].forEach((item, i) => {
      const id = `${currentTab}|${section}|${i}`;

      const label = document.createElement("label");
      label.style.display = "block";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!state.subs[currentSub].checks[id];
      cb.onchange = () => {
        state.subs[currentSub].checks[id] = cb.checked;
        saveState();
      };

      label.appendChild(cb);
      label.append(` ${item.text} (${item.severity})`);
      box.appendChild(label);
    });

    list.appendChild(box);
  });

  const notes = document.getElementById("notesArea");
  notes.value = state.subs[currentSub].notes || "";
  notes.oninput = () => {
    state.subs[currentSub].notes = notes.value;
    saveState();
  };
}

/* -------------------------
   Export / Import
------------------------- */

function exportJSON() {
  const blob = new Blob(
    [JSON.stringify(state, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bug-bounty-data.json";
  a.click();
}

function importJSON() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      state = JSON.parse(reader.result);
      saveState();
      renderSubs();
      currentSub = Object.keys(state.subs)[0] || null;
      render();
    };
    reader.readAsText(file);
  };

  input.click();
}

/* -------------------------
   Reset
------------------------- */

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  state = { subs: {} };
  currentSub = null;
  renderSubs();
  render();
}

/* -------------------------
   Init
------------------------- */

loadState();
renderSubs();
render();
