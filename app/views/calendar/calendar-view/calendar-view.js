import { upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

const { app, calendar, preferences } = window;

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <link rel="stylesheet" href="calendar-view/calendar-view.css" @keydown.window="onKeyDown" />
      <calendar-head @postrender="onPostRender">
        <calendar-today @postrender="onPostRender" @click="onTodayClicked"></calendar-today>
        <calendar-show-preferences @click="onShowPreferences"></calendar-show-preferences>
      </calendar-head>
      <calendar-body #$body @postrender="onPostRender"></calendar-body>
    `);

    calendar.on('hide', this.onHide.bind(this));
  }

  onKeyDown(e) {
    const { key, metaKey } = e;

    if (key === 'Escape') {
      calendar.hide();
    } else if (key === 'w' && metaKey === false) {
      this.onToggle({ weeks: true });
    } else if (key === ',' && metaKey) {
      preferences.show();
    } else if (key === 'q' && metaKey) {
      app.quit();
    } else if (key === ' ') {
      this.onTodayClicked();
    }

    // In general prevent any default browser shortcuts
    e.preventDefault();
  }

  onToggle({ weeks }) {
    const { $body } = this.$refs;

    if (weeks) {
      $body.classList.toggle('show-weeks');
    }

    this.onPostRender();
  }

  onPostRender() {
    app.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }

  onShowPreferences() {
    preferences.show();

    return this;
  }

  onHide() {
    this.onTodayClicked();
  }

  onTodayClicked() {
    this.$refs.$body.setActiveMonth();
  }

  get hidden() {
    return this.getAttribute('hidden');
  }

  set hidden(value) {
    this.toggleAttribute('hidden', value);
  }
}
