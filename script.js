let entries = JSON.parse(localStorage.getItem("healthEntries") || "[]").map(e => ({ ...e, datetime: new Date(e.datetime) }));
let healthChartInstance = null;
let fatSmmChartInstance = null;
let futureChartInstance = null;

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
  calculateSmmAndFatChange(entries, from, to);
  if (isNaN(from) || isNaN(to)) {
    alert("Please select valid date range.");
    return;
  }
  const filtered = entries.filter(e => e.datetime >= from && e.datetime <= new Date(to.getTime() + 24 * 60 * 60 * 1000));
  if (!filtered.length) {
    document.getElementById("averagesResult").innerText = "No entries found in this date range.";
    return;
  }
  const avg = key => filtered.reduce((sum, e) => sum + e[key], 0) / filtered.length;
  document.getElementById("averagesResult").innerHTML = `
  <div class="text-sm text-gray-700 space-y-4">
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">No Of Days:</strong></p>
      <p>${(to - from) / (1000 * 60 * 60 * 24)}</p>
    </div>
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">Average BMI:</strong></p>
      <p>${avg("bmi").toFixed(2)}</p>
    </div>
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">Average SMM:</strong></p>
      <p>${avg("smm").toFixed(2)}</p>
    </div>
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">Average Fat %:</strong></p>
      <p>${avg("fat").toFixed(2)}</p>
    </div>
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">Average WHR:</strong></p>
      <p>${avg("whr").toFixed(2)}</p>
    </div>
    <div class="flex justify-between">
      <p><strong class="font-semibold text-gray-800">Average Other Weight:</strong></p>
      <p>${avg("otherWeight").toFixed(2)} kg</p>
    </div>

    <div class="flex justify-end mt-6">
      <button onclick="exportAveragesToJSON()" class="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
        Download Backup
      </button>
    </div>
  </div>
`;
}
function Reset(){
  document.getElementById("averagesResult").innerHTML = ``;
  document.getElementById("resultTable").style.display = "none";
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
function uploadAndResetEntries(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result).map(entry => ({
        ...entry,
        datetime: new Date(entry.datetime)
      }));

      // Overwrite current entries
      entries = imported;
      localStorage.setItem("healthEntries", JSON.stringify(entries));
      alert("Entries successfully uploaded and reset!");
      setView("entry"); // Optional: refresh to entry view
    } catch (err) {
      console.error("Failed to import JSON:", err);
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

function getNearestData(records, targetDate) {
  return records.reduce((a, b) => {
    return Math.abs(new Date(a.datetime) - targetDate) <
           Math.abs(new Date(b.datetime) - targetDate)
      ? a
      : b;
  });
}

function calculateChangeRate(start, end, key, daysBetween) {
  let ratePerWeekKg = 0;
  let ratePerWeekPercent = 0;
  let diffKg = 0;
  if(key == "smm"){
    diffKg = end[key] - start[key]; // ← actual change in kg
    ratePerWeekKg = (diffKg / daysBetween) * 7;
    const startp =  (start[key] / start["weight"]) * 100;
    const endp =  (end[key] / end["weight"]) * 100;
    ratePerWeekPercent = ((endp - startp) / daysBetween) * 7;
    

    return {
      key,
      start: start[key],
      end: end[key],
      changeKg: parseFloat(diffKg.toFixed(2)), // ← NEW
      ratePerWeekKg: parseFloat(ratePerWeekKg.toFixed(2)),
      ratePerWeekPercent: parseFloat(ratePerWeekPercent.toFixed(2)),
    };
  }
  if(key == "fat"){
    const fatKgStart = start["weight"] * (start[key] / 100);
    const fatKgEnd = start["weight"] * (end[key] / 100);
    const diff = end[key] - start[key]; // ← actual change in %
    diffKg = fatKgEnd - fatKgStart;
    ratePerWeekKg = (diffKg / daysBetween) * 7;
    ratePerWeekPercent = (diff / daysBetween) * 7;
    

    return {
      key,
      start: parseFloat(fatKgStart.toFixed(2)),
      end: parseFloat(fatKgEnd.toFixed(2)),
      changeKg: parseFloat(diffKg.toFixed(2)), // ← NEW
      ratePerWeekKg: parseFloat(ratePerWeekKg.toFixed(2)),
      ratePerWeekPercent: parseFloat(ratePerWeekPercent.toFixed(2)),
    };
  }
}

function calculateSmmAndFatChange(records, startDate, endDate) {
  const start = getNearestData(records, startDate);
  const end = getNearestData(records, endDate);
  const daysBetween = (endDate - startDate) / (1000 * 60 * 60 * 24);

  const fatChange = calculateChangeRate(start, end, "fat", daysBetween);
  const smmChange = calculateChangeRate(start, end, "smm", daysBetween);
  document.getElementById("fatStart").innerText = fatChange.start;
  document.getElementById("fatEnd").innerText = fatChange.end;
  document.getElementById("fatChange").innerText = fatChange.changeKg;
  document.getElementById("fatRateKg").innerText = fatChange.ratePerWeekKg;
  document.getElementById("fatRatePct").innerText = fatChange.ratePerWeekPercent;

  document.getElementById("smmStart").innerText = start.smm;
  document.getElementById("smmEnd").innerText = end.smm;
  document.getElementById("smmChange").innerText = smmChange.changeKg;
  document.getElementById("smmRateKg").innerText = smmChange.ratePerWeekKg;
  document.getElementById("smmRatePct").innerText = smmChange.ratePerWeekPercent;

  document.getElementById("resultTable").style.display = '';
  return { fatChange, smmChange };
}

function createBlob(){
  const from = new Date(document.getElementById("fromDate-f").value);
  const to = new Date(document.getElementById("toDate-f").value);
  const filtered = entries.filter(e => e.datetime >= from && e.datetime <= new Date(to.getTime() + 24 * 60 * 60 * 1000));
  if (!filtered.length) return;

  // Convert Date objects back to ISO strings for export
  const jsonReadyEntries = filtered.map(e => ({
    ...e,
    datetime: e.datetime.toISOString()
  }));

  const blob = new Blob([JSON.stringify(jsonReadyEntries, null, 2)], { type: "application/json" });
  return blob;
}

async  function predict(){
  const blob = createBlob();  // File input element
  const dateInput = document.getElementById("datetime-future");  // Date input element

  const file = new File([blob], "data.json", { type: "application/json" });
    const targetDate = dateInput.value || "2025-07-05";  // Default date
    console.log(targetDate, file);

    if (file) {
      const formData = new FormData();
      formData.append("file", file);  // Add the file to form data
      formData.append("target_date", targetDate);  // Add target date
    
      try {
        // Sending the request to the Flask API
        const response = await fetch('https://futurehealth-dcdk.onrender.com/predict', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const predictions = await response.json();
          renderFatFutureChart(predictions);
        }  else {
          // Enhanced error handling
          const errorText = await response.text();
          console.error('Request failed:', response.status, errorText);
          alert('Error: ' + response.statusText + '\n' + errorText);
        }
      } catch (error) {
        console.error('Network or server error:', error);
        alert('Error: ' + error.message);
      }
    }
}

function renderFatFutureChart(predictions) {
  const ctx = document.getElementById("future").getContext("2d");
  if (futureChartInstance) futureChartInstance.destroy();
  if (!predictions.length) return;
  const labels = predictions.map(e => new Date(e.date).toLocaleDateString());
  const datasets = [
    { label: "smm", data: predictions.map(e => e.smm), borderColor: "#FFDC00", fill: false },
    { label: "fat", data: predictions.map(e => e.fat), borderColor: "#FF4136", fill: false },
    { label: "weight", data: predictions.map(e => e.weight), borderColor: "#007BFF", fill: false }
  ];
  futureChartInstance = new Chart(ctx, {
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

setView("entry");
