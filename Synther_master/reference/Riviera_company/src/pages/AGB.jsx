import React from 'react';
import LegalLayout from '../components/LegalLayout';

const AGB = () => (
  <LegalLayout
    kicker="Rechtliches"
    title="Allgemeine Geschäftsbedingungen"
    updated="01. August 2026"
  >
    <h2>§ 1 Geltungsbereich</h2>
    <p>
      Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die zwischen der
      Riviera Engineering GmbH (im Folgenden „Auftragnehmer") und ihren Kunden (im Folgenden
      „Auftraggeber") über die Erbringung von Ingenieur-, Beratungs- und Softwareleistungen
      geschlossen werden. Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn,
      der Auftragnehmer stimmt ihrer Geltung ausdrücklich schriftlich zu.
    </p>

    <h2>§ 2 Vertragsschluss</h2>
    <p>
      Angebote des Auftragnehmers sind freibleibend und unverbindlich. Ein Vertrag kommt erst durch
      schriftliche Auftragsbestätigung oder durch Beginn der Leistungsausführung zustande.
    </p>

    <h2>§ 3 Leistungsumfang</h2>
    <p>
      Art und Umfang der zu erbringenden Leistungen ergeben sich aus dem jeweiligen Angebot bzw. der
      Auftragsbestätigung. Änderungen oder Erweiterungen des Leistungsumfangs bedürfen der Schriftform.
    </p>
    <p>
      Der Auftragnehmer erbringt seine Leistungen nach den anerkannten Regeln der Technik und unter
      Beachtung der einschlägigen gesetzlichen und behördlichen Vorschriften.
    </p>

    <h2>§ 4 Mitwirkungspflichten des Auftraggebers</h2>
    <p>
      Der Auftraggeber ist verpflichtet, den Auftragnehmer bei der Erbringung der vertraglich
      geschuldeten Leistungen angemessen zu unterstützen. Insbesondere wird der Auftraggeber die für die
      Durchführung des Auftrags notwendigen Informationen, Unterlagen und Zugänge rechtzeitig und
      vollständig zur Verfügung stellen.
    </p>

    <h2>§ 5 Vergütung und Zahlungsbedingungen</h2>
    <p>
      Die Vergütung richtet sich nach der jeweiligen Vereinbarung. Sofern nicht anders vereinbart,
      gelten die zum Zeitpunkt des Vertragsschlusses gültigen Stundensätze des Auftragnehmers.
    </p>
    <p>
      Rechnungen sind innerhalb von 14 Tagen nach Zugang ohne Abzug zur Zahlung fällig. Bei
      Zahlungsverzug gelten die gesetzlichen Regelungen.
    </p>

    <h2>§ 6 Vertraulichkeit</h2>
    <p>
      Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten vertraulichen
      Informationen geheim zu halten und Dritten nicht zugänglich zu machen. Diese Verpflichtung besteht
      auch nach Beendigung des Vertragsverhältnisses fort.
    </p>

    <h2>§ 7 Urheberrecht und Nutzungsrechte</h2>
    <p>
      Alle im Rahmen des Auftrags erstellten Arbeitsergebnisse (CAD-Modelle, Zeichnungen, Software,
      Dokumentationen etc.) unterliegen dem Urheberrecht des Auftragnehmers, sofern nicht ausdrücklich
      etwas anderes vereinbart ist. Der Auftraggeber erhält mit vollständiger Bezahlung der Vergütung
      ein einfaches, nicht übertragbares Nutzungsrecht für den vertraglich vereinbarten Zweck.
    </p>

    <h2>§ 8 Haftung</h2>
    <p>
      Der Auftragnehmer haftet für Vorsatz und grobe Fahrlässigkeit nach den gesetzlichen Bestimmungen.
      Für leichte Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung wesentlicher
      Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesem Fall auf den vertragstypischen,
      vorhersehbaren Schaden begrenzt.
    </p>
    <p>
      Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit bleibt
      unberührt.
    </p>

    <h2>§ 9 Datenschutz</h2>
    <p>
      Die Verarbeitung personenbezogener Daten erfolgt nach Maßgabe der geltenden
      Datenschutzvorschriften, insbesondere der DSGVO und des BDSG. Einzelheiten ergeben sich aus der
      Datenschutzerklärung.
    </p>

    <h2>§ 10 Schlussbestimmungen</h2>
    <p>
      Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
      Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist München,
      sofern der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder
      öffentlich-rechtliches Sondervermögen ist.
    </p>
    <p>
      Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen
      Bestimmungen unberührt.
    </p>
  </LegalLayout>
);

export default AGB;
