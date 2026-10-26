import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Cog } from 'lucide-react';
import CookieBanner, { CookieSettingsButton } from './CookieBanner';
import LanguageSwitch from './LanguageSwitch';

const STRIPE_COLORS = [
  '#CC0000', '#888888', '#30A2DA', '#F47321', '#004225',
];

const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV = [
    { label: t('nav.capabilities'), to: '/capabilities' },
    { label: t('nav.automotive'),   to: '/automotive' },
    { label: t('nav.founder'),      to: '/founder' },
    { label: t('nav.contact'),      to: '/contact' },
  ];

  return (
    <header
      className={`fixed w-full top-1 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">
              {t('site.brand')}<span className="font-light tracking-normal text-slate-500 ml-1">{t('site.brandLight')}</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-10">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-xs font-bold tracking-widest uppercase transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitch variant="inline" />
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hidden md:flex items-center text-xs font-bold tracking-widest uppercase transition-colors group ${
                  isActive ? 'text-brand-red' : 'text-slate-900 hover:text-brand-red'
                }`
              }
            >
              {t('nav.engage')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>

          {/* Mobile header controls — chip on the left of the cog so the current
              language is always visible without opening the menu. */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitch variant="chip" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`text-slate-900 p-2 -mr-2 transition-transform duration-500 ${
                mobileMenuOpen ? 'rotate-[180deg]' : 'rotate-0'
              }`}
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Cog className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>

          {mobileMenuOpen && (
            <nav
              id="mobile-menu"
              className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-md"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-slate-100 hover:bg-slate-50 ${
                      isActive ? 'text-slate-900 bg-slate-50' : 'text-slate-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {/* Inline DE | EN — same visual pattern as the desktop header. */}
              <div className="px-6 py-4 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <span className="mr-3">{t('langSwitch.label')}</span>
                <LanguageSwitch variant="inline" />
              </div>
              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-900 hover:bg-slate-50"
              >
                {t('nav.engage')}
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-12 border-b border-slate-200 pb-12 mb-8">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase text-slate-900 block mb-6">
              {t('site.brand')}<span className="font-light tracking-normal text-slate-500 ml-1">{t('site.brandLight')}</span>
            </Link>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="font-mono uppercase tracking-widest text-[10px] text-slate-400 mb-1">{t('footer.addressLabel')}</p>
              <p>{t('footer.address')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{t('footer.colPractice')}</h4>
            <ul className="space-y-3">
              {[
                [t('footer.practiceCapabilities'), '/capabilities'],
                [t('footer.practiceAutomotive'),   '/automotive'],
                [t('footer.practiceFounder'),      '/founder'],
                [t('footer.practiceContact'),      '/contact'],
              ].map(([label, to]) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${
                        isActive ? 'text-slate-900' : 'text-slate-700 hover:text-slate-900'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{t('footer.colDisciplines')}</h4>
            <ul className="space-y-3">
              {[
                [t('footer.disciplineCad'),         '/capabilities'],
                [t('footer.disciplineManufacturing'), '/capabilities'],
                [t('footer.disciplineSoftware'),    '/capabilities'],
                [t('footer.disciplineAutomotive'),  '/automotive'],
              ].map(([label, to]) => (
                <li key={label}>
                  <NavLink to={to} className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{t('footer.colLegal')}</h4>
            <ul className="space-y-3">
              {[
                [t('footer.legalImpressum'),   '/legal/impressum'],
                [t('footer.legalDatenschutz'), '/legal/datenschutz'],
                [t('footer.legalAgb'),         '/legal/agb'],
                [t('footer.legalAi'),          '/legal/ki-hinweis'],
                [t('footer.legalCookies'),     '/legal/cookies'],
              ].map(([label, to]) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${
                        isActive ? 'text-slate-900' : 'text-slate-700 hover:text-slate-900'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <p>&copy; {year} {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <CookieSettingsButton />
            <div aria-hidden="true" className="flex space-x-1 h-3">
              {STRIPE_COLORS.map((c) => (
                <div key={c} className="w-1.5 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const TopStripe = () => (
  <div aria-hidden="true" className="fixed top-0 left-0 w-full h-1 z-50 flex">
    {STRIPE_COLORS.map((c) => (
      <div key={c} className="h-full flex-grow" style={{ backgroundColor: c }} />
    ))}
  </div>
);

const Layout = ({ children }) => (
  <div className="min-h-screen bg-[#FCFCFC] font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
    <TopStripe />
    <Header />
    <main className="pt-20">{children}</main>
    <Footer />
    <CookieBanner />
  </div>
);

export default Layout;