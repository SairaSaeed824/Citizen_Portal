import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, AlertCircle, Eye, EyeOff, RefreshCw, LogOut } from 'lucide-react';
import AdminSubmissionQueue from '../components/AdminSubmissionQueue';

export default function AdminScreen({ setCurrentScreen, t, lang }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isUrdu = lang === 'ur';

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setIsLoading(true);
    // Backward-compatible local admin access used by the existing portal.
    if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
      setIsLoggedIn(true); setIsLoading(false); return;
    }
    try {
      const { data, error } = await supabase.from('admins').select('*').eq('username', username.trim()).maybeSingle();
      if (error || !data || String(data.password).trim() !== password.trim()) throw new Error('Invalid credentials');
      setIsLoggedIn(true);
    } catch (e) {
      setErrorMsg(isUrdu ? 'غلط یوزر نام یا پاس ورڈ۔' : 'Invalid username or password.');
    } finally { setIsLoading(false); }
  };

  const handleLogout = () => { setIsLoggedIn(false); setUsername(''); setPassword(''); };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <button onClick={() => setCurrentScreen('home')} className="inline-flex items-center gap-2 text-xs font-bold text-[#00401A] dark:text-emerald-400 hover:text-[#055825] mb-6"><ArrowLeft className="w-4 h-4" />{t.backToDirectory}</button>
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6"><div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-[#00401A] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3"><ShieldCheck className="w-7 h-7" /></div><h2 className="text-2xl font-black text-slate-900 dark:text-white">{isUrdu ? 'ایڈمن لاگ ان' : 'Administrator Gateway'}</h2><p className="text-xs text-slate-500 mt-1">Review and verify citizen opportunity submissions.</p></div>
          {errorMsg && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4 flex gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">Username</label><div className="relative"><input value={username} onChange={e=>setUsername(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white" placeholder="admin"/><User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400"/></div></div>
            <div><label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">Password</label><div className="relative"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white" placeholder="••••••••"/><Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
            <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#00401A] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">{isLoading?<RefreshCw className="w-4 h-4 animate-spin"/>:<KeyRound className="w-4 h-4"/>}{isUrdu?'لاگ ان کریں':'Secure Login'}</button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#00401A] rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><ShieldCheck className="w-6 h-6"/><h2 className="text-xl font-black">Admin Verification Center</h2></div><p className="text-xs text-emerald-100 mt-1">Review, approve or reject citizen-submitted opportunities.</p></div><button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold"><LogOut className="w-4 h-4"/>Sign Out</button></div>
          <AdminSubmissionQueue username={username.trim()} password={password} lang={lang} />
        </div>
      )}
    </div>
  );
}
