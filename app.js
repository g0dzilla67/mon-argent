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
  if (!wallets.length) return;

  const labels = wallets.map(w => w.name);
  const data = wallets.map(w => w.amount);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#00c49a','#3399ff','#ffcc00','#ff6699','#66ff66','#ff9966']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  const histLabels = history.map(h => h.date);
  const histData = history.map(h => h.total);

  if (historyChart) historyChart.destroy();
  historyChart = new Chart(histCtx, {
    type: 'line',
    data: {
      labels: histLabels,
      datasets: [{
        label: 'Total',
        data: histData,
        borderColor: '#00c49a',
        tension: 0.3,
        fill: false,
      }]
    }
  });
}

function updateDisplay() {
  const container = document.getElementById("wallets");
  container.innerHTML = "";

  const total = wallets.reduce((sum, w) => sum + w.amount, 0);
  document.getElementById("total").textContent = `Total : ${total.toFixed(2)}€`;

  wallets.forEach((wallet, index) => {
    const div = document.createElement("div");
    div.className = "wallet";
    div.innerHTML = `
      <h3>${wallet.name} : ${wallet.amount.toFixed(2)}€</h3>
      <div class="wallet-actions">
        <input type="text" id="amount${index}" placeholder="+/- montant" />
        <input type="text" id="note${index}" placeholder="Note (repas, boisson...)" />
        <button onclick="editWallet(${index})">Valider</button>
        <button class="rename-btn" onclick="renameWallet(${index})">✏️</button>
        <button class="delete-btn" onclick="deleteWallet(${index})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  renderHistory();
  updateCharts();
}

function renderHistory() {
  const historyDiv = document.getElementById("historyLog");
  if (!historyDiv) return;

  historyDiv.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      ${h.date} • ${h.wallet} : ${h.delta > 0 ? "+" : ""}${h.delta.toFixed(2)}€ 
      <span class="hist-note">${h.note || ""}</span>
    `;
    historyDiv.appendChild(div);
  });
}

function editWallet(index) {
  const val = document.getElementById("amount" + index).value.trim().replace(",", ".");
  const note = document.getElementById("note" + index).value.trim();
  const delta = parseFloat(val);
  if (isNaN(delta)) return alert("Montant invalide");

  wallets[index].amount += delta;
  const total = wallets.reduce((sum, w) => sum + w.amount, 0);

  history.push({
    date: new Date().toLocaleTimeString(),
    wallet: wallets[index].name,
    delta: delta,
    note: note,
    total: total.toFixed(2)
  });

  save();
  updateDisplay();
}

function deleteWallet(index) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(index, 1);
    save();
    updateDisplay();
  }
}

function renameWallet(index) {
  const newName = prompt("Nouveau nom ?", wallets[index].name);
  if (newName) {
    wallets[index].name = newName;
    save();
    updateDisplay();
  }
}

document.getElementById("addWalletBtn").addEventListener("click", () => {
  const name = prompt("Nom de l'endroit ?");
  if (!name) return;

  const val = prompt("Montant initial ?");
  const amount = parseFloat(val.replace(",", "."));
  if (isNaN(amount)) return alert("Montant invalide");

  wallets.push({ name, amount });
  const total = wallets.reduce((s, w) => s + w.amount, 0);

  history.push({
    date: new Date().toLocaleTimeString(),
    wallet: name,
    delta: amount,
    note: "Initial",
    total: total.toFixed(2)
  });

  save();
  updateDisplay();
});

updateDisplay();