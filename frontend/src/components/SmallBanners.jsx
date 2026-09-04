import React from 'react';
import { ArrowUpRight, Sparkles, Flame } from 'lucide-react';

export const smallBannersData = [
  {
    id: 1,
    title: 'CM Honhaar Laptop Scheme',
    titleUrdu: 'وزیراعلیٰ لیپ ٹاپ سکیم',
    tag: 'Free Laptops',
    tagUrdu: 'مفت لیپ ٹاپس',
    highlight: 'Merit List Open',
    highlightUrdu: 'میرٹ لسٹ جاری',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'scholarship'
  },
  {
    id: 2,
    title: 'Kisan Card & Fertilizer Subsidy',
    titleUrdu: 'کسان کارڈ و کھاد سبسڈی',
    tag: 'Agriculture Package',
    tagUrdu: 'کسان پیکج',
    highlight: 'No Interest',
    highlightUrdu: 'بلاسود قرض',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'loan'
  },
  {
    id: 3,
    title: 'Honhaar Scholarships Program',
    titleUrdu: 'ہونہار اسکالرشپ پروگرام',
    tag: '100% Free Tuition',
    tagUrdu: 'تعلیمی وظائف',
    highlight: 'Undergrad & Masters',
    highlightUrdu: 'تمام طلبہ کے لیے',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'scholarship'
  },
  {
    id: 4,
    title: 'NAVTTC High-Tech IT Training',
    titleUrdu: 'ہائی ٹیک آئی ٹی ٹریننگ',
    tag: 'Free with Stipend',
    tagUrdu: 'مفت کورسز',
    highlight: 'Monthly PKR 5,000',
    highlightUrdu: 'ماہانہ وظیفہ',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'training'
  }
];

export default function SmallBanners({ 
  onSelectCategory, 
  lang 
}) {
  const isUrdu = lang === 'ur';

  const handleBannerClick = (catKey) => {
    if (onSelectCategory && catKey) {
      onSelectCategory(catKey);
    }
    const directoryEl = document.getElementById('directory');
    if (directoryEl) {
      directoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section aria-label="Featured Small Banners" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Sub-header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <h3 className={`text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? 'اہم قومی منصوبے' : 'Featured Flagship Initiatives'}
          </h3>
        </div>

        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>{isUrdu ? 'براہِ راست سرکاری رسائی' : 'Verified Direct Access'}</span>
        </span>
      </div>

      {/* 4 Small Banners Grid with Light Gradient & Crisp Fitted Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smallBannersData.map((banner) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner.categoryKey)}
            className="relative h-44 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-4 text-white bg-slate-900 hover:-translate-y-1.5 active:scale-98"
          >
            {/* Banner Image - Properly Fitted (object-cover) with subtle zoom */}
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Light Glassmorphic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:via-black/30 pointer-events-none transition-colors" />

            {/* Top Bar inside Card */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5 text-amber-300" />
                <span>{isUrdu ? banner.highlightUrdu : banner.highlight}</span>
              </span>

              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#00401A] transition-all duration-300 shadow-sm group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/90">
                {isUrdu ? banner.tagUrdu : banner.tag}
              </span>
              
              <h4 className={`text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-1 group-hover:text-emerald-200 transition drop-shadow-md ${isUrdu ? 'urdu-text' : ''}`}>
                {isUrdu ? banner.titleUrdu : banner.title}
              </h4>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}

