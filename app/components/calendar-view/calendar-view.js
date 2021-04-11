import {
  bindEventListeners,
  createShadowRoot,
  dispatch,
  findReferences,
} from '../../node_modules/@browserkids/dom/index.js';

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" href="../../components/calendar-view/calendar-view.css" />
        <calendar-illustration></calendar-illustration>
        <calendar-show-preferences @click="onShowPreferences"></calendar-show-preferences>
        <calendar-today @click="onTodayClicked"></calendar-today>
        <calendar-legend @finish="onFinish"></calendar-legend>
        <calendar-month #$month @finish="onFinish"></calendar-month>
        <calendar-navigation
          @change="onChange"
          @toggle="onToggle"
        ></calendar-navigation>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.$refs = findReferences(this.shadowRoot);
    this.update();
  }

  async update(now) {
    const { calendar } = window;

    dispatch(window, 'update', {
      now: this.now = (now || await calendar.getDate()),
    });

    return this;
  }

  onToggle({ detail }) {
    const { weeks } = detail;
    const { $month } = this.$refs;

    if (weeks) {
      $month.classList.toggle('show-weeks');
    }
  }

  onFinish() {
    const { calendar } = window;

    calendar.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
  }

  onShowPreferences() {
    const { calendar } = window;

    calendar.showPreferences();

    return this;
  }

  onTodayClicked() {
    return this.update();
  }

  async onChange({ detail }) {
    const { now } = this;
    const { calendar } = window;

    return this.update(
      await calendar.getDate(detail ? { date: now, ...detail } : {}),
    );
  }
}
