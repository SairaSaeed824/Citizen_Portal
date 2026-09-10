import { useEffect, useMemo, useState } from 'react';
import HeroSection from '../components/HeroSection';
import CivicStatsDashboard from '../components/CivicStatsDashboard';
import CategoryNav from '../components/CategoryNav';
import OpportunityCard from '../components/OpportunityCard';
import SmallBanners from '../components/SmallBanners';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, RotateCcw, FolderOpen, Heart, Trash2, Clock, MapPin, CalendarDays, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { getOpportunities, getProvinces, getCategoryStats } from '../services/opportunitiesService';

const isExpired = (item) => {
  const raw = item?.closing_date || item?.extra_data?.closing_date || item?.extra_data?.deadline || item?.extra_data?.last_date;
  if (!raw) return false;
  const d = new Date(String(raw).slice(0, 10));
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

export default function HomeScreen({ onSelectOpportunity, t, lang }) {
  const isUrdu = lang === 'ur';
  const [opportunities, setOpportunities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [provinceQuery, setProvinceQuery] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  useEffect(() => {
    Promise.all([getProvinces(), getCategoryStats()])
      .then(([p, c]) => { setProvinces(p); setCategoryStats(c); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let data = await getOpportunities({ category: selectedCategory, province: selectedProvince, location, deadline, keyword, sortBy });
        data = data.filter((item) => showExpiredOnly ? isExpired(item) : !isExpired(item));
        if (showBookmarksOnly && !showExpiredOnly) {
          let saved = [];
          try { saved = JSON.parse(localStorage.getItem('portal_bookmarks') || '[]'); } catch { saved = []; }
          data = data.filter((item) => saved.includes(item.id));
        }
        setOpportunities(data);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setOpportunities([]);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, selectedCategory, selectedProvince, location, deadline, sortBy, showBookmarksOnly, showExpiredOnly]);

  const filteredProvinces = useMemo(() => {
    const q = provinceQuery.trim().toLowerCase();
    if (!q) return provinces;
    return provinces.filter((province) => province.toLowerCase().includes(q));
  }, [provinces, provinceQuery]);

  const clearFilters = () => {
    setKeyword(''); setSelectedCategory('all'); setSelectedProvince('all'); setProvinceQuery(''); setLocation(''); setDeadline('all'); setSortBy('default'); setShowBookmarksOnly(false); setShowExpiredOnly(false);
  };

  const activeFilters = keyword || selectedCategory !== 'all' || selectedProvince !== 'all' || location || deadline !== 'all' || sortBy !== 'default' || showBookmarksOnly || showExpiredOnly;
  const toggleBookmarks = () => { setShowBookmarksOnly((v) => !v); setShowExpiredOnly(false); };
  const toggleExpired = () => { setShowExpiredOnly((v) => !v); setShowBookmarksOnly(false); };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100">
      <HeroSection setKeyword={setKeyword} t={t} lang={lang} />
      <CivicStatsDashboard lang={lang} />

      <section id="directory" className="pt-5 pb-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900 dark:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Find an Opportunity</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Search by title and use filters to narrow results.</p>
              </div>
            </div>
            {activeFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters} className="h-8 gap-1 text-xs text-emerald-700 hover:text-emerald-800">
                <X className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400 z-10" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search opportunities by title..."
              aria-label="Search opportunities by title"
              className="pl-10 pr-4 h-11 rounded-xl bg-emerald-50/70 border-emerald-200 text-sm text-slate-800 placeholder:text-slate-400 shadow-inner dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 mt-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <SlidersHorizontal className="h-3 w-3" /> Filters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <Select value={selectedProvince} onValueChange={(value) => { setSelectedProvince(value); setProvinceQuery(''); }}>
              <SelectTrigger aria-label="Filter by province" className="h-10">
                <span className="flex items-center gap-2 min-w-0"><MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" /><SelectValue placeholder="All Provinces / Regions" /></span>
              </SelectTrigger>
              <SelectContent className="max-h-80 p-1.5">
                <div className="sticky top-0 z-10 bg-white pb-1.5 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      value={provinceQuery}
                      onChange={(e) => setProvinceQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Search province or region..."
                      className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <SelectItem value="all">All Provinces / Regions</SelectItem>
                {filteredProvinces.length > 0 ? filteredProvinces.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                )) : (
                  <div className="px-3 py-3 text-xs text-slate-400">No province found</div>
                )}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Search city / location..." className="pl-9 h-10 rounded-md" aria-label="Search city or location" />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger aria-label="Sort opportunities" className="h-10"><span className="flex items-center gap-2 min-w-0"><Sparkles className="h-4 w-4 text-amber-500 shrink-0" /><SelectValue placeholder="Recommended" /></span></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Recommended</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="closing_soon">Closing Soon</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deadline} onValueChange={setDeadline}>
              <SelectTrigger aria-label="Filter by deadline" className="h-10"><span className="flex items-center gap-2 min-w-0"><CalendarDays className="h-4 w-4 text-slate-400 shrink-0" /><SelectValue placeholder="Any Deadline" /></span></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Deadline</SelectItem>
                <SelectItem value="today">Closing Today</SelectItem>
                <SelectItem value="7_days">Within 7 Days</SelectItem>
                <SelectItem value="30_days">Within 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 flex items-center justify-end">
            <Button type="button" variant="ghost" onClick={clearFilters} disabled={!activeFilters} className="gap-1.5 h-7 px-2 text-[11px] text-slate-500">
              <RotateCcw className="h-3 w-3" /> Clear Filters
            </Button>
          </div>
        </div>
      </section>

      <CategoryNav categoryStats={categoryStats} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} t={t} lang={lang} />

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>{showExpiredOnly ? 'What You Missed' : showBookmarksOnly ? 'Saved Bookmarks' : t.latestOpportunities}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{opportunities.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={showBookmarksOnly ? 'default' : 'outline'} onClick={toggleBookmarks} className="h-9 gap-1.5 text-xs"><Heart className={showBookmarksOnly ? 'h-3.5 w-3.5 fill-current' : 'h-3.5 w-3.5'} /> Bookmarks</Button>
            <Button type="button" variant={showExpiredOnly ? 'default' : 'outline'} onClick={toggleExpired} className="h-9 gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> What You Missed</Button>
            {showBookmarksOnly && <Button type="button" variant="outline" onClick={() => { localStorage.removeItem('portal_bookmarks'); setOpportunities([]); }} className="h-9 gap-1.5 text-xs text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Clear Saved</Button>}
          </div>
        </div>

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />)}</div>}

        {!loading && opportunities.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center max-w-md mx-auto">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <h4 className="font-bold mb-1">{showExpiredOnly ? 'No Missed Opportunities' : showBookmarksOnly ? 'No Bookmarked Opportunities Yet' : 'No opportunities found'}</h4>
            <p className="text-xs text-slate-500 mb-5">Try another title, province, location, or deadline filter.</p>
            <Button type="button" onClick={clearFilters} className="gap-2"><RotateCcw className="h-4 w-4" /> Clear Filters</Button>
          </div>
        )}

        {!loading && opportunities.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={onSelectOpportunity} t={t} lang={lang} />)}</div>}
      </section>

      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <SmallBanners onSelectCategory={(cat) => { setSelectedCategory(cat); setShowExpiredOnly(false); setShowBookmarksOnly(false); }} lang={lang} />
      </div>
    </div>
  );
}
