import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Navbar isScrolled={isScrolled} />
      <main>
        <HeroSection />
        <StatsSection />
        <OfferingsSection />
        <ApproachSection />
        <WorkSection />
      </main>
      <Footer />
    </div>
  );
};

const Navbar = ({ isScrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm'
          : 'bg-white border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          {/* Corporate Geometric Logo */}
          <div className="w-10 h-10 bg-blue-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H10V20H4V4Z" fill="white"/>
              <path d="M14 4H20V12H14V4Z" fill="white"/>
              <path d="M14 14H20V20H14V14Z" fill="#3B82F6"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SYNTHER
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {['Offerings', 'Approach', 'Work', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-blue-700 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href="mailto:hello@synther.gmbh" className="text-sm font-medium text-slate-600 hover:text-blue-700">
            hello@synther.gmbh
          </a>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2">
            Start a Project
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            className="text-slate-900 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg py-4 px-6 flex flex-col gap-4">
          {['Offerings', 'Approach', 'Work', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-600 font-medium py-2 border-b border-slate-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button className="mt-2 bg-blue-700 text-white px-5 py-3 text-sm font-semibold w-full flex justify-center items-center gap-2">
            Start a Project
          </button>
        </div>
      )}
    </header>
  );
};

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50 border-b border-slate-200 overflow-hidden">
      {/* Industrial Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '2rem 2rem'
        }}
      />
      
      {/* Abstract Structural Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-900/5 -skew-x-12 transform origin-top-right z-0"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Systems Engineering & Analytics
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-8">
              Engineering <br />
              <span className="text-blue-700">convergence.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-10 max-w-2xl">
              We engineer the physical and digital systems that decide what comes next — from first-principles design to data-driven decisions in production.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 font-semibold transition-colors flex items-center justify-center gap-2 group">
                Start a Project
                <svg className="transform transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="w-full sm:w-auto bg-transparent hover:bg-slate-200 text-slate-700 border-2 border-slate-300 px-8 py-3.5 font-semibold transition-colors flex items-center justify-center">
                Explore Offerings
              </button>
            </div>
          </div>
          
          {/* Technical Illustration Area */}
          <div className="lg:col-span-4 hidden lg:block">
             <div className="relative w-full aspect-square border border-slate-200 bg-white p-6 shadow-sm">
                {/* Abstract Data/System representation */}
                <div className="absolute inset-6 border border-blue-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full relative">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="absolute border border-blue-500/20" 
                                style={{
                                    top: `${i * 10}%`, left: `${i * 10}%`, 
                                    right: `${i * 10}%`, bottom: `${i * 10}%`,
                                    animation: `spin ${20 + i*5}s linear infinite ${i%2===0?'reverse':''}`
                                }}
                           />
                        ))}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-700"></div>
                    </div>
                </div>
                
                {/* Decorative corner markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-400"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-400"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-400"></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { value: "40+", label: "Engineered systems in production" },
    { value: "12", label: "Industry sectors served" },
    { value: "3.2×", label: "Median process efficiency gain" },
    { value: "99.95%", label: "Uptime on delivered platforms" }
  ];

  return (
    <section className="bg-blue-950 text-white border-y border-blue-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-blue-800">
          {stats.map((stat, index) => (
            <div key={index} className="p-8 lg:p-12 flex flex-col justify-center items-start group">
              <div className="text-4xl lg:text-5xl font-bold mb-3 text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-blue-200 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const OfferingsSection = () => {
  const offerings = [
    {
      id: "01",
      title: "Systems Architecture",
      desc: "First-principles design of complex physical and digital infrastructures.",
      points: ["Requirements Engineering", "Trade-off Analysis", "System Topologies"]
    },
    {
      id: "02",
      title: "Process Optimization",
      desc: "Data-driven methodologies to eliminate bottlenecks and increase throughput.",
      points: ["Lean Methodologies", "Throughput Analysis", "Waste Reduction"]
    },
    {
      id: "03",
      title: "Advanced Analytics",
      desc: "Extracting actionable intelligence from high-volume production data.",
      points: ["Predictive Modeling", "Anomaly Detection", "Performance Dashboards"]
    }
  ];

  return (
    <section id="offerings" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 border-l-4 border-blue-700 pl-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Offerings</h2>
          <p className="text-lg text-slate-600 max-w-2xl">Structured solutions for complex industrial challenges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offerings.map((offering) => (
            <div key={offering.id} className="border border-slate-200 bg-slate-50 p-8 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="text-sm font-bold text-blue-600 mb-6 font-mono">{offering.id}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{offering.title}</h3>
              <p className="text-slate-600 mb-8 min-h-[48px]">{offering.desc}</p>
              
              <ul className="space-y-3 mt-auto">
                {offering.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-none mt-1.5 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ApproachSection = () => {
    const steps = [
        { num: "01", title: "Discovery", desc: "Rigorous assessment of existing systems and operational constraints." },
        { num: "02", title: "Modeling", desc: "Digital twin creation and simulation of proposed architectural changes." },
        { num: "03", title: "Implementation", desc: "Phased rollout with strict quality gates and performance monitoring." },
        { num: "04", title: "Optimization", desc: "Continuous feedback loops driving iterative efficiency gains." }
    ];

    return (
        <section id="approach" className="py-24 bg-slate-100 border-y border-slate-200">
             <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="border-l-4 border-slate-900 pl-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Methodology</h2>
                        <p className="text-lg text-slate-600 max-w-2xl">A deterministic approach to systems engineering.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-6 left-full w-full h-[1px] bg-slate-300 -ml-4 z-0"></div>
                            )}
                            
                            <div className="bg-white border border-slate-200 p-6 relative z-10 h-full shadow-sm">
                                <div className="text-blue-700 font-mono font-bold text-sm mb-4">{step.num}</div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>
    );
};

const WorkSection = () => {
    const cases = [
        { sector: "Manufacturing", title: "Automated Assembly Line Optimization", metric: "24%", metricLabel: "Throughput Increase" },
        { sector: "Energy", title: "Grid Load Balancing Algorithm", metric: "99.9%", metricLabel: "Reliability Rate" },
        { sector: "Logistics", title: "Predictive Supply Chain Routing", metric: "$4.2M", metricLabel: "Annual Cost Savings" }
    ];

    return (
        <section id="work" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="mb-16 border-l-4 border-blue-700 pl-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Proven Outcomes</h2>
                    <p className="text-lg text-slate-600 max-w-2xl">Quantifiable results across industrial sectors.</p>
                </div>

                <div className="flex flex-col border-t border-slate-200">
                    {cases.map((item, index) => (
                        <div key={index} className="py-8 border-b border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-slate-50 transition-colors">
                            <div className="md:col-span-2 text-sm font-bold text-slate-400 font-mono tracking-widest uppercase">
                                {item.sector}
                            </div>
                            <div className="md:col-span-6">
                                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                            </div>
                            <div className="md:col-span-4 flex flex-col md:items-end">
                                <div className="text-3xl font-bold text-blue-700">{item.metric}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.metricLabel}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Footer = () => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t-4 border-blue-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H10V20H4V4Z" fill="white"/>
                        <path d="M14 4H20V12H14V4Z" fill="white"/>
                        <path d="M14 14H20V20H14V14Z" fill="white" fillOpacity="0.5"/>
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">SYNTHER</span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                    Engineering the physical and digital systems that decide what comes next. Professional systems engineering and data-driven decisions.
                </p>
                <button className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2.5 text-sm font-bold transition-colors">
                    Contact Engineering Team
                </button>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Navigation</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#offerings" className="hover:text-blue-400 transition-colors">Offerings</a></li>
                    <li><a href="#approach" className="hover:text-blue-400 transition-colors">Methodology</a></li>
                    <li><a href="#work" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal & Contact</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="mailto:hello@synther.gmbh" className="hover:text-blue-400 transition-colors">hello@synther.gmbh</a></li>
                    <li className="pt-2">Frankfurt am Main</li>
                    <li>Germany</li>
                    <li className="pt-4"><a href="#" className="hover:text-white underline decoration-slate-600 underline-offset-4">Imprint & Privacy</a></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Synther GmbH. All rights reserved.</span>
          <span className="font-mono">SYS-ENG-v2.0</span>
        </div>
      </div>
    </footer>
  );
};

export default App;