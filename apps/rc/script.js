let colors = [
  '#e6194b', '#3cb44b', '#ffe119',
  '#4363d8', '#f58231', '#911eb4',
  '#46f0f0', '#f032e6', '#bcf60c',
  '#fabebe'
];

let charts = {};
let summaries = [];

const orderedCharts = [
  "توتر المكثف - الشحن",
  "توتر المكثف - التفريغ",
  "شدة التيار - الشحن",
  "شدة التيار - التفريغ",
  "توتر المقاومة - الشحن",
  "توتر المقاومة - التفريغ",
  "الشحنة - الشحن",
  "الشحنة - التفريغ",
  "طاقة المكثف - الشحن",
  "طاقة المكثف - التفريغ"
];

function plot() {
  let E = parseFloat(document.getElementById('E').value);
  let R = parseFloat(document.getElementById('R').value);
  let C = parseFloat(document.getElementById('C').value);
  let T = parseFloat(document.getElementById('T').value);
  let N = parseInt(document.getElementById('N').value);

  let tau = R * C;
  let dt = T / N;
  let t = [];
  for (let i = 0; i <= N; i++) t.push(i * dt);

  let Vc_charge = t.map(time => E * (1 - Math.exp(-time / tau)));
  let Vc_discharge = t.map(time => E * Math.exp(-time / tau));
  let I_charge = t.map(time => (E / R) * Math.exp(-time / tau));
  let I_discharge = t.map(time => - (E / R) * Math.exp(-time / tau)); // ✅ تصحيح الإشارة
  let Vr_charge = t.map((_, i) => I_charge[i] * R);
  let Vr_discharge = t.map((_, i) => I_discharge[i] * R); // ✅ تصحيح الإشارة
  let Q_charge = Vc_charge.map(v => C * v);
  let Q_discharge = Vc_discharge.map(v => C * v);
  let U_charge = Vc_charge.map(v => 0.5 * C * v * v);
  let U_discharge = Vc_discharge.map(v => 0.5 * C * v * v);

  let color = colors[Math.floor(Math.random() * colors.length)];

  addDataset("توتر المكثف - الشحن", t, Vc_charge, color);
  addDataset("توتر المكثف - التفريغ", t, Vc_discharge, color);
  addDataset("شدة التيار - الشحن", t, I_charge, color);
  addDataset("شدة التيار - التفريغ", t, I_discharge, color);
  addDataset("توتر المقاومة - الشحن", t, Vr_charge, color);
  addDataset("توتر المقاومة - التفريغ", t, Vr_discharge, color);
  addDataset("الشحنة - الشحن", t, Q_charge, color);
  addDataset("الشحنة - التفريغ", t, Q_discharge, color);
  addDataset("طاقة المكثف - الشحن", t, U_charge, color);
  addDataset("طاقة المكثف - التفريغ", t, U_discharge, color);

  summaries.push({
    E, R, C,
    Imax: (E / R).toFixed(4),
    Vcmax: E.toFixed(4),
    Vrmax: E.toFixed(4),
    Qmax: (C * E).toFixed(4),
    Umax: (0.5 * C * E * E).toFixed(4),
    tau: tau.toFixed(4)
  });
}

function addDataset(chartName, labels, data, color) {
  if (!charts[chartName]) {
    let index = orderedCharts.indexOf(chartName);
    let container = document.createElement('div');
    container.className = 'chart-container';
    container.style.marginBottom = "60px";
    let h3 = document.createElement('h3');
    h3.textContent = chartName;
    h3.style.fontSize = "28px";
    h3.style.color = "#333";
    h3.style.fontWeight = "bold";
    container.appendChild(h3);
    let canvas = document.createElement('canvas');
    container.appendChild(canvas);

    let chartsDiv = document.getElementById('charts');
    if (index >= 0 && index < chartsDiv.children.length) {
      chartsDiv.insertBefore(container, chartsDiv.children[index]);
    } else {
      chartsDiv.appendChild(container);
    }

    charts[chartName] = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'الزمن (s)', font: { size: 18 } }
          },
          y: {
            title: { display: true, text: 'القيمة', font: { size: 18 } }
          }
        },
        plugins: {
          legend: { labels: { font: { size: 18 } } }
        }
      }
    });
  }

  charts[chartName].data.labels = labels;
  charts[chartName].data.datasets.push({
    label: `تجربة ${charts[chartName].data.datasets.length + 1}`,
    data: data,
    borderColor: color,
    borderWidth: 2,
    fill: false,
    tension: 0.2
  });
  charts[chartName].update();
}

function clearCharts() {
  for (let key in charts) {
    charts[key].destroy();
  }
  charts = {};
  summaries = [];
  document.getElementById('charts').innerHTML = '';
}

function showSummary() {
  let html = '<table><tr><th>E</th><th>R</th><th>C</th><th>Iₘₐₓ</th><th>Vcₘₐₓ</th><th>Vrₘₐₓ</th><th>Qₘₐₓ</th><th>Uₘₐₓ</th><th>τ</th></tr>';
  summaries.forEach(s => {
    html += `<tr><td>${s.E}</td><td>${s.R}</td><td>${s.C}</td><td>${s.Imax}</td><td>${s.Vcmax}</td><td>${s.Vrmax}</td><td>${s.Qmax}</td><td>${s.Umax}</td><td>${s.tau}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('summaryContent').innerHTML = html;
  document.getElementById('summaryModal').style.display = 'block';
}

function copySummary() {
  let table = document.querySelector('#summaryContent table');
  let range = document.createRange();
  range.selectNode(table);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  try {
    document.execCommand('copy');
    alert('✅ تم نسخ الجدول!');
  } catch {
    alert('❌ فشل النسخ!');
  }
  window.getSelection().removeAllRanges();
}

function showEquations() {
  document.getElementById('equationsModal').style.display = 'block';
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
