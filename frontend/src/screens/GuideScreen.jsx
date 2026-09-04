import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export default function GuideScreen({ setCurrentScreen, t, lang }) {
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState('flowchart');
  const [animatingStep, setAnimatingStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(0); // Open first FAQ by default
  const isUrdu = lang === 'ur';

  const steps = [
    {
      step: 1,
      number: '01',
      title: isUrdu ? 'سرچ اور فلٹرز کا استعمال' : 'Search & Region Filtering',
      subtitle: isUrdu ? 'صوبے یا عنوان سے تلاش کریں' : 'Type Keywords or Filter by Province',
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      description: isUrdu 
        ? 'ہیرو سیکشن میں اپنی مطلوبہ سکیم جیسے لیپ ٹاپ سکیم، ہونہار وظیفہ یا کسان قرضہ تلاش کریں اور اپنے صوبے کا انتخاب کریں۔'
        : 'Search target programs like PM Laptop Scheme, Honhaar Scholarship, or Kisan Loans in the search bar and filter by your specific province.'
    },
    {
      step: 2,
      number: '02',
      title: isUrdu ? 'شعبہ جات براؤز کریں' : 'Browse Program Categories',
      subtitle: isUrdu ? 'نوکریاں، وظائف، قرضے، ٹریننگ' : 'Filter by Jobs, Scholarships, Loans, Training',
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      description: isUrdu 
        ? 'کیٹیگری ٹیب سے اپنا شعبہ منتخب کریں، جہاں کارڈز پر ماہانہ وظیفہ، قرض کی حد اور نشستیں واضح نظر آتی ہیں۔'
        : 'Click category tabs to isolate your target sector. Each card prominently highlights stipends, maximum loans, and vacancies.'
    },
    {
      step: 3,
      number: '03',
      title: isUrdu ? 'تفصیلات اور اہلیت دیکھیں' : 'Review Criteria & Deadlines',
      subtitle: isUrdu ? 'آخری تاریخ، کوٹہ اور دستاویزات' : 'Inspect Eligibility, Quotas & Requirements',
      gradient: 'from-amber-600 via-orange-600 to-amber-800',
      description: isUrdu 
        ? '"تفصیلات دیکھیں" پر کلک کر کے مکمل شرائط، دستاویزات کی فہرست اور ڈیڈلائن کاؤنٹ ڈاؤن چیک کریں۔'
        : 'Open the opportunity detail modal to review complete qualification criteria, required documents, and deadline urgency alerts.'
    },
    {
      step: 4,
      number: '04',
      title: isUrdu ? 'اصل سرکاری پورٹل پر درخواست' : 'Apply on Official Portal',
      subtitle: isUrdu ? 'براہِ راست تصدیق شدہ ویب سائٹ' : 'Safe Gateway to Official .gov.pk Portals',
      gradient: 'from-emerald-700 via-green-700 to-teal-900',
      description: isUrdu 
        ? '"درخواست دیں" کے بٹن سے آپ متعلقہ سرکاری ادارے کے پورٹل پر پہنچ کر محفوظ آن لائن فارم جمع کروا سکتے ہیں۔'
        : 'Click "Apply Now" to safely navigate to the verified issuing department portal (.gov.pk). No middleman, zero extra fees.'
    },
    {
      step: 5,
      number: '05',
      title: isUrdu ? 'سٹیزن AI اسسٹنٹ سے پوچھیں' : 'Consult AI Assistant',
      subtitle: isUrdu ? 'فوری سوال و جواب اور رہنمائی' : 'Get Conversational Guidance & Answers',
      gradient: 'from-purple-600 via-violet-600 to-purple-900',
      description: isUrdu 
        ? 'اہلیت یا شرائط کی الجھن دور کرنے کے لیے ہمارے چیٹ باٹ سے اردو یا انگلش میں فوری رہنمائی حاصل کریں۔'
        : 'Need clarity on age limits or quotas? Query our AI Chatbot in English or Urdu for instant verified program facts.'
    }
  ];

  // Flowchart Pipeline Nodes
  const flowNodes = [
    {
      id: 1,
      badge: 'Step 1: Crawler',
      title: isUrdu ? 'سرکاری ویب سائٹس سے ڈیٹا اکٹھا ہونا' : 'Automated Ingestion',
      detail: isUrdu ? 'HEC, NJP, SMEDA, NAVTTC اور یوتھ پورٹلز کی پبلک لسٹنگز' : 'Periodic crawlers scrape official public gazettes & notices',
      color: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60'
    },
    {
      id: 2,
      badge: 'Step 2: Validation',
      title: isUrdu ? 'تصدیق اور ڈپلیکیٹ فلٹرنگ' : 'Schema & Expiry Check',
      detail: isUrdu ? 'Pydantic ویلیڈیشن اور ختم شدہ تاریخوں کو ہٹانا' : 'Pydantic v2 rejects broken URLs & auto-expires past deadlines',
      color: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60'
    },
    {
      id: 3,
      badge: 'Step 3: Fast Cache',
      title: isUrdu ? 'تیز رفتار ڈیٹا بیس اور کیش' : 'MongoDB & Redis Caching',
      detail: isUrdu ? 'سب سیکنڈ (Sub-10ms) سرچ کے لیے کیشنگ' : 'High performance compound indexing with Redis memory store',
      color: 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/60'
    },
    {
      id: 4,
      badge: 'Step 4: Citizen UI',
      title: isUrdu ? 'شہریوں کیلئے آسان ڈائریکٹری' : 'Fast Interactive UI',
      detail: isUrdu ? 'اردو/انگلش موڈ، ڈارک لائٹ تھیم اور فوری فلٹرز' : 'React 18 SPA with Urdu Nastaliq, Dark/Light modes & AI bot',
      color: 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60'
    }
  ];

  const faqs = [
    {
      q: isUrdu ? 'کیا یہ پورٹل حکومتِ پاکستان کی ملکیت ہے؟' : 'Is this portal directly owned by the Government of Pakistan?',
      a: isUrdu 
        ? 'نہیں، یہ ایک آزاد اور خود مختار عوامی ایگریگیٹر ہے جو شہریوں کی آسانی کیلئے مختلف سرکاری محکموں کی اسکیمیں ایک جگہ یکجا کرتا ہے۔ اپلائی ہمیشہ متعلقہ ادارے کی آفیشل ویب سائٹ پر ہوتا ہے۔'
        : 'No. This is an independent, non-governmental public aggregator built to centralize public opportunities for Pakistani citizens. All applications are submitted directly on official government department portals (.gov.pk).'
    },
    {
      q: isUrdu ? 'کیا پورٹل استعمال کرنے یا اپلائی کرنے کی کوئی فیس ہے؟' : 'Is there any fee to browse opportunities or use this platform?',
      a: isUrdu 
        ? 'بالکل نہیں! یہ پورٹل تمام پاکستانی شہریوں کے لیے 100% مفت ہے اور کسی بھی قسم کی رجسٹریشن یا سروس فیس نہیں لی جاتی۔'
        : 'Absolutely not. This platform is 100% free for all citizens. We never charge any fees or ask for payments.'
    },
    {
      q: isUrdu ? 'اگر کسی موقع کی تفصیلات میں کوئی تبدیلی ہو تو کیا کریں؟' : 'What if a listed opportunity deadline or criteria changes?',
      a: isUrdu 
        ? 'چونکہ معلومات مختلف سرکاری گزٹس اور ویب سائٹس سے خودکار اکٹھی کی جاتی ہیں، اس لیے ہمیشہ متعلقہ ادارے کی باضابطہ ویب سائٹ پر تصدیق ضرور کریں۔'
        : 'Official departments may alter deadlines or quotas without advance notice. Always review details on the issuing agency’s official website.'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
      
      {/* Top Banner & Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#00401A] dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-800 mb-3 shadow-xs animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isUrdu ? 'پورٹل معلوماتی نقشہ' : 'Interactive Architecture & User Flow'}</span>
        </div>

        <h1 className={`text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 ${isUrdu ? 'urdu-text' : ''}`}>
          {isUrdu ? 'پورٹل کا مکمل فلو چارٹ اور رہنمائی' : 'Portal Flowchart & Citizen Guide'}
        </h1>

        <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
          {isUrdu 
            ? 'متحرک فلو چارٹ، 5 مراحل کی بصری گائیڈ اور سسٹم کے کام کرنے کا مکمل طریقہ کار دیکھیں۔'
            : 'Explore our interactive animated pipeline, step-by-step discovery guide, and independent transparency policies.'}
        </p>
      </div>

      {/* Prominent Non-Governmental Notice Card */}
      <div className="mb-8 bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-400/60 dark:border-amber-600/50 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200 mb-1 ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu ? 'اہم انتباہ برائے عوامی آگاہی (Independent Aggregator)' : 'Important Public Notice: Non-Governmental Aggregator'}
            </h3>
            <p className={`text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/80 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu 
                ? 'یہ پورٹل ایک خود مختار معلوماتی ڈائریکٹری ہے جو شہریوں کی سہولت کے لیے سرکاری اشتہارات یکجا کرتا ہے۔ یہ پورٹل کسی حکومتی ادارے کا باضابطہ نمائندہ نہیں ہے۔ درخواستیں صرف متعلقہ ادارے کی آفیشل ویب سائٹ (.gov.pk) پر جمع کروائیں۔'
                : 'This platform functions strictly as an independent open data aggregator for citizen convenience and is not an official government entity. Information is automatically compiled from public notices. Always verify details directly on the issuing agency’s official website.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('flowchart')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'flowchart'
              ? 'bg-[#00401A] dark:bg-emerald-600 text-white shadow-md scale-102'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {isUrdu ? 'متحرک فلو چارٹ (Flowchart)' : 'Live Flowchart'}
        </button>

        <button
          onClick={() => setActiveTab('howToUse')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'howToUse'
              ? 'bg-[#00401A] dark:bg-emerald-600 text-white shadow-md scale-102'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {isUrdu ? 'استعمال کے مراحل (5 Steps)' : 'Step-by-Step Guide'}
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'faq'
              ? 'bg-[#00401A] dark:bg-emerald-600 text-white shadow-md scale-102'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {isUrdu ? 'عام سوالات (FAQ)' : 'FAQ'}
        </button>
      </div>

      {/* TAB 1: Animated Interactive Flowchart */}
      {activeTab === 'flowchart' && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Animated Pipeline Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>
                  {isUrdu ? 'خودکار ڈیٹا فلو پائپ لائن' : 'Automated Data Pipeline & Discovery Architecture'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isUrdu ? 'کلک کر کے ہر مرحلے کی اینیمیشن اور تفصیل دیکھیں' : 'Click on each stage to trigger the active pipeline flow'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnimatingStep((prev) => (prev % 4) + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'اگلا فلو چلائیں' : 'Simulate Next Stage'}</span>
                </button>
              </div>
            </div>

            {/* 4 Interactive Connected Flow Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {flowNodes.map((node) => {
                const isActive = animatingStep === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setAnimatingStep(node.id)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isActive
                        ? `${node.color} shadow-lg scale-103 -translate-y-1`
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Active pulse bar */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-black/10 dark:bg-white/20 text-slate-900 dark:text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {node.badge}
                        </span>

                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs ${
                          isActive
                            ? 'bg-[#00401A] dark:bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {node.id}
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug ${isUrdu ? 'urdu-text' : ''}`}>
                        {node.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {node.detail}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{isActive ? 'Active Pipeline Stage' : 'Click to inspect'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-1 text-emerald-600 dark:text-emerald-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stage Detail Explanation Box */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 transition-all duration-300 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>
                  {animatingStep === 1 && (isUrdu ? 'مرحلہ 1: پبلک ویب سائٹس سے روزانہ ڈیٹا اکٹھا کیا جاتا ہے' : 'Stage 1: Multi-source Scraping Layer (BeautifulSoup + Selenium)')}
                  {animatingStep === 2 && (isUrdu ? 'مرحلہ 2: Pydantic سکیما چیک اور ڈپلیکیٹ لنکس کو مسترد کرنا' : 'Stage 2: Pydantic v2 Schema Conformance & Deduplication')}
                  {animatingStep === 3 && (isUrdu ? 'مرحلہ 3: MongoDB Atlas اسٹوریج اور Redis کیشنگ' : 'Stage 3: MongoDB Document Store with Upstash Redis Cache Layer')}
                  {animatingStep === 4 && (isUrdu ? 'مرحلہ 4: شہریوں کو فوری سرچ، فلٹرز اور چَیٹ باٹ کی فراہمی' : 'Stage 4: Ultra-fast React Client with Bilingual & Dark/Light Modes')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {animatingStep === 1 && 'Automated Python scrapers crawl public sector portals (HEC, NJP, SMEDA, NAVTTC, BNIP) ensuring only authentic notices with valid closing deadlines enter the pipeline.'}
                {animatingStep === 2 && 'Each record is validated through strict Pydantic schemas. Duplicate URL hashes and expired application dates are automatically filtered out before reaching citizens.'}
                {animatingStep === 3 && 'Structured records are stored with compound text indexes in MongoDB. Frequent queries are cached in Redis for lightning-fast sub-10ms response times.'}
                {animatingStep === 4 && 'The React interface provides smooth transitions, responsive category tabs, Urdu Nastaliq mode, dark/light theme options, and instant direct links to official portals.'}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: 5-Step Citizen Journey */}
      {activeTab === 'howToUse' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Step Selector List (5 Cols) */}
            <div className="md:col-span-5 space-y-2.5">
              {steps.map((item) => {
                const isCurrent = activeStep === item.step;
                return (
                  <div
                    key={item.step}
                    onClick={() => setActiveStep(item.step)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3.5 ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-sm scale-102 -translate-y-0.5'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 bg-gradient-to-br ${item.gradient}`}>
                      {item.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate ${isUrdu ? 'urdu-text' : ''}`}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>

                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isCurrent ? 'text-emerald-600 dark:text-emerald-400 translate-x-1' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>

            {/* Step Detail Card (7 Cols) */}
            <div className="md:col-span-7">
              {(() => {
                const cur = steps.find((s) => s.step === activeStep) || steps[0];
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md relative overflow-hidden transition-colors h-full flex flex-col justify-between animate-spring-in">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base bg-gradient-to-br ${cur.gradient} shadow-md`}>
                          {cur.number}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Step {cur.step} of 5
                          </span>
                          <h3 className={`text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1 ${isUrdu ? 'urdu-text' : ''}`}>
                            {cur.title}
                          </h3>
                        </div>
                      </div>

                      <p className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
                        {cur.description}
                      </p>

                      {/* Interactive Visual Tip */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{isUrdu ? 'اہم ترین ٹپ:' : 'Pro Tip for Citizens:'}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                          {cur.step === 1 && (isUrdu ? 'صوبے کا فلٹر منتخب کرنے سے آپ کے اپنے علاقے کے مخصوص کوٹہ والے مواقع پہلے ظاہر ہوں گے۔' : 'Filtering by province highlights regional quota opportunities specific to your domicile.')}
                          {cur.step === 2 && (isUrdu ? 'ہر کارڈ پر "آخری تاریخ" کے سرخ رنگ کے بیج پر نظر رکھیں تاکہ ڈیڈلائن ضائع نہ ہو۔' : 'Keep an eye on red urgency badges ("Ends in 3 days") to prioritize closing deadlines.')}
                          {cur.step === 3 && (isUrdu ? 'تفصیلات ماڈل میں "کاپی لنک" بٹن سے اپنے دوستوں کے ساتھ واٹس ایپ پر موقع شیئر کر سکتے ہیں۔' : 'Use the "Share Link" button in the modal to easily share opportunities with classmates or family.')}
                          {cur.step === 4 && (isUrdu ? 'کوئی بھی سرکاری ادارہ درخواست فیس کے علاوہ نجی اکاؤنٹ میں رقم نہیں مانگتا۔ جعلسازی سے ہوشیار رہیں۔' : 'Official departments never ask for transfers into private personal bank accounts. Always stay vigilant.')}
                          {cur.step === 5 && (isUrdu ? 'چَیٹ باٹ میں فوری سوالات کے بنے بنائے بٹنوں پر کلک کر کے تیزی سے جواب حاصل کریں۔' : 'Click the suggested prompt chips inside the chatbot to instantly inspect popular loan and scholarship schemes.')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-6">
                      <button
                        onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 5))}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                      >
                        {isUrdu ? 'پچھلا مرحلہ' : 'Previous Step'}
                      </button>

                      <button
                        onClick={() => {
                          if (activeStep === 5) {
                            setCurrentScreen('home');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            setActiveStep((prev) => prev + 1);
                          }
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm cursor-pointer"
                      >
                        {activeStep === 5 ? (isUrdu ? 'مرکزی صفحہ پر جائیں' : 'Explore Directory Now') : (isUrdu ? 'اگلا مرحلہ' : 'Next Step')}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ANIMATIC INTERACTIVE FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3.5 animate-fade-in-up max-w-4xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen
                    ? 'bg-white dark:bg-slate-900 border-emerald-500/80 dark:border-emerald-500 shadow-md -translate-y-0.5'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                {/* FAQ Question Header */}
                <div 
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="p-5 flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                      isOpen
                        ? 'bg-[#00401A] dark:bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-emerald-50 dark:bg-slate-800 text-[#00401A] dark:text-emerald-400'
                    }`}>
                      Q{index + 1}
                    </span>

                    <h4 className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug ${isUrdu ? 'urdu-text' : ''}`}>
                      {faq.q}
                    </h4>
                  </div>

                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Animated Answer Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in-up">
                    <div className="pl-11 pr-2 pt-2 leading-relaxed">
                      <p className={isUrdu ? 'urdu-text' : ''}>
                        {faq.a}
                      </p>
                      
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{isUrdu ? 'تصدیق شدہ گائیڈ لائن' : 'Official Community Policy'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA Card */}
      <div className="mt-10 p-6 rounded-3xl pakistan-hero-bg dark:pakistan-hero-bg-dark text-white text-center shadow-lg border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left sm:text-left">
          <h3 className={`text-base sm:text-lg font-bold text-white mb-1 ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? 'کوئی نیا موقع جمع کروانا چاہتے ہیں؟' : 'Know an official government opportunity?'}
          </h3>
          <p className="text-xs text-emerald-200">
            {isUrdu ? 'عوامی اندراج فارم کے ذریعے معلومات شیئر کریں۔' : 'Submit official notifications to help fellow citizens discover programs.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setCurrentScreen('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-[#00401A] hover:bg-emerald-50 transition shadow-sm cursor-pointer"
          >
            {isUrdu ? 'موقع جمع کروائیں' : 'Submit Opportunity'}
          </button>
          <button
            onClick={() => { setCurrentScreen('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-400/40 transition cursor-pointer"
          >
            {isUrdu ? 'مواقع دیکھیں' : 'Browse Directory'}
          </button>
        </div>
      </div>

    </div>
  );
}
