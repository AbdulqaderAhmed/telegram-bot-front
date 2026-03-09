'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Shield,
  ShieldOff,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/axios';

interface HrisUser {
  id: number;
  ID: string;
  Fullname: string;
  username: string;
  workunit: string;
  position: string;
  Role: string;
  isActive: boolean;
  syncedAt: string;
}

export default function HrisUsersPage() {
  const [users, setUsers] = useState<HrisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { page, limit: 10, search }
      });
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching HRIS users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-blue-500 font-black text-xs uppercase tracking-[0.2em]">
            <span className="w-8 h-[2px] bg-blue-500" />
            Core Directory
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">HRIS Enterprise Accounts</h1>
          <p className="text-slate-500 font-medium max-w-2xl">Manage and monitor synchronized workforce data from the central SQL Server view.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="p-4 glass rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
          <button className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-95 group">
            Export Dataset
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Advanced Filter Bar */}
      <div className="glass rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-all" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or username..." 
            className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-3 px-6 py-4 glass rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-sm h-full w-full md:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Segment
          </button>
          <button className="flex items-center gap-3 px-6 py-4 glass rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-sm h-full w-full md:w-auto justify-center">
            <Clock className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Workforce & Positioning</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Security & Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">System Link</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 bg-white/2" />
                  </tr>
                ))
              ) : (
                users.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/2 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white font-black text-lg shadow-inner group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                          {user.Fullname?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold leading-tight group-hover:text-blue-400 transition-all">{user.Fullname || 'Unknown Identity'}</p>
                          <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider mt-1.5 flex items-center gap-2">
                             <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">{user.ID}</span>
                             • {user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                          {user.position || 'Contractor'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {user.workunit}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${user.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                         {user.isActive ? 'Active Node' : 'Suspended'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Last Synced</span>
                         <span className="text-xs font-mono text-slate-400">{new Date(user.syncedAt).toLocaleTimeString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-3 glass rounded-xl hover:bg-blue-600/10 hover:text-blue-400 text-slate-500 transition-all opacity-0 group-hover:opacity-100">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-3 glass rounded-xl hover:bg-white/10 text-slate-500 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        <div className="px-8 py-8 border-t border-white/5 flex items-center justify-between glass">
          <p className="text-xs font-bold text-slate-500 tracking-tight uppercase">
            Displaying <span className="text-white">{users.length}</span> of <span className="text-white">Active Entities</span>
          </p>
          <div className="flex items-center gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
               {[...Array(totalPages)].map((_, i) => (
                 <button 
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'glass text-slate-500 hover:text-white hover:bg-white/5'}`}
                 >
                   {i+1}
                 </button>
               ))}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
