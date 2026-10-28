// GmbH imprint template — ACTIVE.
//
// This is the imprint that ships: the site identifies the operator as
// the Synther GmbH, and this page is its legally-binding Impressum
// (§ 5 DDG) and Datenschutzerklärung (Art. 13 DSGVO). The English
// blocks that follow are a courtesy translation.
//
// The file layout is unchanged: src/pages/ImprintPage.jsx is a one-line
// re-export shim that points here. ImprintPage.private.jsx stays next
// to it as the private-person fallback (it was the active template
// while the registration was pending); flipping the shim back is one
// line, plus the legalIdentity values in src/data/content.js.
//
// Where the values come from:
//   - provider, address, type → src/data/content.js (legalIdentity)
//   - email, phone, managing director → src/data/content.js (company)
//   - register / VAT / tax rows → this file, as placeholders until the
//     commercial-register extract and the tax number exist
//
// The German and English legal prose itself is NOT written here: it
// lives in src/locales/de.json and src/locales/en.json and is read
// through fixedT('de') / useTranslation(). The only thing this file
// substitutes into those strings is the postal address and the email
// address, because those are data (see fillIdentity below) and would
// otherwise have to be edited into four locale strings by hand.

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import usePageSeo from '../hooks/usePageSeo.js'
import { fixedT } from '../lib/fixedT.js'
import { company, legalIdentity, phoneHref } from '../data/content.js'

// The identity values, read from the one place they are maintained.
const NAME = legalIdentity.legalName
const ADDRESS = legalIdentity.address
const EMAIL = company.email
const REPRESENTATIVE = company.representative

// The registration data that does not exist yet.
//
// `null` means "not yet known": the row still renders, with the
// placeholder, and the TODO callout lists it. Fill in the value and the
// row shows it; delete the row and its callout entry to drop it.
// These are never guessed — they come from the commercial-register
// extract (court, number) and the tax office (VAT ID, tax number).
const REGISTER_COURT = null
const REGISTER_NUMBER = null
const VAT_ID = null
const TAX_NUMBER = null

// TODO marker string; render the inline placeholder text as-is so it
// stays findable with a project-wide grep.
const TODO = '[TODO — replace]'

// The locale files carry the postal address (and the email address) as
// text, with the address as a placeholder. Both are data, so they are
// substituted at render time — that way one value in
// src/data/content.js drives the footer, the structured data and every
// sentence of the legal text. The German legal wording itself stays
// untouched.
const fillIdentity = (text) =>
  text.replace('[TODO - replace]', ADDRESS).replace('contact@synther.eu', EMAIL)

// The /imprint page. The legally-binding German Impressum and
// Datenschutzerklärung are the primary content (§ 5 DDG, Art. 13 DSGVO).
// English parallel blocks follow each German block as a courtesy.
//
// `deT` is a t() bound to the 'de' locale regardless of the active
// i18n.language — the DE blocks must always render in German. `t` is the
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

  // Canonical (trailing-slashed to match what Pages serves), og:url and
  // this page's own social title/description.
  usePageSeo({
    path: '/imprint',
    title: t('title.imprint'),
    description: t('imprint.seo.description'),
  })

  // The placeholders still open in the field table, listed here so the
  // callout names exactly what is missing. When the last one is filled
  // in, the callout disappears on its own.
  const todos = [
    { label: deT('imprint.fields.registerCourt'), open: REGISTER_COURT == null },
    { label: deT('imprint.fields.registerNumber'), open: REGISTER_NUMBER == null },
    { label: deT('imprint.fields.vat'), open: VAT_ID == null },
    { label: deT('imprint.fields.taxNumber') + ' (optional)', open: TAX_NUMBER == null },
  ].filter((it) => it.open)

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
              <Field label={deT('imprint.fields.provider')} value={NAME} />
              <Field
                label={deT('imprint.fields.representative')}
                value={REPRESENTATIVE}
              />
              <Field label={deT('imprint.fields.address')} value={ADDRESS} />
              <Field
                label={deT('imprint.fields.email')}
                value={EMAIL}
                href={`mailto:${EMAIL}`}
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
                value={`${deT('imprint.fields.registerCourt')}: ${REGISTER_COURT ?? TODO} · ${deT('imprint.fields.registerNumber')}: ${REGISTER_NUMBER ?? TODO}`}
              />
              <Field label={deT('imprint.fields.vat')} value={VAT_ID ?? TODO} />
              <Field
                label={deT('imprint.fields.taxNumber')}
                value={TAX_NUMBER ? TAX_NUMBER : TODO + ' (optional)'}
              />
              {/* The managing director is named as the person responsible
                  under § 18 (2) MStV. Change company.representative in
                  src/data/content.js if a different person is designated. */}
              <Field
                label={deT('imprint.fields.mediaLaw')}
                value={REPRESENTATIVE}
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
            <Field label={t('imprint.fields.provider')} value={NAME} />
            <Field
              label={t('imprint.fields.representative')}
              value={REPRESENTATIVE}
            />
            <Field label={t('imprint.fields.address')} value={ADDRESS} />
            <Field
              label={t('imprint.fields.email')}
              value={EMAIL}
              href={`mailto:${EMAIL}`}
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
              value={`${t('imprint.fields.registerCourt')}: ${REGISTER_COURT ?? TODO} · ${t('imprint.fields.registerNumber')}: ${REGISTER_NUMBER ?? TODO}`}
            />
            <Field label={t('imprint.fields.vat')} value={VAT_ID ?? TODO} />
            <Field
              label={t('imprint.fields.taxNumber')}
              value={TAX_NUMBER ? TAX_NUMBER : TODO + ' (optional)'}
            />
            <Field
              label={t('imprint.fields.mediaLaw')}
              value={REPRESENTATIVE}
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

      {/* TODO callout — the placeholders that are still open. Renders last
          so it's hard to miss, and disappears on its own once the last
          one is filled in. */}
      {todos.length > 0 && (
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
      )}

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
        body={fillIdentity(deT('imprint.privacy.controllerBody'))}
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
        body={fillIdentity(deT('imprint.privacy.rightsBody'))}
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
        body={fillIdentity(t('imprint.english.controllerBody'))}
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
        body={fillIdentity(t('imprint.english.rightsBody'))}
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
