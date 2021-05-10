module.exports = {
  name: 'English',
  locale: 'en',
  app: {
    restart: 'Restart',
    updateDownloaded: 'A new version of Timestamp has been downloaded. Please restart the app in order to update it.',
  },
  preferences: {
    category: {
      general: 'General',
      tray: 'System tray',
      calendar: 'Calendar',
      shortcuts: 'Shortcuts',
    },
    openAtLogin: {
      label: 'Open at login',
      description: 'Enable this option if you want Timestamp to start automatically when you start your computer.',
    },
    clockFormat: {
      label: 'Clock format',
      description: 'The system tray clock is using the format function of [date-fns](https://date-fns.org/docs/format). Use any pattern you may like.',
    },
    calendarBackground: {
      label: 'Background',
      description: 'Customize the calendar background to your personal liking.',
    },
    shortcuts: {
      description: 'See below for a complete list of keyboard shortcuts that you can use in the calendar window.',
      keys: [
        ['W', 'Toggle week numbers.'],
        ['↑', 'Next year.'],
        ['↓', 'Previous year.'],
        ['→', 'Next month.'],
        ['←', 'Previous month.'],
        ['⌘+,', 'Show preferences.'],
        ['⌘+Q', 'Quit timestamp.'],
        ['Esc', 'Close window.'],
        ['Space', 'Go to today.'],
      ],
    },
  },
};
