let entries = JSON.parse(localStorage.getItem("healthEntries") || "[]").map(e => ({ ...e, datetime: new Date(e.datetime) }));
let healthChartInstance = null;
let fatSmmChartInstance = null;

function setView(view) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(`${view}-view`).classList.remove('hidden');
  if (view === 'charts') renderChart();
  if (view === 'fatSmm') renderFatSmmChart();
  if (view === 'history') renderHistory();
}

function calculateOtherWeight() {
  const weight = parseFloat(document.getElementById("weight").value);
  const smm = parseFloat(document.getElementById("smm").value);
  const fat = parseFloat(document.getElementById("fat").value);

  if (!isNaN(weight) && !isNaN(smm) && !isNaN(fat)) {
    const fatWeight = (fat / 100) * weight;
    const otherWeight = weight - smm - fatWeight;
    document.getElementById("otherWeight").value = otherWeight.toFixed(2);
  }
}

function saveEntry() {
  const entry = {
    weight: parseFloat(document.getElementById("weight").value),
    bmi: parseFloat(document.getElementById("bmi").value),
    smm: parseFloat(document.getElementById("smm").value),
    fat: parseFloat(document.getElementById("fat").value),
    whr: parseFloat(document.getElementById("whr").value),
    otherWeight: parseFloat(document.getElementById("otherWeight").value),
    datetime: new Date(document.getElementById("datetime").value)
  };
  if (Object.values(entry).some(val => isNaN(val) || (val instanceof Date && isNaN(val)))) {
    alert("Please fill in all fields with valid values.");
    return;
  }
  entries.push(entry);
  localStorage.setItem("healthEntries", JSON.stringify(entries));
  alert("Entry saved!");
  document.querySelectorAll("#entry-view input").forEach(i => i.value = "");
}

function renderChart() {
  const ctx = document.getElementById("healthChart").getContext("2d");
  if (healthChartInstance) healthChartInstance.destroy();
  if (!entries.length) return;
  const labels = entries.map(e => new Date(e.datetime).toLocaleDateString());
  const datasets = [
    { label: "Weight", data: entries.map(e => e.weight), borderColor: "#007BFF", fill: false },
    { label: "BMI", data: entries.map(e => e.bmi), borderColor: "#60a5fa", fill: false },
    { label: "SMM", data: entries.map(e => e.smm), borderColor: "#FFDC00", fill: false },
    { label: "Fat %", data: entries.map(e => e.fat), borderColor: "#FF4136", fill: false },
    { label: "WHR", data: entries.map(e => e.whr), borderColor: "#FF851B", fill: false },
    { label: "Other Weight", data: entries.map(e => e.otherWeight), borderColor: "#B10DC9", fill: false }
  ];
  healthChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: datasets.map(ds => ({
        ...ds,
        backgroundColor: ds.borderColor,
        pointStyle: 'rect',
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Metric Value' } }
      },
      plugins: {
        usePointStyle: true,
        legend: { position: 'top' },
        tooltip: { enabled: true }
      }
    }
  });
}

function renderFatSmmChart() {
  const ctx = document.getElementById("fatSmm").getContext("2d");
  if (fatSmmChartInstance) fatSmmChartInstance.destroy();
  if (!entries.length) return;
  const labels = entries.map(e => new Date(e.datetime).toLocaleDateString());
  const datasets = [
    { label: "SMM", data: entries.map(e => e.smm), borderColor: "#FFDC00", fill: false },
    { label: "Fat %", data: entries.map(e => e.fat), borderColor: "#FF4136", fill: false }
  ];
  fatSmmChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: datasets.map(ds => ({
        ...ds,
        backgroundColor: ds.borderColor,
        pointStyle: 'rect',
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Metric Value' } }
      },
      plugins: {
        usePointStyle: true,
        legend: { position: 'top' },
        tooltip: { enabled: true }
      }
    }
  });
}
function renderHistory() {
  const tbody = document.getElementById("historyTableBody");
  tbody.innerHTML = entries.map(e => `
    <tr>
      <td class="p-2">${e.datetime.toLocaleString()}</td>
      <td class="p-2">${e.weight}</td>
      <td class="p-2">${e.bmi}</td>
      <td class="p-2">${e.smm}</td>
      <td class="p-2">${e.fat}</td>
      <td class="p-2">${e.whr}</td>
      <td class="p-2">${e.otherWeight}</td>
    </tr>
  `).join("");
}

function calculateAverages() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  if (isNaN(from) || isNaN(to)) {
    alert("Please select valid date range.");
    return;
  }
  const filtered = entries.filter(e => e.datetime >= from && e.datetime <= to);
  if (!filtered.length) {
    document.getElementById("averagesResult").innerText = "No entries found in this date range.";
    return;
  }
  const avg = key => filtered.reduce((sum, e) => sum + e[key], 0) / filtered.length;
  document.getElementById("averagesResult").innerHTML = `
    <p><strong>Average Weight:</strong> ${avg("weight").toFixed(2)} kg</p>
    <p><strong>Average BMI:</strong> ${avg("bmi").toFixed(2)}</p>
    <p><strong>Average SMM:</strong> ${avg("smm").toFixed(2)}</p>
    <p><strong>Average Fat %:</strong> ${avg("fat").toFixed(2)}</p>
    <p><strong>Average WHR:</strong> ${avg("whr").toFixed(2)}</p>
    <p><strong>Average Other Weight:</strong> ${avg("otherWeight").toFixed(2)} kg</p>
    <button onclick="exportAveragesToJSON()" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Download Backup</button>
  `;
}

function exportAveragesToJSON() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  const filtered = entries.filter(e => e.datetime >= from && e.datetime <= to);
  if (!filtered.length) return;

  // Convert Date objects back to ISO strings for export
  const jsonReadyEntries = filtered.map(e => ({
    ...e,
    datetime: e.datetime.toISOString()
  }));

  const blob = new Blob([JSON.stringify(jsonReadyEntries, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "health_entries.json";
  link.click();
}

setView("entry");
