class CalendarDay extends CustomElement
{
    /**
     * Lifecycle callback. Custom element is being created.
     *
     * @see https://mdn.io/Web/Web_Components/Custom_Elements#Lifecycle_callbacks
     */
    createdCallback()
    {
        this.addEventListener('click', () => this.onclick());
    }

    /**
     * The day element has been clicked.
     *
     * @return {CalendarDay}
     */
    onclick()
    {
        const detail = {};

        if ('diff' in this.dataset) {
            detail.diff = parseInt(this.dataset.diff, 10) || 0;
        }

        this.dispatchEvent(new CalendarEvent('day.clicked', { detail }));

        return this;
    }
}

document.registerElement('calendar-day', CalendarDay);
