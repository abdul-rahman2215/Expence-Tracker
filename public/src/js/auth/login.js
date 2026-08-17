import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('login-form');
  const alertEl = document.getElementById('auth-alert');
  const submitBtn = document.getElementById('btn-login');
  const togglePassBtn = document.getElementById('btn-toggle-password');
  const passwordInput = document.getElementById('password');

  // Handle Google OAuth Redirect Token Parsing
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
    await authService.redirectIfAuthenticated();
  }

  // Toggle Password Visibility
  togglePassBtn?.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePassBtn.innerHTML = '<i class="ti ti-eye-off"></i>';
    } else {
      passwordInput.type = 'password';
      togglePassBtn.innerHTML = '<i class="ti ti-eye"></i>';
    }
  });

  // Google OAuth Login
  document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    hideAlert();
    const result = await authService.signInWithGoogle();
    if (!result.success) {
      showAlert(result.error);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
      showAlert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    hideAlert();

    const result = await authService.login({ email, password });

    if (result.success) {
      window.location.href = new URL('../dashboard/dashboard.html', window.location.href).href;
    } else {
      showAlert(result.error);
      setLoading(false);
    }
  });

  function showAlert(msg, isError = true) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.className = isError ? 'bg-expense text-danger' : 'bg-income text-income';
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
    submitBtn.textContent = isLoading ? 'Signing In...' : 'Sign In';
  }
});
