import React from 'react';
import LegalLayout from '../components/LegalLayout';

const Datenschutz = () => (
  <LegalLayout
    kicker="Rechtliches"
    title="Datenschutzerklärung"
    updated="01. August 2026"
  >
    <h2>1. Datenschutz auf einen Blick</h2>
    <h3>Allgemeine Hinweise</h3>
    <p>
      Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
      passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
      persönlich identifiziert werden können (z. B. Name, Anschrift, E-Mail-Adresse, IP-Adresse).
    </p>

    <h2>2. Verantwortlicher</h2>
    <p>
      Verantwortlich für die Datenverarbeitung auf dieser Website ist:
    </p>
    <p>
      <strong>Riviera Engineering GmbH</strong><br />
      Musterstraße 12, 80331 München<br />
      Telefon: +49 (0) 89 0000 0000<br />
      E-Mail: <a href="mailto:datenschutz@riviera-engineering.example">datenschutz@riviera-engineering.example</a>
    </p>

    <h2>3. Hosting & Datenverarbeitung in Drittstaaten</h2>
    <p>
      Diese Website wird bei der <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107,
      USA) gehostet und über das Cloudflare-Netzwerk ausgeliefert. Beim Aufruf der Website werden technisch
      erforderliche Daten (IP-Adresse, Datum und Uhrzeit der Anfrage, abgerufene URL, User-Agent,
      Referrer-URL) in sog. Logfiles verarbeitet. Diese Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1
      lit. f DSGVO (berechtigtes Interesse an einem stabilen und sicheren Betrieb der Website).
    </p>
    <p>
      Cloudflare verarbeitet Daten gegebenenfalls in den USA. Die Datenübertragung in die USA erfolgt auf
      Grundlage des Angemessenheitsbeschlusses der EU-Kommission für das EU-US Data Privacy Framework
      (DPF) sowie der von Cloudflare abgeschlossenen Standardvertragsklauseln.
    </p>
    <p>
      Die im Rahmen des Kontaktformulars eingegebenen Daten werden in einer <strong>Cloudflare D1</strong>
      Datenbank in der Region <strong>EEUR (Frankfurt am Main, Deutschland)</strong> gespeichert und
      verarbeitet.
    </p>

    <h2>4. Cookies & lokale Speicherung</h2>
    <p>
      Diese Website verwendet <strong>keine technisch nicht erforderlichen Cookies</strong>. Insbesondere
      setzen wir kein Tracking, keine Analyse-Tools und keine Werbe-Cookies ein. Sollten in Zukunft
      nicht-essenzielle Cookies eingesetzt werden, holen wir vorab Ihre Einwilligung über ein
      Consent-Banner ein.
    </p>
    <p>
      Wir verwenden ausschließlich <code>localStorage</code> zur Speicherung Ihrer Cookie-Einstellung.
      Sie können diese jederzeit über die Schaltfläche „Cookie-Einstellungen" im Seitenfuß ändern.
    </p>

    <h2>5. Kontaktformular</h2>
    <p>
      Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular
      inklusive der von Ihnen dort angegebenen Kontaktdaten (Name, E-Mail-Adresse, Projekttyp, Nachricht)
      zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
    </p>
    <p>
      <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Durchführung
      vorvertraglicher Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
      Bearbeitung Ihrer Anfrage).
    </p>
    <p>
      <strong>Speicherdauer:</strong> Die Daten werden gelöscht, sobald sie für die Erreichung des
      Zweckes ihrer Erhebung nicht mehr erforderlich sind — spätestens jedoch nach Ablauf der gesetzlichen
      Aufbewahrungsfristen (in der Regel 6 Jahre gemäß § 257 HGB, 10 Jahre gemäß § 147 AO).
    </p>
    <p>
      Die im Formular abgefragten Daten werden in eine Datenbank (Cloudflare D1, Region EEUR/Frankfurt)
      gespeichert. Eine Übermittlung in Drittländer findet nicht statt.
    </p>

    <h2>6. Ihre Rechte als betroffene Person</h2>
    <p>Sie haben gegenüber dem Verantwortlichen jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
    <ul>
      <li><strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)</li>
      <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
      <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
      <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
      <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
      <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
      <li><strong>Recht auf Widerruf einer erteilten Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>
      <li><strong>Recht auf Beschwerde bei einer Aufsichtsbehörde</strong> (Art. 77 DSGVO)</li>
    </ul>
    <p>
      Zuständige Aufsichtsbehörde: <strong>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong>,
      Promenade 18, 91522 Ansbach,{' '}
      <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer">www.lda.bayern.de</a>.
    </p>

    <h2>7. Pflicht zur Bereitstellung von Daten</h2>
    <p>
      Die Bereitstellung Ihrer personenbezogenen Daten im Kontaktformular erfolgt freiwillig. Ohne diese
      Daten können wir Ihre Anfrage jedoch nicht bearbeiten.
    </p>

    <h2>8. Keine automatisierte Entscheidungsfindung / kein Profiling</h2>
    <p>
      Eine automatisierte Entscheidungsfindung oder ein Profiling im Sinne von Art. 22 DSGVO findet auf
      dieser Website nicht statt.
    </p>
  </LegalLayout>
);

export default Datenschutz;
