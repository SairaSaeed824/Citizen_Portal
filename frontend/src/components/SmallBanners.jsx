import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * Small Banners Configuration
 * You can replace the 'imageUrl' values with any direct image URL or local asset.
 */
export const smallBannersData = [
  {
    id: 1,
    title: 'CM Honhaar Laptop Scheme',
    titleUrdu: 'وزیراعلیٰ لیپ ٹاپ سکیم 2026',
    tag: 'Free Laptops',
    tagUrdu: 'مفت لیپ ٹاپس',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'scholarship'
  },
  {
    id: 2,
    title: 'Kisan Card & Diesel Subsidy',
    titleUrdu: 'کسان کارڈ و ڈیزل سبسڈی',
    tag: 'Agriculture Package',
    tagUrdu: 'کسان پیکج',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'loan'
  },
  {
    id: 3,
    title: 'Honhaar Scholarships 2026',
    titleUrdu: 'ہونہار اسکالرشپ پروگرام',
    tag: '100% Free Tuition',
    tagUrdu: 'تعلیمی وظائف',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    categoryKey: 'scholarship'
  },
  {
    id: 4,
    title: 'IT Skills & NAVTTC Training',
    titleUrdu: 'آئی ٹی و ٹیکنیکل ٹریننگ',
    tag: 'Free with Stipend',
    tagUrdu: 'مفت کورسز',
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
    <section aria-label="Featured Small Banners" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 4 Small Banners Grid with Light Gradient & Crisp Fitted Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smallBannersData.map((banner) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner.categoryKey)}
            className="relative h-36 sm:h-40 rounded-2xl overflow-hidden border border-emerald-300/60 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all duration-300 cursor-pointer group flex flex-col justify-end p-4 text-white bg-slate-900"
          >
            {/* Banner Image - Properly Fitted (object-cover) */}
            <img 
              src={banner.imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop'} 
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
              loading="lazy"
            />

            {/* Very Light Gradient Overlay (Transparent top, gentle dark base for clear text) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001f0cb8] via-[#001f0c33] to-transparent pointer-events-none" />

            {/* Top Right Corner Action Pill */}
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#00401A] transition-all shadow-sm">
              <ArrowUpRight className="w-4 h-4" />
            </div>

            {/* Content Area */}
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-black/40 text-emerald-300 border border-emerald-400/40 backdrop-blur-xs mb-1">
                {isUrdu ? banner.tagUrdu : banner.tag}
              </span>
              
              <h4 className={`text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-emerald-200 transition drop-shadow-md ${isUrdu ? 'urdu-text' : ''}`}>
                {isUrdu ? banner.titleUrdu : banner.title}
              </h4>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
