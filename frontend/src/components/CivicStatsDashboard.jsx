import { 
  Briefcase, 
  Building2, 
  GraduationCap, 
  ShieldCheck
} from 'lucide-react';

export default function CivicStatsDashboard({ lang }) {
  const isUrdu = lang === 'ur';

  const stats = [
    {
      id: 1,
      icon: Briefcase,
      value: '1,250+',
      label: 'Active Opportunities',
      labelUrdu: 'مجموعی فعال مواقع',
      change: 'Updated Today',
      changeUrdu: 'آج اپ ڈیٹ شدہ',
      color: 'from-emerald-500 to-teal-700'
    },
    {
      id: 2,
      icon: Building2,
      value: '48+',
      label: 'Federal & Provincial Depts',
      labelUrdu: 'وفاقی و صوبائی محکمے',
      change: 'Verified Sources',
      changeUrdu: 'مصدقہ ذرائع',
      color: 'from-blue-500 to-indigo-700'
    },
    {
      id: 3,
      icon: GraduationCap,
      value: 'PKR 15B+',
      label: 'Grants & Youth Loans',
      labelUrdu: 'تعلیمی گرانٹس و قرضے',
      change: '0% Markup Schemes',
      changeUrdu: 'بلاسود سکیمیں',
      color: 'from-purple-500 to-violet-700'
    },
    {
      id: 4,
      icon: ShieldCheck,
      value: '100% Free',
      label: 'Public Directory Access',
      labelUrdu: 'شہریوں کیلئے مفت رسائی',
      change: 'No Login Required',
      changeUrdu: 'بغیر لاگ ان',
      color: 'from-amber-500 to-orange-700'
    }
  ];

  return (
    <section aria-label="Portal Metrics Dashboard" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 group cursor-pointer animate-fade-in-up animate-delay-${(idx + 1) * 100}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                  {isUrdu ? item.changeUrdu : item.change}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5 group-hover:text-[#00401A] dark:group-hover:text-emerald-400 transition-colors">
                {item.value}
              </div>

              <p className={`text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight ${isUrdu ? 'urdu-text' : ''}`}>
                {isUrdu ? item.labelUrdu : item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}