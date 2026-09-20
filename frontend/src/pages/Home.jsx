import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SplitSquareVertical, Users, Split, Zap, Github } from 'lucide-react';

const VortexParticles = () => {
  const particles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: Math.random() * 50 + 10,
    width: Math.random() * 4 + 4,
    height: Math.random() * 12 + 8,
    delay: Math.random() * -20,
    duration: Math.random() * 20 + 20,
    color: ['bg-emerald-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400', 'bg-green-400'][Math.floor(Math.random() * 5)],
    opacityDuration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-30">
      <div className="relative w-[800px] h-[800px]" style={{ animation: 'vortex 60s linear infinite' }}>
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.color}`}
            style={{
              top: '50%',
              left: '50%',
              width: `${p.width}px`,
              height: `${p.height}px`,
              transform: `rotate(${p.angle}deg) translateY(-${p.distance}vh)`,
              animation: `pulse-opacity ${p.opacityDuration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const NumberCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;
          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeProgress * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <SplitSquareVertical size={24} className="text-slate-900" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              FairShare
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-full font-medium text-lg text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-medium text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 hover:opacity-90 shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 flex flex-col items-center text-center overflow-hidden min-h-[80vh] justify-center">
        <VortexParticles />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold mb-8 fade-in-section shadow-sm">
            Expense splitting, simplified
          </div>
          
          <h1 className="text-6xl sm:text-[6rem] md:text-[7.5rem] font-medium tracking-tighter leading-[0.95] text-slate-900 mb-8 fade-in-section py-2">
            <span className="block whitespace-nowrap">Split expenses.</span>
            <span className="block whitespace-nowrap text-slate-600">Not friendships.</span>
          </h1>
          
          <p className="text-slate-600 text-lg sm:text-xl max-w-xl mx-auto mb-10 fade-in-section">
            FairShare automatically calculates who owes whom and simplifies debts to the fewest possible payments.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 fade-in-section">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 hover:opacity-90 shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-base bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm transition-all duration-300"
            >
              See how it works
            </a>
          </div>
          <div className="mt-16 w-screen shrink-0 overflow-hidden fade-in-section py-12">
            <div className="flex animate-slide w-max hover:pause">
              {/* First half of the loop */}
              <div className="flex gap-6 px-3">
                {[
                  "/assets/slider-1.jpg",
                  "/assets/slider-2.jpg",
                  "/assets/slider-3.jpg",
                  "/assets/slider-4.jpg",
                  "/assets/slider-1.jpg",
                  "/assets/slider-2.jpg",
                ].map((src, idx) => (
                  <div key={`set1-${idx}`} className="w-[280px] md:w-[450px] flex-shrink-0 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-neutral-200/50 border border-white/40">
                    <img src={src} alt="FairShare moments" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
              {/* Exact duplicate second half for seamless infinite scroll (-50% translation) */}
              <div className="flex gap-6 px-3">
                {[
                  "/assets/slider-1.jpg",
                  "/assets/slider-2.jpg",
                  "/assets/slider-3.jpg",
                  "/assets/slider-4.jpg",
                  "/assets/slider-1.jpg",
                  "/assets/slider-2.jpg",
                ].map((src, idx) => (
                  <div key={`set2-${idx}`} className="w-[280px] md:w-[450px] flex-shrink-0 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-neutral-200/50 border border-white/40">
                    <img src={src} alt="FairShare moments" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/40 bg-white/60 backdrop-blur-lg/50">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center fade-in-section">
          <p className="text-sm font-medium tracking-wide text-slate-600 uppercase">
            Trusted by students and teams for splitting bills, trips, and shared living
          </p>
        </div>
      </section>

      <section id="features" className="py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20 fade-in-section">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-slate-900 mb-6">Everything you need to split fairly</h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">No more spreadsheets, no more math. FairShare handles all the complexity behind the scenes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-white/40 rounded-[2.5rem] p-10 hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 fade-in-section group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-3 tracking-tight">Group Management</h3>
            <p className="text-slate-600 leading-relaxed">
              Create groups for trips, flatmates, or events. Add members and track every expense in one place.
            </p>
          </div>
          
          <div className="bg-white border border-white/40 rounded-[2.5rem] p-10 hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 fade-in-section group" style={{ transitionDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Split className="text-rose-500" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-3 tracking-tight">Equal & Custom Splits</h3>
            <p className="text-slate-600 leading-relaxed">
              Split equally or set custom amounts per person. FairShare handles the math automatically.
            </p>
          </div>
          
          <div className="bg-white border border-white/40 rounded-[2.5rem] p-10 hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 fade-in-section group" style={{ transitionDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-3 tracking-tight">Minimize Settlements</h3>
            <p className="text-slate-600 leading-relaxed">
              Instead of 10 back-and-forth payments, FairShare reduces it to the minimum transactions needed.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 border-y border-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 fade-in-section">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-slate-900 mb-6">How it works</h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">Three simple steps to settle any shared expense.</p>
          </div>
          
          <div className="mb-20 fade-in-section rounded-[2.5rem] overflow-hidden shadow-xl border border-white/40 max-w-4xl mx-auto">
            <img src="/assets/fairshare-mockup.jpg" alt="Using the app" className="w-full h-auto object-cover max-h-[800px]" />
          </div>

          <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-6 fade-in-section">
            <div className="absolute top-6 left-12 right-12 h-[1px] bg-neutral-200 hidden md:block z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center flex-1 group">
              <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center text-emerald-600 font-bold mb-6 text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">Create a group</h3>
              <p className="text-slate-600 max-w-xs">Add your friends and give your group a name.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center flex-1 group">
              <div className="bg-teal-50 rounded-full w-14 h-14 flex items-center justify-center text-teal-600 font-bold mb-6 text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">Add expenses</h3>
              <p className="text-slate-600 max-w-xs">Log who paid and how the expense should be split.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center flex-1 group">
              <div className="bg-rose-50 rounded-full w-14 h-14 flex items-center justify-center text-rose-600 font-bold mb-6 text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">Settle up</h3>
              <p className="text-slate-600 max-w-xs">Pay the minimum necessary transactions to close the books.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center fade-in-section">
          <div>
            <div className="text-6xl font-medium tracking-tighter text-emerald-600 mb-4 drop-shadow-sm">
              <NumberCounter target={10} suffix="x" />
            </div>
            <p className="text-slate-600">Fewer transactions with debt simplification</p>
          </div>
          <div>
            <div className="text-6xl font-medium tracking-tighter text-emerald-500 mb-4 drop-shadow-sm">
              <NumberCounter target={100} suffix="%" />
            </div>
            <p className="text-slate-600">Free to use, forever</p>
          </div>
          <div>
            <div className="text-6xl font-medium tracking-tighter text-rose-500 mb-4 drop-shadow-sm">
              <NumberCounter target={3} />
            </div>
            <p className="text-slate-600">Steps to settle any group expense</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto fade-in-section">
        <div className="rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Friends on a beach" 
            className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-1000" 
          />
          <div className="absolute bottom-12 left-12 z-20 text-white">
            <h3 className="text-4xl md:text-6xl font-medium tracking-tighter mb-4">Focus on the memories.<br/>We'll handle the math.</h3>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 max-w-6xl mx-auto fade-in-section">
        <div className="bg-white/60 backdrop-blur-lg rounded-[3rem] p-12 md:p-20 text-center">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-slate-900 mb-6">Ready to split smarter?</h2>
          <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
            Join FairShare and never argue about money again. It takes 30 seconds to sign up.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 hover:opacity-90 shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/40 pt-20 pb-8 flex flex-col items-center overflow-hidden bg-white relative">
        <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between px-8 mb-20 text-slate-600 font-medium text-sm gap-8 relative z-10">
          <div className="flex gap-12">
             <a href="https://portfolio-bi-bhab-personal.vercel.app/about" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">About Me</a>
             <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
          </div>
          <div className="flex gap-12">
             <a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a>
             <a href="#" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><Github size={16}/> GitHub</a>
          </div>
        </div>
        
        <div className="w-full px-4 overflow-hidden flex justify-center relative z-10">
          <h1 className="text-[16vw] leading-none font-bold tracking-tighter text-slate-900 select-none whitespace-nowrap">
            fAirShArE
          </h1>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none z-0"></div>
      </footer>
    </div>
  );
};

export default Home;
