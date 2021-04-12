import { bindEventListeners, createShadowRoot } from '../../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="preferences-view/preferences-view.css">

        <translation-key>preferences.startAtLogin.label</translation-key>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);
  }
}
