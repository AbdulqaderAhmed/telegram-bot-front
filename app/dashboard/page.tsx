'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  Target,
  Rocket
} from 'lucide-react';

const stats = [
  { label: 'Total HRIS Users', value: '7', change: '+12%', icon: Users, color: 'blue' },
  { label: 'Total Referrals', value: '1,248', change: '+18.2%', icon: UserPlus, color: 'purple' },
  { label: 'Conversion Rate', value: '64.2%', change: '+4.3%', icon: Target, color: 'emerald' },
  { label: 'Fraud Shields', value: '42', change: '-2.1%', icon: ShieldCheck, color: 'rose' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Ecosystem Overview</h1>
        <p className="text-slate-500 font-medium">Real-time health synchronization & referral metrics.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass rounded-3xl group cursor-pointer hover:border-white/10 transition-all hover:translate-y-[-4px]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:bg-${stat.color}-500 group-hover:text-white transition-all`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs ring-1 ring-white/10 px-2 py-1 rounded-full uppercase tracking-wider group-hover:ring-white/20 transition-all">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-tight mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black text-white font-mono">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Placeholder */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold font-mono text-white flex items-center gap-3">
              <Activity className="text-blue-500 w-5 h-5 animate-pulse" />
              Referral Velocity
            </h3>
            <div className="flex items-center gap-2 p-1 glass rounded-xl">
              {['W', 'M', 'Y'].map((t) => (
                <button key={t} className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${t === 'M' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{t}</button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full flex items-end justify-between gap-4 px-2">
            {[40, 60, 45, 90, 65, 80, 50, 70, 45, 85, 95, 75].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.05 + 0.5 }}
                className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/80 rounded-t-xl group-hover:to-blue-400 transition-all relative"
              >
                 <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-lg text-[10px] font-bold text-white whitespace-nowrap z-50 pointer-events-none"
                 >
                   {h} conversions
                 </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 flex justify-between text-xs text-slate-600 font-bold uppercase tracking-widest px-2">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex flex-col gap-6">
          <div className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent flex flex-col items-center text-center group transition-all hover:border-blue-500/20">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Rocket className="text-white w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-xl leading-tight">Sync New Batch</h4>
            <p className="text-slate-500 text-sm mt-3 mb-6 font-medium leading-relaxed">HRIS view [View_Telegram_HRIS] has 124 pending updates discovered since last sync.</p>
            <button className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Re-Sync System</button>
          </div>

          <div className="glass rounded-[2rem] p-8 space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center justify-between">
              Live Monitor
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </h4>
            <div className="space-y-4">
              {[
                { user: 'B. Johnson', action: 'Joined via code REF452', time: '2m' },
                { user: 'A. Smith', action: 'Referral verified', time: '5m' },
                { user: 'K. West', action: 'Identity fraud blocked', time: '12m' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{log.user.charAt(0)}</div>
                  <div className="flex-1 truncate">
                    <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-all">{log.user}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{log.action}</p>
                  </div>
                  <span className="text-[9px] text-slate-600 font-black">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
