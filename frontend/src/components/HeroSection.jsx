import { Flame } from 'lucide-react';

export default function HeroSection({ setKeyword, t, lang }) {
  const isUrdu = lang === 'ur';

  return (
    <div className="relative pakistan-hero-bg dark:pakistan-hero-bg-dark text-white overflow-hidden py-12 sm:py-16 border-b border-emerald-900/40">
      <div className="absolute inset-0 pakistan-pattern opacity-15 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/25 text-emerald-200 text-xs font-bold border border-emerald-400/30 mb-6 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>{isUrdu ? 'قومی عوامی مواقع ڈائریکٹری' : 'Citizen Opportunities Gateway'}</span>
        </div>

        <h2 className="urdu-text text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-relaxed">
          {t.heroUrduHeading}
        </h2>
        <h3 className="text-base sm:text-xl md:text-2xl font-bold text-emerald-100 mb-3">{t.heroEnglishHeading}</h3>
        <p className="max-w-xl mx-auto text-emerald-100/90 text-xs sm:text-sm mb-7 leading-relaxed">{t.heroDescription}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-100/90">
          <span className="font-bold text-emerald-200 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {t.quickSearchTag}
          </span>
          {t.quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setKeyword(tag)}
              className="bg-emerald-950/70 hover:bg-emerald-900 text-white border border-emerald-400/40 rounded-lg px-3 py-1.5 text-[11px] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
