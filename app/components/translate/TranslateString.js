class TranslateString extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.constructor
            .getDataFromMainProcess('translator.get', this.textContent)
            .then((string) => {
                this.setAttribute('key', this.textContent);
                this.innerHTML = string;
            });
    }
}

document.registerElement('translate-string', TranslateString);
