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
      description: 'Die System-Tray-Uhr verwendet die Formatfunktion von [date-fns](https://date-fns.org/docs/format). Verwenden Sie ein beliebiges Muster, das Ihnen gefällt.',
    },
    calendarBackground: {
      label: 'Hintergrund',
      description: 'Passen Sie den Kalenderhintergrund an Ihre persönlichen Wünsche an.',
    },
    calendarLegendFormat: {
      label: 'Format der Legende',
      description: 'Das Format der Legende über dem Monat. Verwendet auch die Formatfunktion von [date-fns](https://date-fns.org/docs/format).',
    },
    shortcuts: {
      description: 'Im Folgenden finden Sie eine vollständige Liste der Tastenkombinationen, die Sie im Kalenderfenster verwenden können.',
      keys: [
        ['W', 'Wochennummern anzeigen'],
        ['↑', 'Nächstes Jahr'],
        ['↓', 'Vorheriges Jahr'],
        ['→', 'Nächster Monat'],
        ['←', 'Vorheriger Monat'],
        ['⌘+,', 'Einstellungen anzeigen'],
        ['⌘+Q', 'Timestamp beenden'],
        ['Esc', 'Fenster schließen'],
        ['Leertaste', 'Aktuellen Tag anzeigen'],
      ],
    },
  },
};
