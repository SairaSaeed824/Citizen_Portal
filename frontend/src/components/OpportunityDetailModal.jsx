import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  MapPin, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Landmark, 
  Sparkles, 
  Building, 
  Share2, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  MessageCircle,
  Calendar,
  Flame
} from 'lucide-react';

const categoryIcons = {
  job: Briefcase,
  scholarship: GraduationCap,
  loan: Landmark,
  training: Sparkles,
  internship: Building
};

export default function OpportunityDetailModal({
  opportunity,
  onClose,
  t,
  lang
}) {
  const [copied, setCopied] = useState(false);

  if (!opportunity) return null;

  const { id, category, extra_data = {} } = opportunity;
  const {
    title = 'Opportunity Details',
    organization = 'Government Department',
    description = '',
    province = 'All Pakistan',
    closing_date = '',
    apply_link = '#',
    status = 'active'
  } = extra_data;

  const isUrdu = lang === 'ur';
  const CatIcon = categoryIcons[category?.toLowerCase()] || Briefcase;

  const standardKeys = new Set(['title', 'organization', 'description', 'apply_link', 'status']);
  const dynamicEntries = Object.entries(extra_data).filter(
    ([key]) => !standardKeys.has(key)
  );

  // Calculate days remaining
  let daysRemaining = null;
  let isClosingSoon = false;
  if (closing_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(closing_date);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysRemaining >= 0 && daysRemaining <= 7) {
      isClosingSoon = true;
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const shareText = `*${title}*\n🏛 Organization: ${organization}\n📍 Province: ${province}\n📅 Deadline: ${closing_date || 'Open'}\n🔗 Apply Link: ${apply_link}\n\n_Shared via Citizen Opportunities Portal_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const formatFieldValue = (val) => {
    if (val === true) return 'Yes / فراہم کیا جائے گا';
    if (val === false) return 'No / درکار نہیں';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'number') {
      if (val >= 1000) {
        return `PKR ${val.toLocaleString()}`;
      }
      return val.toString();
    }
    return String(val);
  };

  const getFieldFriendlyName = (key) => {
    if (t.fieldLabels && t.fieldLabels[key]) {
      return t.fieldLabels[key];
    }
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in-up"
      onClick={onClose}
    >
      
      {/* Modal Container with Spring Animation */}
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto relative animate-spring-in transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar - Pakistan Green */}
        <div className="pakistan-hero-bg dark:pakistan-hero-bg-dark text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/25 hover:bg-black/50 text-white transition cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
              <CatIcon className="w-3.5 h-3.5" />
              <span>{category}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-200 border border-emerald-400/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.verifiedGovt}</span>
            </span>

            {isClosingSoon && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/30 text-rose-200 border border-rose-400/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{daysRemaining === 0 ? 'Ends Today!' : `${daysRemaining} Days Left`}</span>
              </span>
            )}
          </div>

          <h3 className={`text-xl sm:text-2xl font-extrabold text-white leading-snug mb-2.5 ${isUrdu ? 'urdu-text' : ''}`}>
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-100 dark:text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{organization}</span>
            </div>
            {province && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{province}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          
          {/* Description Section */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2 ${isUrdu ? 'urdu-text' : ''}`}>
              <FileText className="w-4 h-4 text-[#00401A] dark:text-emerald-400" />
              <span>{t.aboutProgram}</span>
            </h4>
            <div className={`bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm ${isUrdu ? 'urdu-text' : ''}`}>
              {description}
            </div>
          </div>

          {/* Dynamic Key Information Grid */}
          {dynamicEntries.length > 0 && (
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2 ${isUrdu ? 'urdu-text' : ''}`}>
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t.keyInformation}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dynamicEntries.map(([key, value]) => (
                  <div 
                    key={key} 
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition shadow-2xs"
                  >
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      {getFieldFriendlyName(key)}
                    </span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {formatFieldValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Agency Notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3 text-emerald-950 dark:text-emerald-200 text-xs">
            <AlertCircle className="w-4 h-4 text-[#00401A] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Direct Application Gateway</p>
              <p className="text-emerald-900/90 dark:text-emerald-200/80">{t.officialApplyNotice}</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/90 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              {t.backToDirectory}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Share Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t.linkCopied : t.shareOpportunity}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 transition flex items-center gap-1.5 cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </button>
          </div>

          <a
            href={apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 btn-apply-glow cursor-pointer"
          >
            <span>{t.applyNow}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

        </div>

      </div>

    </div>
  );
}

