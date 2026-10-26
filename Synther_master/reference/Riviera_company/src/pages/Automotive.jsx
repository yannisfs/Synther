import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Target, Cpu, Activity, Gauge, Wrench, Database, GaugeCircle } from 'lucide-react';
import { PALETTE } from '../lib/palette';
import ColorMark from '../components/ColorMark';

const Automotive = () => {
  const { t } = useTranslation();

  const pillars = [
    { key: 'pillar1', icon: Cpu,      color: PALETTE.silver },
    { key: 'pillar2', icon: Activity, color: PALETTE.lightblue },
    { key: 'pillar3', icon: Gauge,    color: PALETTE.red },
  ].map((p) => ({
    ...p,
    title: t(`automotive.${p.key}Title`),
    body:  t(`automotive.${p.key}Body`),
  }));

  const focus = [
    { key: 'focus1', icon: GaugeCircle, color: PALETTE.red },
    { key: 'focus2', icon: Database,    color: PALETTE.lightblue },
    { key: 'focus3', icon: Wrench,     color: PALETTE.gold },
  ].map((f) => ({
    ...f,
    title: t(`automotive.${f.key}Title`),
    desc:  t(`automotive.${f.key}Desc`),
  }));

  const introPoints = [
    [t('automotive.p1Title'), t('automotive.p1Body')],
    [t('automotive.p2Title'), t('automotive.p2Body')],
    [t('automotive.p3Title'), t('automotive.p3Body')],
  ];

  return (
    <>
      {/* Header */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-16 pb-24 min-h-[480px]">
        <div aria-hidden="true" className="absolute inset-0 z-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl min-h-[320px] md:min-h-[340px] flex flex-col justify-center">
            <div className="inline-flex items-center space-x-3 mb-6">
              <Target className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-400">{t('automotive.kicker')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8 break-words">
              {t('automotive.title')}
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              {t('automotive.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-2xl md:text-3xl font-light text-slate-700 leading-relaxed mb-12">
            {t('automotive.lede')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-12">
            {introPoints.map(([title, body]) => (
              <div key={title}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-3">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-32 bg-[#FCFCFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-b border-slate-200 pb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('automotive.pillarsKicker')}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 max-w-2xl break-words">{t('automotive.pillarsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white p-10 border border-slate-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 group-hover:h-2 transition-all duration-300" style={{ backgroundColor: p.color }} />
                <div aria-hidden="true" className="absolute top-4 right-4 flex space-x-1">
                  <ColorMark color={p.color} className="h-6" />
                </div>
                <p.icon className="w-8 h-8 text-slate-300 group-hover:text-slate-900 transition-colors mb-8" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">{p.title}</h3>
                <p className="text-slate-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-b border-slate-800 pb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('automotive.focusKicker')}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-2xl break-words">{t('automotive.focusTitle')}</h2>
          </div>
          <div className="space-y-8">
            {focus.map((f) => (
              <div key={f.title} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-l-2 pl-8 py-6" style={{ borderColor: f.color }}>
                <div className="md:col-span-4 flex items-center">
                  <f.icon className="w-5 h-5 mr-4 flex-shrink-0" style={{ color: f.color }} />
                  <h3 className="text-xl font-bold uppercase tracking-widest text-sm">{f.title}</h3>
                </div>
                <p className="md:col-span-8 text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t('automotive.closingTitle')}</h2>
          <p className="text-slate-600 leading-relaxed mb-10">
            {t('automotive.closingBody')}
          </p>
          <Link to="/contact" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-brand-red transition-colors group">
            {t('automotive.cta')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Automotive;