import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, MapPin, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { PALETTE } from '../lib/palette';

const Contact = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', project: '', message: '', hp: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | ok | err
  const [errorMsg, setErrorMsg] = useState('');
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const projectTypeKeys = ['digital', 'manufacturing', 'software', 'ai', 'automotive', 'other'];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setStatus('err');
      setErrorMsg(t('contact.consentError'));
      return;
    }
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent: true }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: t('contact.unexpectedResponse') }));
      if (res.ok && data.ok) {
        setStatus('ok');
        setForm({ name: '', email: '', project: '', message: '', hp: '' });
        setConsent(false);
      } else if (res.status === 429) {
        setStatus('err');
        setErrorMsg(data.error || t('contact.rateLimitError'));
      } else {
        setStatus('err');
        setErrorMsg(data.error || t('contact.genericError'));
      }
    } catch (err) {
      setStatus('err');
      setErrorMsg(t('contact.networkError'));
    }
  };

  return (
    <>
      {/* Header */}
      <section className="relative bg-[#FCFCFC] overflow-hidden pt-16 pb-16 border-b border-slate-200 min-h-[420px]">
        <div aria-hidden="true" className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl min-h-[280px] md:min-h-[300px] flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('contact.kicker')}</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-8 break-words">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              {status === 'ok' ? (
                <div className="border border-slate-200 p-12 bg-slate-50">
                  <CheckCircle2 className="w-10 h-10 mb-6" style={{ color: PALETTE.green }} />
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('contact.successTitle')}</h2>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    {t('contact.successBody')}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-brand-red transition-colors"
                  >
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{t('contact.formName')}</label>
                      <input
                        id="name" type="text" required value={form.name} onChange={update('name')}
                        disabled={status === 'sending'}
                        className="w-full border-0 border-b-2 border-slate-200 focus:border-slate-900 focus:ring-0 px-0 py-3 text-slate-900 bg-transparent transition-colors disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{t('contact.formEmail')}</label>
                      <input
                        id="email" type="email" required value={form.email} onChange={update('email')}
                        disabled={status === 'sending'}
                        className="w-full border-0 border-b-2 border-slate-200 focus:border-slate-900 focus:ring-0 px-0 py-3 text-slate-900 bg-transparent transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="project" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{t('contact.formProject')}</label>
                    <select
                      id="project" value={form.project} onChange={update('project')}
                      disabled={status === 'sending'}
                      className="w-full border-0 border-b-2 border-slate-200 focus:border-slate-900 focus:ring-0 px-0 py-3 text-slate-900 bg-transparent transition-colors disabled:opacity-50"
                    >
                      <option value="">{t('contact.formProjectPlaceholder')}</option>
                      {projectTypeKeys.map((k) => (
                        <option key={k} value={t(`contact.projectTypes.${k}`)}>
                          {t(`contact.projectTypes.${k}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{t('contact.formMessage')}</label>
                    <textarea
                      id="message" rows={6} required value={form.message} onChange={update('message')}
                      placeholder={t('contact.formMessagePlaceholder')}
                      disabled={status === 'sending'}
                      className="w-full border-0 border-b-2 border-slate-200 focus:border-slate-900 focus:ring-0 px-0 py-3 text-slate-900 bg-transparent transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  {/* Honeypot — hidden from real users, visible to dumb bots.
                      aria-hidden + absolute off-screen so it never traps keyboard users. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
                    <label htmlFor="hp">Leave this empty</label>
                    <input
                      id="hp" type="text" tabIndex={-1} autoComplete="off"
                      value={form.hp} onChange={update('hp')}
                    />
                  </div>

                  {status === 'err' && (
                    <div role="alert" className="flex items-start border-l-2 border-brand-red bg-red-50 px-4 py-3">
                      <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-brand-red" />
                      <p className="text-sm text-slate-700">{errorMsg}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        required
                        className="mt-1 w-4 h-4 flex-shrink-0 accent-brand-red"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        {t('contact.consentPrefix')}{' '}
                        <Link to="/legal/datenschutz" className="text-brand-red underline underline-offset-2 hover:no-underline">
                          {t('contact.consentLink')}
                        </Link>{' '}
                        {t('contact.consentSuffix')}
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-2">
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      {t('contact.footerNote')}
                    </p>
                    <button
                      type="submit"
                      disabled={status === 'sending' || !consent}
                      className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-white bg-slate-900 hover:bg-brand-red transition-colors px-8 py-4 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('contact.sendingButton')}
                        </>
                      ) : (
                        <>
                          {t('contact.sendButton')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-100 p-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">{t('contact.directLabel')}</h3>
                <ul className="space-y-8">
                  <li className="flex items-start">
                    <Mail className="w-5 h-5 mr-4 mt-1 flex-shrink-0" style={{ color: PALETTE.red }} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t('contact.emailLabel')}</div>
                      <a href="mailto:hello@riviera-engineering.example" className="text-sm font-semibold text-slate-900 hover:text-brand-red transition-colors">
                        hello@riviera-engineering.example
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="w-5 h-5 mr-4 mt-1 flex-shrink-0" style={{ color: PALETTE.blue }} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t('contact.regionLabel')}</div>
                      <div className="text-sm font-semibold text-slate-900">{t('contact.regionValue')}</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 mr-4 mt-1 flex-shrink-0" style={{ color: PALETTE.warm }} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t('contact.responseLabel')}</div>
                      <div className="text-sm font-semibold text-slate-900">{t('contact.responseValue')}</div>
                    </div>
                  </li>
                </ul>

                <div className="mt-10 pt-8 border-t border-slate-200">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{t('contact.goodToKnowTitle')}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('contact.goodToKnowBody')}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;