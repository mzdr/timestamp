class AboutVersion extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being registered right now.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.textContent = Electron.remote.app.getVersion();
    }
}

document.registerElement('about-version', AboutVersion);
