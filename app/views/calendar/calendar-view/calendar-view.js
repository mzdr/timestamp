import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-view/calendar-view.css" @keydown.window="onKeyDown" />
        <calendar-background @postrender="onPostRender">
          <calendar-today @postrender="onPostRender" @click="onTodayClicked"></calendar-today>
          <calendar-show-preferences @click="onShowPreferences"></calendar-show-preferences>
        </calendar-background>
        <calendar-legend @click="onLegendClicked" @postrender="onPostRender"></calendar-legend>
        <calendar-month #$month @postrender="onPostRender"></calendar-month>
        <calendar-navigation #$navigation @change="onChange" hidden></calendar-navigation>
      </template>
    `);

    const { calendar, preferences } = window;

    calendar.on('hide', this.onTodayClicked.bind(this));
    preferences.on('changed', this.onPreferencesChanged.bind(this));

    setInterval(this.update.bind(this), 1000);

    this.selectedMonth = null;
    this.lastUpdate = null;

    this.onTodayClicked();
  }

  async update(force = false) {
    const { selectedMonth } = this;
    const { calendar } = window;
    const now = await calendar.getDate();
    const isFirstTime = this.lastUpdate === null;
    const isSameHour = await calendar.isSameHour(this.lastUpdate || now, now);

    if (force === false && isFirstTime === false && isSameHour) {
      return;
    }

    this.lastUpdate = now;

    dispatch(window, 'postupdate', { selectedMonth });
  }

  onKeyDown(e) {
    const { key, metaKey } = e;
    const { app, calendar, preferences } = window;
    const { $navigation } = this.$refs;

    if (key === 'Escape') {
      if ($navigation.hidden) {
        calendar.hide();
      } else {
        $navigation.hidden = true;
      }
    } else if (key === 'w' && metaKey === false) {
      this.onToggle({ weeks: true });
    } else if (key === ',' && metaKey) {
      preferences.show();
    } else if (key === 'q' && metaKey) {
      app.quit();
    }
  }

  onPreferencesChanged() {
    this.update(true);
  }

  onToggle({ weeks }) {
    const { $month } = this.$refs;

    if (weeks) {
      $month.classList.toggle('show-weeks');
    }

    this.onPostRender();
  }

  onPostRender() {
    const { app } = window;

    app.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }

  onShowPreferences() {
    const { preferences } = window;

    preferences.show();

    return this;
  }

  onTodayClicked() {
    this.onChange();
  }

  onLegendClicked() {
    this.$refs.$navigation.hidden = false;
  }

  async onChange({ detail } = {}) {
    const { calendar } = window;

    this.selectedMonth = await calendar.getDate(detail ? { date: this.selectedMonth, ...detail } : {});
    this.update(true);

    if (detail?.diff?.years === undefined) {
      this.$refs.$navigation.hidden = true;
    }
  }
}
