import React from 'react';
import LegalLayout from '../components/LegalLayout';

const AIDisclosure = () => (
  <LegalLayout
    kicker="Rechtliches"
    title="Hinweis zur Nutzung von KI"
    updated="01. August 2026"
  >
    <h2>1. Verwendung Künstlicher Intelligenz</h2>
    <p>
      Riviera Engineering GmbH setzt bei der Erbringung ihrer Ingenieur- und Beratungsleistungen
      Methoden der Künstlichen Intelligenz (KI) ein. Dies umfasst insbesondere Methoden des
      maschinellen Lernens, der Computer Vision sowie KI-gestützte Designprozesse.
    </p>
    <p>
      KI wird ausschließlich als <strong>Werkzeug und Unterstützung</strong> im Rahmen der
      menschlichen Ingenieurarbeit eingesetzt. Alle wesentlichen Entscheidungen — insbesondere
      sicherheitsrelevante Auslegungen, finale Designs und Empfehlungen an Kunden — werden durch
      qualifizierte Ingenieurinnen und Ingenieure getroffen und verantwortet.
    </p>

    <h2>2. Kein Hochrisiko-System im Sinne der EU-KI-Verordnung</h2>
    <p>
      Die von uns eingesetzten KI-Systeme sind <strong>keine Hochrisiko-KI-Systeme</strong> im Sinne von
      Art. 6 Abs. 1 bis 3 in Verbindung mit Anhang III der Verordnung (EU) 2024/1689
      (EU-KI-Verordnung / AI Act). Unsere Arbeit fällt insbesondere nicht in die dort genannten
      Anwendungsbereiche (Biometrie, kritische Infrastruktur, Bildungswesen, Beschäftigung,
      grundlegende private oder öffentliche Dienstleistungen, Strafverfolgung, Migration, Justiz oder
      demokratische Prozesse).
    </p>

    <h2>3. Keine automatisierten Entscheidungen mit Rechtswirkung</h2>
    <p>
      Wir setzen keine KI-gestützten Systeme ein, die ausschließlich automatisierte Entscheidungen
      mit Rechtswirkung oder ähnlich erheblicher Wirkung gegenüber betroffenen Personen treffen
      (Art. 22 DSGVO). Sämtliche Entscheidungen im Rahmen unserer Dienstleistungen werden von
      Menschen getroffen.
    </p>

    <h2>4. Kein Profiling</h2>
    <p>
      Auf unserer Website findet kein Profiling im Sinne von Art. 4 Nr. 4 DSGVO statt.
    </p>

    <h2>5. Transparenz</h2>
    <p>
      Sollten wir KI in einem neuen Anwendungsbereich einsetzen, der über die oben beschriebene Nutzung
      hinausgeht, aktualisieren wir diese Erklärung. Bei Fragen zum konkreten Einsatz von KI in einem
      Projekt sprechen Sie uns gerne an:{' '}
      <a href="mailto:hallo@riviera-engineering.example">hallo@riviera-engineering.example</a>.
    </p>
  </LegalLayout>
);

export default AIDisclosure;
