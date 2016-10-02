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
    onSwitch({ detail: { tab }})
    {
        this.classList[tab === this.tab ? 'add' : 'remove']('-active');

        return this;
    }

    /**
     * Returns the tab target of this tab content.
     *
     * @return {string}
     */
    get tab()
    {
        return this.getAttribute('tab');
    }

    /**
     * Sets the tab target of this tab content.
     */
    set tab(tab)
    {
        this.setAttribute('tab', tab);
    }
}

document.registerElement('tab-content', TabContent);
