import { Search, MapPin, Flame } from 'lucide-react';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';

export default function HeroSection({ keyword, setKeyword, selectedProvince, setSelectedProvince, provinces, onSearchSubmit, t, lang }) {
  const isUrdu = lang === 'ur';
  const handleFormSubmit = (e) => { e.preventDefault(); onSearchSubmit?.(); };

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

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl border-2 border-emerald-300/70 text-slate-800 dark:text-slate-100 max-w-2xl mx-auto">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800 dark:text-emerald-400 z-10" />
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search opportunity title..." className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200" />
            </div>
            <div className="relative w-full sm:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 z-10 pointer-events-none" />
              <Select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="pl-8 h-11" aria-label="Filter by province">
                <option value="all">{t.allProvinces}</option>
                {provinces.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
              </Select>
            </div>
            <Button type="submit" className="w-full sm:w-auto h-11 gap-1.5 px-6 shrink-0">
              <Search className="w-4 h-4" /><span>{t.searchBtn}</span>
            </Button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-emerald-100/90">
          <span className="font-bold text-emerald-200 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-400" />{t.quickSearchTag}</span>
          {t.quickTags.map((tag) => <button key={tag} type="button" onClick={() => setKeyword(tag)} className="bg-emerald-950/70 hover:bg-emerald-900 text-white border border-emerald-400/40 rounded-lg px-2.5 py-1 text-[11px]">{tag}</button>)}
        </div>
      </div>
    </div>
  );
}
