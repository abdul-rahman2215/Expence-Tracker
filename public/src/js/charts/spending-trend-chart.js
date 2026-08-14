/**
 * Spending Trend Line Chart Component using Chart.js - Dark Fintech SaaS Theme
 */

let lineChartInstance = null;

export function renderSpendingTrendChart(canvasId, trendData = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  const labels = trendData.map(d => d.date);
  const amounts = trendData.map(d => d.amount);

  if (typeof window.Chart !== 'undefined') {
    lineChartInstance = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Expenses (₹)',
          data: amounts,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#EC4899',
          pointBorderColor: '#12162A'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#171B32',
            borderColor: 'rgba(255, 255, 255, 0.10)',
            borderWidth: 1,
            titleColor: '#F8FAFC',
            bodyColor: '#A7ADC4',
            cornerRadius: 10,
            padding: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#A7ADC4' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#A7ADC4' },
            grid: { display: false }
          }
        }
      }
    });
  }
}
