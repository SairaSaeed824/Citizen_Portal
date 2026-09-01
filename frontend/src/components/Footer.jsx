import React from 'react';
import { 
  Building2, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck,
  AlertTriangle 
} from 'lucide-react';

export default function Footer({ 
  setCurrentScreen, 
  t, 
  lang 
}) {
  const isUrdu = lang === 'ur';

  return (
    <footer className="bg-[#00240e] dark:bg-[#00170a] text-emerald-100/80 border-t border-emerald-900/60 transition-colors">
      
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Overview (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {/* Circular Emblem */}
              <div className="w-10 h-10 rounded-full bg-[#00401A] border-2 border-emerald-400/50 flex items-center justify-center text-white shadow-sm shrink-0">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="#00401A" />
                  <path d="M64,26 A25,25 0 1,0 64,74 A20,20 0 1,1 64,26 Z" fill="#FFFFFF" />
                  <polygon points="65,35 68,46 79,46 70,53 74,64 65,57 56,64 59,53 51,46 62,46" fill="#FFFFFF" />
                </svg>
              </div>

              <div>
                <h4 className={`text-base font-extrabold text-white tracking-tight ${isUrdu ? 'urdu-text' : ''}`}>
                  {t.portalTitle}
                </h4>
                <p className="text-[11px] text-emerald-300 font-medium">
                  {lang === 'ur' ? 'قومی عوامی ڈائریکٹری' : 'Public Awareness Directory'}
                </p>
              </div>
            </div>

            <p className={`text-xs text-emerald-100/70 leading-relaxed max-w-sm ${isUrdu ? 'urdu-text' : ''}`}>
              {t.footerAboutDesc}
            </p>

            {/* Explicit Legal & Non-Governmental Disclaimer Box */}
            <div className="p-3.5 bg-[#001c0b] dark:bg-black/50 rounded-2xl border border-emerald-900/70 text-xs text-emerald-200/90 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Important Public Disclaimer</span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                {isUrdu 
                  ? 'یہ پورٹل ایک خود مختار معلوماتی ایگریگیٹر ہے اور کسی حکومتی ادارے کا باضابطہ نمائندہ نہیں ہے۔ صارفین تمام تفصیلات متعلقہ محکموں کے آفیشل پورٹل سے ضرور تصدیق کریں۔'
                  : 'This platform is an independent public opportunities aggregator for citizen convenience and is not directly owned by or affiliated with the Government of Pakistan. Users must verify criteria directly on official department websites.'
                }
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h5 className={`text-xs font-bold text-white uppercase tracking-wider ${isUrdu ? 'urdu-text' : ''}`}>
              {t.footerImportantLinks}
            </h5>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li>
                <button 
                  onClick={() => { setCurrentScreen('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentScreen('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.navSubmit}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentScreen('chatbot'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.navChatbot}
                </button>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t.footerHelpDesk}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t.footerSitemap}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Public Policy (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h5 className={`text-xs font-bold text-white uppercase tracking-wider ${isUrdu ? 'urdu-text' : ''}`}>
              {t.footerLegal}
            </h5>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t.footerPrivacy}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t.footerTerms}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  Open Data Standards
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Public Directory Info (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Citizen Gateway
            </h5>
            <p className="text-xs text-emerald-100/70">
              Open Public Directory for Citizen Opportunities
            </p>
            <p className="text-xs text-emerald-300 font-medium">
              Digital Pakistan Awareness
            </p>
            <p className="text-[11px] text-emerald-200/50">
              Islamabad, Pakistan
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar in Unified Pakistan Dark Green */}
      <div className="border-t border-emerald-950 bg-[#001708] py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-emerald-300/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerCopyright}</span>
          <span className="text-[11px] text-emerald-400/90 font-medium">
            Independent Citizen Opportunities Aggregator
          </span>
        </div>
      </div>

    </footer>
  );
}
