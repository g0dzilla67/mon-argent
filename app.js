// Récupération des données
let wallets = JSON.parse(localStorage.getItem("wallets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// Canvases
const pieCtx = document.getElementById("pieChart").getContext("2d");
const histCtx = document.getElementById("historyChart").getContext("2d");
let pieChart, historyChart;

// Sauve en local
function save() {
  localStorage.setItem("wallets", JSON.stringify(wallets));
  localStorage.setItem("history", JSON.stringify(history));
}

// Mets à jour les graphiques
function updateCharts() {
  const labels = wallets.map(w => w.name);
  const data = wallets.map(w => w.amount);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: ['#00c49a','#3399ff','#ffcc00','#ff6699','#66ff66'] }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  const histLabels = history.map(h => h.date);
  const histData = history.map(h => h.total);
  if (historyChart) historyChart.destroy();
  historyChart = new Chart(histCtx, {
    type: 'line',
    data: { labels: histLabels, datasets: [{ label: 'Total', data: histData, borderColor: '#00c49a', tension: 0.3, fill: false }] }
  });
}

// Rendu des wallets et historique
function updateDisplay() {
  // Wallets
  const wCont = document.getElementById("wallets");
  wCont.innerHTML = "";
  const total = wallets.reduce((s, w) => s + w.amount, 0);
  document.getElementById("total").textContent = `Total : ${total.toFixed(2)}€`;

  wallets.forEach((w, idx) => {
    const div = document.createElement("div");
    div.className = "wallet";
    div.innerHTML = `
      <h3>${w.name} : ${w.amount.toFixed(2)}€</h3>
      <div class="wallet-actions">
        <input type="text" id="amount${idx}" placeholder="+/- montant" />
        <input type="text" id="note${idx}" placeholder="Note (ex : repas)" />
        <button class="edit-btn" onclick="editWallet(${idx})">Valider</button>
        <button class="rename-btn" onclick="renameWallet(${idx})">✏️</button>
        <button class="delete-btn" onclick="deleteWallet(${idx})">🗑️</button>
      </div>
    `;
    wCont.appendChild(div);
  });

  renderHistory();
  updateCharts();
}

// Rendu historique
function renderHistory() {
  const hCont = document.getElementById("historyLog");
  hCont.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-left">${h.date} • ${h.wallet} : ${h.delta > 0 ? '+' : ''}${h.delta.toFixed(2)}€</div>
      <div class="hist-note">${h.note || ''}</div>
    `;
    hCont.appendChild(div);
  });
}

// Actions

function editWallet(idx) {
  const amt = parseFloat(document.getElementById("amount"+idx).value);
  const note = document.getElementById("note"+idx).value.trim();
  if (isNaN(amt)) return alert("Montant invalide");

  wallets[idx].amount += amt;
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleTimeString(), wallet: wallets[idx].name, delta: amt, note, total });

  save(); updateDisplay();
}

function deleteWallet(idx) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(idx,1);
    save(); updateDisplay();
  }
}

function renameWallet(idx) {
  const nm = prompt("Nouveau nom ?", wallets[idx].name);
  if (nm) {
    wallets[idx].name = nm;
    save(); updateDisplay();
  }
}

document.getElementById("addWalletBtn").addEventListener("click", () => {
  const name = prompt("Nom de l'endroit ?");
  if (!name) return;
  const amt = parseFloat(prompt("Montant initial (+/-)?"));
  if (isNaN(amt)) return alert("Montant invalide");

  wallets.push({ name, amount: amt });
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleTimeString(), wallet: name, delta: amt, note: 'Initial', total });

  save(); updateDisplay();
});

// Lancement initial
updateDisplay();