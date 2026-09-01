import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import CivicStatsDashboard from '../components/CivicStatsDashboard';
import CategoryNav from '../components/CategoryNav';
import OpportunityCard from '../components/OpportunityCard';
import SmallBanners from '../components/SmallBanners';
import { RotateCcw, FolderOpen, Loader2 } from 'lucide-react';
import { getOpportunities, getProvinces, getCategoryStats } from '../services/opportunitiesService';

export default function HomeScreen({
  onSelectOpportunity,
  t,
  lang
}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  
  // Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const isUrdu = lang === 'ur';

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [provList, catList] = await Promise.all([
          getProvinces(),
          getCategoryStats()
        ]);
        setProvinces(provList);
        setCategoryStats(catList);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const data = await getOpportunities({
          category: selectedCategory,
          province: selectedProvince,
          keyword: keyword,
          sortBy: sortBy
        });
        setOpportunities(data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [selectedCategory, selectedProvince, keyword, sortBy]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setSelectedProvince('all');
    setSortBy('default');
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedProvince !== 'all' || 
    keyword.trim() !== '' || 
    sortBy !== 'default';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Hero Header */}
      <HeroSection
        keyword={keyword}
        setKeyword={setKeyword}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        provinces={provinces}
        t={t}
        lang={lang}
      />

      {/* 2. Animated Civic Stats Dashboard */}
      <CivicStatsDashboard lang={lang} />

      {/* 3. Category Tabs */}
      <CategoryNav
        categoryStats={categoryStats}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        t={t}
        lang={lang}
      />

      {/* 4. Main Directory Area (All Opportunities) */}
      <section id="directory" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
          
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>
              {t.latestOpportunities}
            </h3>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-[#00401A] dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {opportunities.length}
            </span>
          </div>

          {/* Filter Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Province Filter */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              aria-label="Filter by province"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 cursor-pointer shadow-2xs transition"
            >
              <option value="all">{t.allProvinces}</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 cursor-pointer shadow-2xs transition"
            >
              <option value="default">{t.sortDefault}</option>
              <option value="closing_soon">{t.sortClosingSoon}</option>
              <option value="title">{t.sortTitleAZ}</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearFilters}</span>
              </button>
            )}

          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center animate-fade-in-up">
            <Loader2 className="w-8 h-8 text-[#00401A] dark:text-emerald-400 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading opportunities...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && opportunities.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-sm mx-auto shadow-2xs animate-fade-in-up">
            <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className={`text-base font-bold text-slate-800 dark:text-slate-200 mb-1 ${isUrdu ? 'urdu-text' : ''}`}>
              {t.noResultsTitle}
            </h4>
            <p className={`text-xs text-slate-500 dark:text-slate-400 mb-4 ${isUrdu ? 'urdu-text' : ''}`}>
              {t.noResultsDesc}
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clearFilters}</span>
            </button>
          </div>
        )}

        {/* Opportunities Grid with Fade-in Animation */}
        {!loading && opportunities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSelect={onSelectOpportunity}
                t={t}
                lang={lang}
              />
            ))}
          </div>
        )}

      </section>

      {/* 5. Featured Small Banners Grid (Positioned BELOW Opportunities) */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
          <h3 className={`text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? 'نمایاں فلیگ شپ سکیمیں' : 'Featured Flagship Initiatives'}
          </h3>
        </div>
        <SmallBanners
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          lang={lang}
        />
      </div>

    </div>
  );
}
