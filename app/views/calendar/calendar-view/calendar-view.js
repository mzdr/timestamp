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

    calendar.on('hide', this.onTodayClicked.bind(this));
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
    }
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

  onTodayClicked() {
    this.$refs.$body.setToday({
      isReplacing: true,
    });

    return this;
  }
}
