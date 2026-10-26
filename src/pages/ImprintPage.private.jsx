// Private-person imprint template — ACTIVE.
//
// This is the imprint that ships while the Synther GmbH registration is
// still pending. The page is filed under a private individual (the
// operator's own name + private address) per § 5 DDG. Once the GmbH is
// registered, the user flips one line in src/pages/ImprintPage.jsx
// (the re-export shim) to point at './ImprintPage.gmbh.jsx' and the
// registered-company imprint goes live. The GmbH template at
// ImprintPage.gmbh.jsx is preserved verbatim — do not edit it.
//
// This file mirrors the structure of ImprintPage.gmbh.jsx. The two
// diverge in five places only:
//   1. The page-level lead paragraph (the en.json lead names Synther GmbH).
//   2. The DE Impressum / EN Imprint field tables (inapplicable rows
//      removed; values use NAME / ADDRESS / contact@synther.eu).
//   3. The DE / EN Privacy body controller paragraph (the de.json /
//      en.json sentence names Synther GmbH and hello@synther.gmbh).
//   4. The DE / EN Privacy body "your rights" paragraph (ends with
//      "…write to hello@synther.gmbh." which is the old address).
//   5. The identity data itself: NAME / ADDRESS are read from
//      src/data/content.js (legalIdentity) instead of being written out
//      here, so the footer and the structured data show the same thing.
// Everything else — breadcrumb, h1, back-CTA, the 7-section privacy
// block structure, reveal refs, document.title effect — is identical.

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import usePageSeo from '../hooks/usePageSeo.js'
import { fixedT } from '../lib/fixedT.js'
import { company, legalIdentity } from '../data/content.js'

// Private-person imprint data. Module-scope (not inside the component)
// so the PrivacyBody / PrivacyBodyEN subcomponents below can also read
// them. The optional phone row was dropped rather than left as a
// placeholder, so nothing on the published page says "[TODO — replace]".
//
// The registered indicators (name + address) are not written here but
// read from src/data/content.js, so that this page, the footer's legal
// column and the structured data can never disagree about who runs the
// site. When the GmbH registration is done, the GmbH values are switched
// on in that one place (they sit there commented out).
const NAME = legalIdentity.legalName
const ADDRESS = legalIdentity.address
const EMAIL = company.email

// The /imprint page. The legally-binding German Impressum and
// Datenschutzerklärung are the primary content (§ 5 DDG, Art. 13 DSGVO).
// English parallel blocks follow each German block as a courtesy.
//
// `deT` is a t() bound to the 'de' locale regardless of the active
// i18n.language — the DE blocks must always render in German. `enT` is the
// normal useTranslation() hook for the EN blocks.
export default function ImprintPage() {
  const { t } = useTranslation()
  const deT = useMemo(() => fixedT('de'), [])
  const headRef = useReveal()
  const impressumRef = useReveal()
  const privacyRef = useReveal()
  const enImprintRef = useReveal()
  const enPrivacyRef = useReveal()

  // Reset scroll on direct navigation to /imprint.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    document.title = t('title.imprint')
  }, [t])

  // S35/S36: canonical (trailing-slashed to match what Pages serves),
  // og:url, and this page's own social title/description.
  usePageSeo({ path: '/imprint', title: t('title.imprint'), description: t('imprint.seo.description') })

  // Each imprint block reuses the dark hero + body pattern from
  // CapabilityPage so we don't introduce parallel styles.
  return (
    <article className="capability imprint">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('imprint.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('imprint.breadcrumbCurrent')}</li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true" />
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={headRef}>
            <h1 className="capability__title">{t('imprint.h1')}</h1>
            <p className="capability__lead">
              {/* The en.json 'imprint.lead' string names Synther GmbH, which
                  doesn't apply to the private variant. Inline an equivalent
                  here so the GmbH template (which reads imprint.lead from
                  en.json) is unaffected. */}
              Legal information under § 5 DDG and the statement on the processing
              of personal data under Art. 13 GDPR.
            </p>
          </div>
        </div>
      </header>

      {/* Block 1 — Impressum (DE) — legally binding */}
      <section className="section capability__overview">
        <div className="container">
          <div className="capability__block reveal" ref={impressumRef}>
            <p className="eyebrow">{deT('imprint.impressumEyebrow')}</p>
            <h2 className="capability__h2">{deT('imprint.impressumHead')}</h2>
            <p className="section-lead">
              {/* The de.json 'imprint.impressumLead' assumes an Anbieter
                  in the legal-entity sense ("Anbieter und verantwortliche
                  Stelle"). For a private person under § 5 DDG, the same
                  role is filled by the named operator. Inline the
                  equivalent here. */}
              Anbieter und verantwortliche Stelle im Sinne des § 5 DDG:
            </p>
            <dl className="imprint__fields">
              {/* Private-person field set: name (Anbieter), address, email.
                  All rows that require a registered company
                  (Registereintrag, USt-ID, Steuernummer, § 18 MStV
                  responsible person) are intentionally omitted, and so is
                  the optional phone row — no number is published. */}
              <Field label={deT('imprint.fields.provider')} value={NAME} />
              <Field label={deT('imprint.fields.address')} value={ADDRESS} />
              <Field
                label={deT('imprint.fields.email')}
                value={EMAIL}
                href={`mailto:${EMAIL}`}
              />
            </dl>
          </div>
        </div>
      </section>

      {/* Block 2 — Datenschutzerklärung (DE) — legally binding */}
      <section className="section capability__caps">
        <div className="container">
          <div className="capability__block-head reveal" ref={privacyRef}>
            <p className="eyebrow">{deT('imprint.privacyEyebrow')}</p>
            <h2 className="capability__h2">{deT('imprint.privacyHead')}</h2>
            <p className="section-lead">{deT('imprint.privacyLead')}</p>
          </div>
          <PrivacyBody deT={deT} />
        </div>
      </section>

      {/* Block 3 — Imprint (EN) — courtesy */}
      <section className="section capability__engagement">
        <div className="container">
          <div className="capability__block-head reveal" ref={enImprintRef}>
            <p className="eyebrow">{t('imprint.englishEyebrow')}</p>
            <h2 className="capability__h2">{t('imprint.english.imprintHead')}</h2>
            <p className="section-lead">{t('imprint.english.imprintLead')}</p>
          </div>
          <dl className="imprint__fields">
            {/* EN courtesy field list — mirrors the DE block above. */}
            <Field label={t('imprint.fields.provider')} value={NAME} />
            <Field label={t('imprint.fields.address')} value={ADDRESS} />
            <Field
              label={t('imprint.fields.email')}
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />
          </dl>
        </div>
      </section>

      {/* Block 4 — Privacy Notice (EN) — courtesy */}
      <section className="section capability__lineage">
        <div className="container">
          <div className="capability__block-head reveal" ref={enPrivacyRef}>
            <p className="eyebrow">{t('imprint.englishEyebrow')}</p>
            <h2 className="capability__h2">{t('imprint.english.privacyHead')}</h2>
            <p className="section-lead">{t('imprint.english.privacyLead')}</p>
          </div>
          <div className="capability__body">
            <PrivacyBodyEN t={t} />
          </div>
        </div>
      </section>

      {/* Back to home CTA — simple anchor stays */}
      <div className="container imprint__back-cta">
        <Link to="/" className="btn btn--ghost">
          {t('imprint.backCta')}
        </Link>
      </div>
    </article>
  )
}

// Simple labeled key/value pair for the imprint tables.
function Field({ label, value, href }) {
  return (
    <div className="imprint__field">
      <dt className="imprint__field-label mono">{label}</dt>
      <dd className="imprint__field-value">
        {href ? <a href={href}>{value}</a> : value}
      </dd>
    </div>
  )
}

// Renders the DE Datenschutzerklärung body. Numbers are kept in the i18n
// strings so reordering / re-numbering in the locale doesn't drift from the
// rendered text.
function PrivacyBody({ deT }) {
  return (
    <div className="capability__body">
      <PrivacySection
        head={deT('imprint.privacy.controllerHead')}
        body={
          /* The de.json 'imprint.privacy.controllerBody' sentence names
             Synther GmbH and hello@synther.gmbh. For the private variant
             we render an equivalent inline that uses NAME / ADDRESS /
             contact@synther.eu. The 6 sections below it read identically
             for GmbH or private, so they still use deT(…) unchanged. */
          <>
            Verantwortlich für die Verarbeitung personenbezogener Daten
            auf dieser Website ist {NAME}, E-Mail{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>,
            Postanschrift: {ADDRESS}.
          </>
        }
      />
      <PrivacySection
        head={deT('imprint.privacy.logsHead')}
        body={deT('imprint.privacy.logsBody')}
      />
      <PrivacySection
        head={deT('imprint.privacy.cookiesHead')}
        body={deT('imprint.privacy.cookiesBody')}
        linkTo="/cookies"
        linkLabel={deT('imprint.privacy.cookiesLink')}
      />
      <PrivacySection
        head={deT('imprint.privacy.consentHead')}
        body={deT('imprint.privacy.consentBody')}
      />
      <PrivacySection
        head={deT('imprint.privacy.contactHead')}
        body={deT('imprint.privacy.contactBody')}
      />
      <PrivacySection
        head={deT('imprint.privacy.rightsHead')}
        body={
          /* The de.json 'imprint.privacy.rightsBody' sentence ends with
             "...schreiben Sie an hello@synther.gmbh." which is the old
             address. For the private variant we render an equivalent
             inline that ends with the new email. The enumerated rights
             are identical for GmbH and private, so they're inlined as a
             static string. */
          <>
            Sie haben das Recht auf Auskunft (Art. 15), Berichtigung
            (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
            (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch
            (Art. 21) sowie Beschwerde bei einer Aufsichtsbehörde
            (Art. 77). Zur Ausübung dieser Rechte schreiben Sie an{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </>
        }
      />
      <PrivacySection
        head={deT('imprint.privacy.complaintHead')}
        body={deT('imprint.privacy.complaintBody')}
      />
    </div>
  )
}

// EN privacy body — shorter courtesy translation of the DE blocks.
function PrivacyBodyEN({ t }) {
  return (
    <>
      <PrivacySection
        head={t('imprint.english.controllerHead')}
        body={
          /* The en.json 'imprint.english.controllerBody' sentence names
             Synther GmbH and hello@synther.gmbh. Override inline for the
             private variant. The 6 sections below it read identically
             for GmbH or private, so they still use t(…) unchanged. */
          <>
            The controller for the processing of personal data on this
            site is {NAME}, email{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>,
            postal address: {ADDRESS}.
          </>
        }
      />
      <PrivacySection
        head={t('imprint.english.logsHead')}
        body={t('imprint.english.logsBody')}
      />
      <PrivacySection
        head={t('imprint.english.cookiesHead')}
        body={t('imprint.english.cookiesBody')}
        linkTo="/cookies"
        linkLabel={t('imprint.english.cookiesLink')}
      />
      <PrivacySection
        head={t('imprint.english.consentHead')}
        body={t('imprint.english.consentBody')}
      />
      <PrivacySection
        head={t('imprint.english.contactHead')}
        body={t('imprint.english.contactBody')}
      />
      <PrivacySection
        head={t('imprint.english.rightsHead')}
        body={
          /* The en.json 'imprint.english.rightsBody' sentence ends with
             "write to hello@synther.gmbh." which is the old address.
             For the private variant we render an equivalent inline
             that ends with the new email. */
          <>
            You have the right of access (Art. 15), rectification
            (Art. 16), erasure (Art. 17), restriction of processing
            (Art. 18), data portability (Art. 20), objection (Art. 21)
            and the right to lodge a complaint with a supervisory
            authority (Art. 77). To exercise these rights, write to{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </>
        }
      />
      <PrivacySection
        head={t('imprint.english.complaintHead')}
        body={t('imprint.english.complaintBody')}
      />
    </>
  )
}

function PrivacySection({ head, body, linkTo, linkLabel }) {
  return (
    <>
      <h3 className="capability__cap-title">{head}</h3>
      <p>
        {body}
        {linkTo && linkLabel && (
          <>
            {' '}
            <Link to={linkTo} className="imprint__inline-link">
              {linkLabel}
            </Link>
            .
          </>
        )}
      </p>
    </>
  )
}