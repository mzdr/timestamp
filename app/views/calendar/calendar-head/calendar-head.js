import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

const { app, calendar, preferences } = window;

export default class CalendarHead extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <link rel="stylesheet" href="calendar-head/calendar-head.css">
      <div class="calendar-head">
        <figure class="background" #$background></figure>
        <slot class="slot"></slot>
      </div>
    `);

    app.on('tick', this.render.bind(this));
    preferences.on('changed', this.onPreferencesChanged.bind(this));

    this.render();
  }

  onPreferencesChanged(event, key, value) {
    const { $background } = this.$refs;

    if (key !== 'calendarBackground') {
      return;
    }

    if (this.src !== value) {
      $background.replaceChildren();
    }

    this.src = value;
    this.render();
  }

  async render() {
    const { $background } = this.$refs;
    const now = await calendar.getDate();

    this.hour = now.getHours();
    this.month = now.getMonth();

    if ($background.childElementCount === 0) {
      $background.innerHTML = await preferences.getBackgroundFileContents(await this.src);
    }

    dispatch(this, 'postrender');
  }

  set src(value) {
    this.setAttribute('src', value);
  }

  // @see https://github.com/tc39/proposal-async-await/issues/15
  get src() {
    return (async () => {
      if (this.getAttribute('src') === null) {
        this.setAttribute('src', await preferences.get('calendarBackground'));
      }

      return this.getAttribute('src');
    })();
  }

  get hour() {
    return this.getAttribute('hour') ?? 0;
  }

  set hour(value) {
    this.setAttribute('hour', value);
  }

  get month() {
    return this.getAttribute('month') ?? 0;
  }

  set month(value) {
    this.setAttribute('month', value);
  }
}
