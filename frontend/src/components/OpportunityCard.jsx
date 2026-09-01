import React from 'react';
import { 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Landmark, 
  Sparkles, 
  Building2,
  Clock,
  Coins,
  BookOpen,
  UserCheck
} from 'lucide-react';

const categoryIcons = {
  job: Briefcase,
  scholarship: GraduationCap,
  loan: Landmark,
  training: Sparkles,
  internship: Building2
};

export default function OpportunityCard({
  opportunity,
  onSelect,
  t,
  lang
}) {
  const isUrdu = lang === 'ur';

  const { id, category, extra_data = {} } = opportunity;
  const {
    title,
    organization,
    description,
    province,
    closing_date,
    apply_link,
    status
  } = extra_data;

  const CatIcon = categoryIcons[category?.toLowerCase()] || Briefcase;

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

  // Extract key highlight tag
  const getHighlightInfo = () => {
    if (extra_data.stipend) {
      return { icon: Coins, text: extra_data.stipend };
    }
    if (extra_data.loan_amount_max) {
      const max = `Max PKR ${(extra_data.loan_amount_max / 100000).toFixed(0)} Lakhs`;
      return { icon: Landmark, text: max };
    }
    if (extra_data.degree_level) {
      const levels = Array.isArray(extra_data.degree_level) ? extra_data.degree_level.join(', ') : extra_data.degree_level;
      return { icon: BookOpen, text: levels };
    }
    if (extra_data.vacancies) {
      return { icon: UserCheck, text: `${extra_data.vacancies} ${extra_data.vacancies === 1 ? 'Vacancy' : 'Vacancies'}` };
    }
    if (extra_data.duration) {
      return { icon: Clock, text: extra_data.duration };
    }
    return null;
  };

  const highlight = getHighlightInfo();

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (apply_link) {
      window.open(apply_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={() => onSelect(opportunity)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs pak-card cursor-pointer flex flex-col justify-between group transition-colors"
    >
      <div>
        {/* Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
            <CatIcon className="w-3 h-3 text-[#00401A] dark:text-emerald-400" />
            <span>{category}</span>
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#00401A] dark:group-hover:text-emerald-400 transition leading-snug mb-1.5 ${isUrdu ? 'urdu-text' : ''}`}>
          {title}
        </h4>

        {/* Organization */}
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3 truncate">
          {organization}
        </p>

        {/* Metadata Details */}
        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 mb-4">
          {province && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{province}</span>
            </div>
          )}

          {highlight && (
            <div className="flex items-center gap-1.5 text-[#00401A] dark:text-emerald-300 font-semibold bg-emerald-50/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md w-fit max-w-full border border-emerald-100 dark:border-emerald-900">
              <highlight.icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{highlight.text}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            {isClosingSoon ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                {daysRemaining === 0 ? t.endsToday : t.endsInDays.replace('{days}', daysRemaining)}
              </span>
            ) : closing_date ? (
              <span>{t.deadline}: <span className="font-semibold text-slate-800 dark:text-slate-200">{closing_date}</span></span>
            ) : (
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold">{t.ongoing}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(opportunity)}
          className="flex-1 py-2 px-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition text-center cursor-pointer"
        >
          {t.viewDetails}
        </button>

        <button
          type="button"
          onClick={handleApplyClick}
          className="flex-1 py-2 px-2 text-[11px] font-bold text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs btn-apply-glow transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{t.applyNow}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
