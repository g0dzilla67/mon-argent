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
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#00c49a', '#3399ff', '#ffcc00', '#ff6699', '#66ff66'],
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
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

  let total = wallets.reduce((acc, w) => acc + w.amount, 0);
  document.getElementById("total").textContent = "Total : " + total.toFixed(2) + "€";

  wallets.forEach((wallet, index) => {
    const div = document.createElement("div");
    div.className = "wallet";
    div.innerHTML = `
      <h3>${wallet.name} : ${wallet.amount.toFixed(2)}€</h3>
      <input type="number" id="amount${index}" placeholder="+/- montant">
      <div class="wallet-actions">
        <button onclick="editWallet(${index})">Valider</button>
        <button onclick="deleteWallet(${index})" class="delete-btn">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  updateCharts();
}


  updateCharts();
}

function editWallet(index) {
  const input = document.getElementById("amount" + index);
  const val = parseFloat(input.value);
  if (isNaN(val)) return;

  wallets[index].amount += val;
  const total = wallets.reduce((acc, w) => acc + w.amount, 0);
  history.push({
    date: new Date().toLocaleTimeString(),
    text: `${val > 0 ? "+" : ""}${val}€ sur ${wallets[index].name}`,
    total: total.toFixed(2)
  });

  save();
  updateDisplay();
  input.value = "";
}

document.getElementById("addWalletBtn").onclick = () => {
  const name = prompt("Nom du nouvel endroit ?");
  if (!name) return;
  wallets.push({ name, amount: 0 });
  save();
  updateDisplay();
};

updateDisplay();
function deleteWallet(index) {
  if (confirm("Supprimer cet endroit ?")) {
    wallets.splice(index, 1);
    save();
    updateDisplay();
  }
}
