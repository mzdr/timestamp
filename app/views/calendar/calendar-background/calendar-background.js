import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarBackground extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-background/calendar-background.css">
        <div @postupdate.window="onPostUpdate" class="calendar-background">
          <figure class="image" #$content></figure>
          <slot class="slot"></slot>
        </div>
      </template>
    `);

    const { calendar } = window;

    calendar.on('background-changed', this.onBackgroundChanged.bind(this));

    this.onBackgroundChanged();
  }

  async onBackgroundChanged(event, background) {
    const { preferences } = window;
    const { $content } = this.$refs;

    $content.innerHTML = await preferences.getBackgroundFileContents(
      background || await preferences.get('calendarBackground'),
    );

    dispatch(this, 'postrender');
  }

  async onPostUpdate() {
    const { calendar } = window;
    const now = await calendar.getDate();

    Object.assign(this.dataset, {
      hour: now.getHours(),
      month: now.getMonth(),
    });

    return this;
  }
}
