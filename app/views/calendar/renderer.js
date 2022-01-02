import {
  bindAttributes,
  bindEventListeners,
  Calendar,
  define,
  findReferences,
} from '@browserkids/web-components';

define(Calendar);

window.renderer = new class Renderer {
  #isPackaged = null;

  #resize = null;

  constructor({ app, calendar, preferences }) {
    this.$root = document.documentElement;
    this.$refs = findReferences(this.$root);

    this.app = app;
    this.calendar = calendar;
    this.preferences = preferences;

    this.data = bindAttributes(this.$root, {
      hour: '',
      legend: '',
      month: '',
      rootClasses: [],
      source: '',
      today: '',
    });

    bindEventListeners(this.$root, this);

    this.app.on('tick', this.onTick.bind(this));
    this.app.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    this.calendar.on('hide', this.onHide.bind(this));
    this.preferences.on('changed', this.onPreferencesChanged.bind(this));

    this
      .createObserver({ resize: true })
      .render();
  }

  createObserver(settings = {}) {
    const { resize = false } = settings;

    if (resize) {
      this.#resize = new ResizeObserver(this.onResize.bind(this));
      this.#resize.observe(this.$root);
    }

    return this;
  }

  goPreviousYear() {
    return this;
  }

  goNextYear() {
    return this;
  }

  goMonth() {
    return this;
  }

  onLegendClicked() {
    return this;
  }

  onCalendarUpdate() {
    return this;
  }

  onPreferencesChanged(event, key) {
    if (key === 'calendarTodayFormat') {
      this.setToday();
    } else if (key === 'calendarBackground') {
      this.setHeadBackground();
    }
  }

  onHide() {
    this.onTodayClicked();
  }

  async onKeyDown(event) {
    const { key, metaKey } = event;

    if (key === 'Escape') {
      this.calendar.hide();
    } else if (key === ',' && metaKey) {
      this.preferences.show();
    } else if (key === 'q' && metaKey) {
      this.app.quit();
    } else if (key === ' ') {
      this.onTodayClicked();
    }

    // In general prevent any default browser shortcuts in production
    if (await this.isPackaged) {
      event.preventDefault();
    }
  }

  onResize() {
    this.app.resizeWindow({
      height: this.$root.offsetHeight,
      width: this.$root.offsetWidth,
    });
  }

  onShowPreferences() {
    this.preferences.show();
  }

  onTick(event, now) {
    Object.assign(this.data, {
      hour: now.getHours(),
      month: now.getMonth(),
    });

    this.setToday();
  }

  onTodayClicked() {
    return this;
  }

  onUpdateDownloaded() {
    this.data.rootClasses = ['update-downloaded'];
  }

  async setHeadBackground() {
    this.data.source = await this.preferences.getBackgroundFileContents(
      await this.preferences.get('calendarBackground'),
    );
  }

  async setToday() {
    const format = await this.preferences.get('calendarTodayFormat');
    const today = await this.calendar.getDate({ format: format.replace(/\n/g, '\'<br>\'') });

    if (today === this.data.today) {
      return;
    }

    this.data.today = today;
  }

  render() {
    this.setToday();
    this.setHeadBackground();
  }

  get isPackaged() {
    return (async () => {
      if (this.#isPackaged === null) {
        this.#isPackaged = await this.app.isPackaged();
      }

      return this.#isPackaged;
    })();
  }
}(window);
