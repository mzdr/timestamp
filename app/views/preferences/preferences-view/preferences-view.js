import { upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    const { app } = window;

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="../../styles/components/button-primary.css">
        <link rel="stylesheet" href="../../styles/components/container-alert.css">
        <link rel="stylesheet" href="../../styles/components/form-group.css">
        <link rel="stylesheet" href="../../styles/components/list-shortcuts.css">
        <link rel="stylesheet" href="preferences-view/preferences-view.css">

        <div class="preferences-view">
          <aside class="preferences-side side">
            <img class="logo" src="../../assets/logo.svg" alt="">
            <h1 class="name">${app.productName}</h1>

            <nav class="navigation preferences-navigation">
              <button class="item" @click="onCategoryClicked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <translation-key class="title">preferences.category.general</translation-key>
              </button>
              <button class="item" @click="onCategoryClicked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <translation-key class="title">preferences.category.tray</translation-key>
              </button>
              <button class="item" @click="onCategoryClicked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <translation-key class="title">preferences.category.calendar</translation-key>
              </button>
              <button class="item" @click="onCategoryClicked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
                <translation-key class="title">preferences.category.shortcuts</translation-key>
              </button>
            </nav>
            <section class="about preferences-about">v${app.version}</section>
          </aside>

          <section #$alert class="alert -hidden container-alert">
            <span class="icon">🎉</span>
            <translation-key>app.updateDownloaded</translation-key>
            <div class="actions">
              <button @click="onRestartClicked" class="button-primary">
                <translation-key>app.restart</translation-key>
              </button>
            </div>
          </section>

          <form
            #$form
            @input="onInput"
            @postrender="onPostRender"
            @keydown.window="onKeyDown"
            class="contents preferences-contents"
          >
            <section class="content" #$content>
              <label class="form-group">
                <input type="checkbox" name="openAtLogin" class="action -toggle">
                <translation-key class="label">preferences.openAtLogin.label</translation-key>
                <translation-key class="description">preferences.openAtLogin.description</translation-key>
              </label>
            </section>
            <section class="content -hidden" #$content>
              <label class="form-group">
                <input type="text" name="clockFormat" class="action -text" size="12">
                <translation-key class="label">preferences.clockFormat.label</translation-key>
                <translation-key class="description" markdown>preferences.clockFormat.description</translation-key>
              </label>
            </section>
            <section class="content -hidden" #$content>
              <label class="form-group">
                <select #$backgrounds name="calendarBackground" class="action -select"></select>
                <translation-key class="label">preferences.calendarBackground.label</translation-key>
                <translation-key class="description">preferences.calendarBackground.description</translation-key>
              </label>
              <label class="form-group">
                <input type="text" name="calendarLegendFormat" class="action -text" size="8">
                <translation-key class="label">preferences.calendarLegendFormat.label</translation-key>
                <translation-key class="description" markdown>preferences.calendarLegendFormat.description</translation-key>
              </label>
            </section>
            <section class="content -hidden" #$content>
              <translation-key class="description">preferences.shortcuts.description</translation-key>
              <dl class="list-shortcuts" #$keys></dl>
            </section>
          </form>
        </div>
      </template>
    `);

    this.render();

    app.on('update-downloaded', this.onUpdateDownloaded.bind(this));
  }

  async render() {
    const { app, preferences } = window;
    const { $form, $backgrounds, $keys } = this.$refs;
    const all = await preferences.getAll();
    const backgrounds = await preferences.getBackgrounds();
    const shortcuts = await app.translate('preferences.shortcuts.keys');

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

  onCategoryClicked({ currentTarget }) {
    const { $content } = this.$refs;
    const index = [...currentTarget.parentElement.children].indexOf(currentTarget);

    $content.forEach(($el, current) => $el.classList.toggle('-hidden', index !== current));
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
    this.$refs.$alert.classList.remove('-hidden');
    this.onPostRender();
  }

  onPostRender() {
    const { app } = window;

    app.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }
}
