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
  AlertCircle,
  Bot,
  Radio,
  Power,
} from 'lucide-react';
import api from '@/lib/axios';

interface Setting {
  key: string;
  value: string;
  description: string;
}

const SETTING_META: Record<string, { label: string; placeholder: string }> = {
  BOT_USERNAME: { label: 'Bot Username', placeholder: 'e.g. wegagen_ref_bot (without @)' },
  REQUIRED_CHANNEL_ID: { label: 'Required Channel ID', placeholder: 'e.g. @wegagen_channel or -100123456789' },
  REFERRAL_VERIFICATION_DELAY: { label: 'Referral Verification Delay', placeholder: 'Delay in ms (0 = instant)' },
};

const TEXT_SETTING_KEYS = ['BOT_USERNAME', 'REQUIRED_CHANNEL_ID', 'REFERRAL_VERIFICATION_DELAY'];

function SettingIcon({ settingKey }: { settingKey: string }) {
  const cls = 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6B0B] transition-colors';
  if (settingKey === 'BOT_USERNAME') return <Bot className={cls} />;
  if (settingKey === 'REQUIRED_CHANNEL_ID') return <Radio className={cls} />;
  if (settingKey.includes('DELAY')) return <Clock className={cls} />;
  return <Hash className={cls} />;
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
          <h1 className="text-[36px] font-bold tracking-tight text-[#004360]">Platform Configuration</h1>
          <p className="text-slate-500 font-normal text-[14px]">
            Dynamically control global parameters without restarting the bot module.
          </p>
        </div>
      </header>

      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#004360]/10 rounded-2xl">
              <SettingsIcon className="w-6 h-6 text-[#004360]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#004360]">Bot & Verification Settings</h2>
              <p className="text-[12px] font-normal text-slate-400">Live configuration variables</p>
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
                className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"
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
                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"
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
              {/* Referral Enable/Disable Toggle */}
              {(() => {
                const referralSetting = settings.find(s => s.key === 'REFERRAL_ENABLED');
                if (!referralSetting) return null;
                const isEnabled = referralSetting.value !== 'false';
                return (
                  <div className={`p-6 rounded-2xl border-2 transition-all ${isEnabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isEnabled ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          <Power className={`w-6 h-6 ${isEnabled ? 'text-emerald-600' : 'text-rose-500'}`} />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#004360]">Referral & Invitation System</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {isEnabled
                              ? 'Active — users can share links and referrals are being counted'
                              : 'Disabled — share button hidden, new joins not counted. Leaderboard & T&C still work.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const newVal = isEnabled ? 'false' : 'true';
                          handleChange('REFERRAL_ENABLED', newVal);
                          try {
                            await api.patch('/settings', { settings: [{ key: 'REFERRAL_ENABLED', value: newVal }] });
                          } catch (err) {
                            console.error('Failed to toggle referral:', err);
                          }
                        }}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${isEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Text settings */}
              {settings.filter(s => TEXT_SETTING_KEYS.includes(s.key)).map((setting) => {
                const meta = SETTING_META[setting.key];
                const label = meta?.label ?? setting.key.replace(/_/g, ' ');
                const placeholder = meta?.placeholder ?? '';
                return (
                  <div key={setting.key} className="space-y-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">{label}</span>
                      <span className="text-[12px] font-normal text-slate-400">{setting.description}</span>
                    </label>
                    <div className="relative group">
                      <SettingIcon settingKey={setting.key} />
                      <input
                        type="text"
                        value={setting.value}
                        placeholder={placeholder}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-mono text-[14px] font-normal rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                );
              })}
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
              className="flex items-center gap-3 px-8 py-4 bg-[#FF6B0B] text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-[#FF6B0B]/20 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
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
