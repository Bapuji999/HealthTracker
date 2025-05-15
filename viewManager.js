
function setView(view) {
  document.getElementById("resultTable").style.display = "none";
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(`${view}-view`).classList.remove('hidden');
  if (view === 'charts') renderChart();
  if (view === 'fatSmm') renderFatSmmChart();
  if (view === 'history') renderHistory();
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
      <td class="p-2">${e.fatKg}</td>
      <td class="p-2">${e.whr}</td>
      <td class="p-2">${e.otherWeight}</td>
    </tr>
  `).join("");
}
setView("entry");