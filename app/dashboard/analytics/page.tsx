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
  CalendarDays,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import api from '@/lib/axios';

interface Overview {
  totalUsers: number;
  totalReferrals: number;
  verifiedReferrals: number;
  noReferralUsers: number;
  leftReferrals: number;
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

interface RoleStat {
  role: string;
  count: number;
}

interface RetentionStat {
  status: string;
  count: number;
}

interface HourlyPoint {
  hour: number;
  count: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingStat[]>([]);
  const [roles, setRoles] = useState<RoleStat[]>([]);
  const [retention, setRetention] = useState<RetentionStat[]>([]);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ovRes, grRes, obRes, rlRes, rtRes, hrRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/growth'),
        api.get('/analytics/onboarding'),
        api.get('/analytics/roles'),
        api.get('/analytics/retention'),
        api.get('/analytics/activity')
      ]);
      setOverview(ovRes.data);
      setGrowth(grRes.data);
      setOnboarding(obRes.data);
      setRoles(rlRes.data);
      setRetention(rtRes.data);
      setHourly(hrRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxValue = Math.max(...growth.map(p => p.count), 5);
  const maxHourlyValue = Math.max(...hourly.map(p => p.count), 5);

  const calculateTrend = () => {
    if (growth.length < 2) return 0;
    const current = growth[growth.length - 1].count;
    const previous = growth[growth.length - 2].count;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const trend = calculateTrend();

  // Graph Helpers for Referral Trajectory
  const chartHeight = 200;
  const chartWidth = 800;
  const getPoints = (data: any[], max: number) => data.map((p, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: chartHeight - (p.count / max) * chartHeight
  }));

  const trajectoryPoints = getPoints(growth, maxValue);
  const hourlyPoints = getPoints(hourly, maxHourlyValue);

  const getPath = (points: any[]) => points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const getArea = (points: any[], path: string) => points.length > 0
    ? `${path} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <div className="min-h-screen bg-white text-[#004360] pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 px-6">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#FF6B0B] text-[10px] font-normal uppercase tracking-[0.2em]">
              <Activity className="w-4 h-4" /> Comprehensive Intelligence
            </div>
            <h1 className="text-[36px] font-bold tracking-tight text-[#004360]">Growth <span className="text-[#FF6B0B]">& Behavior</span></h1>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-3 px-8 py-4 bg-[#004360] text-white rounded-2xl font-bold text-[14px] hover:bg-[#004360]/90 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            REFRESH ANALYTICS
          </button>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
            { label: 'Verified Referrals', value: overview?.verifiedReferrals || 0, icon: Target, color: 'text-emerald-500' },
            { label: 'Joined Without Link', value: overview?.noReferralUsers || 0, icon: UserPlus, color: 'text-[#FF6B0B]' },
            { label: 'Left Channel', value: overview?.leftReferrals || 0, icon: Activity, color: 'text-rose-500' },
          ].map((stat) => (
            <div key={stat.label} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color} mb-6`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[16px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
              <h3 className="text-[36px] font-bold text-[#004360] mt-2">{loading ? '—' : stat.value}</h3>
            </div>
          ))}
        </div>

        {/* MAIN CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Trajectory */}
          <InteractiveLineChart
            title="Referral Trajectory"
            subtitle="New referrals per day — last 7 days"
            color="#004360"
            data={growth.map(p => ({
              label: `${new Date(p.date).getDate()}/${new Date(p.date).getMonth() + 1}`,
              value: p.count,
              tooltip: `${new Date(p.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${p.count} referral${p.count !== 1 ? 's' : ''}`,
            }))}
            badge={
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {trend >= 0 ? '+' : ''}{trend}% vs yesterday
              </div>
            }
            loading={loading}
          />

          {/* Hourly Engagement */}
          <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-[16px] font-bold text-[#004360]">Hourly Engagement</h4>
                <p className="text-[12px] font-normal text-slate-400 uppercase tracking-widest mt-1">Join Activity Pulse</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="relative h-[200px] w-full">
              <ChartSVG points={hourlyPoints} path={getPath(hourlyPoints)} area={getArea(hourlyPoints, getPath(hourlyPoints))} color="#FF6B0B" />
            </div>
            <div className="flex justify-between mt-6 px-2">
              {[0, 6, 12, 18, 23].map(h => (
                <p key={h} className="text-[10px] font-normal text-slate-400">{h}:00</p>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SEGMENTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Onboarding Distribution */}
          <div className="hidden p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm">
            <h4 className="text-[16px] font-bold text-[#004360] mb-8 flex items-center gap-3">
              <Target className="w-5 h-5 text-emerald-500" /> Onboarding
            </h4>
            <div className="space-y-6">
              {onboarding.map((stat) => {
                const total = onboarding.reduce((a, b) => a + b.count, 0) || 1;
                const pct = Math.round((stat.count / total) * 100);
                return (
                  <ProgressBar key={stat.status} label={stat.status} count={stat.count} pct={pct} color={stat.status === 'COMPLETED' ? 'bg-[#004360]' : 'bg-[#FF6B0B]'} />
                );
              })}
            </div>
          </div>

          {/* Role Segmentation */}
          <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm">
            <h4 className="text-[16px] font-bold text-[#004360] mb-8 flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" /> Role Distribution
            </h4>
            <div className="space-y-6">
              {roles.map((stat) => {
                const total = roles.reduce((a, b) => a + b.count, 0) || 1;
                const pct = Math.round((stat.count / total) * 100);
                return (
                  <ProgressBar key={stat.role} label={stat.role} count={stat.count} pct={pct} color={stat.role === 'OTHER' ? 'bg-[#004360]' : 'bg-blue-400'} />
                );
              })}
            </div>
          </div>

          {/* Referral Status (Retention) */}
          <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm">
            <h4 className="text-[16px] font-bold text-[#004360] mb-8 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FF8F12]" /> Status Health
            </h4>
            <div className="space-y-6">
              {retention.map((stat) => {
                const total = retention.reduce((a, b) => a + b.count, 0) || 1;
                const pct = Math.round((stat.count / total) * 100);
                const colorMap: any = {
                  verified: 'bg-emerald-500',
                  pending: 'bg-[#FF6B0B]',
                  left: 'bg-slate-300'
                };
                return (
                  <ProgressBar key={stat.status} label={stat.status} count={stat.count} pct={pct} color={colorMap[stat.status] || 'bg-slate-400'} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveLineChart({ title, subtitle, color, data, badge, loading }: {
  title: string;
  subtitle: string;
  color: string;
  data: { label: string; value: number; tooltip: string }[];
  badge?: React.ReactNode;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 800, H = 200, PAD = 10;
  const max = Math.max(...data.map(d => d.value), 1);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const pts = data.map((d, i) => ({
    x: data.length < 2 ? W / 2 : PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - (d.value / max) * (H - PAD * 2),
  }));

  const path = pts.length > 1
    ? pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }, '')
    : '';
  const area = path ? `${path} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z` : '';

  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-[16px] font-bold text-[#004360]">{title}</h4>
          <p className="text-[12px] text-slate-400 mt-1">{subtitle}</p>
        </div>
        {badge}
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#004360] rounded-full animate-spin" />
        </div>
      ) : data.length === 0 || data.every(d => d.value === 0) ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-slate-300 gap-2">
          <TrendingUp className="w-10 h-10" />
          <p className="text-[13px]">No data yet</p>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px] overflow-visible">
            <defs>
              <linearGradient id={`lg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {gridLines.map((g, i) => {
              const y = PAD + (1 - g) * (H - PAD * 2);
              return (
                <g key={i}>
                  <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={0} y={y + 4} fontSize="18" fill="#cbd5e1" textAnchor="start">
                    {Math.round(g * max)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={area} fill={`url(#lg-${color.replace('#', '')})`} />

            {/* Line */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover vertical line */}
            {hovered !== null && pts[hovered] && (
              <line
                x1={pts[hovered].x} y1={PAD}
                x2={pts[hovered].x} y2={H - PAD}
                stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
              />
            )}

            {/* Data points */}
            {pts.map((p, i) => (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                <circle
                  cx={p.x} cy={p.y}
                  r={hovered === i ? 6 : 4}
                  fill="white"
                  stroke={color}
                  strokeWidth={hovered === i ? 3 : 2}
                  style={{ transition: 'r 0.15s' }}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hovered !== null && data[hovered] && (
            <div
              className="absolute -top-2 pointer-events-none z-10 bg-[#004360] text-white text-[12px] font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap"
              style={{
                left: `${(pts[hovered].x / W) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {data[hovered].tooltip}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#004360]" />
            </div>
          )}

          {/* X axis labels */}
          <div className="flex justify-between mt-3 px-1">
            {data.map((d, i) => (
              <span
                key={i}
                className={`text-[10px] transition-colors ${hovered === i ? 'text-[#004360] font-bold' : 'text-slate-400'}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartSVG({ points, path, area, color }: any) {
  return (
    <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {points.map((p: any, i: number) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

function ProgressBar({ label, count, pct, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline text-[11px] font-bold uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-[#004360]">{count} <span className="text-slate-300 ml-1">({pct}%)</span></span>
      </div>
      <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
