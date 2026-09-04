import { Search, MapPin, Flame } from 'lucide-react';

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
    <div className="relative pakistan-hero-bg dark:pakistan-hero-bg-dark text-white overflow-hidden py-12 sm:py-16 border-b border-emerald-900/40 transition-colors">

      {/* Animated Floating Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none hero-orb-1"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-80 h-80 rounded-full bg-teal-300/15 blur-3xl pointer-events-none hero-orb-2"></div>
      <div className="absolute top-[30%] right-[15%] w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none hero-orb-1"></div>

      {/* Background Radial Pattern */}
      <div className="absolute inset-0 pakistan-pattern opacity-15 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">

        {/* Clean Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/25 dark:bg-black/40 text-emerald-200 text-xs font-bold border border-emerald-400/30 mb-6 backdrop-blur-md shadow-xs animate-fade-in-up">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
          </span>
          <span className="tracking-wide">
            {isUrdu ? 'قومی عوامی مواقع ڈائریکٹری' : 'Citizen Opportunities Gateway'}
          </span>
        </div>

        {/* Urdu Main Calligraphic Heading with Soft Glow */}
        <h2 className="urdu-text text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-relaxed animate-text-glow drop-shadow-md">
          {t.heroUrduHeading}
        </h2>

        {/* English Subheading */}
        <h3 className="text-base sm:text-xl md:text-2xl font-bold text-emerald-100 dark:text-emerald-200 mb-3 tracking-tight">
          {t.heroEnglishHeading}
        </h3>

        <p className={`max-w-xl mx-auto text-emerald-100/90 dark:text-emerald-200/80 text-xs sm:text-sm mb-7 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
          {t.heroDescription}
        </p>

        {/* Elevated Interactive Search Container with Glow */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl border-2 border-emerald-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-100 max-w-2xl mx-auto transition-all duration-300 hover:shadow-emerald-950/20 hover:border-emerald-400">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2">

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-800 dark:text-emerald-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition shadow-2xs"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Province Select Dropdown */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-800 dark:text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                aria-label="Filter by Province"
                className="w-full pl-8 pr-7 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 text-slate-700 dark:text-slate-200 transition cursor-pointer appearance-none truncate font-medium shadow-2xs"
              >
                <option value="all">{t.allProvinces}</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer shrink-0 active:scale-95 btn-apply-glow"
            >
              <Search className="w-4 h-4" />
              <span>{t.searchBtn}</span>
            </button>

          </form>
        </div>

        {/* Quick Tags with Smooth Floating Hover */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-emerald-100/90 dark:text-emerald-200/90">
          <span className="font-bold text-emerald-200 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.quickSearchTag}</span>
          </span>
          {t.quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setKeyword(tag)}
              className="bg-emerald-950/70 hover:bg-emerald-900 text-white border border-emerald-400/40 hover:border-emerald-300 rounded-lg px-2.5 py-1 transition-all duration-200 cursor-pointer text-[11px] font-medium shadow-xs hover:-translate-y-0.5"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}