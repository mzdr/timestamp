class PreferencesItemData extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being registered right now.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        if (this.type === 'input') {
            this.createInput();
        } else if (this.type === 'toggle') {
            this.createToggle();
        }

        this.constructor
            .getDataFromMainProcess('preferences.get', this.key)
            .then((value) => this.value = value);
    }

    /**
     * Imports the relevant template according to the given type.
     *
     * @param {string} type Type of the preferences item data.
     * @return {PreferencesItemData}
     */
    importTemplate(type)
    {
        const id = `#item-data-${type}`;
        const template = this.constructor.document.querySelector(id);

        if (template === null) {
            return this;
        }

        const clone = document.importNode(template.content, true);

        if (this.shadowRoot) {
            return this;
        }

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(clone);
    }

    /**
     * Preferences item is of type input. So we are going to create everything
     * necessary to have it behave like an input field.
     *
     * @return {PreferencesItemData}
     */
    createInput()
    {
        const placeholder = this.getAttribute('placeholder');

        this.importTemplate('input');

        this.data = this.shadowRoot.querySelector('input');
        this.data.addEventListener('input', () => this.onchange());

        if (placeholder) {
            this.data.setAttribute('placeholder', placeholder);
        }

        // Dynamically adding getter/setter for the value of this type
        Object.defineProperty(this, 'value', {
            get: () => this.data.value,
            set: (value) => this.data.value = value
        });

        return this;
    }

    /**
     * Preferences item is of type toggle. So we are going to make it behave
     * like a togglable element.
     *
     * @return {PreferencesItemData}
     */
    createToggle()
    {
        this.importTemplate('toggle');

        this.data = this.shadowRoot.querySelector('input');
        this.data.addEventListener('change', () => this.onchange());

        // Dynamically adding getter/setter for the value of this type
        Object.defineProperty(this, 'value', {
            get: () => this.data.checked,
            set: (value) => this.data.checked = value
        });

        return this;
    }

    /**
     * The preferences item data has been changed.
     *
     * @return {PreferencesItemData}
     */
    onchange()
    {
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
    get key()
    {
        return this.getAttribute('key');
    }

    /**
     * Returns the type of this preferences item data.
     *
     * @return {string}
     */
    get type()
    {
        return this.getAttribute('type');
    }
}

PreferencesItemData.document = document.currentScript.ownerDocument;

document.registerElement('preferences-item-data', PreferencesItemData);
