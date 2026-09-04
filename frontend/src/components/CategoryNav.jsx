import React from 'react';
import { 
  Compass, 
  Briefcase, 
  GraduationCap, 
  Landmark, 
  Sparkles, 
  Building2 
} from 'lucide-react';

const categoryIcons = {
  all: Compass,
  job: Briefcase,
  scholarship: GraduationCap,
  loan: Landmark,
  training: Sparkles,
  internship: Building2
};

const categoryNames = {
  en: {
    all: 'All Opportunities',
    job: 'Jobs',
    scholarship: 'Scholarships',
    loan: 'Loans',
    training: 'Training',
    internship: 'Internships'
  },
  ur: {
    all: 'تمام مواقع',
    job: 'نوکریاں',
    scholarship: 'وظائف',
    loan: 'قرضے',
    training: 'ٹریننگ',
    internship: 'انٹرن شپس'
  }
};

export default function CategoryNav({
  categoryStats = [],
  selectedCategory,
  setSelectedCategory,
  t,
  lang
}) {
  const isUrdu = lang === 'ur';
  const currentLangNames = categoryNames[lang] || categoryNames.en;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Category Nav with Smooth Hover Lift */}
        <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar">
          {categoryStats.map((item) => {
            const Icon = categoryIcons[item.key] || Compass;
            const isSelected = selectedCategory === item.key;
            const labelText = currentLangNames[item.key] || item.label;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedCategory(item.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-[#00401A] dark:bg-emerald-600 text-white shadow-md -translate-y-0.5 scale-102'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-[#00401A] dark:hover:text-emerald-300 border border-slate-200/90 dark:border-slate-700/80 hover:-translate-y-0.5 hover:shadow-2xs'
                } ${isUrdu ? 'urdu-text' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{labelText}</span>

                {/* Count Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

