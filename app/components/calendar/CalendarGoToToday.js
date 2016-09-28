class CalendarGoToToday extends CustomButton
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
     * The go to today button has been clicked.
     *
     * @return {CalendarGoToToday}
     */
    onclick()
    {
        this.dispatchEvent(new CalendarEvent('goto.today'));

        return this;
    }
}

document.registerElement('calendar-goto-today', CalendarGoToToday);
