import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

const { app, calendar, preferences } = window;

export default class CalendarToday extends HTMLElement {
  #format = null;

  constructor() {
    super();

    upgrade(this, `
      <link rel="stylesheet" href="calendar-today/calendar-today.css">
      <slot class="calendar-today">&nbsp;</slot>
    `);

    app.on('tick', this.render.bind(this));
    preferences.on('changed', this.onPreferencesChanged.bind(this));

    this.render();
  }

  onPreferencesChanged(event, key, value) {
    if (key !== 'calendarTodayFormat') {
      return;
    }

    this.format = value;
    this.render();
  }

  set format(value) {
    this.#format = value.replace(/\n/g, '\'<br>\'');
  }

  // @see https://github.com/tc39/proposal-async-await/issues/15
  get format() {
    return (async () => {
      if (this.#format === null) {
        this.format = await preferences.get('calendarTodayFormat');
      }

      return this.#format;
    })();
  }

  async render() {
    this.innerHTML = await calendar.getDate({ format: await this.format });

    dispatch(this, 'postrender');
  }
}
