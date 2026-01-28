import React, { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BarChart3, CloudRain, ShieldCheck, Sprout, TrendingUp, Users, Zap, Globe, Leaf, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  // Hero Parallax Logic
  useEffect(() => {
    const moveShapes = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5);
      const yPos = (clientY / window.innerHeight - 0.5);

      gsap.to(".hero-shape", {
        x: xPos * 50, 
        y: yPos * 50,
        duration: 1.5,
        ease: "power2.out"
      });
      
      gsap.to(".hero-content", {
        x: xPos * -20, 
        y: yPos * -20, 
        duration: 1.5,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", moveShapes);
    return () => window.removeEventListener("mousemove", moveShapes);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // 0. Scroll Indicator Animation
      gsap.to(".scroll-indicator", {
        y: 15,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        duration: 1.5
      });

      // 1. Loader/Entry Animation
      const tlEntry = gsap.timeline();
      tlEntry.from(".hero-title-word", {
        y: 120,
        opacity: 0,
        skewY: 10,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out"
      })
      .from(".hero-sub", { opacity: 0, y: 30, duration: 1 }, "-=0.8")
      .from(".hero-btn", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, "-=0.6")
      .from(".hero-float", { scale: 0, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" }, "-=0.4");

      // 2. Marquee Scroll
      gsap.to(".marquee-inner", {
        xPercent: -50,
        ease: "none",
        duration: 25,
        repeat: -1
      });

      // 3. Horizontal Scroll Section with 3D Rotate
      const sections = gsap.utils.toArray(".feature-card");
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: ".horizontal-section",
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: "+=3500" 
        }
      });
      
      sections.forEach((section) => {
        gsap.to(section, {
          rotateY: 8,
          scale: 0.9,
          scrollTrigger: {
             trigger: ".horizontal-section",
             start: "top bottom",
             scrub: 1
          }
        });
      });

      // 4. Reveal "Impact" numbers
      gsap.utils.toArray(".stat-item").forEach(item => {
        gsap.from(item, {
           scale: 0.8,
           opacity: 0,
           y: 50,
           duration: 0.8,
           ease: "power2.out",
           scrollTrigger: {
             trigger: item,
             start: "top 85%"
           }
        });
      });
      
      // 5. Image Zoom Parallax
      gsap.to(".zoom-img", {
        scale: 1.15,
        y: 50,
        scrollTrigger: {
           trigger: ".zoom-section",
           start: "top bottom",
           end: "bottom top",
           scrub: true
        }
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    // Transparent background to show AppLayout video
    <div ref={containerRef} className="bg-transparent font-sans text-slate-900 overflow-x-hidden relative">
      <style>{`
        /* Global & Utility */
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
        }
        
        .hero-title-word { display: inline-block; }

        /* Smooth Gradients */
        .gradient-text {
          background: linear-gradient(135deg, #166534 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        /* Text shadow for better readability over video */
        .text-shadow-sm {
           text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
      
      {/* 1. HERO SECTION - Height adjusted to account for Navbar (pt-16 in AppLayout) */}
      {/* min-h-[calc(100vh-4rem)] ensures it fits perfectly without scroll if navbar is 4rem (16) */}
      <section ref={heroRef} className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
         
         {/* Parallax Background Shapes (Semi-transparent to blend with video) */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="hero-shape absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full blur-[120px] opacity-30 mix-blend-screen animate-pulse"></div>
            <div className="hero-shape absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[150px] opacity-30 mix-blend-screen" style={{animationDelay: '1s'}}></div>
            <div className="hero-shape absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-300 rounded-full blur-[100px] opacity-20 mix-blend-screen" style={{animationDelay: '2s'}}></div>
         </div>
         
         <div className="hero-content relative z-10 text-center px-6 max-w-6xl mt-[-5vh]"> 
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 overflow-hidden">
               <span className="hero-title-word text-6xl md:text-9xl font-black tracking-tighter text-white drop-shadow-sm">SMART</span>
               <span className="hero-title-word text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-green-700 to-emerald-500 drop-shadow-sm">AGRICULTURE</span>
            </div>
            
            <p className="hero-sub text-xl md:text-2xl text-slate-700 font-medium max-w-3xl mx-auto leading-relaxed mb-12 text-shadow-sm bg-white/30 backdrop-blur-sm p-4 rounded-2xl inline-block border border-white/40">
              Harness the power of <span className="text-green-800 font-bold">AI</span> and <span className="text-green-800 font-bold">Data</span> to cultivate a smarter, more sustainable world.
            </p>
         
         </div>
         
       

         {/* Scroll Indicator */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Scroll</span>
            <div className="scroll-indicator w-8 h-12 border-2 border-slate-900 rounded-full flex justify-center p-1">
               <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
            </div>
         </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="py-10 bg-slate-900/90 backdrop-blur-md text-white overflow-hidden border-y border-slate-800 relative z-20 origin-left scale-105 shadow-2xl">
         <div className="marquee-inner flex gap-12 text-5xl font-black uppercase tracking-widest whitespace-nowrap opacity-40">
            <span>Chatbot</span> <span className="text-green-500">•</span> <span>AI</span> <span className="text-green-500">•</span> <span>Analytics</span> <span className="text-green-500">•</span>
            <span>Community</span> <span className="text-green-500">•</span> <span>Schemes</span> <span className="text-green-500">•</span> <span>Expert Help</span> <span className="text-green-500">•</span>
            <span>AI</span> <span className="text-green-500">•</span> <span>AI</span> <span className="text-green-500">•</span> <span>AI</span> <span className="text-green-500">•</span>
         </div>
      </div>

      {/* 3. HORIZONTAL SCROLL FEATURE SHOWCASE */}
      <section className="horizontal-section h-screen  backdrop-blur-sm overflow-hidden relative">
      
         <div className="flex h-full items-center pl-[15vw] md:pl-[25vw]">
             
             {/* Card 1: Analysis */}
             <div className="feature-card w-[85vw] md:w-[60vw] h-[65vh] mr-16 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-slate-100 flex-shrink-0 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Sprout size={200} /></div>
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-10">
                   <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 text-green-600 shadow-md">
                      <Sprout size={32} />
                   </div>
                   <h3 className="text-4xl font-bold mb-4 text-slate-800">Crop Analysis</h3>
                   <p className="text-lg text-slate-600 leading-relaxed mb-8">
                     Advanced computer vision algorithms detect diseases early. Simply snap a photo, and get instant diagnosis with treatment recommendations.
                   </p>
                   <button className="flex items-center gap-3 text-green-700 font-bold hover:gap-5 transition-all group-hover:text-green-600">Learn more <ArrowRight size={20}/></button>
                </div>
                <div className="w-full md:w-1/2 bg-green-50 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1968&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform duration-700 group-hover:scale-110" alt="Crops" />
                   <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
                </div>
             </div>

             {/* Card 2: Market */}
             <div className="feature-card w-[85vw] md:w-[60vw] h-[65vh] mr-16 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-slate-100 flex-shrink-0 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={200} /></div>
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-10">
                   <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-md">
                      <TrendingUp size={32} />
                   </div>
                   <h3 className="text-4xl font-bold mb-4 text-slate-800">Direct Market</h3>
                   <p className="text-lg text-slate-600 leading-relaxed mb-8">
                     Eliminate the middlemen. Connect directly with verified buyers. Secure best prices for your produce with our transparent bidding system.
                   </p>
                   <button className="flex items-center gap-3 text-blue-700 font-bold hover:gap-5 transition-all group-hover:text-blue-600">View prices <ArrowRight size={20}/></button>
                </div>
                <div className="w-full md:w-1/2 bg-blue-50 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform duration-700 group-hover:scale-110" alt="Market" />
                </div>
             </div>

             {/* Card 3: Community */}
             <div className="feature-card w-[85vw] md:w-[60vw] h-[65vh] mr-40 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-slate-100 flex-shrink-0 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={200} /></div>
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-10">
                   <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-8 text-yellow-600 shadow-md">
                      <Users size={32} />
                   </div>
                   <h3 className="text-4xl font-bold mb-4 text-slate-800">Farmer Community</h3>
                   <p className="text-lg text-slate-600 leading-relaxed mb-8">
                     Join thousands of farmers sharing knowledge. Discuss techniques, solve problems together, and grow your network in specialized forums.
                   </p>
                   <button className="flex items-center gap-3 text-yellow-700 font-bold hover:gap-5 transition-all group-hover:text-yellow-600">Join now <ArrowRight size={20}/></button>
                </div>
                <div className="w-full md:w-1/2 bg-yellow-50 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=1974&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform duration-700 group-hover:scale-110" alt="Community" />
                </div>
             </div>
         </div>
      </section>

     
      {/* 5. IMPACT GRID (Semi-transparent background) */}
      <section className="py-32 px-6 relative z-10">
         <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
               <h2 className="text-4xl font-bold mb-4 text-slate-900">Measuring Our Impact</h2>
               <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="stat-item glass-panel p-10 rounded-[2.5rem] hover:bg-white/60 transition-colors text-center">
                  <Globe className="text-green-600 mb-6 mx-auto" size={48} />
                  <div className="text-5xl font-black text-slate-800 mb-2">120<span className="text-green-600">+</span></div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-sm">Villages</div>
               </div>
               <div className="stat-item glass-panel p-10 rounded-[2.5rem] hover:bg-white/60 transition-colors mt-8 lg:mt-12 text-center">
                  <Users className="text-blue-600 mb-6 mx-auto" size={48} />
                  <div className="text-5xl font-black text-slate-800 mb-2">50k<span className="text-blue-600">+</span></div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-sm">Active Farmers</div>
               </div>
               <div className="stat-item glass-panel p-10 rounded-[2.5rem] hover:bg-white/60 transition-colors text-center">
                  <BarChart3 className="text-yellow-600 mb-6 mx-auto" size={48} />
                  <div className="text-5xl font-black text-slate-800 mb-2">$2M<span className="text-yellow-600">+</span></div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-sm">Volume</div>
               </div>
               <div className="stat-item glass-panel p-10 rounded-[2.5rem] hover:bg-white/60 transition-colors mt-8 lg:mt-12 text-center">
                  <ShieldCheck className="text-purple-600 mb-6 mx-auto" size={48} />
                  <div className="text-5xl font-black text-slate-800 mb-2">100<span className="text-purple-600">%</span></div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-sm">Secure</div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER REVEAL */}
      <section className="h-[80vh]  text-white flex flex-col items-center justify-center text-center px-6 relative z-0 sticky bottom-0">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="container mx-auto max-w-4xl relative z-10">
             <div className="inline-block p-4 rounded-full bg-slate-800 border-2 border-slate-700 mb-8 animate-bounce delay-75">
                <ChevronDown size={32} />
             </div>
             <h2 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter">
               Start <span className="text-green-500">Growing</span><br/>Smart Today.
             </h2>
            
             <button className="bg-green-500 text-slate-900 px-12 py-6 rounded-full text-xl font-bold hover:bg-green-400 hover:scale-105 transition-all shadow-xl shadow-green-900/20">
               Join Communities Now
             </button>
         </div>
      </section>

    </div>
  );
}
