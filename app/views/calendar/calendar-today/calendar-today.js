import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarToday extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-today/calendar-today.css">
        <slot class="calendar-today">&nbsp;</slot>
      </template>
    `);

    const { preferences } = window;

    preferences.on('changed', this.onPreferencesChanged.bind(this));

    this.render();
  }

  onPreferencesChanged(event, key, value) {
    if (key !== 'calendarTodayFormat') {
      return;
    }

    this.render(value);
  }

  async render(format) {
    const { calendar, preferences } = window;

    this.innerHTML = await calendar.getDate({
      format: (format || await preferences.get('calendarTodayFormat')).replace(/\n/g, '\'<br>\''),
    });

    dispatch(this, 'postrender');
  }
}
