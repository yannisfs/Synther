import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Settings, Check } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

// Banner shows when:
//   - no choice stored yet (first visit), OR
//   - stored choice is anything other than 'all' | 'none' | 'essential'
// Banner stays hidden when 'essential' or 'all' is set (no scripts to load either way today).
const shouldShow = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return !v || !['all', 'none', 'essential'].includes(v);
  } catch {
    return true;
  }
};

const setChoice = (choice) => {
  try { localStorage.setItem(STORAGE_KEY, choice); } catch { /* private mode */ }
};

const CookieBanner = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { setOpen(shouldShow()); }, []);

  if (!open) return null;

  const accept = () => { setChoice('all'); setOpen(false); };
  const reject = () => { setChoice('essential'); setOpen(false); };
  const saveSettings = (choice) => { setChoice(choice); setOpen(false); };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookie.settingsTitle')}
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-3xl mx-auto bg-slate-900 text-white shadow-2xl border border-slate-700">
        {!showSettings ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">
                {t('cookie.bannerTitle')}
              </h2>
              <button
                onClick={reject}
                aria-label={t('cookie.essentialOnly')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {t('cookie.bannerBody')}{' '}
              <Link to="/legal/cookies" className="underline underline-offset-2 hover:text-white">
                {t('cookie.learnMore')}
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={accept}
                className="inline-flex items-center justify-center text-xs font-bold tracking-widest uppercase text-slate-900 bg-white hover:bg-slate-200 transition-colors px-6 py-3"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('cookie.acceptAll')}
              </button>
              <button
                onClick={reject}
                className="inline-flex items-center justify-center text-xs font-bold tracking-widest uppercase text-white border border-slate-600 hover:border-white transition-colors px-6 py-3"
              >
                {t('cookie.essentialOnly')}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center justify-center text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-white transition-colors px-6 py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('cookie.settings')}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest">
                {t('cookie.settingsTitle')}
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                aria-label={t('cookie.essentialOnly')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <CategoryRow
                title={t('cookie.essentialTitle')}
                desc={t('cookie.essentialDesc')}
                checked disabled
              />
              <CategoryRow
                title={t('cookie.analyticsTitle')}
                desc={t('cookie.analyticsDesc')}
                checked={false}
                disabled
              />
              <CategoryRow
                title={t('cookie.marketingTitle')}
                desc={t('cookie.marketingDesc')}
                checked={false}
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => saveSettings('all')}
                className="inline-flex items-center justify-center text-xs font-bold tracking-widest uppercase text-slate-900 bg-white hover:bg-slate-200 transition-colors px-6 py-3"
              >
                {t('cookie.acceptAll')}
              </button>
              <button
                onClick={() => saveSettings('essential')}
                className="inline-flex items-center justify-center text-xs font-bold tracking-widest uppercase text-white border border-slate-600 hover:border-white transition-colors px-6 py-3"
              >
                {t('cookie.saveEssential')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryRow = ({ title, desc, checked, disabled }) => (
  <label className={`flex items-start gap-4 ${disabled ? 'opacity-70' : ''}`}>
    <span className={`mt-1 inline-flex w-5 h-5 items-center justify-center border ${checked ? 'bg-white border-white' : 'border-slate-500'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      {checked && <Check className="w-3 h-3 text-slate-900" />}
    </span>
    <span>
      <span className="block text-xs font-bold uppercase tracking-widest text-white">{title}</span>
      <span className="block text-sm text-slate-300 leading-relaxed mt-1">{desc}</span>
    </span>
  </label>
);

// "Cookie settings" floating button (visible after banner dismissed)
// so users can change their mind later. Hidden until first decision.
export const CookieSettingsButton = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(['all', 'none', 'essential'].includes(localStorage.getItem(STORAGE_KEY) || ''));
  }, []);
  if (!visible) return null;
  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
  return (
    <button
      onClick={reset}
      className="text-xs text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
      title={t('cookie.settingsButtonTitle')}
    >
      {t('cookie.settingsButton')}
    </button>
  );
};

export default CookieBanner;