/* global document, customElements, BaseElement, Fs, Moment, Electron */

class CalendarIllustration extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.innerHTML = Fs.readFileSync(
            `${Electron.remote.app.getAppPath()}/images/illustrations/mountains.svg`,
            'utf8'
        );
    }

    /**
     * Draws the illustration.
     *
     * @return {CalendarIllustration}
     */
    draw() {
        // Always use current current date/time for drawing since the
        // illustration is supposed to represent the real world.
        const now = Moment();

        this.dataset.time = now.format('ha');
        this.dataset.month = now.format('M');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarIllustration.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-illustration', CalendarIllustration);
