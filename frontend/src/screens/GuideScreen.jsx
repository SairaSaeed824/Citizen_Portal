import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  ExternalLink,
  Bot,
  Bookmark,
  Send,
} from 'lucide-react';

export default function GuideScreen({ setCurrentScreen, t, lang }) {
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const isUrdu = lang === 'ur';

  const steps = [
    {
      number: '01',
      icon: Search,
      title: isUrdu ? 'موقع تلاش کریں' : 'Search Opportunities',
      subtitle: isUrdu ? 'عنوان یا کی ورڈ سے تلاش کریں' : 'Find jobs, scholarships, loans, training and internships',
      description: isUrdu
        ? 'سرچ بار میں موقع کا نام یا متعلقہ کی ورڈ لکھیں۔ آپ jobs، scholarships، loans، training اور internships ایک ہی جگہ تلاش کر سکتے ہیں۔'
        : 'Use the search bar to find opportunities by title or keyword. Citizen Portal brings jobs, scholarships, loans, training and internships together in one place.',
      tip: isUrdu
        ? 'مثال: Laptop Scheme، Scholarship، Internship یا Teacher Jobs لکھیں۔'
        : 'Try specific keywords such as “Laptop Scheme”, “Scholarship”, “Internship” or “Teacher Jobs”.',
    },
    {
      number: '02',
      icon: SlidersHorizontal,
      title: isUrdu ? 'فلٹرز استعمال کریں' : 'Refine Your Search',
      subtitle: isUrdu ? 'صوبہ، مقام اور deadline کے مطابق' : 'Use province, location and deadline filters',
      description: isUrdu
        ? 'اپنے province، city/location اور deadline کے مطابق results کو محدود کریں۔ Recommended، Newest، Closing Soon اور Title A–Z سے sorting بھی کر سکتے ہیں۔'
        : 'Refine results using Province, City/Location and Deadline filters. You can also sort opportunities by Recommended, Newest, Closing Soon or Title A–Z.',
      tip: isUrdu
        ? 'اگر اپنے علاقے کے مواقع چاہیے ہوں تو پہلے Province filter استعمال کریں۔'
        : 'Use the Province filter first when you are looking for opportunities relevant to your region.',
    },
    {
      number: '03',
      icon: CheckCircle,
      title: isUrdu ? 'تفصیلات اور اہلیت چیک کریں' : 'Review Details & Eligibility',
      subtitle: isUrdu ? 'اہلیت، documents اور آخری تاریخ' : 'Review the available opportunity information',
      description: isUrdu
        ? 'Opportunity card کھول کر available eligibility، required documents، location، deadline اور دوسری معلومات دیکھیں۔'
        : 'Open an opportunity card to review the available eligibility criteria, required documents, location, deadline and other extracted information before applying.',
      tip: isUrdu
        ? 'Apply کرنے سے پہلے deadline اور eligibility کو لازمی دوبارہ verify کریں۔'
        : 'Always verify the latest deadline and eligibility on the official source before applying.',
    },
    {
      number: '04',
      icon: ExternalLink,
      title: isUrdu ? 'Official Website پر Apply کریں' : 'Apply on the Official Website',
      subtitle: isUrdu ? 'اصل application link استعمال کریں' : 'Continue through the original application source',
      description: isUrdu
        ? 'Apply Now یا official application link سے متعلقہ ادارے کی website پر جائیں۔ Citizen Portal صرف discovery اور guidance فراہم کرتا ہے؛ اصل application official source پر submit ہوتی ہے۔'
        : 'Use the official application link to continue to the relevant organization’s website. Citizen Portal helps you discover opportunities; the actual application is completed on the official source.',
      tip: isUrdu
        ? 'کسی غیر متعلقہ شخص کو payment یا sensitive information نہ دیں۔'
        : 'Safety tip: Never send money or sensitive information to an unrelated person claiming to represent an opportunity.',
    },
    {
      number: '05',
      icon: Bot,
      title: isUrdu ? 'Citizen AI Assistant استعمال کریں' : 'Ask the Citizen AI Assistant',
      subtitle: isUrdu ? 'معلومات سمجھنے کے لیے سوال کریں' : 'Get conversational help about opportunities',
      description: isUrdu
        ? 'Eligibility، category، deadline یا کسی opportunity کی information سمجھنے میں مشکل ہو تو Citizen AI Assistant سے سوال کریں۔'
        : 'If you are unsure about an opportunity, use the Citizen AI Assistant to ask questions and understand the available information in a simpler way.',
      tip: isUrdu
        ? 'AI کو guidance کے لیے استعمال کریں اور اہم معلومات official source سے verify کریں۔'
        : 'Use AI for guidance and explanation, but verify important information against the official source.',
    },
    {
      number: '06',
      icon: Bookmark,
      title: isUrdu ? 'مواقع محفوظ کریں' : 'Save Opportunities',
      subtitle: isUrdu ? 'بعد میں دوبارہ دیکھنے کے لیے' : 'Keep useful opportunities in Bookmarks',
      description: isUrdu
        ? 'اہم opportunity کو Bookmark کریں تاکہ بعد میں اسے دوبارہ آسانی سے دیکھ سکیں اور deadline سے پہلے review کر سکیں۔'
        : 'Save useful opportunities with Bookmarks so you can return to them later without searching again.',
      tip: isUrdu
        ? 'اہم مواقع save کریں اور closing date سے پہلے دوبارہ check کریں۔'
        : 'Save important opportunities and revisit them before their closing date.',
    },
  ];

  const faqs = [
    {
      q: isUrdu ? 'Citizen Portal کیا ہے؟' : 'What is Citizen Portal?',
      a: isUrdu
        ? 'Citizen Portal ایک centralized information directory ہے جہاں شہری jobs، scholarships، loans، training اور internships جیسے public opportunities ایک جگہ تلاش، filter اور compare کر سکتے ہیں۔'
        : 'Citizen Portal is a centralized information directory where citizens can discover, search and filter public opportunities such as jobs, scholarships, loans, training programs and internships in one place.'
    },
    {
      q: isUrdu ? 'کیا Citizen Portal سرکاری ویب سائٹ ہے؟' : 'Is Citizen Portal an official government website?',
      a: isUrdu
        ? 'نہیں۔ یہ ایک independent aggregator ہے۔ اس کا مقصد مختلف public opportunities کو شہریوں کے لیے ایک جگہ آسانی سے searchable بنانا ہے۔ اصل application متعلقہ official source پر ہوتی ہے۔'
        : 'No. Citizen Portal is an independent aggregator. Its purpose is to make public opportunities easier for citizens to discover in one place. Actual applications are completed through the relevant official source.'
    },
    {
      q: isUrdu ? 'مواقع کی معلومات کہاں سے آتی ہیں؟' : 'Where does the opportunity information come from?',
      a: isUrdu
        ? 'معلومات public اور official opportunity listings سے collect کی جاتی ہیں۔ چونکہ متعلقہ ادارے deadlines یا requirements update کر سکتے ہیں، اس لیے apply کرنے سے پہلے original source verify کرنا ضروری ہے۔'
        : 'Opportunity information is collected from public and official listings. Since issuing organizations can update deadlines or requirements, users should verify important details on the original source before applying.'
    },
    {
      q: isUrdu ? 'کیا میں opportunity کو title سے search کر سکتا ہوں؟' : 'Can I search by opportunity title?',
      a: isUrdu
        ? 'جی ہاں۔ Search bar میں title یا keyword لکھیں۔ اس کے بعد Province، Location اور Deadline filters استعمال کر کے results مزید محدود کریں۔'
        : 'Yes. Search by opportunity title or keyword, then refine the results using Province, Location and Deadline filters.'
    },
    {
      q: isUrdu ? 'Province filter کس لیے ہے؟' : 'What is the Province filter for?',
      a: isUrdu
        ? 'Province filter مخصوص صوبے یا region سے متعلق opportunities تلاش کرنے میں مدد دیتا ہے۔ Nationwide opportunities کے لیے All Provinces / Regions منتخب رکھیں۔'
        : 'The Province filter helps you find opportunities relevant to a particular province or region. For nationwide opportunities, keep it set to All Provinces / Regions.'
    },
    {
      q: isUrdu ? 'Recommended کا کیا مطلب ہے؟' : 'What does Recommended mean?',
      a: isUrdu
        ? 'Recommended default browsing order ہے جو عام discovery کے لیے useful opportunities کو پہلے دکھاتا ہے۔ آپ Newest، Closing Soon یا Title A–Z بھی منتخب کر سکتے ہیں۔'
        : 'Recommended is the default discovery order for browsing opportunities. You can switch to Newest, Closing Soon or Title A–Z whenever you prefer a different order.'
    },
    {
      q: isUrdu ? 'Deadline گزرنے کے بعد opportunity کا کیا ہوتا ہے؟' : 'What happens when an opportunity deadline passes?',
      a: isUrdu
        ? 'Portal expired opportunities کو الگ What You Missed section میں دکھا سکتا ہے تاکہ users انہیں دوبارہ دیکھ سکیں۔ پھر بھی official source سے current status verify کرنا ضروری ہے۔'
        : 'Expired opportunities can be shown separately through the What You Missed section. Always check the official source for the current status before taking action.'
    },
    {
      q: isUrdu ? 'کیا میں Citizen Portal پر براہِ راست apply کرتا ہوں؟' : 'Do I apply directly on Citizen Portal?',
      a: isUrdu
        ? 'نہیں۔ Citizen Portal opportunity details اور official application link فراہم کرتا ہے۔ اصل application متعلقہ organization یا government department کی official website پر submit ہوتی ہے۔'
        : 'No. Citizen Portal provides opportunity details and the official application link. The actual application is submitted on the relevant organization or government department website.'
    },
    {
      q: isUrdu ? 'کیا میں نئی opportunity submit کر سکتا ہوں؟' : 'Can I submit a new opportunity?',
      a: isUrdu
        ? 'جی ہاں۔ Submit Opportunity section میں opportunity کا name/title اور official apply link فراہم کریں۔ submitted opportunity review process سے گزرنے کے بعد directory میں شامل کی جا سکتی ہے۔'
        : 'Yes. Use Submit Opportunity to provide the opportunity name/title and official application link. Submitted opportunities can go through the portal review process before being added to the directory.'
    },
    {
      q: isUrdu ? 'AI Assistant کا جواب حتمی ہوتا ہے؟' : 'Are AI Assistant answers final?',
      a: isUrdu
        ? 'نہیں۔ AI Assistant information کو سمجھنے اور navigation میں مدد دیتا ہے۔ Eligibility، deadline یا application decision کے لیے ہمیشہ official source کو final reference سمجھیں۔'
        : 'No. The AI Assistant helps explain information and guide users. For eligibility, deadlines and application decisions, always treat the official source as the final reference.'
    },
    {
      q: isUrdu ? 'کیا Citizen Portal استعمال کرنے کی کوئی fee ہے؟' : 'Is there a fee to use Citizen Portal?',
      a: isUrdu
        ? 'Citizen Portal کی directory browsing اور basic discovery کے لیے کوئی portal fee نہیں ہے۔ اگر کسی official opportunity کی اپنی application fee ہو تو وہ متعلقہ official source پر واضح ہوگی۔'
        : 'There is no Citizen Portal fee for browsing the directory and discovering opportunities. If an official opportunity has its own application fee, that should be stated by the relevant official source.'
    },
  ];

  const current = steps[activeStep - 1];
  const CurrentIcon = current.icon;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'شہری رہنمائی مرکز' : 'Citizen Help Center'}</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 ${isUrdu ? 'urdu-text' : ''}`}>
          {isUrdu ? 'Citizen Portal کیسے استعمال کریں؟' : 'How to Use Citizen Portal'}
        </h1>
        <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
          {isUrdu
            ? 'مواقع تلاش کریں، filters استعمال کریں، details verify کریں اور official source سے apply کریں۔'
            : 'Find opportunities, refine your search, review details and continue to the official application source.'}
        </p>
      </div>

      <div className="mb-10 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm text-amber-950 dark:text-amber-200 mb-1 ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu ? 'اہم معلومات' : 'Important to Know'}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80 ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu
                ? 'Citizen Portal ایک independent information aggregator ہے۔ حتمی eligibility، deadline اور application instructions ہمیشہ متعلقہ official source سے verify کریں۔'
                : 'Citizen Portal is an independent information aggregator. Always verify final eligibility, deadlines and application instructions on the relevant official source.'}
            </p>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle className="w-4 h-4" />
              {isUrdu ? 'آسان مراحل' : 'Simple Steps'}
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu ? 'موقع تلاش کرنے سے Apply کرنے تک' : 'From Discovery to Application'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{activeStep} / {steps.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-2.5">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const selected = activeStep === index + 1;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(index + 1)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
                    selected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <StepIcon className="w-4.5 h-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs sm:text-sm font-bold text-slate-900 dark:text-white ${isUrdu ? 'urdu-text' : ''}`}>{step.title}</span>
                    <span className={`block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate ${isUrdu ? 'urdu-text' : ''}`}>{step.subtitle}</span>
                  </span>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${selected ? 'text-emerald-600' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/60 dark:bg-emerald-950/40 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                    <CurrentIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400">Step {activeStep} of {steps.length}</span>
                    <h3 className={`text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 ${isUrdu ? 'urdu-text' : ''}`}>{current.title}</h3>
                  </div>
                </div>

                <p className={`text-sm text-slate-700 dark:text-slate-300 leading-7 mb-5 ${isUrdu ? 'urdu-text' : ''}`}>{current.description}</p>

                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/70 p-4 mb-6">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <p className={`text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>{current.tip}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev === 1 ? steps.length : prev - 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {isUrdu ? 'پچھلا' : 'Previous'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === steps.length) {
                        setCurrentScreen('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setActiveStep((prev) => prev + 1);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00401A] hover:bg-[#055825] text-white shadow-sm"
                  >
                    {activeStep === steps.length ? (isUrdu ? 'مواقع دیکھیں' : 'Browse Opportunities') : (isUrdu ? 'اگلا' : 'Next')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? 'اکثر پوچھے جانے والے سوالات' : 'Frequently Asked Questions'}
          </h2>
          <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? 'Portal، search، filters، AI Assistant اور application process کے بارے میں مدد۔' : 'Quick answers about the directory, search, filters, AI Assistant and application process.'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? 'border-emerald-400 dark:border-emerald-700 shadow-sm' : 'border-slate-200 dark:border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${isOpen ? 'bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'}`}>Q{index + 1}</span>
                    <span className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 bg-white dark:bg-slate-900">
                    <div className="ml-11 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-6 ${isUrdu ? 'urdu-text' : ''}`}>{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-[#00401A] to-emerald-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-center md:text-left">
            <h3 className={`text-lg sm:text-xl font-extrabold mb-1 ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu ? 'اپنا اگلا موقع تلاش کریں' : 'Ready to Find Your Next Opportunity?'}
            </h3>
            <p className={`text-xs sm:text-sm text-emerald-100 ${isUrdu ? 'urdu-text' : ''}`}>
              {isUrdu ? 'سرچ کریں، فلٹر کریں اور official source سے apply کریں۔' : 'Search, filter and continue to the official application source.'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => { setCurrentScreen('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-4 py-2.5 rounded-xl bg-white text-[#00401A] font-bold text-xs hover:bg-emerald-50"
            >
              {isUrdu ? 'مواقع دیکھیں' : 'Browse Opportunities'}
            </button>
            <button
              type="button"
              onClick={() => { setCurrentScreen('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900/50 border border-emerald-300/40 text-white font-bold text-xs hover:bg-emerald-900/70"
            >
              <Send className="w-3.5 h-3.5" />
              {isUrdu ? 'موقع جمع کروائیں' : 'Submit Opportunity'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
