import React from 'react';

const LegalLayout = ({ title, kicker, children, updated }) => (
  <section className="py-20 bg-white min-h-[80vh]">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-slate-200 pb-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
          {kicker}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-4">
          {title}
        </h1>
        {updated && (
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Stand: {updated}
          </p>
        )}
      </header>
      <div className="prose-legal space-y-6 text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
    <style>{`
      .prose-legal h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-top: 2.5rem;
        margin-bottom: 0.75rem;
      }
      .prose-legal p { margin-bottom: 1rem; }
      .prose-legal ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
      .prose-legal ul li { margin-bottom: 0.5rem; }
      .prose-legal strong { color: #0f172a; }
      .prose-legal a { color: #CC0000; text-decoration: underline; text-underline-offset: 3px; }
    `}</style>
  </section>
);

export default LegalLayout;
