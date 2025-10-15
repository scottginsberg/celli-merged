const TEMPLATE_BASE = 'src/templates/flash';

const COMPONENT_MAP = {
  shell: 'animator-shell.html',
  'flash-menu': 'menu-bar.html',
  'flash-toolbar': 'toolbar.html',
  'flash-tools': 'tools-panel.html',
  'flash-stage': 'stage.html',
  'flash-properties': 'properties-panel.html',
  'flash-timeline': 'timeline.html',
  'flash-overlays': 'overlays.html'
};

const templateCache = new Map();

async function fetchTemplate(name) {
  if (templateCache.has(name)) {
    return templateCache.get(name);
  }

  const response = await fetch(`${TEMPLATE_BASE}/${name}`);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${name}`);
  }

  const html = await response.text();
  templateCache.set(name, html);
  return html;
}

export async function renderFlashAnimator(target) {
  const shell = document.createElement('div');
  shell.innerHTML = await fetchTemplate(COMPONENT_MAP.shell);
  target.innerHTML = '';
  target.appendChild(shell.firstElementChild);

  const placeholders = target.querySelectorAll('[data-component]');
  await Promise.all(
    Array.from(placeholders).map(async (placeholder) => {
      const key = placeholder.getAttribute('data-component');
      const templateName = COMPONENT_MAP[key];
      if (!templateName) {
        console.warn(`[FlashAnimatorLoader] No template mapping for component "${key}"`);
        return;
      }
      placeholder.innerHTML = await fetchTemplate(templateName);
    })
  );
}
