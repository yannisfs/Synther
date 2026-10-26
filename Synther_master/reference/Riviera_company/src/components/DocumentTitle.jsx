import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Sets <title> based on the current route + language.
 * Re-runs on every route change AND on every language change.
 *
 * Page keys live in title.<route>. Add a new route key to both dicts
 * to localise it; falling back to the default (Riviera Engineering)
 * for unknown routes keeps the site safe.
 */
const PAGE_TITLE_KEYS = {
  '/':              'title.home',
  '/capabilities':  'title.capabilities',
  '/automotive':    'title.automotive',
  '/founder':       'title.founder',
  '/contact':       'title.contact',
  '/admin':         'title.admin',
  '/legal/impressum':   'title.impressum',
  '/legal/datenschutz': 'title.datenschutz',
  '/legal/agb':         'title.agb',
  '/legal/ki-hinweis':  'title.aiDisclosure',
  '/legal/cookies':     'title.cookies',
};

const DocumentTitle = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const key = PAGE_TITLE_KEYS[pathname];
    const page = key ? t(key) : t('site.brand');
    const suffix = t('site.brand');
    document.title = page === suffix ? suffix : `${page} — ${suffix}`;
  }, [pathname, t, i18n.resolvedLanguage]);

  return null;
};

export default DocumentTitle;