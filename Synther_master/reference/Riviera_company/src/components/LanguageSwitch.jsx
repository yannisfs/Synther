import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { LANGUAGE_ORDER } from '../i18n/config.js';

/**
 * Language switcher for the header.
 *
 * Two visual variants:
 *   - "inline"  : DE | EN, separator between, micro-typography. Used in
 *                 desktop header AND inside the mobile drawer.
 *   - "chip"    : Single pill showing the current language; tap cycles to
 *                 the next language. Used in the mobile header bar so users
 *                 always see what language they're in.
 *
 * Hidden on /legal/* — legal pages stay German-only by policy.
 */
const LanguageSwitch = ({ variant = 'inline', className = '' }) => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  // Legal pages are German-only — no switcher.
  if (pathname.startsWith('/legal/')) return null;

  const current = i18n.resolvedLanguage || i18n.language || 'de';
  const currentIdx = Math.max(0, LANGUAGE_ORDER.findIndex((l) => current.startsWith(l)));
  const nextLng = LANGUAGE_ORDER[(currentIdx + 1) % LANGUAGE_ORDER.length];

  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={() => i18n.changeLanguage(nextLng)}
        aria-label={`Switch language to ${nextLng.toUpperCase()}`}
        className={`md:hidden inline-flex items-center justify-center
                    text-[10px] font-bold uppercase tracking-widest
                    text-slate-700 hover:text-slate-900
                    border border-slate-200 px-2.5 py-1.5
                    transition-colors ${className}`}
      >
        {current.toUpperCase().slice(0, 2)}
      </button>
    );
  }

  // variant === 'inline'
  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-center text-[10px] font-bold uppercase tracking-widest ${className}`}
    >
      {LANGUAGE_ORDER.map((lng, idx) => {
        const isActive = current.startsWith(lng);
        const isLast = idx === LANGUAGE_ORDER.length - 1;
        return (
          <React.Fragment key={lng}>
            <button
              type="button"
              onClick={() => i18n.changeLanguage(lng)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Switch language to ${lng.toUpperCase()}`}
              className={`transition-colors px-0 py-0 ${
                isActive
                  ? 'text-brand-red underline underline-offset-4'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {lng.toUpperCase()}
            </button>
            {!isLast && (
              <span aria-hidden="true" className="mx-2 text-slate-300">
                |
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default LanguageSwitch;