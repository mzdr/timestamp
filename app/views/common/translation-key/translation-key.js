import { dispatch } from '../../../../node_modules/@browserkids/dom/index.js';

export default class TranslationKey extends HTMLElement {
  constructor() {
    super();

    this.originalKey = this.textContent;
    this.onPostUpdate();

    window.addEventListener('postupdate', this.onPostUpdate.bind(this));
  }

  async onPostUpdate() {
    const { app } = window;

    if (this.hasAttribute('markdown')) {
      this.innerHTML = await app.translate(this.originalKey, { markdown: true });
    } else {
      this.textContent = await app.translate(this.originalKey);
    }

    dispatch(this, 'postrender');
  }
}
