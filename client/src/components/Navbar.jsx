import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Menu, X, ArrowRight, Globe, ChevronDown, User, LogOut, Bot, ScanLine, Users, Store, TrendingUp, ShoppingCart, Cloud, CloudRain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import gsap from 'gsap';
import { commonTranslations } from '../utils/commonTranslations';


export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isClimateOpen, setIsClimateOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
        gsap.from(navRef.current, { y: -100, opacity: 0, duration: 1, ease: "power4.out" });
        gsap.from(".nav-item", { y: -20, opacity: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.7)", delay: 0.2 });
    }, navRef);
    return () => ctx.revert();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown-container')) {
            setIsToolsOpen(false);
            setIsProfileOpen(false);
            setIsMarketOpen(false);
            setIsClimateOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const NavItem = ({ to, children }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `nav-item relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full hover:bg-gray-50
        ${isActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:text-emerald-600'}`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center ">
        <div 
          className="
            relative flex items-center justify-between px-6 py-3 w-[98%] max-w-[1200px]
            bg-white backdrop-blur-md rounded-b-2xl border border-white/40 shadow-xl shadow-teal-900/5
          "
        >
          {/* LEFT: Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2 rounded-lg group-hover:rotate-12 transition-transform duration-500 ease-elastic">
               <Sprout className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-teal-950 font-[family-name:var(--font-display)]">
               AgriMitra
            </span>
          </div>

       
          <div className="hidden lg:flex items-center bg-gray-100/50 p-1.5 w-5/8 justify-center rounded-full border border-gray-100/50 absolute left-1/2 -translate-x-1/2">
             <NavItem to="/communities">{t('community')}</NavItem>

             <NavItem to="/gov-schemes">{t('govSchemes')}</NavItem>
             
             {/* Admin Link (Only for authorized admin) */}
             {user?.role === "admin" && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    `nav-item flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors duration-300 rounded-full hover:bg-gray-50
                    ${isActive ? 'text-red-600 bg-red-50/50' : 'text-slate-600 hover:text-red-500'}`
                  }
                >
                  🛡️ Admin
                </NavLink>
             )}

             {/* Tools Dropdown */}
             <div className="relative dropdown-container">
                <button 
                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                    className={`nav-item flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full hover:bg-white
                    ${isToolsOpen ? 'text-emerald-700 bg-white shadow-sm' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                    {t('smartTools')} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isToolsOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                        >
                            <div className="grid gap-1">
                                <button onClick={() => { navigate('/chatbot'); setIsToolsOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('aiAssistant')}</div>
                                        <div className="text-xs text-gray-500">{t('cropGuidance')}</div>
                                    </div>
                                </button>
                                <button onClick={() => { navigate('/crop-analysis'); setIsToolsOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <ScanLine className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('cropAnalysis')}</div>
                                        <div className="text-xs text-gray-500">{t('detectDiseases')}</div>
                                    </div>
                                </button>
                                <button onClick={() => { navigate('/expert-help'); setIsToolsOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('expertHelp')}</div>
                                        <div className="text-xs text-gray-500">{t('connectPros')}</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
             
             {/* Market Dropdown */}
             <div className="relative dropdown-container">
                <button 
                    onClick={() => setIsMarketOpen(!isMarketOpen)}
                    className={`nav-item flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full hover:bg-white
                    ${isMarketOpen ? 'text-emerald-700 bg-white shadow-sm' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                    {t('marketplace')} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMarketOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isMarketOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                        >
                            <div className="grid gap-1">
                                <button onClick={() => { navigate('/market-prices'); setIsMarketOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('marketPrices')}</div>
                                        <div className="text-xs text-gray-500">{t('liveCommodityRates')}</div>
                                    </div>
                                </button>
                                <button onClick={() => { navigate('/marketplace'); setIsMarketOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('marketplace')}</div>
                                        <div className="text-xs text-gray-500">{t('buyCropsDirectly')}</div>
                                    </div>
                                </button>
                                <button onClick={() => { navigate('/create-listing'); setIsMarketOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-100">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('sellCrop')}</div>
                                        <div className="text-xs text-gray-500">{t('createListing')}</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
             
             {/* Climate Dropdown */}
             <div className="relative dropdown-container">
                <button 
                    onClick={() => setIsClimateOpen(!isClimateOpen)}
                    className={`nav-item flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full hover:bg-white
                    ${isClimateOpen ? 'text-emerald-700 bg-white shadow-sm' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                    {t('climateAnalysis')} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isClimateOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isClimateOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                        >
                            <div className="grid gap-1">
                                <button onClick={() => { navigate('/climate-change'); setIsClimateOpen(false); }} className="flex items-start gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group w-full">
                                    <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600 group-hover:bg-blue-100">
                                        <Cloud className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{t('climateAnalysis')}</div>
                                        <div className="text-xs text-gray-500">{t('realTimeClimateData')}</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="hidden lg:flex items-center gap-4">
               {/* Replace simple toggle with LanguageSelector component */}
               <LanguageSelector />

               {user ? (
                 <div className="relative dropdown-container">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 pl-2 focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm ring-2 ring-white shadow-md hover:ring-emerald-200 transition-all">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={16}/>}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-gray-50 mb-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email || ""}</p>
                          </div>
                          
                          <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                             <User className="w-4 h-4" /> {t('profile')}
                          </button>
                          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                             <LogOut className="w-4 h-4" /> {t('signOut')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               ) : (
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-sm font-semibold text-slate-600 hover:text-teal-700 px-3 py-2 rounded-full hover:bg-teal-50 transition-colors"
                    >
                      {t('login')}
                    </button>
                    <button 
                      onClick={() => navigate('/signup')} 
                      className="rounded-full px-5 py-2 bg-teal-900 text-white font-medium text-sm hover:bg-teal-800 shadow-md hover:shadow-lg transition-all"
                    >
                      {t('signup')}
                    </button>
                 </div>
               )}
          </div>
          
           {/* Mobile Menu Toggle */}
           <div className="lg:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-600 hover:bg-gray-100 rounded-full"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
             </div>
        </div>

        {/* Mobile Menu (Simplified) */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-x-4 top-24 bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 lg:hidden overflow-y-auto max-h-[80vh] z-50"
                >
                    <div className="flex flex-col space-y-2">
                        <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className="p-3 bg-gray-50 rounded-xl font-medium">{t('home')}</NavLink>
                        <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/communities" className="p-3 bg-gray-50 rounded-xl font-medium">{t('community')}</NavLink>
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('smartTools')}</div>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/chatbot" className="block py-2 font-medium text-emerald-700">{t('aiAssistant')}</NavLink>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/crop-analysis" className="block py-2 font-medium text-emerald-700">{t('cropAnalysis')}</NavLink>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/expert-help" className="block py-2 font-medium text-emerald-700">{t('expertHelp')}</NavLink>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('marketplace')}</div>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/market-prices" className="block py-2 font-medium text-emerald-700">{t('marketPrices')}</NavLink>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/marketplace" className="block py-2 font-medium text-emerald-700">{t('marketplace')}</NavLink>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/create-listing" className="block py-2 font-medium text-emerald-700">{t('sellCrop')}</NavLink>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('climateAnalysis')}</div>
                            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/climate-change" className="block py-2 font-medium text-blue-700">{t('climateAnalysis')}</NavLink>
                        </div>

                        <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/gov-schemes" className="p-3 bg-gray-50 rounded-xl font-medium">{t('govSchemes')}</NavLink>
                        
                        <div className="h-px bg-gray-100 my-2" />
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/login')} className="w-full py-3 font-bold text-slate-600">{t('login')}</button>
                                <button onClick={() => navigate('/signup')} className="w-full py-3 bg-teal-900 text-white rounded-xl font-bold">{t('signup')}</button>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="w-full py-3 font-bold text-red-600">{t('signOut')}</button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>
    </>
  );
};
