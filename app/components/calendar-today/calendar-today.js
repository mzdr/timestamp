import {
  bindEventListeners, createShadowRoot, dispatch, findReferences,
} from '../../node_modules/@browserkids/dom/index.js';

export default class CalendarToday extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="../../components/calendar-today/calendar-today.css">
        <span
          class="calendar-today"
          #$content
          @click="onClick"
          @update.window="onUpdate"
        ></span>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);
  }

  async onUpdate() {
    const { calendar } = window;
    const { $content } = this.$refs;
    const [day, date, month] = (await calendar.getDate({ format: 'EEEE do MMMM' })).split(' ');

    $content.innerHTML = `${day},<br><strong class="day">${date}</strong> ${month}`;

    return this;
  }

  onClick() {
    dispatch(this, 'change');

    return this;
  }
}
