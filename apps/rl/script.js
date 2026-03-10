let charts = {};
let summaryData = [];
let colors = [];

function plot() {
  const E = parseFloat(document.getElementById('E').value);
  const R = parseFloat(document.getElementById('R').value);
  const r = parseFloat(document.getElementById('r').value);
  const L = parseFloat(document.getElementById('L').value);
  const T = parseFloat(document.getElementById('T').value);
  const N = parseInt(document.getElementById('N').value);

  const Req = R + r;
  const tau = L / Req;

  const t = Array.from({ length: N }, (_, i) => i * T / N);

  const I_on = t.map(time => (E / Req) * (1 - Math.exp(-time / tau)));
  const I_off = t.map(time => (E / Req) * Math.exp(-time / tau));
  const VR_on = I_on.map(i => i * R);
  const VR_off = I_off.map(i => i * R);
  const VL_on = I_on.map((i, idx) => E - VR_on[idx]);
  const VL_off = I_off.map((i, idx) => -VR_off[idx]);
  const W_on = I_on.map(i => 0.5 * L * i * i);
  const W_off = I_off.map(i => 0.5 * L * i * i);

  if (!charts.I_on) createCharts(t);

  const color = getRandomColor();
  colors.push(color);

  addDataset(charts.I_on, I_on, `I تطبيق`, color);
  addDataset(charts.VR_on, VR_on, `VR تطبيق`, color);
  addDataset(charts.VL_on, VL_on, `VL تطبيق`, color);
  addDataset(charts.W_on, W_on, `W تطبيق`, color);

  addDataset(charts.I_off, I_off, `I قطع`, color);
  addDataset(charts.VR_off, VR_off, `VR قطع`, color);
  addDataset(charts.VL_off, VL_off, `VL قطع`, color);
  addDataset(charts.W_off, W_off, `W قطع`, color);

  const result = {
    E, R, r, L,
    I_max: (E / Req).toFixed(3),
    VR_max: (E * R / Req).toFixed(3),
    VL_max: E.toFixed(3),
    W_max: (0.5 * L * Math.pow(E/Req,2)).toFixed(3),
    tau: tau.toFixed(3)
  };
  summaryData.push(result);
}

function createCharts(t) {
  const container = document.getElementById('charts');
  container.innerHTML = `
    <div class="chart-container"><h3>📈 شدة التيار (تطبيق)</h3><canvas id="I_on"></canvas></div>
    <div class="chart-container"><h3>📈 شدة التيار (قطع)</h3><canvas id="I_off"></canvas></div>
    <div class="chart-container"><h3>📊 توتر المقاومة (تطبيق)</h3><canvas id="VR_on"></canvas></div>
    <div class="chart-container"><h3>📊 توتر المقاومة (قطع)</h3><canvas id="VR_off"></canvas></div>
    <div class="chart-container"><h3>⚡ توتر الوشيعة (تطبيق)</h3><canvas id="VL_on"></canvas></div>
    <div class="chart-container"><h3>⚡ توتر الوشيعة (قطع)</h3><canvas id="VL_off"></canvas></div>
    <div class="chart-container"><h3>🔋 طاقة الوشيعة (تطبيق)</h3><canvas id="W_on"></canvas></div>
    <div class="chart-container"><h3>🔋 طاقة الوشيعة (قطع)</h3><canvas id="W_off"></canvas></div>
  `;

  charts.I_on = createChart('I_on', t);
  charts.I_off = createChart('I_off', t);
  charts.VR_on = createChart('VR_on', t);
  charts.VR_off = createChart('VR_off', t);
  charts.VL_on = createChart('VL_on', t);
  charts.VL_off = createChart('VL_off', t);
  charts.W_on = createChart('W_on', t);
  charts.W_off = createChart('W_off', t);
}

function createChart(id, labels) {
  return new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [] },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false }
    }
  });
}

function addDataset(chart, data, label, color) {
  chart.data.datasets.push({
    label: label + ` #${chart.data.datasets.length + 1}`,
    data: data,
    borderColor: color,
    borderWidth: 1.5,
    fill: false
  });
  chart.update();
}

function clearCharts() {
  Object.values(charts).forEach(chart => chart.destroy());
  charts = {};
  colors = [];
  document.getElementById('charts').innerHTML = '';
  summaryData = [];
}

function showSummary() {
  let html = `<table><tr>
    <th>E</th><th>R</th><th>r</th><th>L</th>
    <th>I_max</th><th>VR_max</th><th>VL_max</th><th>W_max</th><th>τ</th>
  </tr>`;
  summaryData.forEach(r => {
    html += `<tr><td>${r.E}</td><td>${r.R}</td><td>${r.r}</td><td>${r.L}</td>
      <td>${r.I_max}</td><td>${r.VR_max}</td><td>${r.VL_max}</td><td>${r.W_max}</td><td>${r.tau}</td></tr>`;
  });
  html += `</table>`;
  document.getElementById('summaryContent').innerHTML = html;
  document.getElementById('summaryModal').style.display = 'block';
}

function copySummary() {
  const table = document.querySelector("#summaryContent table");
  let text = "";
  table.querySelectorAll("tr").forEach(row => {
    let rowData = [];
    row.querySelectorAll("th, td").forEach(cell => {
      rowData.push(cell.innerText);
    });
    text += rowData.join("\t") + "\n";
  });
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ تم نسخ الجدول بنجاح!");
  });
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

function showHelp() {
  document.getElementById('helpModal').style.display = 'block';
}

function showAbout() {
  document.getElementById('aboutModal').style.display = 'block';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}