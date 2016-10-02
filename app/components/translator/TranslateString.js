class TranslateString extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.setAttribute('key', this.textContent);
        this.innerHTML = translator.getString(this.textContent);
    }
}

document.registerElement('translate-string', TranslateString);
