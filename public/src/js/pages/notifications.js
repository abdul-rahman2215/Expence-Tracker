import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { notificationService } from '../services/notification-service.js';
import { formatDateForDisplay } from '../utils/date-utils.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('notifications');
  renderNavbar({
    title: 'Notifications',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal();

  // Load Notifications
  async function loadNotifications() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    container.innerHTML = '';

    const result = await notificationService.getNotifications({ limit: 50 });

    if (result.success) {
      if (result.notifications.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--color-text-muted);">
            🔔 You have no notifications yet.
          </div>
        `;
        return;
      }

      result.notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = 'card';
        
        const isDanger = n.threshold === 100 || n.type === 'budget_100';
        const isWarning = n.threshold === 80 || n.type === 'budget_80';
        const borderColor = isDanger ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-primary)';

        item.style.borderLeft = `4px solid ${borderColor}`;
        item.style.opacity = n.is_read ? '0.7' : '1';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '6px';

        const title = document.createElement('strong');
        title.textContent = n.title;

        const time = document.createElement('span');
        time.style.fontSize = '12px';
        time.style.color = 'var(--color-text-muted)';
        time.textContent = formatDateForDisplay(n.created_at?.split('T')[0]);

        header.appendChild(title);
        header.appendChild(time);

        const msg = document.createElement('p');
        msg.style.fontSize = '14px';
        msg.textContent = n.message;

        item.appendChild(header);
        item.appendChild(msg);

        if (!n.is_read) {
          const markBtn = document.createElement('button');
          markBtn.className = 'btn btn-secondary btn-sm';
          markBtn.style.marginTop = '10px';
          markBtn.innerHTML = '<i class="ti ti-check"></i> Mark as Read';
          markBtn.addEventListener('click', async () => {
            await notificationService.markAsRead(n.id);
            loadNotifications();
          });
          item.appendChild(markBtn);
        }

        container.appendChild(item);
      });
    }
  }

  await loadNotifications();
});
