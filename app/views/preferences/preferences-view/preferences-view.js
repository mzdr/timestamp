import { bindEventListeners, createShadowRoot, findReferences } from '../../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="preferences-view/preferences-view.css">

        <form
          class="preferences-view"
          @input="onInput"
          @finish="onFinish"
          @update.window="onUpdate"
        >
          <div class="preferences-category">
            <translation-key class="title">preferences.category.general</translation-key>
            <div class="items">
              <label class="preferences-item">
                <input #$preference type="checkbox" name="openAtLogin" class="action">
                <translation-key class="label">preferences.openAtLogin.label</translation-key>
                <translation-key class="description">preferences.openAtLogin.description</translation-key>
              </label>
            </div>
          </div>

          <div class="preferences-category">
            <translation-key class="title">preferences.category.tray</translation-key>

            <div class="items">
              <label class="preferences-item -text">
                <input #$preference type="text" name="clockFormat" class="action">
                <translation-key class="label">preferences.clockFormat.label</translation-key>
                <translation-key class="description">preferences.clockFormat.description</translation-key>
              </label>
            </div>
          </div>
        </form>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);

    this.$refs.$preference.forEach(async ($el) => {
      const { preferences } = window;
      const { name } = $el;

      const value = await preferences.get(name);

      $el.setAttribute(typeof value === 'boolean' ? 'checked' : 'value', value);
    });
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

  onUpdate() {
    return this;
  }

  onFinish() {
    const { preferences } = window;

    preferences.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }
}
