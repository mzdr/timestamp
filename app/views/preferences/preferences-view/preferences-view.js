import { bindEventListeners, createShadowRoot, findReferences } from '../../../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    const { app, preferences } = window;

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="../../styles/shared/links.css">
        <link rel="stylesheet" href="../../styles/shared/form.css">
        <link rel="stylesheet" href="../../styles/shared/typography.css">
        <link rel="stylesheet" href="../../styles/components/container-alert.css">
        <link rel="stylesheet" href="preferences-view/preferences-view.css">

        <form
          class="preferences-view"
          @input="onInput"
          @postrender="onPostRender"
        >
          <section #$alert class="alert container-alert">
            <span class="icon">🎉</span>
            <translation-key>app.updateDownloaded</translation-key>
            <div class="actions">
              <button @click="onRestartClicked">
                <translation-key>app.restart</translation-key>
              </button>
            </div>
          </section>

          <section class="preferences-category">
            <translation-key class="title">preferences.category.general</translation-key>
            <div class="items">
              <label class="preferences-item">
                <input #$preference type="checkbox" name="openAtLogin" class="action">
                <translation-key class="label">preferences.openAtLogin.label</translation-key>
                <translation-key class="description">preferences.openAtLogin.description</translation-key>
              </label>
            </div>
          </section>

          <section class="preferences-category">
            <translation-key class="title">preferences.category.tray</translation-key>

            <div class="items">
              <label class="preferences-item -text">
                <input #$preference type="text" name="clockFormat" class="action">
                <translation-key class="label">preferences.clockFormat.label</translation-key>
                <translation-key class="description" markdown>preferences.clockFormat.description</translation-key>
              </label>
            </div>
          </section>

          <section class="about">
            <span class="product">${app.productName} v${app.version}</span>
            <span class="copyright">${app.copyright}</span>
          </section>
        </form>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);

    const { $preference } = this.$refs;

    $preference.forEach(async ($el) => {
      const { name } = $el;
      const value = await preferences.get(name);

      $el.setAttribute(typeof value === 'boolean' ? 'checked' : 'value', value);
    });

    preferences.on('app.update-downloaded', this.onUpdateDownloaded.bind(this));
  }

  onInput({ target }) {
    const {
      name, value, type, checked,
    } = target;

    const { preferences } = window;

    // Avoid saving jibberish
    if (value.trim() === '') {
      return this;
    }

    preferences.set(name, type !== 'text' ? checked : value);

    return this;
  }

  onRestartClicked() {
    const { app } = window;

    app.restart();

    return this;
  }

  onUpdateDownloaded() {
    this.$refs.$alert.classList.add('-show');
    this.onPostRender();

    return this;
  }

  onPostRender() {
    const { app } = window;

    app.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }
}
