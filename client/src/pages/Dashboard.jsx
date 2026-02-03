import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ScanLine,
  Users,
  TrendingUp,
  Store,
  Cloud,
  BookOpen,
  Shield,
  Zap,
  Globe,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Target,
  Award,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Sun,
  Droplets,
  Wind,
  MapPin,
  Smartphone,
  Laptop,
  Database,
  Brain,
  Heart,
  Star,
  PlayCircle
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import landing from "../assets/Landing.png";
import landing2 from "../assets/landing2.png";
import { useLanguage } from "../contexts/LanguageContext";
import { dashboardTranslations } from "../utils/dashboardTranslations";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const howToUseRef = useRef(null);
  const statsRef = useRef(null);
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);

  // Hero Animation
  React.useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title", {
        y: 60,
        opacity: 0,
        duration: 1
      })
        .from(
          ".hero-subtitle",
          {
            y: 40,
            opacity: 0,
            duration: 0.8
          },
          "-=0.6"
        )
        .from(
          ".hero-description",
          {
            y: 30,
            opacity: 0,
            duration: 0.8
          },
          "-=0.4"
        )
        .from(
          ".nav-card",
          {
            y: 40,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8
          },
          "-=0.4"
        )
        .from(
          ".hero-cta",
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.6
          },
          "-=0.2"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Scroll Animations
  useEffect(() => {
    const sections = [
      { ref: aboutRef, class: ".about-content" },
      { ref: featuresRef, class: ".feature-card" },
      { ref: howToUseRef, class: ".step-card" },
      { ref: statsRef, class: ".stat-card" },
      { ref: benefitsRef, class: ".benefit-card" },
      { ref: ctaRef, class: ".cta-content" }
    ];

    sections.forEach(({ ref, class: className }) => {
      if (ref.current) {
        gsap.fromTo(
          className,
          {
            y: 60,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      }
    });

    // Animate numbers
    const animateNumbers = () => {
      const numbers = document.querySelectorAll(".stat-number");
      numbers.forEach((num) => {
        const target = parseInt(num.getAttribute("data-target"));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateNumber = () => {
          current += increment;
          if (current < target) {
            num.textContent = Math.floor(current) + (num.getAttribute("data-suffix") || "");
            requestAnimationFrame(updateNumber);
          } else {
            num.textContent = target + (num.getAttribute("data-suffix") || "");
          }
        };

        ScrollTrigger.create({
          trigger: num,
          start: "top 80%",
          onEnter: updateNumber,
          once: true
        });
      });
    };

    animateNumbers();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-[#f4fdf8] min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[92vh] rounded-[2.8rem] overflow-hidden mx-4 mt-4 pb-8">
        {/* Background Image */}
        <img
          src={landing}
          alt="AgriMitra"
          className="absolute inset-0 w-full h-full object-cover  z-0"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2d8c59]/80 to-[#1c7c54] z-10" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-20 min-h-full flex items-center justify-center md:justify-end px-4 md:px-8 py-8">
          <div className="w-full md:w-[60%] lg:w-[55%] h-full my-32 pr-4 md:pr-8 lg:pr-20 pl-4 md:pl-10 text-center md:text-right flex flex-col items-center md:items-end">
            <h1 className="hero-title text-5xl md:text-8xl font-extrabold text-white drop-shadow-2xl">
              Agri<span className="text-emerald-300">Mitra</span>
            </h1>

            <p className="hero-subtitle mt-6 text-lg md:text-2xl text-white/90 max-w-xl leading-relaxed border-r-4 border-emerald-300 pr-6">
              {t.hero.subtitle}
            </p>

            <p className="hero-description mt-4 text-base md:text-lg text-white/80 max-w-xl">
              {t.hero.description}
            </p>

     

            {/* CTA Button */}
            <button
              onClick={() => navigate("/chatbot")}
              className="hero-cta mt-8 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center gap-2"
            >
              <PlayCircle size={20} />
              {t.hero.cta}
            </button>
          </div>
        </div>
      </section>

      {/* About / Importance Section */}
      <section ref={aboutRef} className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="about-content text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              {t.about.title} <span className="text-emerald-600">{t.about.titleHighlight}</span> {t.about.titleSuffix}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.about.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Target, color: "from-red-400 to-pink-500", key: "addressingChallenges" },
              { icon: Leaf, color: "from-green-400 to-emerald-500", key: "sustainable" },
              { icon: TrendingUp, color: "from-blue-400 to-indigo-500", key: "economic" }
            ].map((item, idx) => {
              const trans = t.importance[item.key];
              return (
                <div
                  key={idx}
                  className="about-content bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-emerald-100"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                    <item.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{trans.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{trans.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              {t.features.title} <span className="text-emerald-600">{t.features.titleHighlight}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bot, color: "from-emerald-400 to-green-600", path: "/chatbot", backgroundImage: "https://i.pinimg.com/1200x/5a/77/97/5a779738ab624dc4b236f3c526b5d53c.jpg", key: "aiAssistant" },
              { icon: ScanLine, color: "from-green-400 to-lime-600", path: "/crop-analysis", backgroundImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80", key: "cropAnalysis" },
              { icon: TrendingUp, color: "from-orange-400 to-red-500", path: "/market-prices", backgroundImage: "https://i.pinimg.com/736x/3c/af/27/3caf27c62f0296b9b54f3685f9478918.jpg", key: "marketPrices" },
              { icon: Store, color: "from-rose-400 to-pink-600", path: "/marketplace", backgroundImage: "https://i.pinimg.com/1200x/64/d2/73/64d2733b08b7006767593e9ce12f5499.jpg", key: "marketplace" },
              { icon: Users, color: "from-yellow-400 to-orange-500", path: "/communities", backgroundImage: "https://i.pinimg.com/1200x/67/39/18/6739180698b78019b9e96148e47f2ba2.jpg", key: "community" },
              { icon: BookOpen, color: "from-blue-400 to-indigo-600", path: "/gov-schemes", backgroundImage: "https://i.pinimg.com/1200x/6c/17/b3/6c17b3a3ea5f89a98355d91305c486bc.jpg", key: "govSchemes" },
              { icon: Users, color: "from-purple-400 to-fuchsia-600", path: "/expert-help", backgroundImage: "https://i.pinimg.com/736x/fe/8d/e2/fe8de28b7387fa75180412602afdc11e.jpg", key: "expertHelp" },
              { icon: Cloud, color: "from-sky-400 to-cyan-600", path: "/climate-change", backgroundImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", key: "climateAnalysis" }
            ].map((feature, idx) => {
              const trans = t.features[feature.key];
              return (
              <div
                key={idx}
                className="feature-card relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-emerald-100 group cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${feature.backgroundImage})`
                  }}
                />
                
                {/* Dark Overlay for Text Readability - Transparent on Hover */}
                <div className="absolute inset-0 bg-gray-900/50 group-hover:bg-transparent transition-all duration-300" />
                
                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col min-h-[300px]">
                  {/* Default State Content */}
                  <div className="group-hover:opacity-0 group-hover:hidden transition-all duration-300">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transition-transform shadow-lg`}>
                      <feature.icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{trans.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-4 drop-shadow-md">{trans.description}</p>
                    <ul className="space-y-2 flex-grow">
                      {trans.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                          <CheckCircle2 size={16} className="text-emerald-300 flex-shrink-0 drop-shadow-md" />
                          <span className="drop-shadow-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(feature.path);
                      }}
                      className="mt-4 w-full py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/30"
                    >
                      {t.features.explore} <ArrowRight size={16} />
                    </button>
                  </div>
                  
                  {/* Hover State - Only Title */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl text-center px-4">{trans.title}</h3>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section ref={howToUseRef} className="relative py-20 px-4 md:px-8 m-5 rounded-3xl overflow-hidden">
        {/* Background Image */}
        <img
          src={landing2}
          alt="AgriMitra"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-green-700/45 to-emerald-800/40 z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {t.howToUse.title}<span className="text-emerald-200/70">  {t.howToUse.titleHighlight}</span>
            </h2>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto drop-shadow-md">
              {t.howToUse.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, color: "from-blue-400 to-indigo-500", key: "signUp" },
              { icon: Zap, color: "from-yellow-400 to-orange-500", key: "explore" },
              { icon: Target, color: "from-emerald-400 to-green-600", key: "startUsing" }
            ].map((step, idx) => {
              const trans = t.howToUse[step.key];
              return (
                <div
                  key={idx}
                  className="step-card relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
                >
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl z-30">
                    {idx + 1}
                  </div>
                  <div className="mt-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{trans.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{trans.description}</p>
                    <ul className="space-y-2">
                      {trans.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <ArrowRight size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              {t.benefits.title} <span className="text-emerald-600">{t.benefits.titleHighlight}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.benefits.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, color: "from-purple-400 to-fuchsia-500", key: "aiInsights" },
              { icon: Globe, color: "from-blue-400 to-cyan-500", key: "realTimeData" },
              { icon: Shield, color: "from-green-400 to-emerald-500", key: "secure" },
              { icon: MessageSquare, color: "from-orange-400 to-red-500", key: "expertSupport" },
              { icon: Database, color: "from-indigo-400 to-purple-500", key: "database" },
              { icon: Heart, color: "from-pink-400 to-rose-500", key: "community" }
            ].map((benefit, idx) => {
              const trans = t.benefits[benefit.key];
              return (
                <div
                  key={idx}
                  className="benefit-card bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-emerald-500"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                      <benefit.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{trans.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{trans.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section ref={ctaRef} className="py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 m-5 rounded-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <Sparkles className="w-20 h-20 text-emerald-200 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
         
              <button
                onClick={() => navigate("/communities")}
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                <Users size={20} />
                {t.cta.joinCommunity}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------- */
/* Navigation Card Component */
/* ---------------------------------- */

// eslint-disable-next-line no-unused-vars
const NavCard = ({ icon: Icon, label, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="nav-card relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-4 md:p-5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.07] hover:shadow-2xl group w-full aspect-square"
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br ${color} blur-xl`}
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-2 md:gap-3 w-full h-full">
        <div
          className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:rotate-6 transition flex-shrink-0`}
        >
          <Icon size={24} className="md:w-7 md:h-7" />
        </div>

        <span className="text-white font-semibold text-xs md:text-sm tracking-wide break-words leading-tight">
          {label}
        </span>
      </div>
    </button>
  );
};

/* ---------------------------------- */
/* Navigation Items */
/* ---------------------------------- */

// NAV_ITEMS will be created dynamically using translations

/* ---------------------------------- */
/* Importance Items */
/* ---------------------------------- */

const IMPORTANCE_ITEMS = [
  {
    icon: Target,
    title: "Addressing Real Challenges",
    description: "Farmers face unpredictable weather, market volatility, and limited access to expert knowledge. AgriMitra provides solutions for all these challenges.",
    color: "from-red-400 to-pink-500"
  },
  {
    icon: Leaf,
    title: "Sustainable Agriculture",
    description: "Promote eco-friendly farming practices with AI-powered recommendations that balance productivity with environmental conservation.",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: TrendingUp,
    title: "Economic Empowerment",
    description: "Help farmers maximize profits through real-time market insights, price predictions, and direct marketplace access.",
    color: "from-blue-400 to-indigo-500"
  }
];

/* ---------------------------------- */
/* Features */
/* ---------------------------------- */

const FEATURES = [
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Get instant answers to your farming questions with our intelligent chatbot.",
    color: "from-emerald-400 to-green-600",
    path: "/chatbot",
    backgroundImage: "https://i.pinimg.com/1200x/5a/77/97/5a779738ab624dc4b236f3c526b5d53c.jpg",
    benefits: [
      "24/7 instant support",
      "Crop-specific advice",
      "Disease identification",
      "Best practices guidance"
    ]
  },
  {
    icon: ScanLine,
    title: "Crop Analysis",
    description: "Analyze your crops with AI-powered image recognition and get detailed insights.",
    color: "from-green-400 to-lime-600",
    path: "/crop-analysis",
    backgroundImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    benefits: [
      "Disease detection",
      "Growth monitoring",
      "Yield prediction",
      "Treatment recommendations"
    ]
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    description: "Real-time market prices and price predictions to help you sell at the right time.",
    color: "from-orange-400 to-red-500",
    path: "/market-prices",
    backgroundImage: "https://i.pinimg.com/736x/3c/af/27/3caf27c62f0296b9b54f3685f9478918.jpg",
    benefits: [
      "Live price updates",
      "Price forecasting",
      "Market trends",
      "Best time to sell"
    ]
  },
  {
    icon: Store,
    title: "Marketplace",
    description: "Buy and sell agricultural products directly with other farmers and buyers.",
    color: "from-rose-400 to-pink-600",
    path: "/marketplace",
    backgroundImage: "https://i.pinimg.com/1200x/64/d2/73/64d2733b08b7006767593e9ce12f5499.jpg",
    benefits: [
      "Direct trading",
      "No middlemen",
      "Secure transactions",
      "Wide network"
    ]
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow farmers, share experiences, and learn from each other.",
    color: "from-yellow-400 to-orange-500",
    path: "/communities",
    backgroundImage: "https://i.pinimg.com/1200x/67/39/18/6739180698b78019b9e96148e47f2ba2.jpg",
    benefits: [
      "Farmer networks",
      "Knowledge sharing",
      "Group discussions",
      "Local support"
    ]
  },
  {
    icon: BookOpen,
    title: "Gov Schemes",
    description: "Discover and apply for government schemes and subsidies tailored for farmers.",
    color: "from-blue-400 to-indigo-600",
    path: "/gov-schemes",
    backgroundImage: "https://i.pinimg.com/1200x/6c/17/b3/6c17b3a3ea5f89a98355d91305c486bc.jpg",
    benefits: [
      "Scheme discovery",
      "Eligibility check",
      "Application guide",
      "Status tracking"
    ]
  },
  {
    icon: Users,
    title: "Expert Help",
    description: "Consult with agricultural experts for personalized advice and solutions.",
    color: "from-purple-400 to-fuchsia-600",
    path: "/expert-help",
    backgroundImage: "https://i.pinimg.com/736x/fe/8d/e2/fe8de28b7387fa75180412602afdc11e.jpg",
    benefits: [
      "Expert consultations",
      "Personalized advice",
      "Problem solving",
      "Certified professionals"
    ]
  },
  {
    icon: Cloud,
    title: "Climate Analysis",
    description: "Weather forecasts, climate data, and alerts to plan your farming activities.",
    color: "from-sky-400 to-cyan-600",
    path: "/climate-change",
    backgroundImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    benefits: [
      "Weather forecasts",
      "Climate alerts",
      "Rain predictions",
      "Planning tools"
    ]
  }
];

/* ---------------------------------- */
/* How to Use Steps */
/* ---------------------------------- */

const HOW_TO_USE_STEPS = [
  {
    icon: Smartphone,
    title: "Sign Up & Setup",
    description: "Create your account in minutes and set up your profile with your farming details.",
    color: "from-blue-400 to-indigo-500",
    actions: [
      "Register with email or phone",
      "Complete your profile",
      "Add your location and crops",
      "Set your preferences"
    ]
  },
  {
    icon: Zap,
    title: "Explore Features",
    description: "Navigate through our comprehensive features and find what you need.",
    color: "from-yellow-400 to-orange-500",
    actions: [
      "Browse the dashboard",
      "Try the AI assistant",
      "Check market prices",
      "Join communities"
    ]
  },
  {
    icon: Target,
    title: "Start Using",
    description: "Begin using AgriMitra to improve your farming practices and increase yields.",
    color: "from-emerald-400 to-green-600",
    actions: [
      "Ask questions to AI",
      "Upload crop images",
      "Monitor market trends",
      "Connect with experts"
    ]
  }
];

/* ---------------------------------- */
/* Statistics */
/* ---------------------------------- */

const STATISTICS = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Active Farmers"
  },
  {
    icon: BarChart3,
    value: 50,
    suffix: "%",
    label: "Yield Increase"
  },
  {
    icon: TrendingUp,
    value: 30,
    suffix: "%",
    label: "Profit Boost"
  },
  {
    icon: Award,
    value: 500,
    suffix: "+",
    label: "Expert Consultations"
  }
];

/* ---------------------------------- */
/* Benefits */
/* ---------------------------------- */

const BENEFITS = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Leverage artificial intelligence to get personalized recommendations for your crops and farming practices.",
    color: "from-purple-400 to-fuchsia-500"
  },
  {
    icon: Globe,
    title: "Real-Time Data",
    description: "Access up-to-date market prices, weather forecasts, and agricultural news in real-time.",
    color: "from-blue-400 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security. We prioritize your privacy and safety.",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: MessageSquare,
    title: "Expert Support",
    description: "Get help from certified agricultural experts whenever you need guidance or solutions.",
    color: "from-orange-400 to-red-500"
  },
  {
    icon: Database,
    title: "Comprehensive Database",
    description: "Access a vast database of government schemes, crop information, and agricultural resources.",
    color: "from-indigo-400 to-purple-500"
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Join a thriving community of farmers sharing knowledge, experiences, and supporting each other.",
    color: "from-pink-400 to-rose-500"
  }
];
