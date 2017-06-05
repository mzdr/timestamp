/* global document, Electron, customElements, BaseElement */

class AboutUpdate extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onClick());

        // Received update response
        Electron.ipcRenderer.once('app.update', (e, { code, version }) => {
            if (code < 0) {
                const $label = this.querySelector('[key="updateAvailable"]');

                this.status = 'update-available';

                // Using innerHTML because label is an i18n string
                // that could contain actual HTML elements
                $label.innerHTML = $label.innerHTML.replace(/%version%/, version);
            }
        });

        // Check if there is an update available
        Electron.ipcRenderer.send('app.update');
    }

    /**
     * The update button has been clicked.
     *
     * @return {AboutUpdate}
     */
    onClick() {
        // Checks are going on right now or we are up to date
        if (this.status === 'checking' || this.status === 'up-to-date') {
            return this;
        }

        // We already know there is an update available, clicking the button
        // will fire up the update process
        if (this.status === 'update-available') {
            Electron.ipcRenderer.send('app.update', true);

            return this;
        }

        // Received update response
        Electron.ipcRenderer.once('app.update', (e, update) => {
            // Show checking state at least for 2 seconds
            setTimeout(() => {
                if (update.code < 0) {
                    this.status = 'update-available';
                    return;
                }

                // Either there was an error or we are up to date…
                this.status = 'up-to-date';

                // Reset back to unknown after a 10secs
                setTimeout(() => (this.status = 'unknown'), 1000 * 10);
            }, 1000 * 2);
        });

        // Check again for an update
        Electron.ipcRenderer.send('app.update');

        // Set status to checking…
        this.status = 'checking';

        return this;
    }

    /**
     * Returns the current update status.
     *
     * @return {string}
     */
    get status() {
        return this.getAttribute('status') || 'unknown';
    }

    /**
     * Sets the current update status.
     */
    set status(status) {
        this.setAttribute('status', status);
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
AboutUpdate.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('about-update', AboutUpdate);
