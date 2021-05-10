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

    const { preferences } = window;

    preferences.on('changed', this.onPreferencesChanged.bind(this));

    this.render();
  }

  onPreferencesChanged(event, key, value) {
    if (key !== 'calendarBackground') {
      return;
    }

    this.render(value);
  }

  async render(background) {
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
