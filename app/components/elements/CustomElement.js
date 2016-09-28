class CustomElement extends HTMLElement
{
    /**
     * Removes all child elements.
     *
     * @return {CustomElement}
     */
    removeChildren()
    {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        return this;
    }

    /**
     * Simple factory with a few parameters for easy creation.
     *
     * @param {string} text Element text.
     * @param {Object} attributes Element attributes.
     * @param {Array} classes Element classes.
     * @param {Object} data Element data-* attributes.
     * @return {CustomElement}
     */
    static create({
        text = '',
        attributes = {},
        classes = [],
        data = {}
    } = {})
    {
        const el = new this.prototype.constructor;

        el.textContent = text;
        el.classList.add(...classes);

        for (let key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                el.setAttribute(key, attributes[key]);
            }
        }

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                el.dataset[key] = data[key];
            }
        }

        return el;
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
    static get queue()
    {
        if (this._queue) {
            return this._queue;
        }

        return this._queue = {};
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
     * @param {string} key The key of the request. Used for relocating…
     * @return {Promise}
     */
    static getDataFromMainProcess(channel, key, ...args)
    {
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
        const ticket = new Promise((success, fail) => resolve = success);

        // Add requesting element to the queue
        this.queue[key] = { resolve };

        // Send request
        Electron.ipcRenderer.send(channel, key, ...args);

        return ticket;
    }
}
