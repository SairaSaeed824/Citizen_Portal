import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, ArrowLeft, Sparkles, Info } from 'lucide-react';
import { submitOpportunity } from '../services/opportunitiesService';

const CATEGORIES = [
  ['job', 'Jobs'],
  ['scholarship', 'Scholarships'],
  ['loan', 'Loans'],
  ['training', 'Training'],
  ['internship', 'Internships'],
  ['project', 'Projects'],
];

const ATTRIBUTE_FIELDS = [
  ['organization', 'Organization', 'e.g. Government of Punjab'],
  ['location', 'Location', 'e.g. Lahore, Punjab'],
  ['province', 'Province', 'e.g. Punjab'],
  ['eligibility', 'Eligibility', 'Who can apply?'],
  ['education', 'Education / Qualification', 'e.g. BS Computer Science'],
  ['age_limit', 'Age Limit', 'e.g. 18-30 years'],
  ['duration', 'Duration', 'e.g. 6 months'],
  ['stipend', 'Stipend', 'e.g. Rs. 25,000/month'],
  ['amount', 'Amount / Financial Assistance', 'e.g. Rs. 500,000'],
  ['deadline', 'Deadline / Closing Date', 'e.g. 30 September 2026'],
  ['required_documents', 'Required Documents', 'e.g. CNIC, CV, degree'],
  ['benefits', 'Benefits', 'What does the opportunity offer?'],
  ['application_process', 'Application Process', 'e.g. Apply online through the portal'],
  ['contact', 'Contact / Helpline', 'Phone, email, or office details'],
  ['description', 'Description', 'Short description (optional)'],
];

const INITIAL_FORM = Object.fromEntries(
  [['name', ''], ['category', ''], ...ATTRIBUTE_FIELDS.map(([key]) => [key, '']), ['apply_link', '']]
);

export default function SubmitOpportunityScreen({ setCurrentScreen, t, lang }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isUrdu = lang === 'ur';

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim() || !form.category || !form.apply_link.trim()) {
      setErrorMsg(
        isUrdu
          ? 'نام، کیٹیگری اور Apply Link درج کرنا ضروری ہے۔'
          : 'Opportunity name, category and apply link are required.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      );

      const result = await submitOpportunity(payload);
      if (result.success) {
        setIsSuccess(true);
        setForm(INITIAL_FORM);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {t.submitSuccessTitle || 'Submission Received'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t.submitSuccessDesc || 'Your opportunity is now pending admin verification. It will appear publicly after approval.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsSuccess(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              Submit Another
            </button>
            <button
              onClick={() => setCurrentScreen('home')}
              className="px-5 py-2.5 rounded-xl bg-[#00401A] text-white text-xs font-bold"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <button
        onClick={() => setCurrentScreen('home')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#00401A] dark:text-emerald-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.backToDirectory}
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Citizen Crowdsource Network
        </div>
        <h2 className={`text-3xl font-black text-slate-900 dark:text-white mb-2 ${isUrdu ? 'urdu-text' : ''}`}>
          {t.submitTitle || 'Submit an Opportunity'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Add only the information you have. Name, category and apply link are required; all other attributes are optional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
              Opportunity Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              placeholder="e.g. Punjab Youth Internship Program"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Opportunity Attributes</h3>
              <p className="text-xs text-slate-400 mt-1">Fill only the fields you know. Empty fields will not be stored.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ATTRIBUTE_FIELDS.map(([key, label, placeholder]) => (
                <div key={key} className={key === 'description' || key === 'eligibility' || key === 'benefits' || key === 'application_process' || key === 'required_documents' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                    {label}
                  </label>
                  <textarea
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={key === 'description' || key === 'eligibility' || key === 'benefits' || key === 'application_process' || key === 'required_documents' ? 3 : 2}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
              Apply Link *
            </label>
            <input
              type="url"
              value={form.apply_link}
              onChange={(e) => updateField('apply_link', e.target.value)}
              required
              placeholder="https://example.com/apply"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#00401A] hover:bg-[#055825] text-white text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSubmitting ? 'Submitting...' : (t.btnSubmit || 'Submit Opportunity')}
          </button>
        </form>

        <aside className="md:col-span-4 space-y-4">
          <div className="bg-[#00401A] text-white rounded-3xl p-6">
            <h3 className="font-black text-base mb-3 flex gap-2 items-center">
              <ShieldCheck className="w-5 h-5" />
              Structured Information
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              You do not need to write a long description. Enter whatever attributes you know. The submitted values are stored flexibly inside <code>extra_data</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm flex gap-2 items-center text-slate-900 dark:text-white">
              <Info className="w-4 h-4 text-emerald-600" />
              Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              A submission is not published immediately. Admin reviews the information and can approve or reject it. Approved opportunities are then added to the public opportunities database.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
