import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

const { app, calendar, preferences } = window;

export default class CalendarBody extends HTMLElement {
  #snapTimeout = null;

  #$activeMonth = null;

  constructor() {
    super();

    upgrade(this, `
      <link rel="stylesheet" href="calendar-body/calendar-body.css">
      <section class="calendar-legend" #$legend>&nbsp;</section>
      <section class="calendar-month">
        <span class="no">#</span>
        <div class="weekdays" #$weekdays></div>
        <div class="weeks" #$weeks></div>
        <div class="days" #$days @scroll="onScroll"></div>
      </section>
    `);

    app.on('tick', this.onTick.bind(this));

    this.intersectionObserver = new IntersectionObserver(this.onVisibilityChanged.bind(this), {
      root: this.$refs.$days,
      rootMargin: `0px 0px -${(3 / 6) * 100}% 0px`,
    });

    this.render();
  }

  static async getDays({ month, months, year } = {}) {
    const payload = {
      set: { month, year },
      diff: { months },
    };

    return (await calendar.getCalendar(payload)).map(({ date, day, weekday }, index) => {
      const $day = document.createElement('span');
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

  onTick() {
    this.setToday();
  }

  onScroll() {
    const { $days } = this.$refs;
    const { scrollTop, scrollHeight, offsetHeight } = $days;
    const triggerHeight = offsetHeight * (3 / 6);

    if (scrollTop <= triggerHeight) {
      this.addMonth({ isPrepending: true });
    } else if (scrollTop >= (scrollHeight - offsetHeight - triggerHeight)) {
      this.addMonth();
    }

    if (this.#snapTimeout) {
      clearTimeout(this.#snapTimeout);
    }

    this.#snapTimeout = setTimeout(() => {
      this.#$activeMonth?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }

  async onVisibilityChanged(entries) {
    const { $days, $legend } = this.$refs;
    const intersectingOne = entries.find(({ isIntersecting }) => isIntersecting);

    if (intersectingOne === undefined) {
      return;
    }

    const $day = intersectingOne.target;
    const { year, month, day } = $day.dataset;

    // Set month of day that came into viewport as active month
    $days.dataset.activeMonth = month;

    // Update legend with newly set month label
    $legend.textContent = await calendar.getDate({
      date: new Date(year, month, day),
      format: await preferences.get('calendarLegendFormat'),
    });

    this.#$activeMonth = $day;
  }

  async addMonth(settings = {}) {
    const { isPrepending = false } = settings;
    const { $days } = this.$refs;

    const elementChild = `${isPrepending ? 'first' : 'last'}ElementChild`;
    const diff = isPrepending ? -1 : 1;

    const { year, month } = $days[elementChild]?.dataset ?? {};
    const payload = { year, month, months: year ? diff : 0 };
    const days = await this.constructor.getDays(payload);

    if (isPrepending) {
      days.reverse();
    }

    days.forEach(($day) => {
      if ($day.dataset.day === '1') {
        this.intersectionObserver.observe($day);
      }

      $days[isPrepending ? 'prepend' : 'append']($day);
    });
  }

  removeMonth(settings = {}) {
    const { isLast = true } = settings;
    const { $days } = this.$refs;
    const elementChild = `${isLast ? 'last' : 'first'}ElementChild`;
    const month = $days[elementChild]?.dataset?.month;

    while ($days[elementChild]?.dataset?.month === month) {
      const $day = $days[elementChild];

      // Avoid memory leaks
      // @see https://w3c.github.io/IntersectionObserver/#lifetime
      if ($day.dataset.day === '1') {
        this.intersectionObserver.unobserve($day);
      }

      $day.remove();
    }
  }

  async setWeekdays() {
    const { $weekdays, $days } = this.$refs;
    const { weekdays, startIndex } = await calendar.getWeekdays();

    $days.dataset.startOfWeek = startIndex;
    $weekdays.replaceChildren();

    weekdays.forEach((weekday) => {
      const $weekday = document.createElement('span');

      $weekday.textContent = weekday;
      $weekdays.appendChild($weekday);
    });
  }

  async setToday(settings = {}) {
    const { isReplacing = false } = settings;
    const { $days } = this.$refs;
    const todayCss = '-today';

    const now = await calendar.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    if (isReplacing) {
      this.empty();

      await this.addMonth();
      await this.addMonth({ isPrepending: true });
      await this.addMonth();

      $days
        .querySelector(`[data-month="${month}"][data-day="1"]`)
        .scrollIntoView();
    }

    const $today = $days.querySelector(`[data-year="${year}"][data-month="${month}"][data-day="${day}"]`);
    const $oldToday = $days.querySelector(`.${todayCss}`);

    if ($oldToday === $today) {
      return;
    }

    $oldToday?.classList?.remove(todayCss);
    $today?.classList?.add(todayCss);
  }

  empty() {
    const { $days } = this.$refs;

    Array
      .from($days.querySelectorAll('[data-day="1"]'))
      .forEach(($day) => this.intersectionObserver.unobserve($day));

    $days.replaceChildren();
  }

  async render() {
    await this.setWeekdays();
    await this.setToday({ isReplacing: true });

    dispatch(this, 'postrender');
  }
}
