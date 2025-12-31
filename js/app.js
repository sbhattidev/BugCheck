/* -------------------------
   Global State
------------------------- */

let currentTab = "Javascript"; // MUST match template key
let currentSub = null;
let inSummary = false;

const state = {
  subs: {}
};

/* -------------------------
   Subdomain Logic
------------------------- */

function addSub() {
  const input = document.getElementById("subInput");
  const sub = input.value.trim();
  if (!sub) return;

  if (!state.subs[sub]) {
    state.subs[sub] = {
      notes: "",
      checks: {}
    };
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
   TAB FIX (IMPORTANT PART)
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
  if (!data) {
    list.innerHTML = "<p>No template found</p>";
    return;
  }

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
      };

      label.appendChild(cb);
      label.append(` ${item.text} (${item.severity})`);
      section.appendChild(label);
    });

    list.appendChild(section);
  });

  // Notes (domain-level, untouched logic)
  const notesArea = document.getElementById("notesArea");
  notesArea.value = state.subs[currentSub].notes || "";
  notesArea.oninput = () => {
    state.subs[currentSub].notes = notesArea.value;
  };
}

/* -------------------------
   Init
------------------------- */

renderSubs();
render();
