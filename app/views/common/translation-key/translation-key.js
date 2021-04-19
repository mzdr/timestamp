import { dispatch } from '../../../../node_modules/@browserkids/dom/index.js';

export default class TranslationKey extends HTMLElement {
  constructor() {
    super();

    this.originalKey = this.textContent;
    this.onUpdate();

    window.addEventListener('update', this.onUpdate.bind(this));
  }

  async onUpdate() {
    const { app } = window;

    if (this.hasAttribute('markdown')) {
      this.innerHTML = await app.translate(this.originalKey, { markdown: true });
    } else {
      this.textContent = await app.translate(this.originalKey);
    }

    dispatch(this, 'postrender');
  }
}
