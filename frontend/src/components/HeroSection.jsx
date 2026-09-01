import React from 'react';
import { Search, MapPin } from 'lucide-react';

export default function HeroSection({
  keyword,
  setKeyword,
  selectedProvince,
  setSelectedProvince,
  provinces,
  onSearchSubmit,
  t,
  lang
}) {
  const isUrdu = lang === 'ur';

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <div className="relative pakistan-hero-bg dark:pakistan-hero-bg-dark text-white overflow-hidden py-10 sm:py-14 border-b border-emerald-900/40 transition-colors">
      {/* Background Pattern */}
      <div className="absolute inset-0 pakistan-pattern opacity-15 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Urdu Main Calligraphic Heading */}
        <h2 className="urdu-text text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 leading-relaxed">
          {t.heroUrduHeading}
        </h2>
        
        {/* English Subheading */}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-100 dark:text-emerald-200 mb-3 tracking-tight">
          {t.heroEnglishHeading}
        </h3>

        <p className={`max-w-xl mx-auto text-emerald-100/90 dark:text-emerald-200/80 text-xs sm:text-sm mb-6 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
          {t.heroDescription}
        </p>

        {/* Clean Search Container */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-xl border border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 max-w-2xl mx-auto">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Province Select Dropdown */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-800 dark:text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                aria-label="Filter by Province"
                className="w-full pl-8 pr-7 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 text-slate-700 dark:text-slate-200 transition cursor-pointer appearance-none truncate"
              >
                <option value="all">{t.allProvinces}</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.searchBtn}</span>
            </button>

          </form>
        </div>

        {/* Quick Tags */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-emerald-100/90 dark:text-emerald-200/90">
          <span className="font-semibold text-emerald-200">{t.quickSearchTag}</span>
          {t.quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setKeyword(tag)}
              className="bg-emerald-950/60 hover:bg-emerald-900 text-white border border-emerald-400/40 rounded-md px-2.5 py-0.5 transition cursor-pointer text-[11px] hover:border-emerald-300"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
