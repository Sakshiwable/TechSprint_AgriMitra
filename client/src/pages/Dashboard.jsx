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

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const navigate = useNavigate();
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
              AI-powered agriculture ecosystem for farmers, markets, experts and real-time insights.
            </p>

            <p className="hero-description mt-4 text-base md:text-lg text-white/80 max-w-xl">
              Empowering farmers with intelligent tools, market insights, and expert guidance to transform agriculture.
            </p>

     

            {/* CTA Button */}
            <button
              onClick={() => navigate("/chatbot")}
              className="hero-cta mt-8 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center gap-2"
            >
              <PlayCircle size={20} />
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* About / Importance Section */}
      <section ref={aboutRef} className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="about-content text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Why <span className="text-emerald-600">AgriMitra</span> Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Agriculture is the backbone of our economy, yet farmers face numerous challenges. 
              AgriMitra bridges the gap between traditional farming and modern technology, providing 
              comprehensive solutions for sustainable agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {IMPORTANCE_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="about-content bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-emerald-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                  <item.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Powerful <span className="text-emerald-600">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed in modern agriculture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-emerald-100 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(feature.path)}
                  className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  Explore <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section ref={howToUseRef} className="py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-600 to-green-700 m-5 rounded-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How to Use<span className="text-emerald-200/70">  Agri<span className="text-emerald-300">Mitra</span></span>
            </h2>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Get started in minutes with our simple, intuitive platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_TO_USE_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="step-card relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-lg border border-emerald-200"
              >
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {idx + 1}
                </div>
                <div className="mt-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                    <step.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <ArrowRight size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Key <span className="text-emerald-600">Benefits</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why thousands of farmers trust AgriMitra
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="benefit-card bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-emerald-500"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                    <benefit.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section ref={ctaRef} className="py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 m-5 rounded-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <Sparkles className="w-20 h-20 text-emerald-200 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Agriculture?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of farmers who are already using AgriMitra to improve their yields, 
              increase profits, and build sustainable farming practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
         
              <button
                onClick={() => navigate("/communities")}
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                <Users size={20} />
                Join Community
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

const NAV_ITEMS = [
  {
    icon: Users,
    label: "Community",
    path: "/communities",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: BookOpen,
    label: "Gov Schemes",
    path: "/gov-schemes",
    color: "from-blue-400 to-indigo-600"
  },
  {
    icon: Bot,
    label: "AI Assistant",
    path: "/chatbot",
    color: "from-emerald-400 to-green-600"
  },
  {
    icon: ScanLine,
    label: "Crop Analysis",
    path: "/crop-analysis",
    color: "from-green-400 to-lime-600"
  },
  {
    icon: Users,
    label: "Expert Help",
    path: "/expert-help",
    color: "from-purple-400 to-fuchsia-600"
  },
  {
    icon: TrendingUp,
    label: "Market Prices",
    path: "/market-prices",
    color: "from-orange-400 to-red-500"
  },
  {
    icon: Store,
    label: "Marketplace",
    path: "/marketplace",
    color: "from-rose-400 to-pink-600"
  },
  {
    icon: Cloud,
    label: "Climate Analysis",
    path: "/climate-change",
    color: "from-sky-400 to-cyan-600"
  }
];

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
