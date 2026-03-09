'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Timer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';
import api from '@/lib/axios';

interface ReferralLog {
  id: number;
  status: string;
  joinTime: string;
  referrer: {
    id: number;
    username: string;
    telegramId: string;
  };
  referredUser: {
    id: number;
    username: string;
    telegramId: string;
  };
}

export default function ReferralsPage() {
  const [logs, setLogs] = useState<ReferralLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/referrals', {
        params: { page, limit: 12 }
      });
      setLogs(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'left': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Timer className="w-4 h-4 text-amber-500 animate-pulse" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Referral Intelligence</h1>
        <p className="text-slate-500 font-medium">Tracking the growth of the ecosystem through verified connections.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(12)].map((_, i) => (
            <div key={i} className="h-48 glass rounded-[2rem] border border-white/5 animate-pulse" />
          ))
        ) : (
          logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[2rem] p-6 border border-white/5 hover:border-blue-500/20 transition-all group group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  log.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                  log.status === 'left' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {getStatusIcon(log.status)}
                  {log.status}
                </span>
                <span className="text-[10px] text-slate-600 font-black font-mono">#{log.id}</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-white font-black text-xs">
                    {log.referrer?.username?.charAt(0) || 'U'}
                  </div>
                  <p className="text-[9px] text-slate-500 font-black mt-2 uppercase tracking-tight">Source</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 transition-all" />

                <div className="flex flex-col items-center text-right">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-600/20">
                    {log.referredUser?.username?.charAt(0) || 'U'}
                  </div>
                  <p className="text-[9px] text-slate-500 font-black mt-2 uppercase tracking-tight">Lead</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tight">Referrer</span>
                  <span className="text-white font-black">@{log.referrer?.username || log.referrer?.telegramId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-tight">Joined</span>
                  <span className="text-slate-400 font-mono text-[10px]">{new Date(log.joinTime).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination component logic is the same as in hris-users/page.tsx */}
      <div className="flex items-center justify-between glass rounded-[2rem] p-6 border border-white/5">
        <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Page <span className="text-white">{page}</span> of {totalPages}</p>
        <div className="flex gap-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronLeft />
          </button>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
