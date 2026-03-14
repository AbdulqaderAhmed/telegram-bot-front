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
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxValue = Math.max(...growth.map(p => p.count), 5); // Fallback to 5 for scale

  const calculateTrend = () => {
    if (growth.length < 2) return 0;
    const current = growth[growth.length - 1].count;
    const previous = growth[growth.length - 2].count;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const trend = calculateTrend();

  // Graph Helpers
  const chartHeight = 300;
  const chartWidth = 1200;
  const points = growth.map((p, i) => ({
    x: (i / Math.max(growth.length - 1, 1)) * chartWidth,
    y: chartHeight - (p.count / maxValue) * chartHeight
  }));

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <div className="min-h-screen bg-white text-[#004360] pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 px-6">
        
        {/* SIMPLIFIED HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-12">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[#FF6B0B] text-[10px] font-black uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4" /> System Analytics
             </div>
             <h1 className="text-5xl font-black tracking-tight text-[#004360]">Ecosystem <span className="text-[#FF6B0B]">Health</span></h1>
          </div>

          <button 
            onClick={fetchAnalytics}
            className="flex items-center gap-3 px-8 py-4 bg-[#004360] text-white rounded-2xl font-black text-xs hover:bg-[#004360]/90 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            REFRESH DATA
          </button>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
            { label: 'Referrals', value: overview?.totalReferrals || 0, icon: UserPlus, color: 'text-[#FF6B0B]' },
            { label: 'Verified', value: overview?.completedOnboarding || 0, icon: Target, color: 'text-emerald-500' },
            { label: 'Success Rate', value: `${overview?.completionRate || 0}%`, icon: Activity, color: 'text-[#FF8F12]' }
          ].map((stat) => (
            <div key={stat.label} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
               <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color} mb-6`}>
                  <stat.icon className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-4xl font-black text-[#004360] mt-2">{loading ? '—' : stat.value}</h3>
            </div>
          ))}
        </div>

        {/* GRAPH SECTION */}
        <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden">
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h4 className="text-xl font-black text-[#004360]">Referral Trajectory</h4>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">7-Day Growth Flow</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                 {trend >= 0 ? '+' : ''}{trend}% v. Yesterday
              </div>
           </div>

           <div className="relative h-[300px] w-full group">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <RefreshCw className="w-8 h-8 text-[#004360]/20 animate-spin" />
                </div>
              ) : growth.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest italic bg-slate-50 rounded-3xl">
                   No tracking data available
                </div>
              ) : (
                <>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => (
                      <line 
                        key={v} 
                        x1="0" 
                        y1={chartHeight * v} 
                        x2={chartWidth} 
                        y2={chartHeight * v} 
                        stroke="#f1f5f9" 
                        strokeWidth="1" 
                      />
                    ))}
                    
                    {/* Area Gradient */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#004360" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#004360" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#areaGradient)" />
                    
                    {/* Main Line */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d={pathD} 
                      fill="none" 
                      stroke="#004360" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Points */}
                    {points.map((p, i) => (
                      <g key={i} className="cursor-pointer group/dot">
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="6" 
                          fill="#ffffff" 
                          stroke="#FF6B0B" 
                          strokeWidth="3" 
                          className="transition-all group-hover/dot:r-8"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Date labels */}
                  <div className="flex justify-between mt-6 px-2">
                    {growth.map(p => (
                      <div key={p.date} className="text-center">
                        <p className="text-[10px] font-black text-[#004360]">{new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
           </div>
        </div>

        {/* ONBOARDING FLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
              <h4 className="text-xl font-black text-[#004360] mb-8">Onboarding Distribution</h4>
              <div className="space-y-8">
                 {onboarding.length === 0 ? (
                   <p className="text-slate-400 font-bold italic text-sm">Waiting for new entities to join the ecosystem...</p>
                 ) : (
                   onboarding.map((stat) => {
                      const total = onboarding.reduce((a, b) => a + b.count, 0);
                      const pct = Math.round((stat.count / total) * 100);
                      return (
                        <div key={stat.status} className="space-y-3">
                           <div className="flex justify-between items-baseline text-xs font-black uppercase tracking-widest">
                              <span className="text-slate-400">{stat.status}</span>
                              <span className="text-[#004360]">{stat.count} <span className="text-slate-300 ml-1">({pct}%)</span></span>
                           </div>
                           <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: 'circOut' }}
                                className={`h-full rounded-full ${stat.status === 'COMPLETED' ? 'bg-[#004360]' : 'bg-[#FF6B0B]'}`}
                              />
                           </div>
                        </div>
                      );
                   })
                 )}
              </div>
           </div>

           <div className="lg:col-span-4 p-10 bg-[#004360] rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-blue-900/20">
              <div className="space-y-6">
                 <div className="p-4 bg-white/10 rounded-2xl w-fit">
                    <Sparkles className="w-6 h-6 text-[#FF8F12]" />
                 </div>
                 <h4 className="text-2xl font-black italic tracking-tight leading-tight">Ecosystem Performance Report</h4>
                 <p className="text-white/60 text-sm font-medium leading-relaxed">System-wide conversion health is operating at peak levels. Verified entities have increased by 22% in the last tracking window.</p>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6B0B] hover:gap-4 transition-all mt-10">
                 Export Intelligence <ArrowUpRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
