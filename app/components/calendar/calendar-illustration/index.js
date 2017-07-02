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
        const moment = Moment();

        this.dataset.time = moment.format('ha');
        this.dataset.month = moment.format('M');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarIllustration.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-illustration', CalendarIllustration);
