const Electron = require('electron');

class Preferences
{
    /**
     * Creates an instance of the Preferences controller.
     *
     * @return {Preferences}
     */
    constructor()
    {
        // Remember associated component of this controller
        this.component = Electron.remote.getCurrentWindow().component;

        // Register handler when dark mode is being changed
        this.component.onDarkModeChanged(
            (darkMode) => this.toggleDarkMode(darkMode)
        );

        // Define logic for all fields
        const fields = [
            {
                selector: '[data-format]',
                event: 'keyup',
                onChange: (el) => this.component.set('clockFormat', el.value),
                onLoad: (el) => el.value = this.component.get('clockFormat')
            },
            {
                selector: '[data-autostart]',
                event: 'change',
                onChange: (el) => this.component.set('autoStart', el.checked),
                onLoad: (el) => el.checked = this.component.get('autoStart')
            }
        ];

        // Apply logic to all fields
        fields.forEach((field) => {
            let el = document.querySelector(field.selector);

            // Add onChange listener
            el.addEventListener(field.event, () => {

                // Update custom field
                field.onChange(el)

                // Persist new data
                this.component.save();
            });

            // Fire onLoad listener
            field.onLoad(el);
        });

        // Get all links in preferences window
        const links = document.querySelectorAll('a[href^="http"]');

        // Open links externally by default
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', (e) => {
                e.preventDefault();
                Electron.shell.openExternal(e.currentTarget.href);
            });
        }
    }

    /**
     * When the dark mode is being changed we need to adjust the styles by
     * adding or removing the dark-mode class to the root DOM element.
     *
     * @param {boolean} darkMode
     */
    toggleDarkMode(darkMode)
    {
        document.documentElement.classList[
            darkMode ? 'add' : 'remove'
        ]('dark-mode');
    }
}

module.exports = Preferences;
