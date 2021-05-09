import { upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    const { app } = window;

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="../../styles/shared/links.css">
        <link rel="stylesheet" href="../../styles/shared/form.css">
        <link rel="stylesheet" href="../../styles/shared/typography.css">
        <link rel="stylesheet" href="../../styles/components/container-alert.css">
        <link rel="stylesheet" href="preferences-view/preferences-view.css">

        <form
          #$form
          @input="onInput"
          @postrender="onPostRender"
          @keydown.window="onKeyDown"
          class="preferences-view"
        >
          <section #$alert class="full container-alert">
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
                <input type="checkbox" name="openAtLogin" class="action">
                <translation-key class="label">preferences.openAtLogin.label</translation-key>
                <translation-key class="description">preferences.openAtLogin.description</translation-key>
              </label>
            </div>
          </section>

          <section class="preferences-category">
            <translation-key class="title">preferences.category.tray</translation-key>

            <div class="items">
              <label class="preferences-item -text">
                <input type="text" name="clockFormat" class="action">
                <translation-key class="label">preferences.clockFormat.label</translation-key>
                <translation-key class="description" markdown>preferences.clockFormat.description</translation-key>
              </label>
            </div>
          </section>

          <section class="full preferences-category">
            <translation-key class="title">preferences.category.calendar</translation-key>

            <div class="items">
              <div class="preferences-item -selection">
                <translation-key class="label">preferences.calendarBackground.label</translation-key>
                <translation-key class="description">preferences.calendarBackground.description</translation-key>
                <div #$choices class="choices"></div>
              </div>
            </div>
          </section>

          <section class="full preferences-about">
            <span class="product">${app.productName} v${app.version}</span>
            <span class="copyright">${app.copyright}</span>
          </section>
        </form>
      </template>
    `);

    this.render();

    app.on('update-downloaded', this.onUpdateDownloaded.bind(this));
  }

  async render() {
    const { preferences } = window;
    const { $form, $choices } = this.$refs;
    const all = await preferences.getAll();
    const backgrounds = await preferences.getBackgrounds();

    backgrounds.forEach((background) => $choices.insertAdjacentHTML('beforeend', `
      <label class="choice preferences-choice">
        <input type="radio" name="calendarBackground" class="input" value="${background}">
        <img src="${background}" class="preview" alt="">
        <span class="status"></span>
      </label>
    `));

    Array
      .from(all)
      .filter(([key]) => $form[key])
      .forEach(([key, value]) => {
        $form[key][typeof value === 'boolean' ? 'checked' : 'value'] = value;
      });

    this.onPostRender();
  }

  onInput({ target }) {
    const {
      name,
      value,
      type,
      checked,
    } = target;

    const { preferences } = window;
    const isBoolean = ['on', 'off'].indexOf(value) >= 0 && ['checkbox', 'radio'].indexOf(type) >= 0;

    preferences.set(name, isBoolean ? checked : value);

    return this;
  }

  onKeyDown({ key }) {
    const { preferences } = window;

    if (key === 'Escape') {
      preferences.hide();
    }

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
