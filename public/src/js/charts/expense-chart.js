/**
 * Category Expense Doughnut Chart Component using Chart.js - Dark Fintech SaaS Theme
 */

let categoryChartInstance = null;

export function renderCategoryChart(canvasId, categoryData = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  if (categoryData.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const labels = categoryData.map(c => c.name);
  const amounts = categoryData.map(c => c.amount);

  const palette = [
    '#7C3AED', '#EC4899', '#3B82F6', '#22C55E', '#9333EA',
    '#F59E0B', '#06B6D4', '#8B5CF6', '#F43F5E', '#10B981'
  ];

  if (typeof window.Chart !== 'undefined') {
    categoryChartInstance = new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: palette.slice(0, categoryData.length),
          borderWidth: 2,
          borderColor: '#12162A'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              color: '#A7ADC4',
              font: { family: 'Inter', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#171B32',
            borderColor: 'rgba(255, 255, 255, 0.10)',
            borderWidth: 1,
            titleColor: '#F8FAFC',
            bodyColor: '#A7ADC4',
            cornerRadius: 10,
            padding: 10
          }
        }
      }
    });
  }
}
