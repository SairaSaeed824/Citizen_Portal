import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import SubmitOpportunityScreen from './screens/SubmitOpportunityScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import GuideScreen from './screens/GuideScreen';
import AdminScreen from './screens/AdminScreen';
import OpportunityDetailModal from './components/OpportunityDetailModal';
import { translations } from './i18n/translations';
import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // t as object — backward compatible with all components (t.quickTags, t.fieldLabels etc)
  const t = translations[lang] || translations.en;

  // i18next: used only for language sync / RTL switching
  const { i18n } = useTranslation();

  // Language side effect — also tells i18next to switch language
  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (lang === 'ur') {
      document.body.classList.add('font-urdu');
    } else {
      document.body.classList.remove('font-urdu');
    }
  }, [lang, i18n]);

  // Dark mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 ${lang === 'ur' ? 'urdu-mode' : ''} ${darkMode ? 'dark' : ''}`}>
      
      {/* 1. Public Non-Governmental Aggregator Disclaimer Banner */}
      <DisclaimerBanner 
        lang={lang} 
        onOpenGuide={() => {
          setCurrentScreen('guide');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Top Navigation Bar with Dark Mode & Language Toggles */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        t={t}
      />

      {/* 3. Main Content Screens */}
      <main className="flex-grow">
        {currentScreen === 'home' && (
          <HomeScreen
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            setCurrentScreen={setCurrentScreen}
            t={t}
            lang={lang}
          />
        )}

        {currentScreen === 'guide' && (
          <GuideScreen
            setCurrentScreen={setCurrentScreen}
            t={t}
            lang={lang}
          />
        )}

        {currentScreen === 'submit' && (
          <SubmitOpportunityScreen
            setCurrentScreen={setCurrentScreen}
            t={t}
            lang={lang}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminScreen
            setCurrentScreen={setCurrentScreen}
            t={t}
            lang={lang}
          />
        )}

        {currentScreen === 'chatbot' && (
          <ChatbotScreen
            setCurrentScreen={setCurrentScreen}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            t={t}
            lang={lang}
          />
        )}
      </main>

      {/* 4. Floating Animated Chatbot Assistant Launcher */}
      {currentScreen !== 'chatbot' && (
        <button
          type="button"
          onClick={() => {
            setCurrentScreen('chatbot');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#00401A] to-[#047857] hover:from-[#003314] hover:to-[#035840] text-white flex items-center justify-center shadow-2xl border-2 border-emerald-300/60 animate-chatbot-float cursor-pointer group active:scale-95 transition-all"
          title="Open Citizen AI Assistant"
          aria-label="Open Chatbot"
        >
          {/* Live Pulse Ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-[#00401A]"></span>
          </span>

          <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}

      {/* 5. Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          t={t}
          lang={lang}
        />
      )}

      {/* 6. Footer */}
      <Footer
        setCurrentScreen={setCurrentScreen}
        t={t}
        lang={lang}
      />

    </div>
  );
}

