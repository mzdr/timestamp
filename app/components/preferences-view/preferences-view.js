import { bindEventListeners, createShadowRoot } from '../../node_modules/@browserkids/dom/index.js';

export default class PreferencesView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="../../components/preferences-view/preferences-view.css">
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);
  }
}
