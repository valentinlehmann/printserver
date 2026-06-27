/**
 * Central German UI dictionary, keyed by English identifiers.
 *
 * The app is single-language (German), so there is no i18n runtime — components
 * read strings directly from this object via `t` (see `@/lib/messages`).
 * Keep code/identifiers in English; only the string values are German.
 */
export const de = {
  common: {
    appName: "Familie Drucker",
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
    admin: "Verwaltung",
  },

  header: {
    print: "Drucken",
    scan: "Scannen",
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
