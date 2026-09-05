
import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import CivicStatsDashboard from '../components/CivicStatsDashboard';
import CategoryNav from '../components/CategoryNav';
import OpportunityCard from '../components/OpportunityCard';
import SmallBanners from '../components/SmallBanners';

import {
  RotateCcw,
  FolderOpen,
  Heart,
  Trash2,
  Clock
} from 'lucide-react';

import {
  getOpportunities,
  getProvinces,
  getCategoryStats
} from '../services/opportunitiesService';

export default function HomeScreen({
  onSelectOpportunity,
  t,
  lang
}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Bookmark filter
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Expired / What You Missed filter
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const isUrdu = lang === 'ur';

  /*
  |--------------------------------------------------------------------------
  | Check if opportunity is expired
  |--------------------------------------------------------------------------
  |
  | Past date  -> expired
  | Today      -> active
  | Future     -> active
  | No date    -> active
  |
  */
  const isOpportunityExpired = (opportunity) => {
    const closingDate = opportunity?.extra_data?.closing_date;

    // No closing date = keep it active
    if (!closingDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(closingDate);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  };

  /*
  |--------------------------------------------------------------------------
  | Load Metadata
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | Fetch Opportunities
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);

      try {
        let data = await getOpportunities({
          category: selectedCategory,
          province: selectedProvince,
          keyword: keyword,
          sortBy: sortBy
        });

        /*
        |--------------------------------------------------------------------------
        | Separate Active and Expired Opportunities
        |--------------------------------------------------------------------------
        */

        const expiredOpportunities = data.filter(
          (item) => isOpportunityExpired(item)
        );

        const activeOpportunities = data.filter(
          (item) => !isOpportunityExpired(item)
        );

        /*
        |--------------------------------------------------------------------------
        | What You Missed
        |--------------------------------------------------------------------------
        |
        | Default:
        | Show active opportunities only.
        |
        | What You Missed:
        | Show expired opportunities only.
        |
        */

        if (showExpiredOnly) {
          data = expiredOpportunities;
        } else {
          data = activeOpportunities;
        }

        /*
        |--------------------------------------------------------------------------
        | Bookmarks Filter
        |--------------------------------------------------------------------------
        |
        | Only apply bookmarks when we are NOT in What You Missed mode.
        |
        */

        if (showBookmarksOnly && !showExpiredOnly) {
          try {
            const savedBookmarks = JSON.parse(
              localStorage.getItem('portal_bookmarks') || '[]'
            );

            data = data.filter((item) =>
              savedBookmarks.includes(item.id)
            );
          } catch (err) {
            console.error(
              'Error filtering bookmarks:',
              err
            );

            data = [];
          }
        }

        setOpportunities(data);
      } catch (err) {
        console.error(
          'Error fetching opportunities:',
          err
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [
    selectedCategory,
    selectedProvince,
    keyword,
    sortBy,
    showBookmarksOnly,
    showExpiredOnly
  ]);

  /*
  |--------------------------------------------------------------------------
  | Clear Filters
  |--------------------------------------------------------------------------
  */
  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setSelectedProvince('all');
    setSortBy('default');

    setShowBookmarksOnly(false);
    setShowExpiredOnly(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Bookmarks
  |--------------------------------------------------------------------------
  */
  const handleBookmarksToggle = () => {
    setShowBookmarksOnly((prev) => !prev);

    // Can't show bookmarks and expired mode together
    setShowExpiredOnly(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle What You Missed
  |--------------------------------------------------------------------------
  */
  const handleExpiredToggle = () => {
    setShowExpiredOnly((prev) => !prev);

    // Can't show bookmarks and expired mode together
    setShowBookmarksOnly(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear All Bookmarks
  |--------------------------------------------------------------------------
  */
  const handleClearAllBookmarks = () => {
    const confirmMessage = isUrdu
      ? 'کیا آپ واقعی اپنے تمام پسندیدہ (Bookmarks) مٹانا چاہتے ہیں؟'
      : 'Are you sure you want to clear all your saved bookmarks?';

    if (window.confirm(confirmMessage)) {
      localStorage.removeItem('portal_bookmarks');

      /*
       * Re-fetch/filter the current list instead of
       * permanently changing database data.
       */
      setOpportunities([]);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Active Filters
  |--------------------------------------------------------------------------
  */
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedProvince !== 'all' ||
    keyword.trim() !== '' ||
    sortBy !== 'default' ||
    showBookmarksOnly ||
    showExpiredOnly;

  /*
  |--------------------------------------------------------------------------
  | Current Page Heading
  |--------------------------------------------------------------------------
  */
  const getPageHeading = () => {
    if (showExpiredOnly) {
      return isUrdu
        ? 'جو مواقع رہ گئے'
        : 'What You Missed';
    }

    if (showBookmarksOnly) {
      return isUrdu
        ? 'محفوظ کردہ مواقع'
        : 'Saved Bookmarks';
    }

    return t.latestOpportunities;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 transition-colors duration-300">

      {/* =========================================================
          1. HERO SECTION
      ========================================================= */}
      <HeroSection
        keyword={keyword}
        setKeyword={setKeyword}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        provinces={provinces}
        t={t}
        lang={lang}
      />

      {/* =========================================================
          2. CIVIC STATS
      ========================================================= */}
      <CivicStatsDashboard lang={lang} />

      {/* =========================================================
          3. CATEGORY NAVIGATION
      ========================================================= */}
      <CategoryNav
        categoryStats={categoryStats}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        t={t}
        lang={lang}
      />

      {/* =========================================================
          4. MAIN DIRECTORY
      ========================================================= */}
      <section
        id="directory"
        className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >

        {/* =====================================================
            TOOLBAR
        ===================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">

          {/* Heading + Count */}
          <div className="flex items-center gap-2">

            <h3
              className={`text-base font-bold text-slate-900 dark:text-white ${
                isUrdu ? 'urdu-text' : ''
              }`}
            >
              {getPageHeading()}
            </h3>

            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                showExpiredOnly
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : showBookmarksOnly
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-[#00401A] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {opportunities.length}
            </span>
          </div>

          {/* ===================================================
              FILTER CONTROLS
          =================================================== */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* -------------------------------------------------
                BOOKMARKS BUTTON
            ------------------------------------------------- */}
            <button
              type="button"
              onClick={handleBookmarksToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer shadow-2xs active:scale-95 ${
                showBookmarksOnly
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  showBookmarksOnly
                    ? 'fill-rose-500 text-rose-500'
                    : ''
                }`}
              />

              <span>
                {isUrdu
                  ? 'پسندیدہ'
                  : 'Bookmarks'}
              </span>
            </button>

            {/* -------------------------------------------------
                WHAT YOU MISSED BUTTON
            ------------------------------------------------- */}
            <button
              type="button"
              onClick={handleExpiredToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer shadow-2xs active:scale-95 ${
                showExpiredOnly
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />

              <span>
                {isUrdu
                  ? 'جو مواقع رہ گئے'
                  : 'What You Missed'}
              </span>
            </button>

            {/* -------------------------------------------------
                PROVINCE FILTER
            ------------------------------------------------- */}
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) =>
                  setSelectedProvince(e.target.value)
                }
                aria-label="Filter by province"
                className="pl-3.5 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 cursor-pointer shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-600 appearance-none"
              >
                <option value="all">
                  {t.allProvinces}
                </option>

                {provinces.map((prov) => (
                  <option
                    key={prov}
                    value={prov}
                  >
                    {prov}
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* -------------------------------------------------
                SORT
            ------------------------------------------------- */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                aria-label="Sort listings"
                className="pl-3.5 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 cursor-pointer shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-600 appearance-none"
              >
                <option value="default">
                  {t.sortDefault}
                </option>

                <option value="closing_soon">
                  {t.sortClosingSoon}
                </option>

                <option value="title">
                  {t.sortTitleAZ}
                </option>
              </select>

              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* -------------------------------------------------
                CLEAR FILTERS
            ------------------------------------------------- */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />

                <span>
                  {t.clearFilters}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            CLEAR ALL BOOKMARKS
        ===================================================== */}
        {showBookmarksOnly &&
          opportunities.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleClearAllBookmarks}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />

                <span>
                  {isUrdu
                    ? 'تمام پسندیدہ ختم کریں'
                    : 'Clear All Bookmarks'}
                </span>
              </button>
            </div>
          )}

        {/* =====================================================
            WHAT YOU MISSED INFO
        ===================================================== */}
        {showExpiredOnly && (
          <div className="mb-5 flex items-start gap-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>

            <div>
              <p
                className={`text-xs font-bold text-slate-700 dark:text-slate-200 ${
                  isUrdu ? 'urdu-text' : ''
                }`}
              >
                {isUrdu
                  ? 'یہ وہ مواقع ہیں جن کی آخری تاریخ گزر چکی ہے۔'
                  : 'These are opportunities whose deadlines have already passed.'}
              </p>

              <p
                className={`text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 ${
                  isUrdu ? 'urdu-text' : ''
                }`}
              >
                {isUrdu
                  ? 'نئی اور فعال opportunities دیکھنے کے لیے بٹن دوبارہ دبائیں۔'
                  : 'Click the button again to return to current active opportunities.'}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            LOADING SKELETON
        ===================================================== */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 space-y-3 shadow-xs"
                >
                  <div className="h-5 w-24 skeleton-shimmer rounded-lg"></div>

                  <div className="h-4 w-full skeleton-shimmer rounded"></div>

                  <div className="h-4 w-3/4 skeleton-shimmer rounded"></div>

                  <div className="h-3 w-1/2 skeleton-shimmer rounded pt-2"></div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <div className="h-8 flex-1 skeleton-shimmer rounded-xl"></div>

                    <div className="h-8 flex-1 skeleton-shimmer rounded-xl"></div>
                  </div>
                </div>
              )
            )}

          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}
        {!loading &&
          opportunities.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm animate-fade-in-up">

              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">

                {showExpiredOnly ? (
                  <Clock className="w-8 h-8" />
                ) : showBookmarksOnly ? (
                  <Heart className="w-8 h-8 text-rose-400" />
                ) : (
                  <FolderOpen className="w-8 h-8" />
                )}

              </div>

              <h4
                className={`text-base font-bold text-slate-800 dark:text-slate-200 mb-1 ${
                  isUrdu ? 'urdu-text' : ''
                }`}
              >
                {showExpiredOnly
                  ? isUrdu
                    ? 'کوئی پرانی opportunity نہیں'
                    : 'No Missed Opportunities'
                  : showBookmarksOnly
                  ? isUrdu
                    ? 'کوئی محفوظ کردہ موقع موجود نہیں'
                    : 'No Bookmarked Opportunities Yet'
                  : t.noResultsTitle}
              </h4>

              <p
                className={`text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed ${
                  isUrdu ? 'urdu-text' : ''
                }`}
              >
                {showExpiredOnly
                  ? isUrdu
                    ? 'اس وقت کوئی expired opportunity موجود نہیں۔'
                    : 'There are no expired opportunities matching your current filters.'
                  : showBookmarksOnly
                  ? isUrdu
                    ? 'کارڈ پر دل (Heart) کے آئیکن پر کلک کر کے اپنے پسندیدہ مواقع یہاں محفوظ کریں۔'
                    : 'Click the heart icon on any opportunity card to save it to your bookmarks.'
                  : t.noResultsDesc}
              </p>

              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />

                <span>
                  {t.clearFilters}
                </span>
              </button>
            </div>
          )}

        {/* =====================================================
            OPPORTUNITIES GRID
        ===================================================== */}
        {!loading &&
          opportunities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">

              {opportunities.map(
                (opportunity, idx) => (
                  <div
                    key={opportunity.id}
                    className={
                      idx < 4
                        ? `animate-delay-${(idx + 1) * 100}`
                        : ''
                    }
                  >
                    <OpportunityCard
                      opportunity={opportunity}
                      onSelect={onSelectOpportunity}
                      t={t}
                      lang={lang}
                    />
                  </div>
                )
              )}

            </div>
          )}

      </section>

      {/* =========================================================
          5. FEATURED SMALL BANNERS
      ========================================================= */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <SmallBanners
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);

            // Return to active opportunities
            setShowExpiredOnly(false);
            setShowBookmarksOnly(false);
          }}
          lang={lang}
        />
      </div>

    </div>
  );
}
