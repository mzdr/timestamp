import { bindEventListeners, createShadowRoot, dispatch } from '../../node_modules/@browserkids/dom/index.js';

export default class CalendarView extends HTMLElement {
  constructor() {
    super();

    createShadowRoot(this, `
      <template>
        <link rel="stylesheet" type="text/css" href="../../components/calendar-view/calendar-view.css" />
        <calendar-illustration></calendar-illustration>
        <calendar-today @click="onTodayClicked"></calendar-today>
        <calendar-legend @finish="onFinish"></calendar-legend>
        <calendar-month @finish="onFinish"></calendar-month>
        <calendar-navigation @change="onChange"></calendar-navigation>
      </template>
    `);

    bindEventListeners(this.shadowRoot, this);

    this.update();
  }

  async update(now) {
    const { calendar } = this;

    dispatch(window, 'update', {
      now: this.now = (now || await calendar.getDate()),
    });

    return this;
  }

  onFinish() {
    const { calendar } = this;

    calendar.resizeWindow({
      width: this.offsetWidth,
      height: this.offsetHeight,
    });
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
