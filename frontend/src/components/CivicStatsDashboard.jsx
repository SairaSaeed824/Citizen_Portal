import React from 'react';
import { 
  Briefcase, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  TrendingUp,
  Sparkles,
  Users
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
      changeUrdu: 'آج اپ ڈیٹ شدہ'
    },
    {
      id: 2,
      icon: Building2,
      value: '48+',
      label: 'Federal & Provincial Depts',
      labelUrdu: 'وفاقی و صوبائی محکمے',
      change: 'Verified Sources',
      changeUrdu: 'مصدقہ ذرائع'
    },
    {
      id: 3,
      icon: GraduationCap,
      value: 'PKR 15B+',
      label: 'Grants & Youth Loans',
      labelUrdu: 'تعلیمی گرانٹس و قرضے',
      change: '0% Interest Schemes',
      changeUrdu: 'بلاسود سکیمیں'
    },
    {
      id: 4,
      icon: ShieldCheck,
      value: '100% Free',
      label: 'Public Directory Access',
      labelUrdu: 'شہریوں کیلئے مفت رسائی',
      change: 'No Login Required',
      changeUrdu: 'بغیر لاگ ان'
    }
  ];

  return (
    <section aria-label="Portal Metrics Dashboard" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4.5 shadow-2xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00401A] dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {isUrdu ? item.changeUrdu : item.change}
                </span>
              </div>

              <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
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
