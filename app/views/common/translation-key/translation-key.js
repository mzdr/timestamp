import { bindEventListeners, createShadowRoot } from '../../../node_modules/@browserkids/dom/index.js';

export default class TranslationKey extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <slot @slotchange="onChange"></slot>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);
  }

  async onChange() {
    const { app } = window;
    const key = this.textContent;

    this.textContent = await app.translate(key);
  }
}
