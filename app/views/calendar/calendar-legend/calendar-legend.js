import {
  bindEventListeners,
  createShadowRoot,
  dispatch,
  findReferences,
} from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarLegend extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="calendar-legend/calendar-legend.css">
        <span class="calendar-legend" #$content @postupdate.window="onPostUpdate"></span>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);
  }

  async onPostUpdate({ detail }) {
    const { selected } = detail;
    const { calendar } = window;
    const { $content } = this.$refs;

    const month = await calendar.getDate({ date: selected, format: 'MM' });
    const year = await calendar.getDate({ date: selected, format: 'y' });

    $content.textContent = `${month} / ${year}`;

    dispatch(this, 'postrender');
  }
}
