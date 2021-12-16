import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

const { app, calendar, preferences } = window;

export default class CalendarBody extends HTMLElement {
  #years = [];

  constructor() {
    super();

    upgrade(this, `
      <link rel="stylesheet" href="calendar-body/calendar-body.css">
      <section class="calendar-body">
        <span class="legend" #$legend>&nbsp;</span>
        <ul class="weekdays" #$weekdays></ul>
        <ul class="days" #$days></ul>
      </section>
    `);

    app.on('tick', () => this.setToday());

    this.render();
  }

  static async getDays({ year, diff } = {}) {
    const payload = {
      set: { year },
      diff: { years: diff },
    };

    return (await calendar.getCalendar(payload)).map(({ date, day, weekday }, index) => {
      const $day = document.createElement('li');
      const isFirst = index === 0;

      $day.classList.add('day');
      $day.dataset.year = date.getFullYear();
      $day.dataset.month = date.getMonth();
      $day.dataset.day = date.getDate();
      $day.textContent = day;

      // Need weekday for properly picking starting column
      if (isFirst) {
        $day.dataset.weekday = weekday;
      }

      return $day;
    });
  }

  async onVisibilityChanged(entries) {
    const { $legend } = this.$refs;
    const intersectingOne = entries.find(({ isIntersecting }) => isIntersecting);

    if (intersectingOne === undefined) {
      return;
    }

    const $day = intersectingOne.target;
    const { year, month, day } = $day.dataset;

    $legend.textContent = await calendar.getDate({
      set: { year, month, day },
      format: await preferences.get('calendarLegendFormat'),
    });

    this.activeMonth = month;

    const position = this.#years.indexOf(year);

    if (position === 1) {
      return;
    }

    await this.addYear({ isFirst: position === 0 });
    await this.removeYear({ isFirst: position === 2 });
  }

  createObserver() {
    const { $days } = this.$refs;

    this.firstRow = new IntersectionObserver(this.onVisibilityChanged.bind(this), {
      root: $days,
      rootMargin: '0px 0px -50% 0px',
    });

    return this;
  }

  async addYear(settings = {}) {
    const { isFirst = false, year } = settings;
    const { $days } = this.$refs;
    const $firstOrLastDay = $days[`${isFirst ? 'first' : 'last'}ElementChild`];

    const diff = isFirst ? -1 : 1;
    const days = await this.constructor.getDays({
      year: year ?? $firstOrLastDay?.dataset?.year,
      diff: $firstOrLastDay ? diff : 0,
    });

    if (isFirst) {
      days.reverse();
    }

    days.forEach(($el) => {
      if ($el.dataset.day === '1') {
        this.firstRow.observe($el);
      }

      $days[isFirst ? 'prepend' : 'append']($el);
    });

    this.#years[isFirst ? 'unshift' : 'push'](days.at(0).dataset.year);
  }

  removeYear(settings = {}) {
    const { isFirst = true } = settings;
    const { $days } = this.$refs;
    const elementChild = `${isFirst ? 'first' : 'last'}ElementChild`;
    const year = $days[elementChild]?.dataset?.year;

    while ($days[elementChild]?.dataset?.year === year) {
      const $day = $days[elementChild];

      // Avoid memory leaks
      // @see https://w3c.github.io/IntersectionObserver/#lifetime
      if ($day.dataset.day === '1') {
        this.firstRow.unobserve($day);
      }

      $day.remove();
    }

    this.#years[isFirst ? 'shift' : 'pop']();
  }

  async setActiveMonth(payload) {
    const { $days } = this.$refs;

    const date = await calendar.getDate(payload);
    const year = date.getFullYear();
    const month = date.getMonth();
    const isReset = this.#years.includes(year.toString()) === false;

    if (isReset) {
      this.createObserver();

      $days.replaceChildren();

      this.#years = [];

      await this.addYear({ year });
      await this.addYear();
      await this.addYear({ isFirst: true });
    }

    $days
      .querySelector(`[data-year="${year}"][data-month="${month}"]`)
      .scrollIntoView();

    await this.setToday();
  }

  async setToday() {
    const { $days } = this.$refs;

    const now = await calendar.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const todayCss = '-today';
    const todaySelector = `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`;

    const $today = $days.querySelector(todaySelector);
    const $oldToday = $days.querySelector(`.${todayCss}`);

    if ($oldToday === $today) {
      return;
    }

    $oldToday?.classList?.remove(todayCss);
    $today?.classList?.add(todayCss);
  }

  async setWeekdays() {
    const { $weekdays } = this.$refs;
    const { weekdays, startIndex } = await calendar.getWeekdays();

    this.startOfWeek = startIndex;

    $weekdays.replaceChildren();

    weekdays.forEach((weekday) => {
      const $weekday = document.createElement('li');

      $weekday.textContent = weekday;
      $weekdays.appendChild($weekday);
    });
  }

  async render() {
    this.createObserver();

    await this.setWeekdays();
    await this.setActiveMonth();
    await this.setToday();

    dispatch(this, 'postrender');
  }

  get activeMonth() {
    return this.getAttribute('active-month') ?? '';
  }

  set activeMonth(value) {
    this.setAttribute('active-month', value);
  }

  get startOfWeek() {
    return this.getAttribute('start-of-week') ?? '';
  }

  set startOfWeek(value) {
    this.setAttribute('start-of-week', value);
  }
}
