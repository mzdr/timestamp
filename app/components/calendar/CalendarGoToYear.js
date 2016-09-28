class CalendarGoToYear extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.addEventListener('click', (e) => this.onYearClicked(e));
    }

    /**
     * Draws the actual year selecting UI element.
     *
     * @param {number} year Selected year.
     * @return {CalendarGoToYear}
     */
    draw(year)
    {
        // Clean up old content
        this.removeChildren();

        for (let i = year - 1; i <= year + 1; i++) {
            const el = document.createElement('calendar-year');

            el.textContent = i;

            if (i !== year) {
                el.setAttribute('number', i);
            } else {
                el.classList.add('-current');
            }

            this.appendChild(el);
        }

        return this;
    }

    /**
     * One of the listed years has been clicked. Going to dispatch a
     * CalendarEvent to notify the other components.
     *
     * @param {Event} e The original click event.
     * @return {CalendarGoToYear}
     */
    onYearClicked(e)
    {
        const year = e.target.getAttribute('number');

        // If there is not a number attribute it means it's the currently
        // selected year and therefore we have nothing to do
        if (year === null) {
            return;
        }

        this.dispatchEvent(new CalendarEvent('goto.year', {
            detail: {
                year
            }
        }));

        return this;
    }
}

document.registerElement('calendar-goto-year', CalendarGoToYear);
