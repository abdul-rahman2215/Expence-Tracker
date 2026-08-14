import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('register-form');
  const alertEl = document.getElementById('auth-alert');
  const submitBtn = document.getElementById('btn-register');

  // Handle Google OAuth Redirect Token Parsing
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
    await authService.redirectIfAuthenticated();
  }

  const p1 = document.getElementById('password');
  const p2 = document.getElementById('confirm-password');
  const btn1 = document.getElementById('btn-toggle-pass1');
  const btn2 = document.getElementById('btn-toggle-pass2');

  btn1?.addEventListener('click', () => {
    p1.type = p1.type === 'password' ? 'text' : 'password';
    btn1.textContent = p1.type === 'password' ? '👁️ Show' : '🙈 Hide';
  });

  btn2?.addEventListener('click', () => {
    p2.type = p2.type === 'password' ? 'text' : 'password';
    btn2.textContent = p2.type === 'password' ? '👁️ Show' : '🙈 Hide';
  });

  // Google OAuth Register
  document.getElementById('btn-google-register')?.addEventListener('click', async () => {
    hideAlert();
    const result = await authService.signInWithGoogle();
    if (!result.success) {
      showAlert(result.error);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    if (!name || !email || !password || !confirmPassword) {
      showAlert('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    hideAlert();

    const result = await authService.register({ name, email, password });

    if (result.success) {
      showAlert('Registration successful! Redirecting to login...', false);
      setTimeout(() => {
        window.location.href = '/src/pages/auth/login.html';
      }, 1500);
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
    submitBtn.textContent = isLoading ? 'Creating Account...' : 'Create Free Account';
  }
});
