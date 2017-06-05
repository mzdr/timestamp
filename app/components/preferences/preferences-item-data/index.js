/* global document, customElements, BaseElement, PreferencesEvent */

class PreferencesItemData extends BaseElement {
    constructor() {
        super();

        this.constructor
            .getDataFromMainProcess('preferences.get', this.key)
            .then(value => (this.value = value));
    }

    /**
     * Called when the element is inserted into a document, including into a
     * shadow tree.
     *
     * @return {PreferencesItemData}
     * @see https://developer.mozilla.org/docs/Web/Web_Components/Custom_Elements
     */
    connectedCallback() {
        if (this.type === 'input') {
            this.createInput();
        } else if (this.type === 'toggle') {
            this.createToggle();
        }

        return this;
    }

    /**
     * Imports the relevant template according to the given type.
     *
     * @param {string} type Type of the preferences item data.
     * @return {PreferencesItemData}
     */
    importTemplate(type) {
        const id = `#${type}`;
        const $template = this.constructor.ownerDocument.querySelector(id);

        if ($template === null) {
            return this;
        }

        const $clone = $template.content.cloneNode(true);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild($clone);

        return this;
    }

    /**
     * Preferences item is of type input. So we are going to create everything
     * necessary to have it behave like an input field.
     *
     * @return {PreferencesItemData}
     */
    createInput() {
        const placeholder = this.getAttribute('placeholder');

        this.importTemplate('input');

        this.$data = this.shadowRoot.querySelector('input');
        this.$data.addEventListener('input', () => this.onChange());

        if (placeholder) {
            this.$data.setAttribute('placeholder', placeholder);
        }

        // Dynamically adding getter/setter for the value of this type
        Object.defineProperty(this, 'value', {
            get: () => this.$data.value,
            set: value => (this.$data.value = value)
        });

        return this;
    }

    /**
     * Preferences item is of type toggle. So we are going to make it behave
     * like a togglable element.
     *
     * @return {PreferencesItemData}
     */
    createToggle() {
        this.importTemplate('toggle');

        this.$data = this.shadowRoot.querySelector('input');
        this.$data.addEventListener('change', () => this.onChange());

        // Dynamically adding getter/setter for the value of this type
        Object.defineProperty(this, 'value', {
            get: () => this.$data.checked,
            set: value => (this.$data.checked = value)
        });

        return this;
    }

    /**
     * The preferences item data has been changed.
     *
     * @return {PreferencesItemData}
     */
    onChange() {
        this.dispatchEvent(new PreferencesEvent('change', {
            detail: {
                key: this.key,
                value: this.value
            }
        }));

        return this;
    }

    /**
     * Returns the key of this preferences item data.
     *
     * @return {string}
     */
    get key() {
        return this.getAttribute('key');
    }

    /**
     * Returns the type of this preferences item data.
     *
     * @return {string}
     */
    get type() {
        return this.getAttribute('type');
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
PreferencesItemData.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('preferences-item-data', PreferencesItemData);
