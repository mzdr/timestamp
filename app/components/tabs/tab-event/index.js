/* global document, CustomEvent */

class TabEvent extends CustomEvent { // eslint-disable-line
    constructor(type, options = {}) {
        const defaults = {
            // @see https://developer.mozilla.org/docs/Web/API/Event/bubbles
            bubbles: true,

            // @see https://developer.mozilla.org/docs/Web/API/Event/composed
            composed: true
        };

        super(`tabs.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener) {
        document.addEventListener(`tabs.${type}`, listener);
    }
}
