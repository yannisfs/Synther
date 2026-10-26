import React from 'react';
import LegalLayout from '../components/LegalLayout';

const Impressum = () => (
  <LegalLayout
    kicker="Rechtliches"
    title="Impressum"
    updated="01. August 2026"
  >
    <p>
      Angaben gemäß § 5 DDG (Digital Services Act Umsetzungsgesetz, vormals § 5 TMG):
    </p>

    <h2>Anbieter</h2>
    <p>
      <strong>Riviera Engineering GmbH</strong><br />
      Musterstraße 12<br />
      80331 München<br />
      Deutschland
    </p>

    <h2>Kontakt</h2>
    <p>
      Telefon: +49 (0) 89 0000 0000<br />
      E-Mail: <a href="mailto:hallo@riviera-engineering.example">hallo@riviera-engineering.example</a>
    </p>

    <h2>Registereintrag</h2>
    <p>
      Eintragung im Handelsregister.<br />
      Registergericht: Amtsgericht München<br />
      Registernummer: HRB 000000 (Platzhalter)
    </p>

    <h2>Umsatzsteuer-ID</h2>
    <p>
      Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
      DE000000000 (Platzhalter)
    </p>

    <h2>Wirtschafts-Identifikationsnummer</h2>
    <p>
      Wirtschafts-Identifikationsnummer gemäß § 139c Abgabenordnung:<br />
      noch nicht erteilt (Platzhalter)
    </p>

    <h2>Berufsrechtliche Angaben</h2>
    <p>
      Mitglied der Industrie- und Handelskammer (IHK) für München und Oberbayern:<br />
      Max-Joseph-Straße 2, 80333 München<br />
      <a href="https://www.ihk-muenchen.de" target="_blank" rel="noopener noreferrer">www.ihk-muenchen.de</a>
    </p>
    <p>
      Berufsbezeichnung: Beratender Ingenieur (verliehen in der Bundesrepublik Deutschland).<br />
      Maßgebliche berufsrechtliche Regelungen finden sich in den einschlägigen Kammer- und Berufsordnungen der IHK.
    </p>

    <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
    <p>
      [Geschäftsführer/in]<br />
      Anschrift wie oben
    </p>

    <h2>Streitschlichtung</h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
      {' '}<a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.
      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
      Verbraucherschlichtungsstelle teilzunehmen.
    </p>

    <h2>Haftung für Inhalte</h2>
    <p>
      Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den
      allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
      verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
      forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung
      der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
      diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
      Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
      Inhalte umgehend entfernen.
    </p>

    <h2>Haftung für Links</h2>
    <p>
      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
      Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
      verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
      verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
      Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche
      Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
      zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
    </p>

    <h2>Urheberrecht</h2>
    <p>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
      Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
      Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
      Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
      gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
      Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
      Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
      entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
      umgehend entfernen.
    </p>
  </LegalLayout>
);

export default Impressum;
