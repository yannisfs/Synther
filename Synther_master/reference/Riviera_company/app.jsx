import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, BrainCircuit, Box, Code2, 
  Layers, Gauge, Compass, ChevronRight, 
  Cpu, Target, Activity, Settings
} from 'lucide-react';

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Structural Design Accents (Internal Use Only)
  const structuralAccents = {
    primary: '#CC0000',
    secondary: '#004225',
    accentBlue: '#30A2DA',
    accentOrange: '#F47321',
    neutralSilver: '#888888',
    deepBlue: '#0055A4',
    gold: '#CFB53B',
    warmOrange: '#FF8000'
  };

  const capabilities = [
    { 
      name: 'Intelligent Product Development', 
      icon: BrainCircuit, 
      desc: 'AI-assisted design processes, machine learning applications, computer vision systems, and data-driven engineering.',
      color: structuralAccents.deepBlue
    },
    { 
      name: 'Digital Engineering', 
      icon: Box, 
      desc: 'Advanced CAD modeling, 3D visualization, complex simulation workflows, and comprehensive product documentation.',
      color: structuralAccents.neutralSilver
    },
    { 
      name: 'Software Systems', 
      icon: Code2, 
      desc: 'Full-stack applications, technical platforms, proprietary engineering tools, and automation systems.',
      color: structuralAccents.warmOrange
    },
    { 
      name: 'Physical Product Development', 
      icon: Layers, 
      desc: 'Rapid prototype development, manufacturing preparation, component engineering, testing, and iteration.',
      color: structuralAccents.secondary
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      
      {/* Structural Design Top Border */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 flex">
        <div className="h-full flex-grow" style={{ backgroundColor: structuralAccents.primary }}></div>
        <div className="h-full flex-grow" style={{ backgroundColor: structuralAccents.neutralSilver }}></div>
        <div className="h-full flex-grow" style={{ backgroundColor: structuralAccents.accentBlue }}></div>
        <div className="h-full flex-grow" style={{ backgroundColor: structuralAccents.accentOrange }}></div>
        <div className="h-full flex-grow" style={{ backgroundColor: structuralAccents.secondary }}></div>
      </div>

      {/* Navigation */}
      <header className={`fixed w-full top-1 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer group">
              <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">
                RIVIERA<span className="font-light tracking-normal text-slate-500 ml-1">Engineering</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-10">
              {['Vision', 'Capabilities', 'Automotive', 'Founder'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            {/* Engage Button */}
            <div className="hidden md:flex items-center">
              <button className="flex items-center text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-[#CC0000] transition-colors group">
                Engage Us <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-900">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center bg-[#FCFCFC] overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-slate-900 tracking-tight leading-[1.05] mb-8">
              Intelligent Engineering <br className="hidden md:block"/>
              <span className="text-slate-400 font-light">for the Physical World.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl font-light leading-relaxed">
              Bridging the gap between the digital and physical. Where computation, artificial intelligence, and human creativity converge to design and manufacture the future of intelligent products.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 border-t border-slate-200 pt-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Core Focus</span>
                <span className="text-sm font-semibold text-slate-900">Automotive Proving Ground</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Future Expansion</span>
                <span className="text-sm font-semibold text-slate-900">Robotics & Industrial Automation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Founder's Motto */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex h-8">
             <div className="w-1 h-full bg-[#001F5C]"></div>
             <div className="w-1 h-full bg-[#007EE5]"></div>
             <div className="w-1 h-full bg-[#E31E24]"></div>
          </div>

          <h2 className="text-3xl md:text-5xl font-light italic leading-tight max-w-4xl mx-auto text-slate-900 mt-8">
            "Understand everything. Explore anything. <br className="hidden md:block"/>
            <span className="font-bold">Build what has not yet been possible.</span>"
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8">
            The Founder Philosophy
          </p>
        </div>
      </section>

      {/* Core Ecosystem */}
      <section className="py-32 bg-[#FCFCFC]" id="capabilities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 md:flex justify-between items-end border-b border-slate-200 pb-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Competencies</h2>
              <h3 className="text-4xl font-bold text-slate-900">A Complete Engineering Ecosystem.</h3>
            </div>
            <p className="text-slate-500 text-sm max-w-sm mt-6 md:mt-0 leading-relaxed">
              From concept generation and AI simulation to rapid prototyping and physical manufacturing solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="bg-white p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-2" style={{ backgroundColor: cap.color }}></div>
                
                <div className="mb-8 mt-2">
                  <cap.icon className="w-8 h-8 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </div>
                <h4 className="text-lg font-bold mb-4 text-slate-900">
                  {cap.name}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  {cap.desc}
                </p>
                <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest cursor-pointer mt-auto">
                  Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Proving Ground */}
      <section className="py-32 bg-slate-950 text-white" id="automotive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center space-x-3 mb-6">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Initial Focus Area</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">The Automotive Proving Ground.</h3>
              <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                Automotive engineering is not a limitation; it is the ultimate stress test. It is one of the most complex engineering environments, combining mechanical systems, software, AI, and human interaction.
              </p>
              <p className="text-slate-400 leading-relaxed mb-12">
                We develop components and systems that feel inevitable—solutions that improve the machine while respecting the original engineering intent.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: 'Performance Components', color: structuralAccents.primary },
                  { title: 'Data-Driven Vehicle Systems', color: structuralAccents.accentBlue },
                  { title: 'Motorsport-Inspired Engineering', color: structuralAccents.gold }
                ].map((item, i) => (
                  <div key={i} className="flex items-center border-l-2 pl-4" style={{ borderColor: item.color }}>
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-300">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-8 border border-slate-800 relative group">
                <div className="absolute top-4 right-4 flex space-x-1">
                  <div className="w-1.5 h-6" style={{ backgroundColor: structuralAccents.neutralSilver }}></div>
                </div>
                <Cpu className="w-6 h-6 text-slate-500 mb-6 group-hover:text-white transition-colors" />
                <h4 className="text-xl font-bold mb-3">Precision Architecture</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Reflecting strict structural standards and unpainted componentry. Our systems are stripped of excess, focusing entirely on structural integrity and computational accuracy.
                </p>
              </div>

              <div className="bg-slate-900 p-8 border border-slate-800 relative group">
                <div className="absolute top-4 right-4 flex space-x-1">
                  <div className="w-1.5 h-6" style={{ backgroundColor: structuralAccents.accentBlue }}></div>
                  <div className="w-1.5 h-6" style={{ backgroundColor: structuralAccents.accentOrange }}></div>
                </div>
                <Activity className="w-6 h-6 text-slate-500 mb-6 group-hover:text-white transition-colors" />
                <h4 className="text-xl font-bold mb-3">Integration & Endurance</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Built to survive extreme dynamic loads. We integrate modern AI into mechanical longevity, pushing the boundaries of continuous operation.
                </p>
              </div>

              <div className="bg-slate-900 p-8 border border-slate-800 relative group sm:col-span-2">
                <div className="absolute top-4 right-4 flex space-x-1">
                   <div className="w-1.5 h-6" style={{ backgroundColor: structuralAccents.primary }}></div>
                </div>
                <Gauge className="w-6 h-6 text-slate-500 mb-6 group-hover:text-white transition-colors" />
                <h4 className="text-xl font-bold mb-3">Pure Engineering Intent</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                  Riviera represents a foundation of pure performance. We do not build excessive aftermarket parts; we engineer solutions that elevate the machine.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Multidisciplinary Advantage */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Founder Profile</h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">The Multidisciplinary Advantage.</h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                A technologist and engineer driven by a lifelong curiosity to understand what is possible. With over seven years of experience across software, AI, computer vision, and 3D design, the foundation is built on approaching complex problems from both digital and physical perspectives.
              </p>
              <button className="flex items-center text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-slate-500 transition-colors">
                Read Full Profile <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8 border-l border-slate-100 pl-8 md:pl-16">
              {[
                { title: 'Curiosity', desc: 'Desire to understand.' },
                { title: 'Precision', desc: 'Accuracy & purpose.' },
                { title: 'Integration', desc: 'Connecting disciplines.' },
                { title: 'Innovation', desc: 'Emerging technology.' },
                { title: 'Craftsmanship', desc: 'Visible excellence.' }
              ].map((item, idx) => (
                <div key={idx} className="mb-4">
                  <span className="font-mono text-[10px] text-slate-400 mb-2 block border-b border-slate-100 pb-2">0{idx + 1}</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 mt-4 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-200 pb-16 mb-8">
            
            <div className="lg:col-span-2">
              <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 block mb-6">
                RIVIERA<span className="font-light tracking-normal text-slate-500 ml-1">Engineering</span>
              </span>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Intelligent Engineering for the Physical World. Scaling beyond automotive into robotics, smart manufacturing, and AI-driven engineering tools.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Architecture</h4>
              <ul className="space-y-4">
                {['Digital Engineering', 'Software Systems', 'Product Development', 'Automotive Focus'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Enterprise</h4>
              <ul className="space-y-4">
                {['Vision & Identity', 'Founder Profile', 'Technical Contact', 'Legal & Patents'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Riviera Engineering. All rights reserved.</p>
            
            <div className="flex space-x-1 h-3 mt-4 md:mt-0">
              <div className="w-1.5 h-full" style={{ backgroundColor: structuralAccents.primary }}></div>
              <div className="w-1.5 h-full" style={{ backgroundColor: structuralAccents.secondary }}></div>
              <div className="w-1.5 h-full" style={{ backgroundColor: structuralAccents.neutralSilver }}></div>
              <div className="w-1.5 h-full" style={{ backgroundColor: structuralAccents.accentBlue }}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

