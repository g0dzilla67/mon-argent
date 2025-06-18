// Récupération stockage
let wallets = JSON.parse(localStorage.getItem("wallets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// Canvas contexts
const pieCtx = document.getElementById("pieChart").getContext("2d");
const histCtx = document.getElementById("historyChart").getContext("2d");

// Chart instances
let pieChart, historyChart;

// Sauvegarde en local
function save() {
  localStorage.setItem("wallets", JSON.stringify(wallets));
  localStorage.setItem("history", JSON.stringify(history));
}

// Met à jour les deux graphiques
function updateCharts() {
  const labels = wallets.map(w => w.name);
  const data = wallets.map(w => w.amount);

  // Pie chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: ['#00c49a','#3399ff','#ffcc00','#ff6699','#66ff66'] }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // History line chart
  const histLabels = history.map(h => h.date);
  const histData = history.map(h => h.total);
  if (historyChart) historyChart.destroy();
  historyChart = new Chart(histCtx, {
    type: 'line',
    data: { labels: histLabels, datasets: [{ label: 'Total', data: histData, borderColor: '#00c49a', tension: 0.3, fill: false }] }
  });
}

// Affichage des wallets + boutons Valider / Supprimer
function updateDisplay() {
  const container = document.getElementById("wallets");
  container.innerHTML = "";

  // Mise à jour du total
  const total = wallets.reduce((sum, w) => sum + w.amount, 0);
  document.getElementById("total").textContent = `Total : ${total.toFixed(2)}€`;

  // Création des cartes
  wallets.forEach((w, idx) => {
    const div = document.createElement("div");
    div.className = "wallet";
    div.innerHTML = `
      <h3>${w.name} : ${w.amount.toFixed(2)}€</h3>
      <div class="wallet-actions">
        <input type="number" id="amount${idx}" placeholder="+/- montant">
        <button onclick="editWallet(${idx})">Valider</button>
        <button onclick="deleteWallet(${idx})" class="delete-btn">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Re-dessine les graphiques
  updateCharts();
}

// Modification du montant
function editWallet(index) {
  const input = document.getElementById("amount" + index);
  const val = parseFloat(input.value);
  if (isNaN(val)) return;

  wallets[index].amount += val;
  const newTotal = wallets.reduce((sum, w) => sum + w.amount, 0);
  history.push({ date: new Date().toLocaleTimeString(), text: `${val>0?"+":""}${val}€ sur ${wallets[index].name}`, total: newTotal.toFixed(2) });

  save();
  updateDisplay();
  input.value = "";
}

// Suppression d’un wallet
function deleteWallet(index) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(index, 1);
    save();
    updateDisplay();
  }
}

// Ajout d’un nouveau wallet
document.getElementById("addWalletBtn").addEventListener("click", () => {
  const name = prompt("Nom du nouvel endroit ?");
  if (!name) return;
  const amountStr = prompt("Montant initial (€) ?");
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return alert("Montant invalide.");

  wallets.push({ name, amount });
  save();
  updateDisplay();
});

function renameWallet(index) {
  const newName = prompt("Nouveau nom ?", wallets[index].name);
  if (newName) {
    wallets[index].name = newName;
    save();
    updateDisplay();
  }
}


// Init
updateDisplay();
