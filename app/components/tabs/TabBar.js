class TabBar extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being registered right now.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        // Depending on the update response we are going the show a different
        // tab initially. If we have an update the about tab will be active,
        // otherwise it's the general tab
        Electron.ipcRenderer.once('app.update', (e, update) => {
            const tab = update.code < 0 ? 'about' : 'general';

            this.dispatchEvent(new TabEvent('switch', { detail: { tab } }));
        });

        // Check if there is an update available
        Electron.ipcRenderer.send('app.update');
    }
}

document.registerElement('tab-bar', TabBar);
