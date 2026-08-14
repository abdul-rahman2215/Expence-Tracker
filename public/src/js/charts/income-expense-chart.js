/**
 * Income vs Expense Comparison Bar Chart Component using Chart.js - Dark Fintech SaaS Theme
 */

let barChartInstance = null;

export function renderIncomeExpenseChart(canvasId, { totalIncome = 0, totalExpenses = 0 } = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  if (typeof window.Chart !== 'undefined') {
    barChartInstance = new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          label: 'Amount (₹)',
          data: [totalIncome, totalExpenses],
          backgroundColor: ['#22C55E', '#EC4899'],
          borderRadius: 8
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
