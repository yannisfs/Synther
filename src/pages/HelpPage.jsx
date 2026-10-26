import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import usePageSeo from '../hooks/usePageSeo.js'
import { company } from '../data/content.js'
import Icon from '../components/Icon.jsx'

// The /help page. Three sections:
//   1. Urgent help   — email + a Sev-1 ticket form (posts to /api/quick-consult)
//   2. Quick consult — a 30-min consult request form (same endpoint)
//   3. Help & guides — placeholder index with a "Browse all guides" link
//
// Both forms share the same backend; v1 doesn't route them differently.
// The page mirrors src/pages/CookiePage.jsx structurally (same hero,
// breadcrumb, back-to-home CTA, useReveal per block).

// Map the server's English error strings to localized UI keys. Mirrors
// the same logic in src/components/Contact.jsx#localizeError so the two
// forms present error messages the same way.
function localizeQuickError(message, t) {
  if (!message) return t('help.errorGeneric')
  const m = message.toLowerCase()
  if (m.includes('too many')) return t('help.errorRateLimit')
  if (m.includes('consent to data processing')) return t('help.errorConsent')
  if (m.includes('a valid email')) return t('help.errorEmail')
  if (m.includes('describe the situation')) return t('help.errorSituation')
  if (m.includes('callback phone')) return t('help.urgent.form.errorCallbackPhone')
  if (m.includes('company or system')) return t('help.urgent.form.errorCompanySystem')
  if (m.startsWith('name')) return t('help.errorName')
  return t('help.errorGeneric')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function HelpPage() {
  const { t } = useTranslation()
  const headRef = useReveal()
  const urgentRef = useReveal()
  const consultRef = useReveal()
  // (the "Help & guides" section was removed in S02 — D10 = hide)

  // Reset scroll on direct navigation to /help.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    document.title = t('title.help')
  }, [t])

  // S35/S36: canonical (trailing-slashed to match what Pages serves),
  // og:url, and this page's own social title/description.
  usePageSeo({ path: '/help', title: t('title.help'), description: t('help.seo.description') })

  // Urgent-help state: whether the inline ticket form is visible.
  const [ticketOpen, setTicketOpen] = useState(false)

  return (
    <article className="capability imprint help">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('help.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('help.breadcrumbCurrent')}</li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true" />
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={headRef}>
            <p className="eyebrow">{t('help.kicker')}</p>
            <h1 className="capability__title">{t('help.title')}</h1>
            <p className="capability__lead">{t('help.lead')}</p>

            {/* D4: both ways in, side by side in the first screen. A
                customer with a live incident and a prospect who wants a
                second opinion have to find their own path without reading
                the page first — the nav label alone ("Support") can't
                tell either of them where to go. */}
            <div className="help__paths">
              <a className="help__path" href="#urgent">
                <span className="help__path-label mono">
                  {t('help.paths.urgentLabel')}
                </span>
                <span className="help__path-title">{t('help.paths.urgentTitle')}</span>
                <span className="help__path-hint">{t('help.paths.urgentHint')}</span>
              </a>
              <a className="help__path" href="#consult">
                <span className="help__path-label mono">
                  {t('help.paths.consultLabel')}
                </span>
                <span className="help__path-title">{t('help.paths.consultTitle')}</span>
                <span className="help__path-hint">{t('help.paths.consultHint')}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Urgent help — email + ticket form. */}
      <section
        className="section capability__overview help__urgent-section"
        id="urgent"
      >
        <div className="container">
          <div className="capability__block reveal" ref={urgentRef}>
            <p className="eyebrow">{t('help.urgent.eyebrow')}</p>
            <h2 className="capability__h2">{t('help.urgent.title')}</h2>
            <p className="section-lead">{t('help.urgent.lead')}</p>

            <div className="help__urgent-cta">
              <a
                className="help__urgent-mail"
                href={`mailto:urgent@${company.email.split('@')[1]}`}
              >
                {t('help.urgent.emailLabel')}
              </a>
              <button
                type="button"
                className={`btn ${ticketOpen ? 'btn--ghost' : 'btn--primary'} help__urgent-toggle`}
                onClick={() => setTicketOpen((v) => !v)}
              >
                {ticketOpen ? t('help.urgent.cancelTicket') : t('help.urgent.openTicket')}
              </button>
            </div>

            {ticketOpen && (
              <QuickConsultForm
                formId="help-urgent-form"
                kind="urgent"
                fields={['name', 'email', 'callbackPhone', 'company', 'situation']}
                labels={{
                  name: t('help.urgent.form.name'),
                  email: t('help.urgent.form.email'),
                  callbackPhone: t('help.urgent.form.callbackPhoneLabel'),
                  company: t('help.urgent.form.companySystemLabel'),
                  situation: t('help.urgent.form.situation'),
                }}
                placeholders={{
                  callbackPhone: t('help.urgent.form.callbackPhonePlaceholder'),
                  company: t('help.urgent.form.companySystemPlaceholder'),
                  situation: t('help.urgent.form.situationPlaceholder'),
                }}
                consentKey="help.urgent.form.consent"
                submitLabel={t('help.urgent.form.submit')}
                sendingLabel={t('help.urgent.form.sending')}
                successTitle={t('help.urgent.form.successTitle')}
                successBody={t('help.urgent.form.successBody')}
                sendAnotherLabel={t('help.urgent.form.sendAnother')}
              />
            )}
          </div>
        </div>
      </section>

      {/* Quick consulting — 30-min call request. */}
      <section className="section capability__caps help__consult-section" id="consult">
        <div className="container">
          <div className="capability__block reveal" ref={consultRef}>
            <p className="eyebrow">{t('help.consult.eyebrow')}</p>
            <h2 className="capability__h2">{t('help.consult.title')}</h2>
            <p className="section-lead">{t('help.consult.lead')}</p>

            <QuickConsultForm
              formId="help-consult-form"
              kind="consult"
              fields={['name', 'email', 'situation', 'preferredTime']}
              labels={{
                name: t('help.consult.form.name'),
                email: t('help.consult.form.email'),
                situation: t('help.consult.form.situation'),
                preferredTime: t('help.consult.form.preferredTime'),
              }}
              placeholders={{
                situation: t('help.consult.form.situationPlaceholder'),
                preferredTime: t('help.consult.form.preferredTimePlaceholder'),
              }}
              consentKey="help.consult.form.consent"
              submitLabel={t('help.consult.form.submit')}
              sendingLabel={t('help.consult.form.sending')}
              successTitle={t('help.consult.form.successTitle')}
              successBody={t('help.consult.form.successBody')}
              sendAnotherLabel={t('help.consult.form.sendAnother')}
            />
          </div>
        </div>
      </section>

      {/* V32: the lone "Back to home" section is gone — the logo and the
          breadcrumb already lead home, and the section's padding left a
          band of empty space at the bottom of the page. */}
    </article>
  )
}

// One form, parameterised for either the urgent or the consult use case.
// Both forms post to /api/quick-consult; `kind` tells the server which
// optional fields are mandatory. The rendered field set is driven by the
// `fields` array, so the urgent form can ask for a callback phone number
// and a company/system (S30) while the consult form asks for a preferred
// time instead.
const EMPTY_FORM = {
  name: '',
  email: '',
  callbackPhone: '',
  company: '',
  situation: '',
  preferredTime: '',
}

function QuickConsultForm({
  formId,
  kind = 'consult',
  fields,
  labels,
  placeholders,
  consentKey,
  submitLabel,
  sendingLabel,
  successTitle,
  successBody,
  sendAnotherLabel,
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [hp, setHp] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [sent, setSent] = useState(false)
  const formRef = useRef(null)

  const update = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((fe) => {
      if (!fe[field]) return fe
      const { [field]: _drop, ...rest } = fe
      return rest
    })
  }

  const validate = () => {
    const fe = {}
    if (!form.name.trim()) fe.name = t('help.errorName')
    if (!EMAIL_RE.test(form.email)) fe.email = t('help.errorEmail')
    // S30: the urgent ticket can't be worked without these two. Keyed on
    // `fields`, not on `kind`, so a form that doesn't render them never
    // blocks on them.
    if (fields.includes('callbackPhone') && !form.callbackPhone.trim()) {
      fe.callbackPhone = t('help.urgent.form.errorCallbackPhone')
    }
    if (fields.includes('company') && !form.company.trim()) {
      fe.company = t('help.urgent.form.errorCompanySystem')
    }
    if (!form.situation.trim()) fe.situation = t('help.errorSituation')
    return fe
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const fe = validate()
    setFieldErrors(fe)
    if (Object.keys(fe).length > 0) {
      setError(t('help.errorFixFields'))
      // Focus the first invalid field for keyboard users.
      const first = Object.keys(fe)[0]
      const el = formRef.current?.querySelector(`[name="${first}"]`)
      el?.focus()
      return
    }
    if (!consent) {
      setError(t('help.errorConsent'))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quick-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          situation: form.situation,
          preferredTime: form.preferredTime,
          callbackPhone: form.callbackPhone,
          company: form.company,
          kind,
          hp,
          consent,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        setError(localizeQuickError(data?.error, t))
        return
      }
      setSent(true)
    } catch (err) {
      console.error('Quick-consult submit failed', err)
      if (import.meta.env.DEV) {
        setError(t('help.errorDevHint'))
      } else {
        setError(t('help.errorGeneric'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setHp('')
    setConsent(false)
    setError(null)
    setFieldErrors({})
    setSent(false)
  }

  if (sent) {
    return (
      <div className="help__success contact__success" role="status" aria-live="polite">
        <Icon name="check" size={36} className="contact__success-icon" />
        <h3 className="help__success-title contact__success-title">{successTitle}</h3>
        <p className="help__success-body contact__success-body">{successBody}</p>
        <button
          type="button"
          className="contact__again mono"
          onClick={reset}
        >
          {sendAnotherLabel}
        </button>
      </div>
    )
  }

  return (
    <form
      id={formId}
      ref={formRef}
      className="help__form contact__form"
      onSubmit={onSubmit}
      noValidate
    >
      {/* Honeypot — same pattern as src/components/Contact.jsx */}
      <div className="contact__hp" aria-hidden="true">
        <label>
          <span>Leave this field empty</span>
          <input
            type="text"
            name="hp"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="help__form-row contact__row">
        {fields.includes('name') && (
          <label className="contact__field">
            <span className="contact__label mono">{labels.name}</span>
            <input
              className={`contact__input${fieldErrors.name ? ' contact__input--invalid' : ''}`}
              type="text"
              name="name"
              required
              value={form.name}
              onChange={update('name')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <span className="contact__field-error mono" role="alert">
                {fieldErrors.name}
              </span>
            )}
          </label>
        )}
        {fields.includes('email') && (
          <label className="contact__field">
            <span className="contact__label mono">{labels.email}</span>
            <input
              className={`contact__input${fieldErrors.email ? ' contact__input--invalid' : ''}`}
              type="email"
              name="email"
              required
              value={form.email}
              onChange={update('email')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <span className="contact__field-error mono" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </label>
        )}
        {/* S30: an urgent ticket needs a phone number to call back on and
            a statement of what is affected — email alone is not actionable
            when something is, in the headline copy, "on fire". */}
        {fields.includes('callbackPhone') && (
          <label className="contact__field">
            <span className="contact__label mono">{labels.callbackPhone}</span>
            <input
              className={`contact__input${fieldErrors.callbackPhone ? ' contact__input--invalid' : ''}`}
              type="tel"
              name="callbackPhone"
              required
              placeholder={placeholders.callbackPhone}
              value={form.callbackPhone}
              onChange={update('callbackPhone')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.callbackPhone)}
            />
            {fieldErrors.callbackPhone && (
              <span className="contact__field-error mono" role="alert">
                {fieldErrors.callbackPhone}
              </span>
            )}
          </label>
        )}
        {fields.includes('company') && (
          <label className="contact__field">
            <span className="contact__label mono">{labels.company}</span>
            <input
              className={`contact__input${fieldErrors.company ? ' contact__input--invalid' : ''}`}
              type="text"
              name="company"
              required
              placeholder={placeholders.company}
              value={form.company}
              onChange={update('company')}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.company)}
            />
            {fieldErrors.company && (
              <span className="contact__field-error mono" role="alert">
                {fieldErrors.company}
              </span>
            )}
          </label>
        )}
      </div>

      {fields.includes('situation') && (
        <label className="contact__field">
          <span className="contact__label mono">{labels.situation}</span>
          <textarea
            className={`contact__input contact__textarea${fieldErrors.situation ? ' contact__input--invalid' : ''}`}
            name="situation"
            rows={4}
            required
            placeholder={placeholders.situation}
            value={form.situation}
            onChange={update('situation')}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.situation)}
          />
          {fieldErrors.situation && (
            <span className="contact__field-error mono" role="alert">
              {fieldErrors.situation}
            </span>
          )}
        </label>
      )}

      {fields.includes('preferredTime') && (
        <label className="contact__field">
          <span className="contact__label mono">{labels.preferredTime}</span>
          <input
            className="contact__input"
            type="text"
            name="preferredTime"
            placeholder={placeholders.preferredTime}
            value={form.preferredTime}
            onChange={update('preferredTime')}
            disabled={submitting}
          />
        </label>
      )}

      <div className={`contact__consent${error && !consent ? ' contact__consent--invalid' : ''}`}>
        <label className="contact__consent-row">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={submitting}
          />
          <span>
            <Trans
              i18nKey={consentKey}
              components={{
                1: <Link to="/imprint" className="contact__consent-link" />,
              }}
            />
          </span>
        </label>
      </div>

      <div className="contact__submit-row help__submit-row">
        <button
          type="submit"
          className="btn btn--primary contact__submit"
          disabled={submitting}
        >
          {submitting ? sendingLabel : submitLabel}
        </button>
        {error && (
          <p id={`${formId}-error`} className="contact__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
