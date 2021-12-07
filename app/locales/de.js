module.exports = {
  name: 'Deutsch',
  locale: 'de',
  app: {
    restart: 'Neustarten',
    updateDownloaded: 'Eine neue Version von Timestamp wurde heruntergeladen. Bitte starten Sie die App neu, um sie zu aktualisieren.',
  },
  preferences: {
    category: {
      general: 'Generell',
      tray: 'System Tray',
      calendar: 'Kalender',
      shortcuts: 'Tastaturkürzel',
    },
    openAtLogin: {
      label: 'Autostart',
      description: 'Aktivieren Sie diese Option, wenn Sie möchten, dass Timestamp automatisch beim Starten des Computers gestartet werden soll.',
    },
    clockFormat: {
      label: 'Format der Uhr',
      description: 'Das [Format](https://date-fns.org/docs/format) der Uhrzeitanzeige im System-Tray.',
    },
    calendarBackground: {
      label: 'Hintergrund',
      description: 'Wählen Sie einen Kalenderhintergrund aus der Ihrem Geschmack entspricht.',
    },
    calendarLegendFormat: {
      label: 'Format der Legende',
      description: 'Das [Format](https://date-fns.org/docs/format) der Legende über dem Monat.',
    },
    calendarTodayFormat: {
      label: 'Format des aktuellen Tages',
      description: 'Das [Format](https://date-fns.org/docs/format) des aktuellen Tages welches im Kalenderkopf angezeigt wird.',
    },
    shortcuts: {
      description: 'Im Folgenden finden Sie eine vollständige Liste der Tastenkombinationen, die Sie im Kalenderfenster verwenden können.',
      keys: [
        ['W', 'Wochennummern anzeigen'],
        ['Leertaste', 'Aktuellen Tag anzeigen'],
      ],
    },
  },
};
