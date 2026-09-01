import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import { submitOpportunity } from '../services/opportunitiesService';

export default function SubmitOpportunityScreen({
  setCurrentScreen,
  t,
  lang
}) {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isUrdu = lang === 'ur';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم موقع کا نام درج کریں۔' : 'Please enter the opportunity name.');
      return;
    }

    if (!detail.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم تفصیلات درج کریں۔' : 'Please provide opportunity details and official source link.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitOpportunity({ 
        name: name.trim(), 
        detail: detail.trim() 
      });

      if (result.success) {
        setIsSuccess(true);
        setName('');
        setDetail('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMsg('');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => setCurrentScreen('home')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#00401A] dark:text-emerald-400 hover:text-[#055825] mb-5 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToDirectory}</span>
      </button>

      {/* Screen Title Banner */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#00401A] dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold mb-2.5 border border-emerald-200 dark:border-emerald-800">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{lang === 'ur' ? 'عوامی شراکت' : 'Citizen Crowdsource'}</span>
        </div>

        <h2 className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5 ${isUrdu ? 'urdu-text' : ''}`}>
          {t.submitTitle}
        </h2>
        <p className={`text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl ${isUrdu ? 'urdu-text' : ''}`}>
          {t.submitSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Main Form Column (7 Cols) */}
        <div className="md:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-colors">
            
            {isSuccess ? (
              <div className="text-center py-6 animate-fade-in-up">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto mb-3 text-[#00401A] dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-1.5 ${isUrdu ? 'urdu-text' : ''}`}>
                  {t.submitSuccessTitle}
                </h3>

                <p className={`text-slate-600 dark:text-slate-400 text-xs mb-5 leading-relaxed ${isUrdu ? 'urdu-text' : ''}`}>
                  {t.submitSuccessDesc}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {t.submitAnother}
                  </button>
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                  >
                    {t.backToDirectory}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <h3 className={`text-base font-bold text-slate-900 dark:text-white mb-0.5 ${isUrdu ? 'urdu-text' : ''}`}>
                    {t.submitFormHeader}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {t.submitFormSub}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Field 1: Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t.fieldName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fieldNamePlaceholder}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition"
                  />
                </div>

                {/* Field 2: Detail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t.fieldDetail} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder={t.fieldDetailPlaceholder}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition resize-y"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{t.submitting}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.btnSubmit}</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>

        {/* Guidelines Sidebar (5 Cols) */}
        <div className="md:col-span-5 space-y-3.5">
          
          <div className="pakistan-hero-bg dark:pakistan-hero-bg-dark text-white rounded-2xl p-5 border border-emerald-800/80 shadow-xs">
            <h4 className={`text-sm font-bold text-white mb-2.5 flex items-center gap-2 ${isUrdu ? 'urdu-text' : ''}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t.submissionGuidelinesTitle}</span>
            </h4>

            <ul className="space-y-2 text-xs text-emerald-100 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>{t.guideline1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>{t.guideline2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>{t.guideline3}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-[#00401A] dark:text-emerald-400 mb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-[#00401A] dark:text-emerald-400" />
              <span>Verification Process</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Submissions are stored directly in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono text-[10px]">submitted_opportunities</code> and reviewed for official verification.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
