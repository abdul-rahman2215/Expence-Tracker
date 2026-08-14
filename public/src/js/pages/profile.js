import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { profileService } from '../services/profile-service.js';
import { toast } from '../components/toast.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('profile');
  renderNavbar({
    title: 'Profile',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal();

  // Load Profile Details
  async function loadProfile() {
    const emailInput = document.getElementById('prof-email');
    const nameInput = document.getElementById('prof-name');
    const currencySelect = document.getElementById('prof-currency');

    if (emailInput) emailInput.value = user.email || '';

    const result = await profileService.getProfile();
    if (result.success && result.profile) {
      if (nameInput) nameInput.value = result.profile.name || '';
      if (currencySelect) currencySelect.value = result.profile.currency || 'INR';
    }
  }

  // Handle Profile Form Submission
  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('prof-name')?.value;
    const currency = document.getElementById('prof-currency')?.value;

    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    const result = await profileService.updateProfile({ name, currency });

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Profile Changes';
    }

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.error);
    }
  });

  await loadProfile();
});
