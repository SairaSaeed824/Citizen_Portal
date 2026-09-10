import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, ArrowLeft, Sparkles, Info } from 'lucide-react';
import { submitOpportunity } from '../services/opportunitiesService';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';

const CATEGORIES = [
  ['job', 'Jobs'],
  ['scholarship', 'Scholarships'],
  ['loan', 'Loans'],
  ['training', 'Training'],
  ['internship', 'Internships'],
  ['project', 'Projects'],
];

const ATTRIBUTE_FIELDS = [
  ['organization', 'Organization', 'e.g. Government of Punjab', 'input'],
  ['location', 'Location', 'e.g. Lahore, Punjab', 'input'],
  ['province', 'Province', 'e.g. Punjab', 'input'],
  ['eligibility', 'Eligibility', 'Who can apply?', 'textarea'],
  ['education', 'Education / Qualification', 'e.g. BS Computer Science', 'input'],
  ['age_limit', 'Age Limit', 'e.g. 18-30 years', 'input'],
  ['duration', 'Duration', 'e.g. 6 months', 'input'],
  ['stipend', 'Stipend', 'e.g. Rs. 25,000/month', 'input'],
  ['amount', 'Amount / Financial Assistance', 'e.g. Rs. 500,000', 'input'],
  ['deadline', 'Deadline / Closing Date', 'e.g. 30 September 2026', 'input'],
  ['required_documents', 'Required Documents', 'e.g. CNIC, CV, degree', 'textarea'],
  ['benefits', 'Benefits', 'What does the opportunity offer?', 'textarea'],
  ['application_process', 'Application Process', 'e.g. Apply online through the portal', 'textarea'],
  ['contact', 'Contact / Helpline', 'Phone, email, or office details', 'input'],
  ['description', 'Description', 'Short description (optional)', 'textarea'],
];

const INITIAL_FORM = Object.fromEntries([
  ['name', ''],
  ['category', ''],
  ...ATTRIBUTE_FIELDS.map(([key]) => [key, '']),
  ['apply_link', ''],
]);

export default function SubmitOpportunityScreen({ setCurrentScreen, t, lang }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isUrdu = lang === 'ur';

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.name.trim() || !form.category || !form.apply_link.trim()) {
      setErrorMsg(isUrdu ? 'نام، کیٹیگری اور Apply Link درج کرنا ضروری ہے۔' : 'Opportunity name, category and apply link are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.submitSuccessTitle || 'Submission Received'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.submitSuccessDesc || 'Your opportunity is now pending admin verification. It will appear publicly after approval.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setIsSuccess(false)}>Submit Another</Button>
            <Button onClick={() => setCurrentScreen('home')}>Back to Directory</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => setCurrentScreen('home')} className="mb-6 gap-2 px-0 text-[#00401A] dark:text-emerald-400">
        <ArrowLeft className="w-4 h-4" /> {t.backToDirectory}
      </Button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3"><Sparkles className="w-3.5 h-3.5" /> Citizen Crowdsource Network</div>
        <h2 className={`text-3xl font-black text-slate-900 dark:text-white mb-2 ${isUrdu ? 'urdu-text' : ''}`}>{t.submitTitle || 'Submit an Opportunity'}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">Add only the information you have. Name, category and apply link are required; all other attributes are optional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
          {errorMsg && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">{errorMsg}</div>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Opportunity Name *</label>
            <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required placeholder="e.g. Punjab Youth Internship Program" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Category *</label>
            <Select value={form.category} onValueChange={(value) => updateField('category', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-slate-400">Choose the type of opportunity you are submitting.</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Opportunity Attributes</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Fill only the fields you know. Empty fields will not be stored.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ATTRIBUTE_FIELDS.map(([key, label, placeholder, type]) => (
                <div key={key} className={type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">{label}</label>
                  {type === 'textarea' ? <Textarea value={form[key]} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder} rows={3} /> : <Input value={form[key]} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder} />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Apply Link *</label>
            <Input type="url" value={form.apply_link} onChange={(e) => updateField('apply_link', e.target.value)} required placeholder="https://example.com/apply" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 gap-2">
            {isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSubmitting ? 'Submitting...' : (t.btnSubmit || 'Submit Opportunity')}
          </Button>
        </form>

        <aside className="md:col-span-4 space-y-4">
          <div className="bg-[#00401A] text-white rounded-3xl p-6">
            <h3 className="font-black text-base mb-3 flex gap-2 items-center"><ShieldCheck className="w-5 h-5" /> Structured Information</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">You do not need to write a long description. Enter whatever attributes you know. Values are stored flexibly inside <code>extra_data</code>.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm flex gap-2 items-center"><Info className="w-4 h-4 text-emerald-600" /> Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">A submission is not published immediately. Admin reviews it and can approve or reject it. Approved opportunities are then added to the public database.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
