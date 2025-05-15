let healthChartInstance = null;
let fatSmmChartInstance = null;
let futureChartInstance = null;

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
    { label: "FatKg", data: entries.map(e => e.fatKg), borderColor: "#0D4715", fill: false },
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