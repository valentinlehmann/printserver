/**
 * Central German UI dictionary, keyed by English identifiers.
 *
 * The app is single-language (German), so there is no i18n runtime — components
 * read strings directly from this object via `t` (see `@/lib/messages`).
 * Keep code/identifiers in English; only the string values are German.
 */
export const de = {
  common: {
    appName: "Printserver",
    cancel: "Abbrechen",
    close: "Schließen",
    download: "Herunterladen",
    retry: "Erneut versuchen",
    loading: "Wird geladen …",
    save: "Speichern",
  },

  nav: {
    print: "Drucken",
    scan: "Scannen",
    status: "Status",
    admin: "Verwaltung",
  },

  header: {
    print: "Drucken",
    scan: "Scannen",
    status: "Status",
    admin: "Verwaltung",
  },

  auth: {
    signIn: "Anmelden",
    signInWithPasskey: "Mit Passkey anmelden",
    signOut: "Abmelden",
    signingIn: "Anmeldung läuft …",
    account: "Konto",
    loginTitle: "Anmeldung",
    loginSubtitle: "Melde dich mit deinem Passkey an, um zu drucken und zu scannen.",
    loginFailed: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
    noPasskeyHint:
      "Noch kein Passkey? Bitte den Administrator um einen Einrichtungslink.",
    // Passkey enrollment (one-time link)
    enrollTitle: "Passkey einrichten",
    enrollSubtitle:
      "Erstelle einen Passkey auf diesem Gerät, um dich künftig sicher anzumelden.",
    enrollButton: "Passkey erstellen",
    enrolling: "Passkey wird erstellt …",
    enrollSuccess: "Passkey erfolgreich erstellt. Du kannst dich jetzt anmelden.",
    enrollFailed: "Passkey konnte nicht erstellt werden.",
    enrollInvalidToken: "Dieser Einrichtungslink ist ungültig oder abgelaufen.",
  },

  print: {
    title: "Drucken",
    subtitle: "PDF hochladen und Druckeinstellungen festlegen.",
    // File
    file: "Datei",
    dropzone: "PDF hierher ziehen oder klicken zum Auswählen",
    dropzoneHint: "Nur PDF-Dateien",
    fileSelected: "Ausgewählt",
    pages: "Seiten",
    removeFile: "Datei entfernen",
    // Copies & collate
    copiesGroup: "Kopien & Sortierung",
    copies: "Kopien",
    collate: "Sortieren",
    // Page range
    pagesGroup: "Seiten",
    allPages: "Alle Seiten",
    pageRange: "Seitenbereich",
    pageRangePlaceholder: "z. B. 1-3, 5, 8-10",
    pageRangeInvalid: "Ungültiger Seitenbereich",
    // Layout
    layoutGroup: "Layout",
    orientation: "Ausrichtung",
    portrait: "Hochformat",
    landscape: "Querformat",
    pagesPerSheet: "Seiten pro Blatt",
    // Duplex
    duplexGroup: "Beidseitig",
    sides: "Druckseiten",
    oneSided: "Einseitig",
    twoSidedLong: "Beidseitig (lange Kante)",
    twoSidedShort: "Beidseitig (kurze Kante)",
    duplexUnsupported: "Beidseitiger Druck wird nicht unterstützt.",
    // Color
    colorGroup: "Farbe",
    colorMode: "Farbmodus",
    color: "Farbe",
    monochrome: "Schwarzweiß",
    // Paper
    paperGroup: "Papier",
    paperSize: "Papierformat",
    // Quality
    qualityGroup: "Qualität",
    quality: "Qualität",
    qualityDraft: "Entwurf",
    qualityNormal: "Normal",
    qualityHigh: "Hoch",
    // Submit
    submit: "Drucken",
    submitting: "Wird gedruckt …",
    success: "Druckauftrag gesendet.",
    failed: "Druck fehlgeschlagen.",
    failedFormat: "Der Drucker hat das Dateiformat abgelehnt.",
    noFile: "Bitte zuerst eine PDF-Datei auswählen.",
  },

  scan: {
    title: "Scannen",
    subtitle: "Scaneinstellungen festlegen und Ergebnis herunterladen.",
    // Source
    sourceGroup: "Quelle",
    source: "Vorlagenquelle",
    platen: "Vorlagenglas",
    adf: "Dokumenteneinzug (ADF)",
    duplex: "Beidseitig (ADF)",
    duplexAdfOnly: "Beidseitiges Scannen ist nur über den Einzug möglich.",
    // Color
    colorGroup: "Farbe",
    colorMode: "Farbmodus",
    color: "Farbe",
    grayscale: "Graustufen",
    blackwhite: "Schwarzweiß",
    // Quality
    qualityGroup: "Qualität",
    resolution: "Auflösung",
    dpi: "dpi",
    content: "Inhalt",
    contentText: "Text",
    contentPhoto: "Foto",
    // Format
    formatGroup: "Format",
    documentSize: "Dokumentgröße",
    // Output
    outputGroup: "Ausgabe",
    output: "Ausgabeformat",
    outputDocument: "Dokument (PDF)",
    outputPhoto: "Fotos (ZIP)",
    // Run
    submit: "Scan starten",
    starting: "Scan wird gestartet …",
    scanning: "Wird gescannt …",
    assembling: "Wird zusammengestellt …",
    pagesScanned: "Seiten gescannt",
    done: "Scan abgeschlossen.",
    downloadPdf: "PDF herunterladen",
    downloadZip: "ZIP herunterladen",
    failed: "Scan fehlgeschlagen.",
    cancel: "Scan abbrechen",
    canceled: "Scan abgebrochen.",
  },

  admin: {
    title: "Verwaltung",
    subtitle: "Nutzer anlegen und Einrichtungslinks erzeugen.",
    createUserTitle: "Nutzer anlegen",
    createUserDesc:
      "Lege ein Konto an. Anschließend wird ein einmaliger Einrichtungslink erzeugt, den du teilen kannst.",
    emailLabel: "E-Mail",
    nameLabel: "Name",
    createButton: "Anlegen & Link erzeugen",
    creating: "Wird angelegt …",
    errorMissingFields: "Bitte Name und E-Mail angeben.",
    errorUserExists: "Es existiert bereits ein Konto mit dieser E-Mail.",
    errorLink: "Einrichtungslink konnte nicht erzeugt werden.",
    usersTitle: "Konten",
    noUsers: "Noch keine Konten vorhanden.",
    reissue: "Neuer Einrichtungslink",
    linkLabel: "Einrichtungslink",
    linkHint:
      "Einmalig gültig. Teile ihn sicher mit der Person (z. B. per Messenger).",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert.",
    roleAdmin: "Administrator",
    roleUser: "Nutzer",
  },

  status: {
    title: "Druckerstatus",
    subtitle: "Aktueller Status und Warteschlange des Druckers.",
    online: "Online",
    offline: "Nicht erreichbar",
    offlineHint:
      "Der Drucker antwortet nicht. Prüfe, ob er eingeschaltet und mit dem Netzwerk verbunden ist.",
    state: "Status",
    stateIdle: "Bereit",
    stateProcessing: "Druckt …",
    stateStopped: "Angehalten",
    stateOffline: "Nicht erreichbar",
    note: "Hinweis",
    queue: "Warteschlange",
    noJobs: "Keine Aufträge in der Warteschlange.",
    ink: "Tintenstände",
    refresh: "Aktualisieren",
    // job states
    jobPending: "Wartet",
    jobProcessing: "Wird gedruckt",
    jobHeld: "Angehalten",
    jobAborted: "Abgebrochen (Fehler)",
    jobCanceled: "Abgebrochen",
    jobCompleted: "Fertig",
    jobUnknown: "Unbekannt",
    // common printer-state-reasons
    reasonMediaEmpty: "Kein Papier",
    reasonMediaNeeded: "Papier einlegen",
    reasonMediaJam: "Papierstau",
    reasonMarkerSupplyLow: "Tinte niedrig",
    reasonMarkerSupplyEmpty: "Tinte leer",
    reasonCoverOpen: "Abdeckung offen",
    reasonDoorOpen: "Klappe offen",
    reasonPaused: "Pausiert",
    reasonOffline: "Offline",
    reasonShutdown: "Ausgeschaltet",
  },

  printer: {
    offlineBanner:
      "Drucker nicht erreichbar – es werden Standardeinstellungen angezeigt.",
    scannerOfflineBanner:
      "Scanner nicht erreichbar – es werden Standardeinstellungen angezeigt.",
  },

  errors: {
    unauthorized: "Nicht angemeldet.",
    invalidFile: "Ungültige Datei. Bitte eine PDF-Datei wählen.",
    fileTooLarge: "Die Datei ist zu groß.",
    generic: "Es ist ein Fehler aufgetreten.",
  },
} as const;

export type Messages = typeof de;
