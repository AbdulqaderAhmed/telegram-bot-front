'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Activity
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
      setLoading(false);
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-foreground/5">
        <div className="grid gap-2">
           <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.25em]">
              <div className="w-10 h-[2px] bg-primary" />
              Real-time Intelligence
           </div>
           <h1 className="text-5xl font-black text-foreground tracking-tight italic">Analytics Studio</h1>
           <p className="text-foreground/60 font-medium text-lg">Measure, analyze, and optimize your referral engine performance.</p>
        </div>
        
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </header>

      {/* High-Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Base', value: overview?.totalUsers, icon: Users, color: 'primary' },
          { label: 'Referrals', value: overview?.totalReferrals, icon: UserPlus, color: 'secondary' },
          { label: 'Conversions', value: overview?.completedOnboarding, icon: Target, color: 'accent' },
          { label: 'Health Rate', value: `${overview?.completionRate}%`, icon: Zap, color: 'emerald-500' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden p-8 glass rounded-[2.5rem] border border-foreground/5 hover:border-primary/20 transition-all pointer-events-none"
          >
            <div className="relative z-10 flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{stat.label}</p>
              <h3 className="text-4xl font-black text-foreground mt-1 tabular-nums tracking-tighter">
                {loading ? '...' : stat.value}
              </h3>
            </div>
            <stat.icon className="absolute top-1/2 -right-4 -translate-y-1/2 w-24 h-24 text-foreground/[0.03] group-hover:text-primary/[0.05] transition-colors" />
            <div className={`absolute bottom-0 right-0 w-24 h-24 bg-${stat.color} opacity-[0.03] rounded-tl-[100px] pointer-events-none`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart - Custom SVG implementation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-10 glass rounded-[3rem] border border-foreground/5 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-foreground tracking-tight">Referral Trajectory</h4>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Last 7 Effective Days</p>
               </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'} rounded-full text-xs font-black transition-colors duration-500`}>
               {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
               {loading ? '0%' : `${trend >= 0 ? '+' : ''}${trend}%`}
            </div>
          </div>

          <div className="relative h-[300px] w-full mt-10 flex items-end justify-between gap-4">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin text-primary/20" />
              </div>
            ) : growth.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-foreground/20 font-bold uppercase tracking-widest italic">
                  Not enough data yet
                </div>
            ) : (
              growth.map((point, index) => (
                <div key={point.date} className="flex-1 group flex flex-col items-center gap-4">
                  <div className="relative w-full flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(point.count / maxValue) * 100}%` }}
                      transition={{ type: 'spring', bounce: 0.4, delay: index * 0.1 }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-primary to-primary/60 rounded-t-2xl shadow-xl shadow-primary/20 group-hover:brightness-110 transition-all relative overflow-hidden"
                    >
                       <div className="absolute top-0 left-0 w-full h-8 bg-white/20 blur-md translate-y-[-50%]" />
                       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
                    </motion.div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       {point.count} NEW
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-wider rotate-[-45deg] whitespace-nowrap">
                    {new Date(point.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))
            )}
            
            {/* Grid Lines */}
            <div className="absolute inset-0 border-b border-foreground/5 pointer-events-none" />
            <div className="absolute inset-0 top-1/2 border-b border-foreground/5 pointer-events-none opacity-50" />
            <div className="absolute inset-0 top-1/4 border-b border-foreground/5 pointer-events-none opacity-25" />
          </div>
        </motion.div>

        {/* Onboarding Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-10 glass rounded-[3rem] border border-foreground/5 space-y-10"
        >
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <BarChartIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground tracking-tight">Onboarding Health</h4>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Global Status Delta</p>
              </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
               [...Array(3)].map((_, i) => (
                 <div key={i} className="h-20 bg-foreground/5 rounded-3xl animate-pulse" />
               ))
            ) : onboarding.length === 0 ? (
               <p className="text-center text-foreground/20 italic font-bold">Waiting for users...</p>
            ) : (
              onboarding.map((stat, i) => {
                const total = onboarding.reduce((acc, curr) => acc + curr.count, 0);
                const perc = (stat.count / total) * 100;
                
                return (
                  <div key={stat.status} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">{stat.status}</span>
                      <span className="text-sm font-black text-foreground tabular-nums">{Math.round(perc)}%</span>
                    </div>
                    <div className="h-4 bg-foreground/5 rounded-full overflow-hidden p-[2px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${perc}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full rounded-full bg-${i === 0 ? 'secondary' : i === 1 ? 'primary' : 'foreground/20'}`}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{stat.count} ACTIVE USERS</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-6 border-t border-foreground/5">
            <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-primary/10">
               <div className="flex items-start gap-4">
                  <Activity className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h5 className="text-sm font-black text-foreground italic underline decoration-primary decoration-2 underline-offset-4">Performance Insight</h5>
                    <p className="text-xs font-medium text-foreground/60 leading-relaxed mt-2">
                      Growth is currently trending upwards. Users are completing onboarding 15% faster compared to last cycle.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
