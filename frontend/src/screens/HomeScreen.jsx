import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import CivicStatsDashboard from '../components/CivicStatsDashboard';
import CategoryNav from '../components/CategoryNav';
import OpportunityCard from '../components/OpportunityCard';
import SmallBanners from '../components/SmallBanners';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, RotateCcw, FolderOpen, Heart, Trash2, Clock, MapPin, Building2, CalendarDays, ArrowUpDown } from 'lucide-react';
import { getOpportunities, getProvinces, getCategoryStats } from '../services/opportunitiesService';

const isExpired = (item) => {
  const raw = item?.closing_date || item?.extra_data?.closing_date || item?.extra_data?.deadline || item?.extra_data?.last_date;
  if (!raw) return false;
  const d = new Date(String(raw).slice(0, 10));
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
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
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
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
        let data = await getOpportunities({
          category: selectedCategory,
          province: selectedProvince,
          location,
          organization,
          deadline,
          keyword,
          sortBy,
        });

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
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, selectedCategory, selectedProvince, location, organization, deadline, sortBy, showBookmarksOnly, showExpiredOnly]);

  const clearFilters = () => {
    setKeyword(''); setSelectedCategory('all'); setSelectedProvince('all');
    setLocation(''); setOrganization(''); setDeadline('all'); setSortBy('default');
    setShowBookmarksOnly(false); setShowExpiredOnly(false);
  };

  const activeFilters = keyword || selectedCategory !== 'all' || selectedProvince !== 'all' || location || organization || deadline !== 'all' || sortBy !== 'default' || showBookmarksOnly || showExpiredOnly;

  const toggleBookmarks = () => { setShowBookmarksOnly(v => !v); setShowExpiredOnly(false); };
  const toggleExpired = () => { setShowExpiredOnly(v => !v); setShowBookmarksOnly(false); };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100">
      <HeroSection keyword={keyword} setKeyword={setKeyword} selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince} provinces={provinces} t={t} lang={lang} />
      <CivicStatsDashboard lang={lang} />
      <CategoryNav categoryStats={categoryStats} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} t={t} lang={lang} />

      <section id="directory" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by opportunity title..." className="pl-9" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Filter by city / location" className="pl-9" />
            </div>
            <div className="relative flex-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Filter by organization" className="pl-9" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} aria-label="Filter by province">
              <option value="all">All Provinces</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
              <Select value={deadline} onChange={(e) => setDeadline(e.target.value)} className="pl-9" aria-label="Filter by deadline">
                <option value="all">Any Deadline</option><option value="today">Closing Today</option><option value="7_days">Within 7 Days</option><option value="30_days">Within 30 Days</option>
              </Select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-9" aria-label="Sort opportunities">
                <option value="default">Recommended</option><option value="newest">Newest</option><option value="closing_soon">Closing Soon</option><option value="title">Title A–Z</option>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={clearFilters} disabled={!activeFilters} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Clear Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>
              {showExpiredOnly ? 'What You Missed' : showBookmarksOnly ? 'Saved Bookmarks' : t.latestOpportunities}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{opportunities.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={showBookmarksOnly ? 'default' : 'outline'} onClick={toggleBookmarks} className="h-9 gap-1.5 text-xs">
              <Heart className={showBookmarksOnly ? 'h-3.5 w-3.5 fill-current' : 'h-3.5 w-3.5'} /> Bookmarks
            </Button>
            <Button type="button" variant={showExpiredOnly ? 'default' : 'outline'} onClick={toggleExpired} className="h-9 gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" /> What You Missed
            </Button>
            {showBookmarksOnly && <Button type="button" variant="outline" onClick={() => { localStorage.removeItem('portal_bookmarks'); setOpportunities([]); }} className="h-9 gap-1.5 text-xs text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Clear Saved</Button>}
          </div>
        </div>

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />)}</div>}

        {!loading && opportunities.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center max-w-md mx-auto">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <h4 className="font-bold mb-1">{showExpiredOnly ? 'No Missed Opportunities' : showBookmarksOnly ? 'No Bookmarked Opportunities Yet' : 'No opportunities found'}</h4>
            <p className="text-xs text-slate-500 mb-5">Try another title, province, organization, location, or deadline filter.</p>
            <Button type="button" onClick={clearFilters} className="gap-2"><RotateCcw className="h-4 w-4" /> Clear Filters</Button>
          </div>
        )}

        {!loading && opportunities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={onSelectOpportunity} t={t} lang={lang} />)}
          </div>
        )}
      </section>

      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <SmallBanners onSelectCategory={(cat) => { setSelectedCategory(cat); setShowExpiredOnly(false); setShowBookmarksOnly(false); }} lang={lang} />
      </div>
    </div>
  );
}
