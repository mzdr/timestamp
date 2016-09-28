class TabBarItem extends CustomButton
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.addEventListener('click', () => this.onclick());

        TabEvent.on('switch', (e) => this.onSwitch(e));
    }

    /**
     * Listen for the tab switch event and set the active state on the
     * according tab bar item.
     *
     * @param {TabEvent} e The original tab event.
     * @return {TabBarItem}
     */
    onSwitch(e)
    {
        if (e.target === this) {
            this.classList.add('-active');
        } else {
            this.classList.remove('-active');
        }

        return this;
    }

    /**
     * The go to today button has been clicked.
     *
     * @return {TabBarItem}
     */
    onclick()
    {
        this.dispatchEvent(new TabEvent('switch'));

        return this;
    }
}

document.registerElement('tab-bar-item', TabBarItem);
