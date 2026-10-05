import { el } from './dom.js';

export function createModal() {
  const panel = el('div', {
    className: 'modal-panel',
    attrs: { tabindex: '-1' },
  });
  const dialog = el('dialog', { className: 'modal' });
  dialog.append(panel);
  document.body.append(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  dialog.addEventListener('close', () => {
    document.removeEventListener('keydown', onKeydown);
    document.documentElement.classList.remove('is-modal-open');
    panel.replaceChildren();
  });

  function open(content, labelledBy) {
    panel.replaceChildren(content);
    dialog.setAttribute('aria-labelledby', labelledBy);
    document.documentElement.classList.add('is-modal-open');
    document.addEventListener('keydown', onKeydown);

    if (!dialog.open) {
      dialog.showModal();
    }

    panel.focus();
  }

  function close() {
    if (dialog.open) {
      dialog.close();
    }
  }

  function isOpen() {
    return dialog.open;
  }

  return { open, close, isOpen };
}
