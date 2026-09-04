export default function Footer({ 
  t, 
  lang 
}) {
  const isUrdu = lang === 'ur';

  return (
    <footer className="pakistan-hero-bg dark:pakistan-hero-bg-dark text-white border-t border-emerald-900/60 transition-colors py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Crest */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#00401A" />
                <path d="M64,26 A25,25 0 1,0 64,74 A20,20 0 1,1 64,26 Z" fill="#FFFFFF" />
                <polygon points="65,35 68,46 79,46 70,53 74,64 65,57 56,64 59,53 51,46 62,46" fill="#FFFFFF" />
              </svg>
            </div>

            <div>
              <span className={`text-xs font-extrabold text-white block ${isUrdu ? 'urdu-text' : ''}`}>
                {t.portalTitle}
              </span>
              <span className="text-[10px] text-emerald-200/80">
                {lang === 'ur' ? 'عوامی ڈائریکٹری و معلوماتی سروس' : 'Independent Public Aggregator'}
              </span>
            </div>
          </div>

          {/* Legal / Policy Indicators only */}
          <div className="flex items-center gap-4 text-[11px] text-emerald-200/80">
            <span>{t.footerCopyright}</span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">
              {isUrdu ? 'تمام حقوق محفوظ ہیں' : 'All Rights Reserved'}
            </span>
          </div>

        </div>

        {/* Minimal Legal Verification Disclaimer */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 text-center text-[10px] text-emerald-200/70">
          {isUrdu 
            ? 'نوٹ: یہ پورٹل صرف معلومات کی آسانی کے لیے ہے۔ برائے مہربانی اپلائی کرنے سے قبل متعلقہ محکمے کے پورٹل (.gov.pk) سے شرائط کی تصدیق کریں۔'
            : 'Public Notice: This portal aggregates opportunities for citizen convenience. Always verify official eligibility and deadlines on department websites (.gov.pk).'
          }
        </div>

      </div>
    </footer>
  );
}