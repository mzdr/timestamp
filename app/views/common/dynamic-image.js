import { define } from '@browserkids/web-components';

define(class DynamicImage extends HTMLElement {
  template = `
    <style>
      .dynamic-image {
        display: grid;
        grid: 1fr / 1fr;
        margin: 0;
        width: 100%;
      }

      .dynamic-image > .image,
      .dynamic-image > .caption {
        grid-column: 1;
        grid-row: 1;
      }

      .dynamic-image > .image {
        display: flex;
      }
    </style>

    <figure class="dynamic-image">
      <div class="image" :html="source"></div>
      <figcaption class="caption">
        <slot></slot>
      </figcaption>
    </figure>
  `;

  data = {
    source: '',
  };

  set source(value) {
    if (this.data.source === value) {
      return;
    }

    this.data.source = value;
  }

  get source() {
    return this.data.source;
  }

  get hour() {
    if (this.hasAttribute('hour')) {
      return parseInt(this.getAttribute('hour'), 10);
    }

    return null;
  }

  set hour(value) {
    this.setAttribute('hour', value);
  }

  get month() {
    if (this.hasAttribute('month')) {
      return parseInt(this.getAttribute('month'), 10);
    }

    return null;
  }

  set month(value) {
    this.setAttribute('month', value);
  }
});
