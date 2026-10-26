import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BrainCircuit, Box, Code2, Layers } from 'lucide-react';
import { PALETTE } from '../lib/palette';

const Home = () => {
  const { t } = useTranslation();

  const capabilities = [
    { key: 'capIntelligent', icon: BrainCircuit, color: PALETTE.blue },
    { key: 'capDigital',    icon: Box,         color: PALETTE.silver },
    { key: 'capSoftware',   icon: Code2,       color: PALETTE.warm },
    { key: 'capPhysical',   icon: Layers,      color: PALETTE.green },
  ].map((c) => ({
    ...c,
    name: t(`home.${c.key}`),
    desc: t(`home.${c.key}Desc`),
  }));

  return (
    <>
      {/* Hero */}
      <section id="top" className="relative min-h-[90vh] flex flex-col justify-center bg-[#FCFCFC] overflow-hidden pt-16 pb-16">
        <div aria-hidden="true" className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl min-h-[320px] md:min-h-[360px] flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-8 break-words hyphens-auto">
              {t('home.heroTitle')} <br className="hidden md:block" />
              <span className="text-slate-400 font-light">{t('home.heroTitleLight')}</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl font-light leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 border-t border-slate-200 pt-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('home.coreFocusLabel')}</span>
                <span className="text-sm font-semibold text-slate-900">{t('home.coreFocus')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('home.futureLabel')}</span>
                <span className="text-sm font-semibold text-slate-900">{t('home.future')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div aria-hidden="true" className="absolute top-0 left-1/2 transform -translate-x-1/2 flex h-8">
            <div className="w-1 h-full bg-[#001F5C]"></div>
            <div className="w-1 h-full bg-[#007EE5]"></div>
            <div className="w-1 h-full bg-[#E31E24]"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light italic leading-tight max-w-4xl mx-auto text-slate-900 mt-8 break-words">
            "{t('home.visionQuote')} <br className="hidden md:block" />
            <span className="font-bold">{t('home.visionQuoteBold')}</span>"
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8">{t('home.visionAttribution')}</p>
        </div>
      </section>

      {/* Capabilities teaser */}
      <section className="py-32 bg-[#FCFCFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 md:flex justify-between items-end border-b border-slate-200 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('home.competenciesKicker')}</h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 break-words">{t('home.competenciesTitle')}</h3>
            </div>
            <p className="text-slate-500 text-sm max-w-sm mt-6 md:mt-0 leading-relaxed">
              {t('home.competenciesLede')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap) => (
              <div key={cap.key} className="bg-white p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-2" style={{ backgroundColor: cap.color }} />
                <div className="mb-8 mt-2">
                  <cap.icon className="w-8 h-8 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </div>
                <h4 className="text-lg font-bold mb-4 text-slate-900">{cap.name}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{cap.desc}</p>
                <Link to="/capabilities" className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest cursor-pointer mt-auto">
                  {t('home.explore')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-16 flex justify-center">
            <Link to="/capabilities" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-brand-red transition-colors group">
              {t('home.seeAll')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;