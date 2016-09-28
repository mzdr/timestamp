class CalendarWeek extends CustomElement
{
    /**
     * Adds a day to this week.
     *
     * @param {Object} day Day creation object.
     * @return {CalendarWeek}
     */
    addDay(day)
    {
        // A week is only going to have seven days
        if (this.children.length > 7) {
            return this;
        }

        const dayNode = CalendarDay.create(day);

        this.appendChild(dayNode);

        return this;
    }

    /**
     * [addDays description]
     *
     * @param {Array} days An array of day creation objects.
     * @return {CalendarWeek}
     */
    addDays(days)
    {
        days.forEach((day) => this.addDay(day));

        return this;
    }
}

document.registerElement('calendar-week', CalendarWeek);
