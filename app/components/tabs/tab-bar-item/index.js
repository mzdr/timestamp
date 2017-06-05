/* global document, customElements, BaseElement, TabEvent */

class TabBarItem extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onClick());

        TabEvent.on('switch', e => this.onSwitch(e));
    }

    /**
     * Listen for the tab switch event and set the active state on the
     * according tab bar item.
     *
     * @param {TabEvent} e The original tab event.
     * @return {TabBarItem}
     */
    onSwitch({ detail: { tab } }) {
        if (tab === this.tab) {
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
        }

        return this;
    }

    /**
     * The go to today button has been clicked.
     *
     * @return {TabBarItem}
     */
    onClick() {
        this.dispatchEvent(new TabEvent('switch', { detail: { tab: this.tab } }));

        return this;
    }

    /**
     * Returns the tab target of this tab bar item.
     *
     * @return {string}
     */
    get tab() {
        return this.getAttribute('tab');
    }

    /**
     * Sets the tab target of this tab bar item.
     */
    set tab(tab) {
        this.setAttribute('tab', tab);
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
TabBarItem.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('tab-bar-item', TabBarItem);
