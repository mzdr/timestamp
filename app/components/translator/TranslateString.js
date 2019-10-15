import BaseElement from '../base/BaseElement';
import Translator from './Translator';

(() => {
  const template = `<template>
    <style>
        :host {
            display: inline;
        }

        ::slotted(a) {
            color: currentColor;
            text-decoration-skip: ink;
        }
    </style>
    <slot></slot>
</template>`;

  class TranslateString extends BaseElement {
    constructor() {
      super().createShadowRoot(template);

      const string = Translator.getString(this.textContent);

      this.setAttribute('key', this.textContent);

      this.innerHTML = string;
      this.originalString = string;
    }
  }

  // @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
  customElements.define('translate-string', TranslateString);
})();
