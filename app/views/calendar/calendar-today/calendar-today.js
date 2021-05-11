import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarToday extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-today/calendar-today.css">
        <span class="calendar-today" @postupdate.window="onPostUpdate" #$content>&nbsp;</span>
      </template>
    `);
  }

  async onPostUpdate() {
    const { calendar } = window;
    const { $content } = this.$refs;
    const [day, date, month] = (await calendar.getDate({ format: 'EEEE do MMMM' })).split(' ');

    $content.innerHTML = `${day},<br><strong class="day">${date}</strong> ${month}`;

    dispatch(this, 'postrender');
  }
}
