import {
  bindEventListeners,
  createShadowRoot,
  dispatch,
  findReferences,
} from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarMonth extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="calendar-month/calendar-month.css">
        <div class="calendar-month" #$content @postupdate.window="onPostUpdate"></div>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);
  }

  async onPostUpdate({ detail }) {
    const { now } = detail;
    const { calendar } = window;
    const { $content } = this.$refs;
    const { weekdays, weeks, days } = await calendar.getCalendar({ now });

    const $weekdays = weekdays.map((weekday) => `<span class="weekday">${weekday}</span>`).join('');
    const $weeks = weeks.map((week) => `<span class="week">${week}</span>`).join('');

    const $days = days.map(({
      day, isToday, previousMonth, nextMonth,
    }) => {
      const cssClass = [
        'day',
        isToday ? '-today' : null,
        previousMonth ? '-previous' : null,
        nextMonth ? '-next' : null,
      ]
        .filter(Boolean)
        .join(' ');

      return `<span class="${cssClass}">${day.getDate()}</span>`;
    }).join('');

    $content.innerHTML = `
      <div class="no">#</div>
      <div class="weekdays">${$weekdays}</div>
      <div class="weeks">${$weeks}</div>
      <div class="days">${$days}</div>
    `;

    dispatch(this, 'postrender');
  }
}
