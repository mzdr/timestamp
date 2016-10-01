class AboutUpdate extends CustomButton
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.addEventListener('click', () => this.onclick());

        // Received update response
        Electron.ipcRenderer.once('app.update', (e, update) => {
            if (update.code < 0) {
                this.status = 'update-available';
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
    onclick()
    {
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
                    return this.status = 'update-available';
                }

                // Either there was an error or we are up to date…
                this.status = 'up-to-date';

                // Reset back to unknown after a 10secs
                setTimeout(() => this.status = 'unknown', 1000 * 10);
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
    get status()
    {
        return this.getAttribute('status') || 'unknown';
    }

    /**
     * Sets the current update status.
     */
    set status(status)
    {
        this.setAttribute('status', status);
    }
}

document.registerElement('about-update', AboutUpdate);
