import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
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
  if (m.startsWith('name')) return t('help.errorName')
  return t('help.errorGeneric')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function HelpPage() {
  const { t } = useTranslation()
  const headRef = useReveal()
  const urgentRef = useReveal()
  const consultRef = useReveal()
  const guidesRef = useReveal()

  // Reset scroll on direct navigation to /help.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    document.title = t('title.help')
  }, [t])

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
          </div>
        </div>
      </header>

      {/* Urgent help — email + ticket form. */}
      <section className="section capability__overview help__urgent-section">
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
                fields={['name', 'email', 'situation']}
                labels={{
                  name: t('help.urgent.form.name'),
                  email: t('help.urgent.form.email'),
                  situation: t('help.urgent.form.situation'),
                }}
                placeholders={{
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
      <section className="section capability__caps help__consult-section">
        <div className="container">
          <div className="capability__block reveal" ref={consultRef}>
            <p className="eyebrow">{t('help.consult.eyebrow')}</p>
            <h2 className="capability__h2">{t('help.consult.title')}</h2>
            <p className="section-lead">{t('help.consult.lead')}</p>

            <QuickConsultForm
              formId="help-consult-form"
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

      {/* Help & guides — placeholder index. */}
      <section className="section capability__overview help__guides-section">
        <div className="container">
          <div className="capability__block reveal" ref={guidesRef}>
            <p className="eyebrow">{t('help.guides.eyebrow')}</p>
            <h2 className="capability__h2">{t('help.guides.title')}</h2>
            <p className="section-lead">{t('help.guides.lead')}</p>

            <div className="help__guides-cta">
              <Link to="/help/guides" className="help__guides-link">
                {t('help.guides.browse')}
                <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <p className="help__guides-note mono">
                {t('help.guides.browseNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to home CTA */}
      <div className="container imprint__back-cta">
        <Link to="/" className="btn btn--ghost">
          {t('help.backCta')}
        </Link>
      </div>
    </article>
  )
}

// One form, parameterised for either the urgent or the consult use case.
// Both forms post to /api/quick-consult with the same field shape; the
// only differences are the labels and whether `preferredTime` is shown.
function QuickConsultForm({
  formId,
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
  const [form, setForm] = useState({ name: '', email: '', situation: '', preferredTime: '' })
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
    setForm({ name: '', email: '', situation: '', preferredTime: '' })
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

      <div className="contact__submit-row">
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
