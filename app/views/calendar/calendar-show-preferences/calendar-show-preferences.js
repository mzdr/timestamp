import { createShadowRoot } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarShowPreferences extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="calendar-show-preferences/calendar-show-preferences.css">
        <svg class="icon-dots" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 6">
          <circle class="dot" cx="21" cy="3" r="3" />
          <circle class="dot" cx="12" cy="3" r="3" />
          <circle class="dot" cx="3" cy="3" r="3" />
        </svg>
      </template>
    `);

    const { app } = window;

    app.on('update-downloaded', this.onUpdateDownloaded.bind(this));
  }

  onUpdateDownloaded() {
    this.classList.add('update-downloaded');
  }
}
