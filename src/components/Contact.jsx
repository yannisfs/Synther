import { useEffect, useRef, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import useReveal from '../hooks/useReveal.js'
import Icon from './Icon.jsx'
import { company, contactDirect, projectTypes, projectTypeKeys } from '../data/content.js'

const INITIAL = { name: '', email: '', project: '', message: '' }

// Trivial email shape check — mirrors what the server does so users get the
// hint before the round trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Map the server's English error strings to localized UI keys. The server
// returns one of: "Name is required.", "A valid email is required.",
// "Message is required.", "Consent to data processing is required.",
// "<field> is too long (max N).", "Too many submissions…" — we keep this
// in one function so client-side validation and server-error rendering stay
// in sync.
function localizeError(message, t) {
  if (!message) return t('contact.errorGeneric')
  const m = message.toLowerCase()
  if (m.includes('too many')) return t('contact.errorRateLimit')
  if (m.includes('consent to data processing')) return t('contact.errorConsent')
  if (m.includes('a valid email')) return t('contact.errorEmail')
  if (m.startsWith('message')) return t('contact.errorMessage')
  if (m.startsWith('name')) return t('contact.errorName')
  return t('contact.errorGeneric')
}

export default function Contact() {
  const { t } = useTranslation()
  const ref = useReveal()
  const [form, setForm] = useState(INITIAL)
  const [hp, setHp] = useState('') // honeypot — bots fill it, humans never see it
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  // Per-field errors keyed by field name. Empty when the field is valid.
  const [fieldErrors, setFieldErrors] = useState({})
  const [sent, setSent] = useState(false)
  const formRef = useRef(null)

  // V01: the "Discuss" links carry the project type in the hash
  // (#contact?type=<key>), both on the homepage cards and on the
  // discipline pages (/#contact?type=<key>).
  //
  // The type lives in the hash, not the query string — "#contact?type=…"
  // is not a valid fragment id, so the browser neither scrolls to the
  // form nor tells us anything on its own. We read it on mount and on
  // every hashchange, then do the scrolling ourselves.
  //
  // An unknown key is ignored and the field stays empty.
  useEffect(() => {
    const applyContactHash = () => {
      const m = window.location.hash.match(/^#contact\?type=([a-z]+)/)
      if (!m) return
      const project = projectTypeKeys[m[1]]
      if (!project || !projectTypes.includes(project)) return
      // The link wins over whatever is in the select: clicking a second
      // "Discuss" link has to move the selection, otherwise the form keeps
      // showing the first discipline. A manual choice made afterwards is
      // untouched — nothing fires another hashchange.
      setForm((f) => ({ ...f, project }))
      document.getElementById('contact')?.scrollIntoView()
    }
    applyContactHash()
    window.addEventListener('hashchange', applyContactHash)
    return () => window.removeEventListener('hashchange', applyContactHash)
  }, [])

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    // Clear that field's error as soon as the user starts fixing it.
    setFieldErrors((fe) => {
      if (!fe[field]) return fe
      const { [field]: _drop, ...rest } = fe
      return rest
    })
  }

  // Client-side validation. Returns an object of per-field errors. Empty
  // object means the form is ready to submit. This is the same shape that
  // gets rendered inline next to each field.
  const validate = (values, consentChecked) => {
    const errs = {}
    if (!values.name.trim()) errs.name = t('contact.errorName')
    if (!values.email.trim()) {
      errs.email = t('contact.errorEmail')
    } else if (!EMAIL_RE.test(values.email.trim())) {
      errs.email = t('contact.errorEmailInvalid')
    }
    if (!values.message.trim()) errs.message = t('contact.errorMessage')
    if (!consentChecked) errs.consent = t('contact.errorConsent')
    return errs
  }

  // POST to the Pages Function. The D1 row is the durable record; the
  // user's mail client is not involved anymore.
  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Client-side guard: catch empty / malformed fields before we burn a
    // round trip. We still let the server be authoritative — if anything
    // slips through, server errors are surfaced via localizeError below.
    const clientErrs = validate(form, consent)
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs)
      setError(t('contact.errorFixFields'))
      // Move focus to the first invalid field so keyboard / screen-reader
      // users land where the problem is.
      const order = ['name', 'email', 'message']
      const firstBad = order.find((k) => clientErrs[k])
      if (firstBad) {
        const el = formRef.current?.querySelector(`[name="${firstBad}"]`)
        if (el && typeof el.focus === 'function') el.focus()
      }
      return
    }

    setFieldErrors({})
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          project: form.project,
          message: form.message,
          hp,
          consent,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setError(localizeError(data?.error, t))
        return
      }
      setSent(true)
    } catch (err) {
      console.error('Contact submit failed', err)
      // In Vite-only dev (`npm run dev`) the Pages Function isn't running, so
      // fetch fails with a TypeError. Surface a hint to use `npm run cf:dev`
      // for end-to-end testing. In production / cf:dev this code path is only
      // reached on real network errors.
      if (import.meta.env.DEV && err instanceof TypeError) {
        setError(t('contact.errorDevHint'))
      } else {
        setError(t('contact.errorGeneric'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact__inner reveal" ref={ref}>
        <div className="section-head">
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2 className="contact__title">{t('contact.title')}</h2>
          <p className="contact__lead">{t('contact.lead')}</p>
        </div>

        <div className="contact__grid">
          {/* Form column */}
          <div className="contact__formcol">
            {sent ? (
              <div className="contact__success" role="status">
                <Icon name="check" size={36} className="contact__success-icon" />
                <h3 className="contact__success-title">{t('contact.successTitle')}</h3>
                <p className="contact__success-body">
                  <Trans
                    i18nKey="contact.successBody"
                    values={{ email: company.email }}
                    components={{ 1: <a href={`mailto:${company.email}`} /> }}
                  />
                </p>
                <button
                  type="button"
                  className="contact__again mono"
                  onClick={() => {
                    setForm(INITIAL)
                    setHp('')
                    setConsent(false)
                    setError(null)
                    setFieldErrors({})
                    setSent(false)
                  }}
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form
                className="contact__form"
                onSubmit={onSubmit}
                noValidate
                ref={formRef}
                aria-describedby={error ? 'contact-form-error' : undefined}
              >
                {/* Honeypot — hidden from sighted users and screen readers,
                    positioned offscreen. Real users never fill it; bots do. */}
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

                <div className="contact__row">
                  <label className="contact__field">
                    <span className="contact__label mono">{t('contact.name')}</span>
                    <input
                      className={`contact__input${fieldErrors.name ? ' contact__input--invalid' : ''}`}
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={update('name')}
                      disabled={submitting}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'contact-error-name' : undefined}
                    />
                    {fieldErrors.name && (
                      <span id="contact-error-name" className="contact__field-error mono" role="alert">
                        {fieldErrors.name}
                      </span>
                    )}
                  </label>
                  <label className="contact__field">
                    <span className="contact__label mono">{t('contact.email')}</span>
                    <input
                      className={`contact__input${fieldErrors.email ? ' contact__input--invalid' : ''}`}
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={update('email')}
                      disabled={submitting}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'contact-error-email' : undefined}
                    />
                    {fieldErrors.email && (
                      <span id="contact-error-email" className="contact__field-error mono" role="alert">
                        {fieldErrors.email}
                      </span>
                    )}
                  </label>
                </div>

                <label className="contact__field">
                  <span className="contact__label mono">{t('contact.projectType')}</span>
                  <select
                    className="contact__input contact__select"
                    name="project"
                    value={form.project}
                    onChange={update('project')}
                    disabled={submitting}
                  >
                    <option value="">{t('contact.projectTypePlaceholder')}</option>
                    {projectTypes.map((p) => (
                      <option key={p} value={p}>
                        {t(`contact.projectTypes.${p}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="contact__field">
                  <span className="contact__label mono">{t('contact.message')}</span>
                  <textarea
                    className={`contact__input contact__textarea${fieldErrors.message ? ' contact__input--invalid' : ''}`}
                    name="message"
                    rows={5}
                    required
                    placeholder={t('contact.messagePlaceholder')}
                    value={form.message}
                    onChange={update('message')}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'contact-error-message' : undefined}
                  />
                  {fieldErrors.message && (
                    <span id="contact-error-message" className="contact__field-error mono" role="alert">
                      {fieldErrors.message}
                    </span>
                  )}
                </label>

                <div
                  className={`contact__consent${fieldErrors.consent ? ' contact__consent--invalid' : ''}`}
                >
                  <label className="contact__consent-row">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked)
                        if (e.target.checked) {
                          setFieldErrors((fe) => {
                            const { consent: _drop, ...rest } = fe
                            return rest
                          })
                        }
                      }}
                      required
                      disabled={submitting}
                      aria-invalid={Boolean(fieldErrors.consent)}
                      aria-describedby={fieldErrors.consent ? 'contact-error-consent' : undefined}
                    />
                    <span>
                      <Trans
                        i18nKey="contact.consent"
                        components={{
                          1: <Link to="/imprint" className="contact__consent-link" />,
                        }}
                      />
                    </span>
                  </label>
                  {fieldErrors.consent && (
                    <span id="contact-error-consent" className="contact__field-error mono" role="alert">
                      {fieldErrors.consent}
                    </span>
                  )}
                </div>

                {error && (
                  <p id="contact-form-error" className="contact__error mono" role="alert">
                    {error}
                  </p>
                )}

                <div className="contact__submit-row">
                  <button
                    type="submit"
                    className="btn btn--primary contact__submit"
                    disabled={submitting}
                  >
                    {submitting ? t('contact.sending') : t('contact.submit')}{' '}
                    <span className="arrow">→</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Direct sidebar */}
          <aside className="contact__direct">
            <h3 className="contact__direct-title mono">{t('contact.directTitle')}</h3>
            <ul className="contact__direct-list">
              {contactDirect.map((row) => {
                const label = t(`contact.direct.${row.key}.label`)
                const value =
                  row.key === 'email'
                    ? company.email
                    : row.key === 'phone'
                      ? company.phone
                      : t(`contact.direct.${row.key}.value`, {
                          // D5: the region the operator is based in. The
                          // country (site.location) stays in the schema
                          // markup as the service area — this is where the
                          // work comes from.
                          region: t('site.region'),
                        })
                return (
                  <li className="contact__direct-row" key={row.key}>
                    <Icon
                      name={row.icon}
                      size={20}
                      className="contact__direct-icon"
                    />
                    <div>
                      <div className="contact__direct-label mono">{label}</div>
                      {row.href ? (
                        <a className="contact__direct-value" href={row.href}>
                          {value}
                        </a>
                      ) : (
                        <div className="contact__direct-value">{value}</div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}