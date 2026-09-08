import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Eye, Inbox } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function AdminSubmissionQueue({ username, password, lang }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/submitted-opportunities/pending`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Could not load pending submissions');
      setItems(result.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const review = async (item, action) => {
    setBusyId(item.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/submitted-opportunities/${item.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_username: username,
          admin_password: password,
          action,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Review failed');
      setItems((current) => current.filter((x) => x.id !== item.id));
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const extra = selected?.extra_data || {};

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Citizen Submission Queue</h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black">{items.length} Pending</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review extracted opportunity details before publication.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-xs text-slate-500">Loading submissions...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500">No pending citizen submissions.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{item.title || item.name}</h5>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">{item.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || item.detail}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"><Eye className="w-3.5 h-3.5" /> Review</button>
                  <button onClick={() => review(item, 'approve')} disabled={busyId === item.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</button>
                  <button onClick={() => review(item, 'reject')} disabled={busyId === item.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div><h3 className="text-lg font-black text-slate-900 dark:text-white">{selected.title || selected.name}</h3><p className="text-xs text-slate-500 mt-1">{selected.category}</p></div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            <div className="space-y-4 text-xs">
              <div><div className="font-black uppercase tracking-wider text-slate-400 mb-1">Details</div><p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selected.description || selected.detail}</p></div>
              <div><div className="font-black uppercase tracking-wider text-slate-400 mb-2">Extracted attributes</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{Object.entries(extra).filter(([k]) => !['submitted_details','submitted_at','source_type','verification_status','category'].includes(k)).map(([key, value]) => <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><div className="font-bold text-slate-500 mb-1">{key.replaceAll('_',' ')}</div><div className="text-slate-800 dark:text-slate-200 break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</div></div>)}</div></div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => review(selected, 'reject')} disabled={busyId === selected.id} className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold">Reject</button>
              <button onClick={() => review(selected, 'approve')} disabled={busyId === selected.id} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Approve & Publish</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
