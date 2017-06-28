/* global Electron, HTMLElement, customElements */

class BaseElement extends HTMLElement { // eslint-disable-line
    /**
     * Tries to fetch the template from the given ownerDocument and attaches it
     * to the Shadow DOM.
     *
     * @return {BaseElement}
     */
    fetchTemplate() {
        if (this.constructor.ownerDocument === undefined) {
            throw new Error(`${this.constructor.name} has no ownerDocument defined.`);
        }

        const $template = this.constructor.ownerDocument.querySelector('template');

        if ($template === null) {
            throw new Error(`${this.constructor.name} has no template element.`);
        }

        const $clone = $template.content.cloneNode(true);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild($clone);

        return this;
    }

    /**
     * Removes all child elements.
     *
     * @return {BaseElement}
     */
    removeChildren() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        return this;
    }

    /**
     * Removes all attributes from this element.
     *
     * @return {BaseElement}
     */
    removeAttributes() {
        while (this.attributes.length > 0) {
            this.removeAttribute(this.attributes[0].name);
        }

        return this;
    }

    /**
     * Calls a given function when all custom elements within the Shadow DOM
     * have been defined.
     *
     * @param {Function} fn Function to call.
     * @return {BaseElement}
     */
    whenElementsAreDefined(fn) {
        const undefinedElements = this.shadowRoot.querySelectorAll(':not(:defined)');
        const whenDefined = [...undefinedElements].map(
            el => customElements.whenDefined(el.localName)
        );

        Promise.all(whenDefined).then(fn);

        return this;
    }

    /**
     * Simple factory with a few parameters for easy creation.
     *
     * @param {string} text Element text.
     * @param {Object} attributes Element attributes.
     * @param {Array} classes Element classes.
     * @param {Object} data Element data-* attributes.
     * @return {BaseElement}
     */
    static create({
        text = '',
        attributes = {},
        classes = [],
        data = {}
    } = {}) {
        const $el = new this.prototype.constructor();

        $el.textContent = text;
        $el.classList.add(...classes);

        Object
            .entries(attributes)
            .filter(([, value]) => value !== undefined)
            .forEach(([key, value]) => $el.setAttribute(key, value));

        Object
            .entries(data)
            .filter(([, value]) => value !== undefined)
            .forEach(([key, value]) => ($el.dataset[key] = value));

        return $el;
    }

    /**
     * Returns the current queue.
     *
     * The queue is mostly used for multiple elements of the same type
     * requesting data from the main process via ipc. This is to avoid having
     * the same listener within each element listening on the same channel.
     *
     * @return {Object}
     */
    static get queue() {
        if (this.internalQueue) {
            return this.internalQueue;
        }

        return (this.internalQueue = {});
    }

    /**
     * Requests data from the main process.
     *
     * In order to avoid the EventEmitter memory leak warning, which happens
     * to pop up if there are too many listeners registered for the same event,
     * this method provides a way for custom elements to request data from the
     * main process without registering a listener for each created element.
     *
     * Basically it works like this: We queue all the requests, return promises
     * instead and handle them all piece by piece.
     *
     * @param {string} channel The channel name to listen to.
     * @param {string} requestKey The key of the request. Used for relocating…
     * @param {Array} …requestArgs Additional request arguments.
     * @return {Promise}
     */
    static getDataFromMainProcess(channel, requestKey, ...requestArgs) {
        // Register listener only once
        if (this.listenerRegistered !== true) {
            // Receiving answer to request…
            Electron.ipcRenderer.on(channel, (e, key, ...args) => {
                // Resolve promise and remove it from the queue
                if (this.queue[key]) {
                    this.queue[key].resolve(...args);

                    delete this.queue[key];
                }
            });

            this.listenerRegistered = true;
        }

        // Provide unique resolve function
        let resolve;

        // Create promise for this request
        const ticket = new Promise(success => (resolve = success));

        // Add requesting element to the queue
        this.queue[requestKey] = { resolve };

        // Send request
        Electron.ipcRenderer.send(channel, requestKey, ...requestArgs);

        return ticket;
    }
}
