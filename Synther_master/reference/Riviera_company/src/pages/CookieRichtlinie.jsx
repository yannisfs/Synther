import React from 'react';
import LegalLayout from '../components/LegalLayout';

const CookieRichtlinie = () => (
  <LegalLayout
    kicker="Rechtliches"
    title="Cookie-Richtlinie"
    updated="01. August 2026"
  >
    <h2>1. Was sind Cookies?</h2>
    <p>
      Cookies sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.
      Ähnlich funktioniert der sogenannte <code>localStorage</code> — ein Speicher in Ihrem Browser, der
      von Websites genutzt werden kann.
    </p>

    <h2>2. Welche Technologien wir einsetzen</h2>
    <p>
      Diese Website verwendet <strong>keine Cookies</strong> zu Analyse-, Marketing- oder
      Tracking-Zwecken. Wir setzen ausschließlich <code>localStorage</code> ein, um Ihre
      Cookie-Einstellung zu speichern, damit wir Sie nicht bei jedem Seitenaufruf erneut um Ihre
      Einwilligung bitten.
    </p>
    <p>
      Beim Aufruf der Website werden durch den Hoster (Cloudflare) technisch erforderliche Daten
      verarbeitet (IP-Adresse, User-Agent, Zeitpunkt der Anfrage). Diese dienen dem stabilen und
      sicheren Betrieb der Website und sind nach § 25 Abs. 2 Nr. 2 TTDSG ohne Einwilligung zulässig.
    </p>

    <h2>3. Drittanbieter</h2>
    <p>
      Es werden <strong>keine Drittanbieter-Cookies</strong> gesetzt. Insbesondere setzen wir keine
      Analyse-Tools wie Google Analytics, Matomo oder Plausible ein und binden keine Werbe- oder
      Social-Media-Tracker ein.
    </p>

    <h2>4. Ihre Einwilligung verwalten</h2>
    <p>
      Sie können Ihre Einwilligung jederzeit widerrufen oder ändern. Klicken Sie dazu auf den
      untenstehenden Link:
    </p>
    <p>
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem('cookie-consent');
          window.location.reload();
        }}
        className="text-brand-red underline underline-offset-4 hover:no-underline"
      >
        Cookie-Einstellungen zurücksetzen
      </button>
    </p>

    <h2>5. Änderungen</h2>
    <p>
      Sollten wir künftig nicht-essenzielle Cookies oder Tracking-Technologien einsetzen, werden wir
      Sie vorab um Ihre ausdrückliche Einwilligung bitten und diese Cookie-Richtlinie aktualisieren.
    </p>
  </LegalLayout>
);

export default CookieRichtlinie;
