'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  RefreshCw,
  TrendingUp,
  UserCheck,
  Award,
  Crown,
  Medal,
  Calendar,
  ChevronRight,
  ChevronDown,
  Loader2,
  Users
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import * as XLSX from 'xlsx';

interface LeaderboardEntry {
  rank: number;
  referralCount: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string | null;
    telegramId: string;
    phoneNumber: string | null;
    onboardingStatus: string;
    role: string | null;
    EmpID: string | null;
    createdAt: string;
  };
}

interface Campaign {
  id: number;
  name: string;
  isCurrent: boolean;
  isEnabled: boolean;
}

export default function ReportsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState<number | null>(null);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get<Campaign[]>('/campaigns');
      setCampaigns(data);
      const current = data.find((c) => c.isCurrent) || data.find((c) => c.isEnabled) || null;
      setCampaignId((prev) => prev ?? current?.id ?? null);
    } catch (err) {
      setCampaigns([]);
    }
  };

  const fetchLeaderboard = async (id?: number | null) => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaderboard', {
        params: { limit: 100, campaignId: id ?? campaignId ?? undefined } // Get a larger set for reporting
      });
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns().finally(() => fetchLeaderboard(null));
  }, []);

  useEffect(() => {
    fetchLeaderboard(campaignId);
  }, [campaignId]);

  const toggleRow = (userId: number) => {
    setExpandedRow(prev => prev === userId ? null : userId);
  };

  const exportToExcel = () => {
    if (leaderboard.length === 0) return;
    setExporting(true);
    try {
      const exportData = leaderboard.map(entry => {
        const fullName = [entry.user?.firstName, entry.user?.lastName].filter(Boolean).join(' ');
        
        // SECURITY COMPLIANCE: Including PII (Phone Number) as per explicit business requirement for administrative reporting.
        return {
          Rank: entry.rank,
          'Full Name': fullName || '—',
          'Phone Number': entry.user?.phoneNumber || '—',
          'Role': entry.user?.role || '—',
          'Employee ID': entry.user?.EmpID || '—',
          'Username / ID': entry.user?.username ? `@${entry.user.username}` : (entry.user?.telegramId || '—'),
          'Verified Referrals': entry.referralCount,
          'Onboarding Status': entry.user?.onboardingStatus || '—',
          'Joined At': entry.user?.createdAt ? new Date(entry.user.createdAt).toLocaleDateString() : '—'
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Auto-size columns logic
      const colWidths = Object.keys(exportData[0] || {}).map(key => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map(row => String(row[key as keyof typeof row] || '').length)
        );
        return { wch: maxLength + 2 };
      });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Referral Leaderboard");
      XLSX.writeFile(wb, `Referral_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 shadow-xl" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-[12px] font-bold text-slate-400 font-mono">#{rank}</span>;
  };

  return (
    <div className="space-y-12 pb-20 overflow-hidden">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2">
        <div className="space-y-3">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-3"
           >
              <div className="px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-normal uppercase tracking-[0.3em]">
                Elite Performance
              </div>
           </motion.div>
           <h1 className="text-[36px] font-bold tracking-tight text-[#004360] leading-[1.1]">Leaderboard & <br/><span className="text-[#FF6B0B]">Growth Reports</span></h1>
           <p className="text-slate-500 font-normal max-w-xl text-[14px]">
             The ultimate ranking of our ecosystem's top influencers. Track, analyze, and export verified performance data.
           </p>
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex gap-4">
              <button 
                onClick={() => fetchLeaderboard(campaignId)}
                className="p-5 glass rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={exportToExcel}
                disabled={leaderboard.length === 0 || exporting}
                className="flex items-center gap-3 px-8 py-5 bg-[#004360] text-white rounded-2xl font-bold text-[14px] hover:translate-y-[-4px] transition-all shadow-2xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
              >
                {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
                Export to Excel
              </button>
           </div>
           <div className="px-6 py-3 glass rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Campaign</span>
              <select
                value={campaignId ?? ''}
                onChange={(e) => setCampaignId(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent text-[12px] font-bold text-[#004360] outline-none"
              >
                <option value="">Select</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.isCurrent ? `${c.name} (Current)` : c.name}
                  </option>
                ))}
              </select>
           </div>
           <div className="px-6 py-3 glass rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Last Updated</span>
              <span className="text-[10px] font-bold text-[#004360] font-mono">{new Date().toLocaleTimeString()}</span>
           </div>
        </div>
      </header>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Top Performer', value: leaderboard.length > 0 ? (leaderboard[0]?.user?.username || leaderboard[0]?.user?.firstName || '—') : '—', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
           { label: 'Ecosystem Growth', value: leaderboard.length > 0 ? `+${leaderboard.reduce((a, b) => a + (b.referralCount || 0), 0)} Verified` : '0 Verified', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { label: 'Active Champions', value: leaderboard.length, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
         ].map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-8 glass rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden"
           >
              <div className={`absolute top-0 right-0 p-10 ${stat.bg} rounded-bl-[100px] opacity-20 group-hover:scale-110 transition-transform`} />
              <stat.icon className={`w-8 h-8 ${stat.color} mb-6 relative z-10`} />
              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
              <h3 className="text-[36px] font-bold text-[#004360] mt-2 relative z-10">{stat.value}</h3>
           </motion.div>
         ))}
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                 <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                 <h2 className="text-[16px] font-bold text-[#004360]">Ranking Table</h2>
                 <p className="text-[12px] font-normal text-slate-400">Showing top performers by verified invite volume</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">All Time Stats</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-24">Rank</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Champion Account</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phone Number</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Score</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Onboarding</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Performance Index</th>
                <th className="pr-10 pl-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-10 py-8">
                      <div className="h-4 bg-slate-100 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                       <Trophy className="w-16 h-16" />
                       <p className="text-[16px] font-bold text-slate-500">The leaderboard is currently empty.</p>
                       <p className="text-[14px] font-normal">Be the first to refer a user and claim the throne!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, i) => (
                  <LeaderboardRow 
                    key={entry.user.id}
                    entry={entry}
                    index={i}
                    isExpanded={expandedRow === entry.user.id}
                    onToggle={() => toggleRow(entry.user.id)}
                    maxReferrals={leaderboard.length > 0 ? Math.max(leaderboard[0].referralCount, 1) : 1}
                    getMedalIcon={getMedalIcon}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ 
  entry, 
  index, 
  isExpanded, 
  onToggle, 
  maxReferrals, 
  getMedalIcon 
}: { 
  entry: LeaderboardEntry; 
  index: number; 
  isExpanded: boolean; 
  onToggle: () => void;
  maxReferrals: number;
  getMedalIcon: (rank: number) => React.ReactNode;
}) {
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isExpanded && !hasFetched) {
      setLoadingDetails(true);
      api.get(`/referrals/user/${entry.user.id}`)
        .then(({ data }) => {
          setReferredUsers(data.list || []);
          setHasFetched(true);
        })
        .catch(err => {
          console.error(err);
          setReferredUsers([]);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [isExpanded, hasFetched, entry.user.id]);

  const performancePct = Math.min(100, (entry.referralCount / maxReferrals) * 100);

  return (
    <React.Fragment>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onToggle}
        className={`hover:bg-amber-500/[0.04] transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
      >
        <td className="pl-10 pr-6 py-8">
           <div className="flex items-center gap-4">
              {getMedalIcon(entry.rank)}
           </div>
        </td>
        <td className="px-6 py-8">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[12px] font-bold shadow-lg shadow-blue-900/10 ${index < 3 ? 'bg-[#004360]' : 'bg-slate-300'}`}>
                 {entry.user.firstName?.charAt(0).toUpperCase() || entry.user.username?.charAt(0).toUpperCase() || entry.user.telegramId?.charAt(0) || '?'}
              </div>
              <div className="flex flex-col">
                 <span className="text-[14px] font-bold text-[#004360]">
                   {[entry.user.firstName, entry.user.lastName].filter(Boolean).join(' ') || entry.user.username || `@${entry.user.telegramId}` || 'Unknown User'}
                 </span>
                 {entry.user.username && <span className="text-[10px] font-normal text-slate-400">@{entry.user.username}</span>}
              </div>
           </div>
        </td>
        <td className="px-6 py-8">
           <span className="text-[14px] font-normal text-slate-500">{entry.user.phoneNumber || '—'}</span>
        </td>
        <td className="px-6 py-8">
           <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold text-[#004360] font-mono">{entry.referralCount}</span>
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Pts</span>
           </div>
        </td>
        <td className="px-6 py-8">
           <span className={`px-4 py-1.5 rounded-full text-[9px] font-normal uppercase tracking-widest border ${
             entry.user.onboardingStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'
           }`}>
              {entry.user.onboardingStatus}
           </span>
        </td>
        <td className="px-6 py-8">
           <div className="flex items-center gap-3">
             <div className="w-full max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${performancePct}%` }}
                   className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-[#FF8F12] to-[#FF6B0B] shadow-lg shadow-[#FF6B0B]/40' : 'bg-[#004360]'}`}
                />
             </div>
             <span className="text-[10px] font-normal text-slate-400 w-8">{Math.round(performancePct)}%</span>
           </div>
        </td>
        <td className="pr-10 pl-6 py-8 text-right">
           <button className={`p-3 glass rounded-xl transition-all shadow-sm ${isExpanded ? 'bg-[#004360] text-white' : 'text-[#004360] bg-[#004360]/5 border-[#004360]/10 hover:bg-[#004360]/10'}`}>
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
           </button>
        </td>
      </motion.tr>
      
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={7} className="p-0 border-b border-slate-100 bg-slate-50/50">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden shadow-inner"
              >
                <div className="p-10">
                  <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#004360] uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">
                    <Users className="w-4 h-4 text-[#FF6B0B]" /> Recruited Network ({entry.referralCount})
                  </h4>
                  
                  {loadingDetails ? (
                    <div className="flex items-center justify-center gap-3 text-[#004360] font-bold p-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF6B0B]" /> Loading network connections...
                    </div>
                  ) : referredUsers.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-normal text-[14px]">
                      No direct verified recruits recorded on the blockchain yet.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-[#004360]/5">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {referredUsers.map((ref: any, idx) => {
                            const fullName = [ref.referredUser?.firstName, ref.referredUser?.lastName].filter(Boolean).join(' ');
                            
                            return (
                              <motion.tr 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                key={ref.id}
                                className="hover:bg-[#FF6B0B]/[0.02] transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#004360]/10 text-[#004360] font-bold text-[12px] flex items-center justify-center">
                                      {(fullName || ref.referredUser?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[14px] font-bold text-[#004360]">
                                      {fullName || 'Anonymous User'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-[14px] font-normal text-slate-500">
                                  {ref.referredUser?.username ? `@${ref.referredUser.username}` : '—'}
                                </td>
                                <td className="px-6 py-4 text-[14px] font-normal text-slate-500">
                                  {ref.referredUser?.phoneNumber || '—'}
                                </td>
                                <td className="px-6 py-4 text-right text-[12px] font-normal text-slate-400">
                                  {new Date(ref.joinTime).toLocaleDateString()}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
