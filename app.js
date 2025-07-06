// Données depuis localStorage
let wallets = JSON.parse(localStorage.getItem("wallets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// Contexte Chart.js
const pieCtx = document.getElementById("pieChart").getContext("2d");
const histCtx = document.getElementById("historyChart").getContext("2d");
let pieChart, historyChart;

// Sauvegarde en local
function save() {
  localStorage.setItem("wallets", JSON.stringify(wallets));
  localStorage.setItem("history", JSON.stringify(history));
}

// Met à jour les graphiques
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

// Affiche wallets et historique
function updateDisplay() {
  // Total
  const total = wallets.reduce((s, w) => s + w.amount, 0);
  document.getElementById("total").textContent = `Total : ${total.toFixed(2)}€`;

  // Wallets
  const wCont = document.getElementById("wallets");
  wCont.innerHTML = "";
  wallets.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "wallet";
    div.innerHTML = `
      <h3>${w.name} : ${w.amount.toFixed(2)}€</h3>
      <div class="wallet-actions">
        <input 
          type="text" 
          id="amount${i}" 
          placeholder="+/- montant" 
          inputmode="decimal"
          pattern="^-?[0-9]*\\.?[0-9]+$"
        />
        <input type="text" id="note${i}" placeholder="Note (ex : repas)" />
        <button class="edit-btn" onclick="editWallet(${i})">Valider</button>
        <button class="rename-btn" onclick="renameWallet(${i})">✏️</button>
        <button class="delete-btn" onclick="deleteWallet(${i})">🗑️</button>
      </div>
    `;
    wCont.appendChild(div);
  });

  renderHistory();
  updateCharts();
}

// Affiche historique
function renderHistory() {
  const hCont = document.getElementById("historyLog");
  hCont.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-left">
        ${h.date} • ${h.wallet} : ${h.delta>0?'+':''}${h.delta.toFixed(2)}€
      </div>
      <div class="hist-note">${h.note||''}</div>
    `;
    hCont.appendChild(div);
  });
}

// Actions
function editWallet(i) {
  const raw = document.getElementById("amount"+i).value.trim();
  const amt = parseFloat(raw);
  if (isNaN(amt)) return alert("Montant invalide !");
  const note = document.getElementById("note"+i).value.trim();
  
  wallets[i].amount += amt;
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleTimeString(), wallet: wallets[i].name, delta: amt, note, total });
  
  save(); updateDisplay();
}

function deleteWallet(i) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(i,1);
    save(); updateDisplay();
  }
}

function renameWallet(i) {
  const nm = prompt("Nouveau nom ?", wallets[i].name);
  if (nm) {
    wallets[i].name = nm;
    save(); updateDisplay();
  }
}

// Bouton Ajouter
document.getElementById("addWalletBtn").addEventListener("click", () => {
  const name = prompt("Nom de l'endroit ?");
  if (!name) return;
  const raw = prompt("Montant initial (+/-) ?");
  const amt = parseFloat(raw);
  if (isNaN(amt)) return alert("Montant invalide !");

  wallets.push({ name, amount: amt });
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleTimeString(), wallet: name, delta: amt, note: 'Initial', total });

  save(); updateDisplay();
});

// Init
updateDisplay();