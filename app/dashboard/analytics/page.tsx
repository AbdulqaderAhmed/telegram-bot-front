'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sparkles,
  MousePointer2,
  CalendarDays
} from 'lucide-react';
import api from '@/lib/axios';

interface Overview {
  totalUsers: number;
  totalReferrals: number;
  completedOnboarding: number;
  completionRate: number;
}

interface GrowthPoint {
  date: string;
  count: number;
}

interface OnboardingStat {
  status: string;
  count: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingStat[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ovRes, grRes, obRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/growth'),
        api.get('/analytics/onboarding')
      ]);
      setOverview(ovRes.data);
      setGrowth(grRes.data);
      setOnboarding(obRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Smooth transition
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxValue = Math.max(...growth.map(p => p.count), 1);

  const calculateTrend = () => {
    if (growth.length < 2) return 0;
    const current = growth[growth.length - 1].count;
    const previous = growth[growth.length - 2].count;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const trend = calculateTrend();

  return (
    <div className="min-h-screen bg-white text-[#004360]">
      <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
        
        {/* TOP BAR / HEADER */}
        <header className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-8 px-4">
          <div className="space-y-4">
             <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="flex items-center gap-3"
             >
                <div className="px-4 py-1 rounded-full bg-[#FF6B0B]/10 border border-[#FF6B0B]/20 text-[#FF6B0B] text-[10px] font-black uppercase tracking-[0.3em]">
                   Live Intelligence
                </div>
                <div className="h-[1px] w-20 bg-gradient-to-r from-[#FF6B0B]/40 to-transparent" />
             </motion.div>
             
             <div className="relative">
                <h1 className="text-6xl font-black tracking-tight leading-none text-[#004360]">
                   Alpha <span className="text-[#FF6B0B]">Analytics</span>
                </h1>
                <p className="text-[#004360]/60 font-medium text-xl mt-4 max-w-xl">
                   Strategic overview of your multi-channel referral ecosystem performance.
                </p>
             </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchAnalytics}
            className="group relative flex items-center gap-4 px-10 py-5 bg-[#004360] text-white rounded-3xl font-black text-sm transition-all shadow-2xl shadow-[#004360]/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            SYNCHRONIZE DATA
          </motion.button>
        </header>

        {/* CORE KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 px-4">
          {[
            { label: 'Network Size', value: overview?.totalUsers, icon: Users, color: '#004360', desc: 'Total tracked users' },
            { label: 'Referral Flow', value: overview?.totalReferrals, icon: UserPlus, color: '#FF6B0B', desc: 'Active invite cycles' },
            { label: 'Conversions', value: overview?.completedOnboarding, icon: Target, color: '#FF8F12', desc: 'Verification success' },
            { label: 'Retention Health', value: `${overview?.completionRate}%`, icon: Activity, color: '#10b981', desc: 'Onboarding funnel' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-1 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,67,96,0.08)] group overflow-hidden border border-[#004360]/5"
            >
               <div className="relative z-10 p-8 flex flex-col h-full bg-white rounded-[2.25rem]">
                  <div className="flex items-start justify-between">
                     <div className="p-4 rounded-2xl bg-gray-50 text-[#004360] group-hover:bg-[#004360] group-hover:text-white transition-all duration-500">
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-[#004360]/30 uppercase tracking-widest">{stat.desc}</span>
                  </div>
                  
                  <div className="mt-10">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6B0B] mb-1">{stat.label}</p>
                     <h3 className="text-5xl font-black tracking-tighter text-[#004360]">
                        {loading ? '...' : stat.value}
                     </h3>
                  </div>

                  <div className="mt-6 h-[2px] w-full bg-gray-50 group-hover:bg-[#FF6B0B]/20 transition-all overflow-hidden">
                     <motion.div 
                       initial={{ x: '-100%' }}
                       whileInView={{ x: '0%' }}
                       transition={{ duration: 1, delay: i * 0.2 }}
                       className="h-full w-full bg-[#FF6B0B]"
                     />
                  </div>
               </div>
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#FF6B0B]/10 transition-all duration-700" />
            </motion.div>
          ))}
        </div>

        {/* MAIN DATA SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-4">
          
          {/* TRAJECTORY CHART (Visual) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-8 p-1 bg-gradient-to-br from-white to-gray-50 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-[#004360]/5"
          >
            <div className="p-12 space-y-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-3xl bg-[#004360] flex items-center justify-center text-white shadow-xl shadow-[#004360]/20">
                        <TrendingUp className="w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-[#004360] tracking-tight">Referral Trajectory</h4>
                        <p className="flex items-center gap-2 text-sm font-bold text-[#004360]/40 uppercase tracking-[0.1em]">
                           <CalendarDays className="w-4 h-4" />
                           Dynamic 7-Day Performance Index
                        </p>
                     </div>
                  </div>

                  <div className={`flex items-center gap-3 px-6 py-3 ${trend >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} border rounded-2xl font-black transition-all duration-700`}>
                     <div className={`p-1.5 rounded-lg ${trend >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                     </div>
                     <span className="text-xl tabular-nums tracking-tighter">{loading ? '0%' : `${trend >= 0 ? '+' : ''}${trend}%`}</span>
                     <span className="text-[10px] text-current/60 uppercase tracking-widest ml-1">v. Yesterday</span>
                  </div>
               </div>

               {/* CUSTOM BAR CHART UI */}
               <div className="relative h-[400px] w-full mt-10 p-4 flex items-end justify-between gap-6">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                         <div className="flex gap-2">
                           {[0.1, 0.2, 0.3].map(d => (
                             <motion.div 
                               key={d}
                               animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                               transition={{ repeat: Infinity, duration: 1, delay: d }}
                               className="w-3 h-3 bg-[#004360] rounded-full"
                             />
                           ))}
                         </div>
                      </motion.div>
                    ) : growth.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-[#004360]/30 font-black uppercase tracking-[0.2em] italic bg-gray-50/50 rounded-3xl">
                         No Data Points Available
                      </div>
                    ) : (
                      growth.map((point, index) => {
                        const heightPerc = (point.count / maxValue) * 100;
                        return (
                          <div key={point.date} className="flex-1 group flex flex-col items-center gap-6">
                            <div className="relative w-full flex items-end justify-center">
                               {/* Bar Backdrop */}
                               <div className="absolute inset-0 w-2 h-full bg-gray-100 rounded-full left-1/2 -translate-x-1/2 opacity-20" />
                               
                               <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${Math.max(heightPerc, 8)}%` }} // Minimum height for visibility
                                 transition={{ type: 'spring', damping: 20, stiffness: 100, delay: index * 0.1 }}
                                 className="relative w-full max-w-[60px] min-h-[40px] bg-white rounded-3xl transition-all duration-500 shadow-xl border-4 border-gray-50 flex items-center justify-center group-hover:-translate-y-2 group-hover:border-[#FF6B0B]/30"
                                 style={{ 
                                   background: `linear-gradient(to top, #004360 0%, ${heightPerc > 50 ? '#FF6B0B' : '#004360'} 100%)`,
                                   boxShadow: `0 20px 40px -10px rgba(0,67,96,${heightPerc > 50 ? '0.4' : '0.2'})`
                                 }}
                               >
                                  <span className="text-[10px] font-black text-white mix-blend-difference">{point.count}</span>
                                  {/* Glass shine Overlay */}
                                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none" />
                               </motion.div>
                            </div>
                            
                            <div className="text-center">
                               <p className="text-[11px] font-black tracking-widest text-[#004360]">{new Date(point.date).toLocaleDateString(undefined, { day: 'numeric' })}</p>
                               <p className="text-[9px] font-bold text-[#004360]/40 uppercase">{new Date(point.date).toLocaleDateString(undefined, { month: 'short' })}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </AnimatePresence>

                  {/* Aesthetic Grid Elements */}
                  <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-[10px] font-black text-[#004360]/20 pointer-events-none">
                     <span>{maxValue}</span>
                     <span>{Math.round(maxValue / 2)}</span>
                     <span>0</span>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* SIDE PANEL: ANALYTICS DETAIL */}
          <div className="xl:col-span-4 space-y-8">
             
             {/* ONBOARDING HEALTH (Simplified & Beautiful) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="p-10 bg-white rounded-[3rem] shadow-[0_25px_50px_rgba(0,0,0,0.04)] border border-[#004360]/5 overflow-hidden group"
             >
                <div className="flex items-center gap-5 mb-10">
                   <div className="p-4 rounded-2xl bg-[#FF6B0B]/10 text-[#FF6B0B]">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-[#004360] tracking-tight">Onboarding Health</h4>
                      <p className="text-[10px] font-black text-[#004360]/40 uppercase tracking-widest">Global Status Delta</p>
                   </div>
                </div>

                <div className="space-y-10">
                   {loading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                           <div className="h-4 bg-gray-50 rounded-full w-full animate-pulse" />
                           <div className="h-2 bg-gray-50 rounded-full w-2/3 animate-pulse" />
                        </div>
                      ))
                   ) : (
                      onboarding.map((stat, i) => {
                         const total = onboarding.reduce((acc, curr) => acc + curr.count, 0);
                         const perc = (stat.count / total) * 100;
                         const isPrimary = stat.status === 'COMPLETED';
                         
                         return (
                           <div key={stat.status} className="relative group/item">
                              <div className="flex justify-between items-end mb-3">
                                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#004360]/60">{stat.status}</span>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-[#004360] tabular-nums">{Math.round(perc)}</span>
                                    <span className="text-xs font-bold text-[#004360]/40">%</span>
                                 </div>
                              </div>
                              <div className="h-3 bg-gray-50 rounded-full overflow-hidden p-[1px]">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: `${perc}%` }}
                                   transition={{ duration: 1.5, ease: 'circOut' }}
                                   className={`h-full rounded-full ${isPrimary ? 'bg-[#004360]' : 'bg-[#FF6B0B]'}`}
                                 />
                              </div>
                              <p className="text-[9px] font-black text-[#004360]/30 mt-2 uppercase tracking-widest">{stat.count} Active Entities</p>
                           </div>
                         );
                      })
                   )}
                </div>
             </motion.div>

             {/* QUICK ACTION / INSIGHT */}
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="relative p-10 bg-[#004360] text-white rounded-[3rem] shadow-2xl shadow-[#004360]/30 overflow-hidden"
             >
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                         <Layers className="w-5 h-5 text-[#FF8F12]" />
                      </div>
                      <h5 className="text-lg font-black tracking-tight italic">Performance Insight</h5>
                   </div>
                   
                   <p className="text-white/70 text-sm leading-relaxed font-medium">
                      Your referral ecosystem is seeing a <span className="text-[#FF8F12] font-black">Velocity Boost</span>. 
                      Completion rates are trending up by 15.4% compared to the previous window.
                   </p>

                   <button className="flex items-center gap-2 group-hover:gap-4 text-xs font-black text-[#FF6B0B] transition-all uppercase tracking-widest">
                      Export Intelligence Report
                      <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF6B0B]/20 to-transparent rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF8F12]/10 rounded-full blur-[60px] -ml-16 -mb-16" />
             </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
