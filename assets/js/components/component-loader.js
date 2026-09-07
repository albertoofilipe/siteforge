import { assertSafeComponentFragment } from '../utils/validation.js';

const componentsUrl = new URL('../../../components/', import.meta.url);
const componentNamePattern = /^[a-z0-9-]+$/;

/** Carrega fragmentos HTML locais nos slots declarados pela página. */
export function createComponentLoader({ initializers = {}, loader } = {}) {
  if (!loader || typeof loader.loadText !== 'function') {
    throw new TypeError('[components] É necessário informar um loader com loadText().');
  }

  async function load(root = document) {
    for (let pass = 0; pass < 10; pass += 1) {
      const slots = [...root.querySelectorAll('[data-component-slot]:not([data-component-loaded])')];

      if (slots.length === 0) {
        return;
      }

      await Promise.all(slots.map((slot) => loadSlot(slot)));
    }

    console.error('[components] Limite de componentes aninhados atingido. Verifique referências circulares.');
  }

  async function loadSlot(slot) {
    const name = slot.dataset.componentSlot;
    const optional = slot.hasAttribute('data-component-optional');

    if (!componentNamePattern.test(name)) {
      reportError(slot, name, optional, new Error('Nome de componente inválido.'));
      return;
    }

    try {
      const markup = await loader.loadText(new URL(`${name}.html`, componentsUrl));
      const fragment = document.createRange().createContextualFragment(markup);

      assertSafeComponentFragment(fragment, componentsUrl);

      slot.replaceChildren(fragment);
      slot.dataset.componentLoaded = 'true';
      await initializeComponent(name, slot);
    } catch (error) {
      reportError(slot, name, optional, error);
    }
  }

  async function initializeComponent(name, slot) {
    const initializer = initializers[name];

    if (typeof initializer !== 'function') {
      return;
    }

    try {
      await initializer(slot);
    } catch (error) {
      console.error(`[components] Falha ao inicializar "${name}".`, error);
    }
  }

  return Object.freeze({ load });
}

function reportError(slot, name, optional, error) {
  slot.dataset.componentLoaded = 'failed';
  slot.dataset.componentFailed = 'true';
  const level = optional ? 'warn' : 'error';
  console[level](`[components] Não foi possível carregar "${name}".`, error);
}
