import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarLegend extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-legend/calendar-legend.css">
        <span class="calendar-legend" #$content @postupdate.window="onPostUpdate"></span>
      </template>
    `);
  }

  async onPostUpdate({ detail }) {
    const { selectedMonth } = detail;
    const { calendar, preferences } = window;
    const { $content } = this.$refs;

    $content.textContent = await calendar.getDate({
      date: selectedMonth,
      format: await preferences.get('calendarLegendFormat'),
    });

    dispatch(this, 'postrender');
  }
}
