/**
 * Debug Utilities
 * Toast notifications and debug helpers
 */

const toastEl = document.getElementById('toast');

export function toast(lines, level = 'ok') {
  const arr = Array.isArray(lines) ? lines : [String(lines)];
  toastEl.innerHTML = `<strong>Debug</strong><br>${arr.map(l => 
    `<span class="${level}">${l}</span>`
  ).join('<br>')}`;
  toastEl.style.display = 'block';
}

export function clearToast() {
  toastEl.style.display = 'none';
}


