let wallets = JSON.parse(localStorage.getItem("wallets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const pieCtx = document.getElementById("pieChart").getContext("2d");
const histCtx = document.getElementById("historyChart").getContext("2d");

let pieChart, historyChart;

function save() {
  localStorage.setItem("wallets", JSON.stringify(wallets));
  localStorage.setItem("history", JSON.stringify(history));
}

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

function updateDisplay() {
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
        <input type="number" id="amount${idx}" placeholder="+/- montant">
        <input type="text" id="note${idx}" placeholder="Note (ex: repas)" style="flex:1; margin-left:8px;border-radius:5px;padding:0.4rem;">
        <button onclick="editWallet(${idx})">Valider</button>
        <button onclick="renameWallet(${idx})" class="rename-btn">✏️</button>
        <button onclick="deleteWallet(${idx})" class="delete-btn">🗑️</button>
      </div>
    `;
    wCont.appendChild(div);
  });

  renderHistory();
  updateCharts();
}

function renderHistory() {
  const hCont = document.getElementById("historyLog");
  hCont.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-info">${h.date} • ${h.wallet}: ${h.delta > 0 ? '+' : ''}${h.delta.toFixed(2)}€</div>
      <div class="hist-note">${h.note||''}</div>
    `;
    hCont.appendChild(div);
  });
}

function editWallet(idx) {
  const val = parseFloat(document.getElementById("amount"+idx).value);
  const note = document.getElementById("note"+idx).value.trim();
  if (isNaN(val)) return alert("Montant invalide");

  wallets[idx].amount += val;
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleString(), wallet: wallets[idx].name, delta: val, note, total });

  save(); updateDisplay();
}

function deleteWallet(idx) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(idx,1);
    save(); updateDisplay();
  }
}

function renameWallet(idx) {
  const nm = prompt("Nouveau nom?", wallets[idx].name);
  if (nm) {
    wallets[idx].name = nm;
    save(); updateDisplay();
  }
}

document.getElementById("addWalletBtn").addEventListener("click", () => {
  const name = prompt("Nom de l'endroit ?");
  if (!name) return;
  const amt = parseFloat(prompt("Montant initial ?"));
  if (isNaN(amt)) return alert("Montant invalide.");

  wallets.push({ name, amount: amt });
  const total = wallets.reduce((s,w)=>s+w.amount,0);
  history.push({ date: new Date().toLocaleString(), wallet: name, delta: amt, note: 'Initial', total });

  save(); updateDisplay();
});

updateDisplay();