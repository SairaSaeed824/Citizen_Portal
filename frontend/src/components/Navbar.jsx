import React, { useState } from 'react';
import { 
  Globe, 
  Menu, 
  X,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  currentScreen, 
  setCurrentScreen, 
  lang, 
  setLang, 
  darkMode,
  setDarkMode,
  t 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isUrdu = lang === 'ur';

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ur' : 'en');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'submit', label: t.navSubmit },
    { id: 'chatbot', label: t.navChatbot },
  ];

  const handleNavClick = (screenId) => {
    setCurrentScreen(screenId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
      
      {/* Clean Top Official Strip */}
      <div className="bg-[#00401A] dark:bg-[#00240e] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold tracking-wide text-xs">
              {lang === 'ur' ? 'قومی سٹیزن مواقع پورٹل' : 'National Citizen Opportunities Directory'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer font-medium"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer font-medium"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.langToggle}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Branding */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00401A] to-[#046a38] p-0.5 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-200 border-2 border-emerald-400/40 flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-white/40 flex items-center justify-center bg-[#00401A]">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="#00401A" />
                  <path d="M64,26 A25,25 0 1,0 64,74 A20,20 0 1,1 64,26 Z" fill="#FFFFFF" />
                  <polygon points="65,35 68,46 79,46 70,53 74,64 65,57 56,64 59,53 51,46 62,46" fill="#FFFFFF" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className={`text-xl font-extrabold text-[#00401A] dark:text-emerald-400 tracking-tight leading-none transition ${isUrdu ? 'urdu-text' : ''}`}>
                {t.portalTitle}
              </h1>
            </div>
          </div>

          {/* Navigation Links Aligned to the RIGHT */}
          <nav className="hidden md:flex items-center gap-1.5 ml-auto">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00401A] text-white dark:bg-emerald-600 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-[#00401A] dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-slate-800'
                  } ${isUrdu ? 'urdu-text' : ''}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Hamburger & Theme Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 dark:bg-slate-800 text-[#00401A] dark:text-emerald-400 border border-emerald-200 dark:border-slate-700"
            >
              {t.langToggle}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fade-in-up">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#00401A] text-white dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                } ${isUrdu ? 'urdu-text' : ''}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
