import { useState } from 'react';
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
  UserCheck,
  Flame,
  Heart,
  XCircle,
  AlarmClock
} from 'lucide-react';

const categoryConfig = {
  job: {
    icon: Briefcase,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/80',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  scholarship: {
    icon: GraduationCap,
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800/80',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  loan: {
    icon: Landmark,
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800/80',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  training: {
    icon: Sparkles,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  internship: {
    icon: Building2,
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    badgeBorder: 'border-sky-200 dark:border-sky-800/80',
    iconColor: 'text-sky-600 dark:text-sky-400'
  }
};

function getInitialBookmarkState(id) {
  try {
    const savedBookmarks = JSON.parse(localStorage.getItem('portal_bookmarks') || '[]');
    return savedBookmarks.includes(id);
  } catch (err) {
    console.error('Failed to load bookmarks from localStorage', err);
    return false;
  }
}

export default function OpportunityCard({
  opportunity,
  onSelect,
  onBookmarkToggle,
  t,
  lang
}) {
  const isUrdu = lang === 'ur';

  const { id, category = 'job', extra_data = {} } = opportunity;
  const {
    title,
    organization,
    province,
    closing_date,
    apply_link
  } = extra_data;

  const catKey = category?.toLowerCase();
  const config = categoryConfig[catKey] || categoryConfig.job;
  const CatIcon = config.icon;

  const [isBookmarked, setIsBookmarked] = useState(() => getInitialBookmarkState(id));

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    try {
      const savedBookmarks = JSON.parse(localStorage.getItem('portal_bookmarks') || '[]');
      let updatedBookmarks;

      if (isBookmarked) {
        updatedBookmarks = savedBookmarks.filter(itemIds => itemIds !== id);
        setIsBookmarked(false);
      } else {
        updatedBookmarks = [...savedBookmarks, id];
        setIsBookmarked(true);
      }

      localStorage.setItem('portal_bookmarks', JSON.stringify(updatedBookmarks));
      window.dispatchEvent(new Event('bookmarksUpdated'));

      if (onBookmarkToggle) {
        onBookmarkToggle(id);
      }
    } catch (err) {
      console.error('Failed to update bookmark in localStorage', err);
    }
  };

  // Deadline calculations — three distinct states
  let daysRemaining = null;
  let isClosingSoon = false;   // within 7 days (but not today)
  let isExpiringToday = false; // deadline is today — most urgent
  let isExpired = false;       // deadline already passed

  if (closing_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(closing_date);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      isExpired = true;
    } else if (daysRemaining === 0) {
      isExpiringToday = true;
    } else if (daysRemaining <= 7) {
      isClosingSoon = true;
    }
  }

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
    if (isExpired) return;
    if (apply_link) {
      window.open(apply_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={() => onSelect(opportunity)}
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-4.5 shadow-xs pak-card cursor-pointer flex flex-col justify-between group transition-all duration-200 relative ${
        isExpired 
          ? 'border-slate-200 dark:border-slate-800 grayscale opacity-60 hover:opacity-80' 
          : isExpiringToday
          ? 'border-red-400 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/60 animate-pulse-slow'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600'
      }`}
    >
      <style>{`
        @keyframes pulse-slow-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-slow {
          animation: pulse-slow-border 1.8s ease-in-out infinite;
        }
        @keyframes alarm-shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(6deg); }
        }
        .alarm-shake {
          animation: alarm-shake 0.7s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder} capitalize`}>
              <CatIcon className={`w-3 h-3 ${config.iconColor}`} />
              <span>{category}</span>
            </span>

            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                <XCircle className="w-3 h-3 text-slate-500" />
                <span>{t.expired || 'Expired'}</span>
              </span>
            )}

            {isExpiringToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-700">
                <AlarmClock className="w-3 h-3 text-red-600 dark:text-red-400 alarm-shake" />
                <span>{t.endsToday || 'Ends Today!'}</span>
              </span>
            )}

            {isClosingSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <Flame className="w-3 h-3 text-rose-500" />
                <span>{`${daysRemaining}d Left`}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label="Bookmark opportunity"
            className={`p-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
              isBookmarked 
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 scale-110' 
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        <h4 className={`text-sm font-bold line-clamp-2 transition-colors leading-snug mb-1.5 ${
          isExpired 
            ? 'text-slate-500 dark:text-slate-500' 
            : 'text-slate-900 dark:text-white group-hover:text-[#00401A] dark:group-hover:text-emerald-400'
        } ${isUrdu ? 'urdu-text' : ''}`}>
          {title}
        </h4>

        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3 truncate">
          {organization}
        </p>

        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 mb-4">
          {province && (
            <div className="flex items-center gap-1.5">
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isExpired ? 'text-slate-400 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{province}</span>
            </div>
          )}

          {highlight && (
            <div className={`flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-md w-fit max-w-full border ${
              isExpired
                ? 'text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                : 'text-[#00401A] dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900'
            }`}>
              <highlight.icon className={`w-3.5 h-3.5 shrink-0 ${isExpired ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`} />
              <span className="truncate">{highlight.text}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            {isExpired ? (
              <span className="text-slate-500 dark:text-slate-500 font-semibold">
                {t.expiredOn ? t.expiredOn.replace('{date}', closing_date) : `Closed on ${closing_date}`}
              </span>
            ) : isExpiringToday ? (
              <span className="text-red-600 dark:text-red-400 font-extrabold">
                {t.endsToday || 'Ends Today — Apply Now!'}
              </span>
            ) : closing_date ? (
              <span>{t.deadline}: <span className="font-semibold text-slate-800 dark:text-slate-200">{closing_date}</span></span>
            ) : (
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold">{t.ongoing}</span>
            )}
          </div>
        </div>
      </div>

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
          disabled={isExpired}
          className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 ${
            isExpired
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 btn-apply-glow cursor-pointer'
          }`}
        >
          <span>{isExpired ? (t.applicationClosed || 'Closed') : t.applyNow}</span>
          {!isExpired && <ExternalLink className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}