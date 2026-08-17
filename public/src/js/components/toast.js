/**
 * Toast Notification Component
 * Renders user alerts safely using textContent to prevent XSS vulnerabilities.
 */

class ToastManager {
  constructor() {
    this.container = null;
    this._ensureContainer();
  }

  _ensureContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  show({ message, type = 'info', duration = 3500 }) {
    this._ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.innerHTML = type === 'success' ? '<i class="ti ti-circle-check"></i>' : type === 'danger' ? '<i class="ti ti-circle-x"></i>' : type === 'warning' ? '<i class="ti ti-alert-triangle"></i>' : '<i class="ti ti-info-circle"></i>';

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => {
        toast.remove();
      }, 200);
    }, duration);
  }

  success(msg) {
    this.show({ message: msg, type: 'success' });
  }

  error(msg) {
    this.show({ message: msg, type: 'danger' });
  }

  warning(msg) {
    this.show({ message: msg, type: 'warning' });
  }

  info(msg) {
    this.show({ message: msg, type: 'info' });
  }
}

export const toast = new ToastManager();
