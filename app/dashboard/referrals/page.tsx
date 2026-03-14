'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import api from '@/lib/axios';
import * as XLSX from 'xlsx';

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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/referrals', {
        params: { 
          page, 
          limit: 10,
          search: search || undefined,
          status: status || undefined
        }
      });
      setLogs(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (logs.length === 0) return;
    try {
      const exportData = logs.map(log => ({
        ID: log.id,
        Referrer: `@${log.referrer?.username || log.referrer?.telegramId || '—'}`,
        Referred: `@${log.referredUser?.username || log.referredUser?.telegramId || '—'}`,
        Status: log.status,
        'Join Time': new Date(log.joinTime).toLocaleString()
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      const colWidths = Object.keys(exportData[0] || {}).map(key => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row] || '').length)
        );
        return { wch: maxLength + 2 };
      });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Referral Logs");
      XLSX.writeFile(wb, `Referral_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [page, search, status]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'left': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'left': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Timer className="w-3.5 h-3.5 animate-pulse" />;
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-3"
           >
              <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-normal uppercase tracking-[0.2em]">
                Growth Engine
              </div>
              <div className="h-[1px] w-12 bg-blue-500/20" />
           </motion.div>
           <h1 className="text-[36px] font-bold tracking-tight text-[#004360]">Referral Intelligence</h1>
           <p className="text-slate-500 font-normal max-w-xl text-[14px]">
             Explore verified connections across the ecosystem with granular filtering and live tracking.
           </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => { setPage(1); fetchLogs(); }}
             className="p-4 glass rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
           >
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={exportToExcel}
             disabled={logs.length === 0}
             className="flex items-center gap-2 px-6 py-4 bg-[#004360] text-white rounded-2xl font-bold text-[14px] hover:translate-y-[-2px] transition-all shadow-xl shadow-blue-900/10 active:scale-95 disabled:opacity-50"
           >
             <Download className="w-4 h-4" />
             Export Data
           </button>
        </div>
      </header>

      {/* FILTERS BAR */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-slate-100 shadow-sm"
      >
        <div className="relative flex-1 w-full">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by username or Telegram ID..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[14px] font-normal focus:ring-2 focus:ring-blue-500/20 transition-all"
           />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 rounded-2xl border-none">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent border-none text-[14px] font-normal p-0 focus:ring-0 text-slate-600 cursor-pointer min-w-[120px]"
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="left">Left</option>
              </select>
           </div>
           
           <div className="px-5 py-4 bg-blue-50 rounded-2xl text-blue-600 text-[12px] font-normal uppercase tracking-widest hidden lg:block">
              {logs.length} Records Found
           </div>
        </div>
      </motion.div>

      {/* DATA TABLE */}
      <div className="glass rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400">Syncing Intelligence...</p>
             </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referral Linkage</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Source Account</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                         <div className="p-6 bg-slate-100 rounded-full">
                            <Activity className="w-12 h-12" />
                         </div>
                         <p className="text-[14px] font-normal text-slate-500">No referral logs match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="flex -space-x-3">
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                                 {log.referrer?.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#004360] flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                                 {log.referredUser?.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[14px] font-bold text-[#004360]">@{log.referredUser?.username || log.referredUser?.telegramId}</span>
                              <span className="text-[10px] font-normal text-slate-400">Ref ID: #{log.id}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-normal uppercase tracking-widest flex items-center gap-2 border w-fit ${getStatusStyle(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-slate-600 flex items-center gap-2">
                               <Users className="w-3 h-3 text-blue-500" />
                               @{log.referrer?.username || log.referrer?.telegramId}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 mt-0.5">Origin User</span>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-slate-600 flex items-center gap-2">
                               <Calendar className="w-3 h-3 text-slate-400" />
                               {new Date(log.joinTime).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                               {new Date(log.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-5 h-5" />
                         </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
         <div className="flex items-center gap-4">
            <div className="px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-normal text-slate-400 uppercase tracking-widest bg-white">
               Displaying {logs.length} of {totalPages * 10} records
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 const p = i + 1;
                 const isActive = p === page;
                 return (
                   <button 
                     key={p}
                     onClick={() => setPage(p)}
                     className={`w-12 h-12 rounded-2xl text-[12px] font-normal transition-all ${
                       isActive ? 'bg-[#004360] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                     }`}
                   >
                     {p}
                   </button>
                 );
               })}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
}
