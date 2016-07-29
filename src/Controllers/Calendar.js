const Pikaday = require('pikaday');
const Electron = require('electron');

class Calendar
{
    /**
     * Creates an instance of the Calendar controller.
     *
     * @return {Calendar}
     */
    constructor()
    {
        // Get access to app from main process
        this.app = Electron.remote.getGlobal('App');

        // Add class if in dark mode
        if (Electron.remote.systemPreferences.isDarkMode()) {
            document.documentElement.classList.add('dark-mode');
        }

        let picker = new Pikaday({
            field: document.createElement('div'),
            bound: false,
            container: document.querySelector('[data-pikaday]'),
            showWeekNumber: false,
            showDaysInNextAndPreviousMonths: true
        });

        let todayButton = document.querySelector('[data-today]');

        todayButton.addEventListener('click', (e) => picker.gotoToday());
    }
}

module.exports = Calendar;
