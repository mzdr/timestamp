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
      description: 'The format [pattern](https://date-fns.org/docs/format) of the system tray clock.',
    },
    calendarBackground: {
      label: 'Background',
      description: 'Choose a calendar background that suits your personal liking.',
    },
    calendarLegendFormat: {
      label: 'Legend format',
      description: 'The format [pattern](https://date-fns.org/docs/format) of the legend above the month.',
    },
    calendarTodayFormat: {
      label: 'Today format',
      description: 'The format [pattern](https://date-fns.org/docs/format) of the today display in the calendar head.',
    },
    shortcuts: {
      description: 'See below for a complete list of keyboard shortcuts that you can use in the calendar window.',
      keys: [
        ['W', 'Toggle week numbers'],
        ['↑', 'Next year'],
        ['↓', 'Previous year'],
        ['→', 'Next month'],
        ['←', 'Previous month'],
        ['⌘+,', 'Show preferences'],
        ['⌘+Q', 'Quit timestamp'],
        ['Esc', 'Close window'],
        ['Space', 'Go to today'],
      ],
    },
  },
};
