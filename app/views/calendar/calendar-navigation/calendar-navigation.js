import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarNavigation extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-navigation/calendar-navigation.css">

        <div
          class="calendar-navigation"
          #$content
          @keydown.window="onKeyDown"
          @postupdate.window="onPostUpdate"
        >
          <button class="go-to -year" @click="goPreviousYear"></button>

          <div class="quarter">
            <button class="go-to -month" @click="goMonth" data-month="0"></button>
            <button class="go-to -month" @click="goMonth" data-month="1"></button>
            <button class="go-to -month" @click="goMonth" data-month="2"></button>
          </div>

          <div class="quarter">
            <button class="go-to -month" @click="goMonth" data-month="3"></button>
            <button class="go-to -month" @click="goMonth" data-month="4"></button>
            <button class="go-to -month" @click="goMonth" data-month="5"></button>
          </div>

          <div class="quarter">
            <button class="go-to -month" @click="goMonth" data-month="6"></button>
            <button class="go-to -month" @click="goMonth" data-month="7"></button>
            <button class="go-to -month" @click="goMonth" data-month="8"></button>
          </div>

          <div class="quarter">
            <button class="go-to -month" @click="goMonth" data-month="9"></button>
            <button class="go-to -month" @click="goMonth" data-month="10"></button>
            <button class="go-to -month" @click="goMonth" data-month="11"></button>
          </div>

          <button class="go-to -year" @click="goNextYear"></button>
        </div>
      </template>
    `);
  }

  onKeyDown({ key, metaKey }) {
    const { app, calendar, preferences } = window;

    if (key === 'ArrowRight') {
      this.goNextMonth();
    } else if (key === 'ArrowLeft') {
      this.goPreviousMonth();
    } else if (key === 'ArrowUp') {
      this.goNextYear();
    } else if (key === 'ArrowDown') {
      this.goPreviousYear();
    } else if (key === ' ') {
      this.goToday();
    } else if (key === 'Escape') {
      calendar.hide();
    } else if (key === 'w' && metaKey === false) {
      dispatch(this, 'toggle', { weeks: true });
    } else if (key === ',' && metaKey) {
      preferences.show();
    } else if (key === 'q' && metaKey) {
      app.quit();
    }
  }

  onPostUpdate({ detail }) {
    const { selected } = detail;
    const { $content } = this.$refs;
    const $months = $content.querySelectorAll('.go-to.-month');

    $months.forEach(($el) => $el.classList.toggle(
      '-current',
      parseInt($el.dataset.month, 10) === selected.getMonth(),
    ));

    return this;
  }

  goToday() {
    dispatch(this, 'change');

    return this;
  }

  goMonth({ currentTarget: { dataset: { month } } }) {
    dispatch(this, 'change', { set: { month } });

    return this;
  }

  goPreviousYear() {
    dispatch(this, 'change', { diff: { years: -1 } });

    return this;
  }

  goNextYear() {
    dispatch(this, 'change', { diff: { years: 1 } });

    return this;
  }

  goPreviousMonth() {
    dispatch(this, 'change', { diff: { months: -1 } });

    return this;
  }

  goNextMonth() {
    dispatch(this, 'change', { diff: { months: 1 } });

    return this;
  }
}
