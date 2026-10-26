import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BrainCircuit, Box, Code2, Layers, ChevronRight } from 'lucide-react';
import { PALETTE } from '../lib/palette';

const Capabilities = () => {
  const { t } = useTranslation();

  // Order matches the dictionary keys: intelligent, digital, software, physical.
  const disciplines = [
    {
      id: 'intelligent-product', icon: BrainCircuit, color: PALETTE.blue, prefix: 'intelligent',
    },
    {
      id: 'digital-engineering', icon: Box,          color: PALETTE.silver, prefix: 'digital',
    },
    {
      id: 'software-systems',    icon: Code2,        color: PALETTE.warm, prefix: 'software',
    },
    {
      id: 'physical-product',    icon: Layers,       color: PALETTE.green, prefix: 'physical',
    },
  ].map((d) => ({
    ...d,
    name:    t(`capabilities.nav${d.prefix.charAt(0).toUpperCase()}${d.prefix.slice(1)}`),
    tagline: t(`capabilities.${d.prefix}Tagline`),
    body: [
      t(`capabilities.${d.prefix}Body1`),
      t(`capabilities.${d.prefix}Body2`),
    ],
    deliverables: [
      t(`capabilities.deliverable_${d.prefix}_1`),
      t(`capabilities.deliverable_${d.prefix}_2`),
      t(`capabilities.deliverable_${d.prefix}_3`),
      t(`capabilities.deliverable_${d.prefix}_4`),
    ],
  }));

  return (
    <>
      {/* Page header */}
      <section className="relative bg-[#FCFCFC] overflow-hidden pt-16 pb-16 border-b border-slate-200 min-h-[420px]">
        <div aria-hidden="true" className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl min-h-[280px] md:min-h-[300px] flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('capabilities.kicker')}</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-8 break-words">
              {t('capabilities.title')}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
              {t('capabilities.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Discipline sections */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-16 border-b border-slate-200 pb-6">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {disciplines.map((d) => (
                <li key={d.id}>
                  <a href={`#${d.id}`} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                    {d.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-32">
            {disciplines.map((d, idx) => (
              <article key={d.id} id={d.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start scroll-mt-32">
                <div className="lg:col-span-5 lg:sticky lg:top-32">
                  <div className="inline-flex items-center space-x-3 mb-6">
                    <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                    <div className="w-8 h-1" style={{ backgroundColor: d.color }} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                    {d.name}
                  </h2>
                  <p className="text-slate-500 text-sm uppercase tracking-widest mb-6">{d.tagline}</p>
                  <d.icon className="w-12 h-12 text-slate-300" />
                </div>

                <div className="lg:col-span-7">
                  {d.body.map((para, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed mb-6 text-lg">
                      {para}
                    </p>
                  ))}
                  <div className="mt-8 bg-slate-50 border border-slate-100 p-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                      {t('capabilities.deliverables')}
                    </h3>
                    <ul className="space-y-3">
                      {d.deliverables.map((item) => (
                        <li key={item} className="flex items-start text-sm text-slate-700 leading-relaxed">
                          <ChevronRight className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: d.color }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('capabilities.ctaTitle')}</h2>
          <p className="text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t('capabilities.ctaBody')}
          </p>
          <Link to="/contact" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-white hover:text-brand-red transition-colors group">
            {t('nav.engage')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Capabilities;