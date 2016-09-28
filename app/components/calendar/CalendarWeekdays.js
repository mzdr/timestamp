class CalendarWeekdays extends CustomElement
{
    /**
     * Draws the actual weekdays legend.
     *
     * @param {number} currentWeekday Current weekday selected in the calendar.
     * @return {CalendarWeekdays}
     */
    draw(currentWeekday)
    {
        // Clean up old content
        this.removeChildren();

        Moment.weekdaysShort(true).forEach((weekday, index) => {
            const el = document.createElement('calendar-weekday');

            el.textContent = weekday;

            if (index === currentWeekday) {
                el.classList.add('-current');
            }

            this.appendChild(el);
        });

        return this;
    }
}

document.registerElement('calendar-weekdays', CalendarWeekdays);
