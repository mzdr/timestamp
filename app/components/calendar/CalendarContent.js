class CalendarContent extends CustomElement
{
    /**
     * Draws the actual content of the calendar which is the currently selected
     * month and all of it's weeks and days.
     *
     * @param {Moment} moment The current Moment.js instance.
     * @return {CalendarContent}
     */
    draw(moment)
    {
        const currentDate = Moment(moment);
        const lastDate = Moment(currentDate).endOf('month').weekday(6);
        const today = Moment().startOf('date');

        // Clean up old calendar content
        this.removeChildren();

        // Start by the first weekday of the first week of the month
        currentDate.startOf('month').weekday(0);

        for (let i = 0; Moment.min(currentDate, lastDate) === currentDate; i++) {
            const dayClasses = ['calendar-day'];
            let week = this.lastChild;

            // New week
            if (currentDate.weekday() % 7 === 0) {
                week = CalendarWeek.create({
                    classes: ['calendar-week'],
                    data: {
                        weekofyear: currentDate.format('w')
                    }
                });

                this.appendChild(week);
            }

            // Add active state to today and week
            if (currentDate.isSame(today, 'day')) {
                week.classList.add('-current');
                dayClasses.push('-today');
            }

            // Add muted state to days not within the requested month
            if (currentDate.month() !== moment.month()) {
                dayClasses.push('-muted');
            }

            week.addDay({
                classes: dayClasses,
                text: currentDate.format('D'),
                data: {
                    diff: currentDate.diff(today, 'days')
                }
            });

            // Next day
            currentDate.add(1, 'days');
        }
    }
}

document.registerElement('calendar-content', CalendarContent);
