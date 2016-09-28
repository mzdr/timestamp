class CalendarGoToMonth extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.addEventListener('click', (e) => this.onMonthClicked(e));
    }

    /**
     * Draws the actual month selecting UI element.
     *
     * @param {number} currentMonth Current month selected in the calendar.
     * @return {CalendarGoToMonth}
     */
    draw(currentMonth)
    {
        // Clean up old content
        this.removeChildren();

        Moment.monthsShort(true).forEach((month, index) => {
            const el = document.createElement('calendar-month');

            el.setAttribute('number', index);
            el.textContent = month;

            if (currentMonth === index) {
                el.classList.add('-current');
            }

            this.appendChild(el);
        });

        return this;
    }

    /**
     * One of the listed months has been clicked. Going to dispatch a
     * CalendarEvent to notify the other components.
     *
     * @param {Event} e The original click event.
     * @return {CalendarGoToMonth}
     */
    onMonthClicked(e)
    {
        const month = e.target.getAttribute('number');

        this.dispatchEvent(new CalendarEvent('goto.month', {
            detail: {
                month
            }
        }));

        return this;
    }
}

document.registerElement('calendar-goto-month', CalendarGoToMonth);
