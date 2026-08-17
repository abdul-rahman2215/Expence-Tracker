/**
 * Modal Engine Component
 * Controls modal backdrop opening, closing, and escape key listener.
 */

export class Modal {
  constructor(modalId) {
    this.modalBackdrop = document.getElementById(modalId);
    if (this.modalBackdrop) {
      this._bindEvents();
    }
  }

  _bindEvents() {
    // Close on backdrop click outside modal body
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) {
        this.close();
      }
    });

    // Close on close button click
    const closeBtns = this.modalBackdrop.querySelectorAll('[data-modal-close]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    if (!this.modalBackdrop) return;
    this.modalBackdrop.classList.add('active');
    document.body.classList.add('modal-open');
    this._scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this._scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modalBackdrop) return;
    this.modalBackdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    if (this._scrollY !== undefined) {
      window.scrollTo(0, this._scrollY);
    }
  }

  isOpen() {
    return this.modalBackdrop && this.modalBackdrop.classList.contains('active');
  }
}
