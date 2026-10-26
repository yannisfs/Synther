// GmbH imprint template — currently DORMANT.
//
// This file is the registered-company variant of the imprint. It is NOT
// the file the site ships today; the router loads it via
// src/pages/ImprintPage.jsx, which is a one-line re-export shim. The
// shim currently points at ImprintPage.private.jsx (the private-person
// variant active while the Synther GmbH registration is still pending).
//
// To switch the site over to the GmbH template once registration
// completes: edit the single re-export line in src/pages/ImprintPage.jsx
// to point at './ImprintPage.gmbh.jsx'. No other change is needed.
// This file is preserved byte-identical to the version that shipped
// pre-registration, so the company-specific values, the i18n
// controllerBody strings, and the field table are all already
// correct — just fill in the `[TODO — replace]` placeholders with the
// real GmbH data before the flip.
//
// One deliberate exception (25 Oct 2026, owner decision D8): the
// "Contact (phone)" row is not part of the company-specific data — it
// is read from `company.phone` in src/data/content.js and rendered only
// while a number is actually published, exactly like the private
// template does. So the flip never publishes an empty phone row, and
// publishing a number later needs no change here at all. The label
// stays in the locale files; there is no phone entry in the TODO
// callout, because the number is not a placeholder — it is either set
// or absent.

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import { fixedT } from '../lib/fixedT.js'
import { company, phoneHref } from '../data/content.js'

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
  const todoRef = useReveal()

  // Reset scroll on direct navigation to /imprint.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    document.title = t('title.imprint')
  }, [t])

  // TODO marker strings come from the DE namespace; render the inline
  // placeholder text as-is so it's findable with a project-wide grep.
  const TODO = '[TODO — replace]'

  // The list of placeholders surfaced in the callout. Matches the markers
  // used in the body below so each TODO appears exactly once.
  const todos = [
    { label: deT('imprint.fields.representative') },
    { label: deT('imprint.fields.address') },
    { label: deT('imprint.fields.registerCourt') },
    { label: deT('imprint.fields.registerNumber') },
    { label: deT('imprint.fields.vat') },
    { label: deT('imprint.fields.taxNumber') + ' (optional)' },
    { label: deT('imprint.fields.mediaLaw') },
    { label: deT('imprint.fields.responsibleAuthority') },
  ]

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
            <p className="capability__lead">{t('imprint.lead')}</p>
          </div>
        </div>
      </header>

      {/* Block 1 — Impressum (DE) — legally binding */}
      <section className="section capability__overview">
        <div className="container">
          <div className="capability__block reveal" ref={impressumRef}>
            <p className="eyebrow">{deT('imprint.impressumEyebrow')}</p>
            <h2 className="capability__h2">{deT('imprint.impressumHead')}</h2>
            <p className="section-lead">{deT('imprint.impressumLead')}</p>
            <dl className="imprint__fields">
              <Field label={deT('imprint.fields.provider')} value="Synther GmbH" />
              <Field
                label={deT('imprint.fields.representative')}
                value={TODO}
              />
              <Field label={deT('imprint.fields.address')} value={TODO} />
              <Field
                label={deT('imprint.fields.email')}
                value="hello@synther.gmbh"
                href="mailto:hello@synther.gmbh"
              />
              {company.phone && (
                <Field
                  label={deT('imprint.fields.phone')}
                  value={company.phone}
                  href={phoneHref(company.phone)}
                />
              )}
              <Field
                label={deT('imprint.fields.register')}
                value={`${deT('imprint.fields.registerCourt')}: ${TODO} · ${deT('imprint.fields.registerNumber')}: ${TODO}`}
              />
              <Field label={deT('imprint.fields.vat')} value={TODO} />
              <Field label={deT('imprint.fields.taxNumber')} value={TODO + ' (optional)'} />
              <Field label={deT('imprint.fields.mediaLaw')} value={TODO} />
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
            <Field label={t('imprint.fields.provider')} value="Synther GmbH" />
            <Field label={t('imprint.fields.representative')} value={TODO} />
            <Field label={t('imprint.fields.address')} value={TODO} />
            <Field
              label={t('imprint.fields.email')}
              value="hello@synther.gmbh"
              href="mailto:hello@synther.gmbh"
            />
            {company.phone && (
              <Field
                label={t('imprint.fields.phone')}
                value={company.phone}
                href={phoneHref(company.phone)}
              />
            )}
            <Field
              label={t('imprint.fields.register')}
              value={`${t('imprint.fields.registerCourt')}: ${TODO} · ${t('imprint.fields.registerNumber')}: ${TODO}`}
            />
            <Field label={t('imprint.fields.vat')} value={TODO} />
            <Field label={t('imprint.fields.taxNumber')} value={TODO + ' (optional)'} />
            <Field label={t('imprint.fields.mediaLaw')} value={TODO} />
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

      {/* TODO callout — list of placeholders the user must fill in before
          the imprint is legally adequate. Renders last so it's hard to miss. */}
      <aside className="imprint__todo" aria-label={t('imprint.todoTitle')}>
        <div className="container">
          <div className="imprint__todo-inner reveal" ref={todoRef}>
            <p className="eyebrow">{t('imprint.todoEyebrow')}</p>
            <h2 className="imprint__todo-title">{t('imprint.todoTitle')}</h2>
            <p className="imprint__todo-body">{t('imprint.todoBody')}</p>
            <ul className="imprint__todo-list">
              {todos.map((it) => (
                <li key={it.label}>
                  <span className="mono imprint__todo-marker">{TODO}</span>
                  <span>{it.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

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
        body={deT('imprint.privacy.controllerBody')}
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
        body={deT('imprint.privacy.rightsBody')}
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
        body={t('imprint.english.controllerBody')}
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
        body={t('imprint.english.rightsBody')}
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