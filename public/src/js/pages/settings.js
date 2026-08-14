import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { profileService } from '../services/profile-service.js';
import { storageUtil } from '../utils/storage.js';
import { toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('settings');
  renderNavbar({
    title: 'Settings',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal();
  const deleteAccountModal = new Modal('modal-delete-account-backdrop');

  // Load Preferences
  async function loadSettings() {
    const themeSelect = document.getElementById('set-theme-select');
    const notifToggle = document.getElementById('set-notifications-toggle');

    if (themeSelect) themeSelect.value = storageUtil.getTheme();

    const result = await profileService.getUserSettings();
    if (result.success && result.settings) {
      if (notifToggle) notifToggle.checked = result.settings.notifications_enabled;
    }
  }

  // Theme Change Listener
  document.getElementById('set-theme-select')?.addEventListener('change', (e) => {
    storageUtil.setTheme(e.target.value);
  });

  // Save Settings Form
  document.getElementById('btn-save-settings')?.addEventListener('click', async () => {
    const theme = document.getElementById('set-theme-select')?.value;
    const notifications_enabled = document.getElementById('set-notifications-toggle')?.checked;

    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    const result = await profileService.updateUserSettings({
      theme,
      currency: 'INR',
      notifications_enabled
    });

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Preferences';
    }

    if (result.success) {
      toast.success('Settings saved!');
    } else {
      toast.error(result.error);
    }
  });

  // Account Deletion Handlers
  document.getElementById('btn-open-delete-account')?.addEventListener('click', () => {
    deleteAccountModal.open();
  });

  const confirmInput = document.getElementById('confirm-delete-input');
  const confirmBtn = document.getElementById('btn-confirm-delete-account');

  confirmInput?.addEventListener('input', (e) => {
    if (confirmBtn) {
      confirmBtn.disabled = e.target.value.trim() !== 'DELETE';
    }
  });

  confirmBtn?.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting Account...';

    const result = await profileService.deleteAccount();
    if (!result.success) {
      toast.error(result.error);
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Delete';
    }
  });

  await loadSettings();
});
