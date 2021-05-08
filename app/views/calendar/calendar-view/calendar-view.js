import {
  bindEventListeners,
  createShadowRoot,
  dispatch,
  findReferences,
} from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="calendar-view/calendar-view.css" />
        <calendar-background @postrender="onPostRender">
          <calendar-today @postrender="onPostRender" @click="onTodayClicked"></calendar-today>
          <calendar-show-preferences @click="onShowPreferences"></calendar-show-preferences>
        </calendar-background>
        <calendar-legend @postrender="onPostRender"></calendar-legend>
        <calendar-month #$month @postrender="onPostRender"></calendar-month>
        <calendar-navigation @change="onChange" @toggle="onToggle"></calendar-navigation>
      </template>
    `);

    const { calendar } = window;

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);
    this.update();

    calendar.on('hide', this.onTodayClicked.bind(this));
  }

  async update(selected) {
    const { calendar } = window;

    dispatch(window, 'postupdate', {
      selected: this.selected = (selected || await calendar.getDate()),
    });

    return this;
  }

  onToggle({ detail }) {
    const { weeks } = detail;
    const { $month } = this.$refs;

    if (weeks) {
      $month.classList.toggle('show-weeks');
    }

    this.onPostRender();
  }

  onPostRender() {
    const { app } = window;

    app.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }

  onShowPreferences() {
    const { preferences } = window;

    preferences.show();

    return this;
  }

  onTodayClicked() {
    return this.update();
  }

  async onChange({ detail }) {
    const { selected } = this;
    const { calendar } = window;

    return this.update(
      await calendar.getDate(detail ? { date: selected, ...detail } : {}),
    );
  }
}
