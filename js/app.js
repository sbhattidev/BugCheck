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

function renderSubs() {
  const box = document.getElementById("subList");
  box.innerHTML = "";

  Object.keys(state.subs).forEach(sub => {
    const div = document.createElement("div");
    div.className = "sub-item";
    div.textContent = sub;
    div.onclick = () => {
      currentSub = sub;
      render();
    };
    box.appendChild(div);
  });
}

/* -------------------------
   Tabs (FIXED)
------------------------- */

function switchTab(tab) {
  if (tab === "javascript") currentTab = "Javascript";
  else if (tab === "api") currentTab = "API";
  else if (tab === "logic") currentTab = "BusinessLogic";

  inSummary = false;
  render();
}

/* -------------------------
   Checklist Rendering
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

  Object.keys(data).forEach(category => {
    const section = document.createElement("div");
    section.className = "category";

    const h3 = document.createElement("h3");
    h3.textContent = category;
    section.appendChild(h3);

    data[category].forEach((item, index) => {
      const id = `${currentTab}|${category}|${index}`;

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
      section.appendChild(label);
    });

    list.appendChild(section);
  });

  const notes = document.getElementById("notesArea");
  notes.value = state.subs[currentSub].notes || "";
  notes.oninput = () => {
    state.subs[currentSub].notes = notes.value;
    saveState();
  };
}

/* -------------------------
   Export / Import JSON
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
