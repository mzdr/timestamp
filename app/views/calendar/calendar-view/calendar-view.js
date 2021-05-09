import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-view/calendar-view.css" />
        <calendar-background @postrender="onPostRender">
          <calendar-today @postrender="onPostRender" @click="onTodayClicked"></calendar-today>
          <calendar-show-preferences @click="onShowPreferences"></calendar-show-preferences>
        </calendar-background>
        <calendar-legend @postrender="onPostRender"></calendar-legend>
        <calendar-month #$month @postrender="onPostRender"></calendar-month>
        <calendar-navigation @change="onChange" @toggle="onToggle"></calendar-navigation>
      </template>
    `);

    const { calendar } = window;

    calendar.on('hide', this.onTodayClicked.bind(this));

    setInterval(this.update.bind(this), 1000);

    this.selected = null;
    this.lastUpdate = null;

    this.onTodayClicked();
  }

  async update(selected) {
    const { calendar } = window;
    const now = await calendar.getDate();
    const isNewHour = this.lastUpdate === null || (await calendar.isSameHour(this.lastUpdate, now)) === false;

    if (selected === undefined && isNewHour === false) {
      return;
    }

    this.selected = selected || this.selected;
    this.lastUpdate = now;

    dispatch(window, 'postupdate', { selected: this.selected });
  }

  onToggle({ detail }) {
    const { weeks } = detail;
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
    return this.onChange();
  }

  async onChange({ detail } = {}) {
    const { calendar } = window;

    if (detail) {
      return this.update(
        await calendar.getDate({ date: this.selected, ...detail }),
      );
    }

    return this.update(await calendar.getDate());
  }
}
