/**
 * charts.js - Chart.js Visualization Helpers
 */

const chartColors = {
  purple: 'rgba(108, 92, 231, 0.8)',
  cyan: 'rgba(0, 206, 201, 0.8)',
  green: 'rgba(0, 184, 148, 0.8)',
  orange: 'rgba(253, 203, 110, 0.8)',
  red: 'rgba(255, 107, 107, 0.8)',
  pink: 'rgba(253, 121, 168, 0.8)',
  blue: 'rgba(116, 185, 255, 0.8)',
  lavender: 'rgba(162, 155, 254, 0.8)',
};
const colorArray = Object.values(chartColors);
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#a0a0b8', font: { family: 'Inter', size: 12 } } } },
};

function createCategoryChart(stats) {
  const ctx = document.getElementById('category-chart');
  if (!ctx || !stats?.length) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: stats.map(s => s._id), datasets: [{ data: stats.map(s => s.count), backgroundColor: colorArray.slice(0, stats.length), borderWidth: 0, hoverOffset: 8 }] },
    options: { ...chartDefaults, cutout: '55%', plugins: { legend: { position: 'right', labels: { color: '#a0a0b8', font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true } } } },
  });
}

function createDifficultyChart(stats) {
  const ctx = document.getElementById('difficulty-chart');
  if (!ctx || !stats?.length) return;
  const cMap = { Easy: chartColors.green, Medium: chartColors.orange, Hard: chartColors.red };
  new Chart(ctx, {
    type: 'pie',
    data: { labels: stats.map(s => s._id), datasets: [{ data: stats.map(s => s.count), backgroundColor: stats.map(s => cMap[s._id] || chartColors.purple), borderWidth: 0 }] },
    options: { ...chartDefaults, plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b8', usePointStyle: true } } } },
  });
}

function createTopicsChart(topics) {
  const ctx = document.getElementById('topics-chart');
  if (!ctx || !topics?.length) return;
  const sorted = [...topics].sort((a, b) => b.frequency - a.frequency).slice(0, 8);
  new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(t => t.topic), datasets: [{ label: 'Frequency', data: sorted.map(t => t.frequency), backgroundColor: colorArray.slice(0, sorted.length), borderRadius: 6 }] },
    options: { ...chartDefaults, indexAxis: 'y', scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b8' }, max: 100 }, y: { grid: { display: false }, ticks: { color: '#a0a0b8' } } }, plugins: { legend: { display: false } } },
  });
}

function createFrequencyChart(topics) {
  const ctx = document.getElementById('frequency-chart');
  if (!ctx || !topics?.length) return;
  const top = [...topics].sort((a, b) => b.frequency - a.frequency).slice(0, 6);
  new Chart(ctx, {
    type: 'radar',
    data: { labels: top.map(t => t.topic), datasets: [{ label: 'Frequency', data: top.map(t => t.frequency), backgroundColor: 'rgba(108,92,231,0.15)', borderColor: chartColors.purple, borderWidth: 2, pointBackgroundColor: chartColors.purple, pointRadius: 4 }] },
    options: { ...chartDefaults, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.08)' }, grid: { color: 'rgba(255,255,255,0.08)' }, pointLabels: { color: '#a0a0b8' }, ticks: { display: false }, min: 0, max: 100 } }, plugins: { legend: { display: false } } },
  });
}

function createSearchTrendChart(data) {
  const ctx = document.getElementById('search-trend-chart');
  if (!ctx || !data?.length) return;
  new Chart(ctx, {
    type: 'line',
    data: { labels: data.map(d => d._id), datasets: [{ label: 'Searches', data: data.map(d => d.count), borderColor: chartColors.purple, backgroundColor: 'rgba(108,92,231,0.1)', fill: true, tension: 0.4, pointRadius: 5 }] },
    options: { ...chartDefaults, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b8' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b8' }, beginAtZero: true } } },
  });
}
