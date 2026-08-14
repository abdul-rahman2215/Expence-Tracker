import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-form');
  const alertEl = document.getElementById('auth-alert');
  const submitBtn = document.getElementById('btn-reset');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();

    if (!email) {
      showAlert('Please enter your email address.');
      return;
    }

    setLoading(true);
    hideAlert();

    const result = await authService.requestPasswordReset(email);

    if (result.success) {
      showAlert('Password reset link sent! Check your email inbox.', false);
      form.reset();
      setLoading(false);
    } else {
      showAlert(result.error);
      setLoading(false);
    }
  });

  function showAlert(msg, isError = true) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.style.display = 'block';
    alertEl.style.backgroundColor = isError ? 'var(--color-expense-light)' : 'var(--color-income-light)';
    alertEl.style.color = isError ? 'var(--color-danger)' : 'var(--color-income)';
    alertEl.style.padding = '12px 16px';
    alertEl.style.borderRadius = '8px';
    alertEl.style.fontSize = '12px';
    alertEl.style.marginBottom = '16px';
    alertEl.classList.remove('hidden');
  }

  function hideAlert() {
    alertEl?.classList.add('hidden');
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Sending Link...' : 'Send Reset Link';
  }
});
