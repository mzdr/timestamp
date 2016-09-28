class TabContent extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        TabEvent.on('switch', (e) => this.onSwitch(e));
    }

    /**
     * Listen for the tab switch event and set the active state on the
     * according tab content.
     *
     * @param {TabEvent} e The original tab event.
     * @return {TabContent}
     */
    onSwitch(e)
    {
        const targetTab = e.target.getAttribute('tab');

        if (targetTab === this.getAttribute('tab')) {
            this.classList.add('-active');
        } else {
            this.classList.remove('-active');
        }

        return this;
    }
}

document.registerElement('tab-content', TabContent);
