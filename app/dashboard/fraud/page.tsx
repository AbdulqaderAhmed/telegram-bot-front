'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ExternalLink,
  User as UserIcon
} from 'lucide-react';
import api from '@/lib/axios';

interface FraudLog {
  id: number;
  reason: string;
  type: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    telegramId: string;
    firstName: string;
    lastName: string;
  };
}

export default function FraudPage() {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fraud', { params: { page, limit: 10 } });
      setLogs(data.data);
      setTotalPages(data.totalPages);
      setTotalLogs(data.total);
    } catch (err) {
      console.error('Error fetching fraud logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'confirmed' | 'dismissed') => {
    setUpdating(id);
    try {
      await api.patch(`/fraud/${id}/status`, { status });
      setLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'dismissed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-rose-500 font-normal text-[10px] uppercase tracking-[0.2em]">
            <span className="w-8 h-[2px] bg-rose-500" />
            Security Shield
          </div>
          <h1 className="text-[36px] font-bold text-foreground tracking-tight">Suspicious Activity Audit</h1>
          <p className="text-foreground/60 text-[14px] font-normal max-w-2xl">
            Review automatically flagged referral patterns and manual fraud reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-4 glass rounded-2xl hover:bg-foreground/5 text-foreground/70 transition-all active:scale-95 group"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass rounded-3xl border border-foreground/10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/40 text-[10px] font-normal uppercase tracking-[0.1em]">Total Flagged</p>
            <h3 className="text-[36px] font-bold text-foreground">{totalLogs}</h3>
          </div>
        </div>
        <div className="p-6 glass rounded-3xl border border-foreground/10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/40 text-[10px] font-normal uppercase tracking-[0.1em]">Critical Patterns</p>
            <h3 className="text-[36px] font-bold text-foreground">{logs.filter(l => l.type === 'rate_limit' || l.type === 'fake_user').length}</h3>
          </div>
        </div>
        <div className="p-6 glass rounded-3xl border border-foreground/10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/40 text-[10px] font-normal uppercase tracking-[0.1em]">Last 24 Hours</p>
            <h3 className="text-[36px] font-bold text-foreground">{logs.length}</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-foreground/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/5">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/70">Subject</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/70">Violation Type / Reason</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/70">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-foreground/70">Timestamp</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`load-${i}`} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 bg-foreground/[0.01]" />
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-foreground/30 text-[14px] font-normal">
                    Clean slate. No suspicious patterns detected! 🛡️
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-foreground/[0.02] transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground/60">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-foreground">
                            {log.user?.firstName ? `${log.user.firstName} ${log.user.lastName}` : `@${log.user?.username || 'unknown'}`}
                          </p>
                          <p className="text-[10px] font-normal text-foreground/40">{log.user?.telegramId || 'No ID'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-rose-500/5 text-rose-500/80 px-4 py-3 rounded-2xl border border-rose-500/10 text-[12px] font-normal">
                        {log.reason}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-normal uppercase tracking-widest border ${getStatusStyle(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[12px] font-mono text-foreground/60">{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => updateStatus(log.id, 'dismissed')}
                          disabled={updating === log.id || log.status === 'dismissed'}
                          className="p-3 glass rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all disabled:opacity-40"
                          title="Dismiss"
                        >
                          {updating === log.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => updateStatus(log.id, 'confirmed')}
                          disabled={updating === log.id || log.status === 'confirmed'}
                          className="p-3 glass rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-40"
                          title="Confirm Fraud"
                        >
                          {updating === log.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-8 border-t border-foreground/10 flex items-center justify-between glass">
          <p className="text-[12px] font-normal text-foreground/60 uppercase tracking-widest">
            Audit Archive — {totalLogs} Events
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-foreground/70 hover:text-foreground disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-foreground/70 hover:text-foreground disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
