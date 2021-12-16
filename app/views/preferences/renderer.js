import { bindAttributes, bindEventListeners, findReferences } from '@browserkids/dom';

window.renderer = new class Renderer {
  constructor({ app, preferences }) {
    this.$root = document.documentElement;
    this.$refs = findReferences(this.$root);
    this.app = app;
    this.preferences = preferences;

    bindEventListeners(this.$root, this);

    bindAttributes(this.$root, {
      productName: this.app.productName,
      version: this.app.version,
    });

    this.app.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    this.render();
  }

  onCategoryClicked({ currentTarget }) {
    const { $content, $tab } = this.$refs;
    const index = $tab.indexOf(currentTarget);
    const toggleActive = ($el, position) => $el.classList.toggle('-active', index === position);

    [$tab, $content].forEach(($el) => $el.forEach(toggleActive));
  }

  onInput({ target }) {
    const {
      name,
      value,
      type,
      checked,
    } = target;

    const isBoolean = ['on', 'off'].indexOf(value) >= 0 && ['checkbox', 'radio'].indexOf(type) >= 0;

    this.preferences.set(name, isBoolean ? checked : value);
  }

  onKeyDown({ key }) {
    if (key === 'Escape') {
      this.preferences.hide();
    }
  }

  onPostRender() {
    this.app.resizeWindow({
      height: this.$root.offsetHeight,
      width: this.$root.offsetWidth,
    });
  }

  onQuitClicked() {
    this.app.quit();
  }

  onRestartClicked() {
    this.app.restart();
  }

  onUpdateDownloaded() {
    this.$refs.$alert.classList.remove('-hidden');
  }

  async render() {
    const {
      $backgrounds,
      $keys,
      $form,
      $tab,
    } = this.$refs;

    const all = await this.preferences.getAll();
    const backgrounds = await this.preferences.getBackgrounds();
    const shortcuts = await this.app.translate('preferences.shortcuts.keys');

    backgrounds
      .map((background) => ([background, background.split('/').pop().split('.').shift()]))
      .map(([value, name]) => `<option value="${value}">${name}</option>`)
      .forEach((background) => $backgrounds.insertAdjacentHTML('beforeend', background));

    shortcuts
      .map(([keys, label]) => ([keys.split('+').map((key) => `<span class="key">${key}</span>`).join('+'), label]))
      .map(([keys, label]) => `<dt class="keys">${keys}</dt><dd class="label">${label}</dd>`)
      .forEach((shortcut) => $keys.insertAdjacentHTML('beforeend', shortcut));

    Array
      .from(all)
      .filter(([key]) => $form[key])
      .forEach(([key, value]) => {
        $form[key][typeof value === 'boolean' ? 'checked' : 'value'] = value;
      });

    this.onCategoryClicked({ currentTarget: $tab[0] });
  }
}(window);
