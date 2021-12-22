customElements.define('translation-key', class TranslationKey extends HTMLElement {
  #key;

  constructor() {
    super();

    this.#key = this.textContent;
    this.render();
  }

  async render() {
    const { app } = window;

    if (this.hasAttribute('markdown')) {
      this.innerHTML = await app?.translate(this.#key, { markdown: true });
    } else {
      this.textContent = await app?.translate(this.#key);
    }
  }
});
