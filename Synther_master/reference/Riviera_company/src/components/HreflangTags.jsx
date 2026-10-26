import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { SUPPORTED_LANGUAGES } from '../i18n/config.js';

/**
 * Renders <link rel="alternate" hreflang="…"> tags into <head> pointing at the
 * current URL. Because the site is content-switched (not URL-switched), every
 * hreflang variant points to the SAME URL — this tells Google which languages
 * are available on this page, but does not change user-visible routes.
 *
 * Mounted once at the App root.
 */
const HreflangTags = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const url = `${window.location.origin}${pathname}${search}`;

    const head = document.head;
    const created = [];

    SUPPORTED_LANGUAGES.forEach((lng) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lng;
      link.href = url;
      link.setAttribute('data-hreflang', lng);
      head.appendChild(link);
      created.push(link);
    });

    // x-default for languages we don't have explicit translations for.
    const xdef = document.createElement('link');
    xdef.rel = 'alternate';
    xdef.hreflang = 'x-default';
    xdef.href = url;
    xdef.setAttribute('data-hreflang', 'x-default');
    head.appendChild(xdef);
    created.push(xdef);

    return () => {
      created.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
    };
  }, [pathname, search]);

  return null;
};

export default HreflangTags;