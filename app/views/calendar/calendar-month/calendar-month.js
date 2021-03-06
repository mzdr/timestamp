import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarMonth extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-month/calendar-month.css">
        <div class="calendar-month" #$content @postupdate.window="onPostUpdate"></div>
      </template>
    `);
  }

  async onPostUpdate({ detail }) {
    const { selectedMonth } = detail;
    const { calendar } = window;
    const { $content } = this.$refs;
    const { weekdays, weeks, days } = await calendar.getCalendar({ date: selectedMonth });

    const $weekdays = weekdays.map((weekday) => `<span class="weekday">${weekday}</span>`).join('');
    const $weeks = weeks.map((week) => `<span class="week">${week}</span>`).join('');

    const $days = days.map(({
      day, isToday, isThisWeek, previousMonth, nextMonth,
    }) => {
      const cssClass = [
        'day',
        isToday ? '-today' : null,
        isThisWeek ? '-week' : null,
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
