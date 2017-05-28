/* global document, CustomEvent */

class CalendarEvent extends CustomEvent { // eslint-disable-line
    constructor(type, options = {}) {
        const defaults = {
            // @see https://developer.mozilla.org/docs/Web/API/Event/bubbles
            bubbles: true,

            // @see https://developer.mozilla.org/docs/Web/API/Event/composed
            composed: true
        };

        super(`calendar.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener) {
        document.addEventListener(`calendar.${type}`, listener);
    }
}
