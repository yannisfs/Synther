import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import HreflangTags from './components/HreflangTags';
import DocumentTitle from './components/DocumentTitle';
import Home from './pages/Home';
import Capabilities from './pages/Capabilities';
import Automotive from './pages/Automotive';
import Founder from './pages/Founder';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';
import AIDisclosure from './pages/AIDisclosure';
import CookieRichtlinie from './pages/CookieRichtlinie';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <section className="py-32 bg-[#FCFCFC] min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">{t('notFound.kicker')}</span>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-6">
          {t('notFound.title')}
        </h1>
        <p className="text-slate-600 leading-relaxed">
          {t('notFound.body')}
        </p>
      </div>
    </section>
  );
};

const App = () => (
  <>
    <HreflangTags />
    <DocumentTitle />
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capabilities" element={<Capabilities />} />
        <Route path="/automotive" element={<Automotive />} />
        <Route path="/founder" element={<Founder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/legal/impressum" element={<Impressum />} />
        <Route path="/legal/datenschutz" element={<Datenschutz />} />
        <Route path="/legal/agb" element={<AGB />} />
        <Route path="/legal/ki-hinweis" element={<AIDisclosure />} />
        <Route path="/legal/cookies" element={<CookieRichtlinie />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  </>
);

export default App;
