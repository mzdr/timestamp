import {
  createShadowRoot,
  dispatch,
  findReferences,
} from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarBackground extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="calendar-background/calendar-background.css">
        <div class="calendar-background">
          <figure class="image" #$content></figure>
          <slot class="slot"></slot>
        </div>
      </template>
    `);

    const { calendar } = window;

    this.$refs = findReferences(this.shadowRoot);
    this.render(true);

    calendar.on('background-changed', (event, content) => this.update(content));

    setInterval(this.render.bind(this), 1000 * 60);
  }

  async render(firstRender) {
    const { calendar, preferences } = window;
    const now = await calendar.getDate();

    Object.assign(this.dataset, {
      hour: now.getHours(),
      month: now.getMonth(),
    });

    if (firstRender) {
      await this.update(
        await preferences.get('calendarBackground'),
      );
    }

    return this;
  }

  async update(content) {
    const { preferences } = window;
    const { $content } = this.$refs;

    $content.innerHTML = await preferences.getBackgroundFileContents(content);

    dispatch(this, 'postrender');

    return this;
  }
}
