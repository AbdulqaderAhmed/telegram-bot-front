"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Target,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Rocket,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Timer,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useDashboardStore, ActivityLog } from "@/store/dashboard.store";

// ── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ActivityLog["status"] }) {
  const map = {
    verified: {
      icon: CheckCircle2,
      cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    pending: {
      icon: Timer,
      cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    left: {
      icon: XCircle,
      cls: "bg-foreground/10 text-foreground/50 border-foreground/10",
    },
  };
  const { icon: Icon, cls } = map[status];
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border w-fit ${cls}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="p-6 glass rounded-3xl animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-foreground/10" />
        <div className="w-16 h-6 rounded-full bg-foreground/10" />
      </div>
      <div className="w-24 h-3 rounded bg-foreground/10" />
      <div className="w-16 h-8 rounded bg-foreground/10" />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const {
    userStats,
    referralStats,
    activity,
    isLoading,
    lastUpdated,
    error,
    fetchAll,
    startPolling,
  } = useDashboardStore();

  useEffect(() => {
    const stop = startPolling(30_000); // real-time polling every 30s
    return stop;
  }, [startPolling]);

  const stats = [
    {
      label: "Total HRIS Users",
      value: userStats ? userStats.totalHris.toLocaleString() : "—",
      change: userStats ? `${userStats.activeNodes} active` : "…",
      icon: Users,
      color: "blue",
    },
    {
      label: "Total Referrals",
      value: referralStats ? referralStats.total.toLocaleString() : "—",
      change: referralStats ? `+${referralStats.verified} verified` : "…",
      icon: UserPlus,
      color: "blue",
    },
    {
      label: "Conversion Rate",
      value: referralStats ? `${referralStats.conversionRate}%` : "—",
      change: referralStats
        ? `${referralStats.verified}/${referralStats.total}`
        : "…",
      icon: Target,
      color: "amber",
    },
    {
      label: "Pending Referrals",
      value: referralStats ? referralStats.pending.toLocaleString() : "—",
      change: referralStats ? `${referralStats.left} left` : "…",
      icon: ShieldCheck,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Ecosystem Overview
          </h1>
          <p className="text-foreground/60 font-medium">
            Real-time health synchronization & referral metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-xs font-mono text-foreground/40">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-3 glass rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all text-sm font-bold disabled:opacity-50 group"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-bold"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error} — showing last known data.
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading && !userStats
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-6 glass rounded-3xl group cursor-pointer hover:border-foreground/20 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:bg-${stat.color}-500 group-hover:text-white transition-all`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/60 font-bold text-xs ring-1 ring-foreground/10 px-2 py-1 rounded-full uppercase tracking-wider">
                    {stat.change}
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-foreground/60 text-sm font-bold uppercase tracking-tight mb-2">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black text-foreground font-mono">
                  {stat.value}
                </h3>
              </motion.div>
            ))}
      </div>

      {/* Quick Actions Support */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="w-10 h-px bg-foreground/10" />
          Mission Control Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Audit Fraud logs",
              desc: "Review flagged suspicious referral patterns",
              icon: ShieldCheck,
              color: "rose",
            },
            {
              label: "Generate Reports",
              desc: "Export weekly growth & conversion datasets",
              icon: Rocket,
              color: "blue",
            },
            {
              label: "Manage Segments",
              desc: "Update workforce grouping categories",
              icon: Users,
              color: "amber",
            },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="p-5 glass rounded-4xl flex items-center gap-5 group cursor-pointer hover:bg-foreground/5 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-${action.color}-500/10 flex items-center justify-center text-${action.color}-500 group-hover:scale-110 group-hover:bg-${action.color}-500 group-hover:text-white transition-all shadow-lg shadow-transparent group-hover:shadow-${action.color}-500/20`}
              >
                <action.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-foreground font-bold text-sm tracking-tight">
                  {action.label}
                </p>
                <p className="text-foreground/40 text-[10px] font-medium leading-tight mt-1">
                  {action.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Status Breakdown */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-foreground/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold font-mono text-foreground flex items-center gap-3">
              <Activity className="text-blue-500 w-5 h-5 animate-pulse" />
              Referral Status Breakdown
            </h3>
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-foreground/40 animate-spin" />
            )}
          </div>

          {referralStats && referralStats.total > 0 ? (
            <div className="space-y-6">
              {[
                {
                  label: "Verified",
                  value: referralStats.verified,
                  total: referralStats.total,
                  color: "bg-blue-500",
                },
                {
                  label: "Pending",
                  value: referralStats.pending,
                  total: referralStats.total,
                  color: "bg-amber-500",
                },
                {
                  label: "Left",
                  value: referralStats.left,
                  total: referralStats.total,
                  color: "bg-foreground/20",
                },
              ].map((row) => {
                const pct = Math.round((row.value / row.total) * 100);
                return (
                  <div key={row.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-foreground/70">{row.label}</span>
                      <span className="text-foreground font-mono">
                        {row.value.toLocaleString()}{" "}
                        <span className="text-foreground/40">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full ${row.color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-foreground/10">
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground font-mono">
                    {referralStats.conversionRate}%
                  </p>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1">
                    Conversion
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground font-mono">
                    {referralStats.total}
                  </p>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1">
                    Total
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground font-mono">
                    {referralStats.pending}
                  </p>
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-62.5 flex items-center justify-center text-foreground/30 font-bold">
              {isLoading ? "Loading data..." : "No referral data yet"}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="glass rounded-4xl p-8 border border-foreground/10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="text-foreground font-bold text-sm uppercase tracking-widest">
              Live Activity
            </h4>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          </div>

          <div className="space-y-3 flex-1 overflow-hidden">
            {isLoading && !activity.length ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-foreground/5 animate-pulse"
                />
              ))
            ) : activity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-foreground/30 text-sm font-bold">
                No activity yet
              </div>
            ) : (
              activity.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-foreground/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    {(log.referrer?.username || log.referrer?.telegramId || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">
                      @
                      {log.referrer?.username ||
                        log.referrer?.telegramId ||
                        "—"}{" "}
                      <ArrowRight className="inline w-3 h-3" /> @
                      {log.referredUser?.username ||
                        log.referredUser?.telegramId ||
                        "—"}
                    </p>
                    <StatusBadge status={log.status} />
                  </div>
                  <span className="text-[9px] text-foreground/40 font-black shrink-0">
                    {new Date(log.joinTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </motion.div>
              ))
            )}
          </div>

          {/* HRIS Sync Action */}
          <div className="pt-6 border-t border-foreground/10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform shrink-0">
                <Rocket className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-bold text-sm">
                  Sync HRIS Data
                </p>
                <p className="text-foreground/50 text-[10px] font-medium">
                  {userStats
                    ? `${userStats.totalHris} users synced`
                    : "Checking…"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
