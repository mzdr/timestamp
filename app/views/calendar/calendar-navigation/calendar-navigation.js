import { dispatch, upgrade } from '../../../../node_modules/@browserkids/dom/index.js';

export default class CalendarNavigation extends HTMLElement {
  constructor() {
    super();

    upgrade(this, `
      <template>
        <link rel="stylesheet" href="calendar-navigation/calendar-navigation.css">

        <div
          class="calendar-navigation"
          @keydown.window="onKeyDown"
          @postupdate.window="onPostUpdate"
        >
          <div class="year">
            <button class="go-to" @click="goPreviousYear">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="icon-chevron">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"/>
              </svg>
            </button>

            <strong class="go-to -year" #$year></strong>

            <button class="go-to" @click="goNextYear">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="icon-chevron">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/>
              </svg>
            </button>
          </div>

          <div class="month">
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
            <button #$month class="go-to" @click="goMonth"></button>
          </div>
        </div>
      </template>
    `);
  }

  onKeyDown(e) {
    const { key } = e;

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

      // Hitting space might as well trigger a focused button (month),
      // avoid that behaviour.
      e.preventDefault();
    }
  }

  async onPostUpdate({ detail }) {
    const { calendar } = window;
    const { selectedMonth } = detail;
    const { $year, $month } = this.$refs;
    const months = await calendar.getMonths();

    $year.textContent = selectedMonth.getFullYear();

    $month.forEach(($el, month) => {
      $el.classList.toggle(
        '-current',
        month === selectedMonth.getMonth(),
      );

      // eslint-disable-next-line no-param-reassign
      $el.textContent = months[month];
    });

    return this;
  }

  goToday() {
    dispatch(this, 'change');

    return this;
  }

  goMonth({ currentTarget }) {
    dispatch(this, 'change', { set: { month: this.$refs.$month.indexOf(currentTarget) } });

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
