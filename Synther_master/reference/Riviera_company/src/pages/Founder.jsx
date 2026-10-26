import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { PALETTE } from '../lib/palette';

const Founder = () => {
  const { t } = useTranslation();

  const values = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`founder.v${n}Title`),
    desc:  t(`founder.v${n}Desc`),
    body:  t(`founder.v${n}Body`),
  }));

  const stats = [
    [t('founder.stat1K'), t('founder.stat1V')],
    [t('founder.stat2K'), t('founder.stat2V')],
    [t('founder.stat3K'), t('founder.stat3V')],
  ];

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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('founder.kicker')}</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-8 break-words">
              {t('founder.title')}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
              {t('founder.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">{t('founder.bgLabel')}</span>
              <div className="space-y-6">
                {stats.map(([k, v]) => (
                  <div key={k} className="border-l-2 border-slate-200 pl-4">
                    <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1">{k}</div>
                    <div className="text-sm font-semibold text-slate-900">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-6 text-slate-700 leading-relaxed">
              <p>{t('founder.bio1')}</p>
              <p>{t('founder.bio2')}</p>
              <p>{t('founder.bio3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div aria-hidden="true" className="absolute top-0 left-1/2 transform -translate-x-1/2 flex h-8">
            <div className="w-1 h-full bg-[#001F5C]"></div>
            <div className="w-1 h-full bg-[#007EE5]"></div>
            <div className="w-1 h-full bg-[#E31E24]"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light italic leading-tight max-w-4xl mx-auto text-slate-900 mt-8 break-words">
            "{t('founder.quote')} <br className="hidden md:block" />
            <span className="font-bold">{t('founder.quoteBold')}</span>"
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8">{t('founder.attribution')}</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-[#FCFCFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-b border-slate-200 pb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('founder.principlesKicker')}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 max-w-2xl break-words">{t('founder.principlesTitle')}</h2>
          </div>
          <div className="space-y-16">
            {values.map((v, idx) => (
              <article key={v.title} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-3">
                  <span className="font-mono text-[10px] text-slate-400 block border-b border-slate-200 pb-2 mb-4">0{idx + 1}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2 break-words">{v.title}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{v.desc}</p>
                </div>
                <div className="md:col-span-9">
                  <div className="w-8 h-1 mb-6" style={{ backgroundColor: PALETTE.red }} />
                  <p className="text-lg text-slate-700 leading-relaxed">{v.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('founder.ctaTitle')}</h2>
          <p className="text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t('founder.ctaBody')}
          </p>
          <Link to="/contact" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-white hover:text-brand-red transition-colors group">
            {t('nav.engage')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Founder;