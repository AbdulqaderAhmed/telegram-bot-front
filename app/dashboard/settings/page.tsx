'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Clock,
  Hash,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = settings.map(({ key, value }) => ({ key, value }));
      await api.patch('/settings', { settings: payload });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-3"
           >
              <div className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                System Parameters
              </div>
           </motion.div>
           <h1 className="text-4xl font-black tracking-tight text-[#004360]">Platform Configuration</h1>
           <p className="text-slate-500 font-medium">
             Dynamically control global parameters without restarting the bot module.
           </p>
        </div>
      </header>

      {/* FORM CARD */}
      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
         <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-[#004360]/10 rounded-2xl">
                  <SettingsIcon className="w-6 h-6 text-[#004360]" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-[#004360]">Bot & Verification Settings</h2>
                  <p className="text-xs font-bold text-slate-400">Live configuration variables</p>
               </div>
            </div>
         </div>

         <form onSubmit={handleSave} className="p-8 space-y-8">
            <AnimatePresence>
               {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3"
                  >
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     {error}
                  </motion.div>
               )}
               {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3"
                  >
                     <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                     Configuration safely persisted to the database.
                  </motion.div>
               )}
            </AnimatePresence>

            {loading ? (
               <div className="flex items-center justify-center p-12">
                  <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
               </div>
            ) : settings.length === 0 ? (
               <div className="text-center p-12 text-slate-400 font-bold">No configurable settings available right now.</div>
            ) : (
               <div className="space-y-6">
                 {settings.map((setting) => (
                   <div key={setting.key} className="space-y-3">
                     <label className="flex flex-col gap-1">
                        <span className="text-xs font-black text-[#004360] uppercase tracking-widest">{setting.key.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] font-bold text-slate-400">{setting.description}</span>
                     </label>
                     <div className="relative group">
                        {setting.key.includes('DELAY') ? (
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6B0B] transition-colors" />
                        ) : (
                           <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6B0B] transition-colors" />
                        )}
                        <input
                           type="text"
                           value={setting.value}
                           onChange={(e) => handleChange(setting.key, e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-mono text-sm font-bold rounded-2xl auto-transition py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                        />
                     </div>
                   </div>
                 ))}
               </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
               <button
                  type="button"
                  onClick={fetchSettings}
                  disabled={loading || saving}
                  className="px-6 py-4 glass text-[#004360] font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
               >
                  Discard Changes
               </button>
               <button
                  type="submit"
                  disabled={loading || saving}
                  className="flex items-center gap-3 px-8 py-4 bg-[#FF6B0B] text-white rounded-2xl font-black shadow-xl shadow-[#FF6B0B]/20 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
               >
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Configuration
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
