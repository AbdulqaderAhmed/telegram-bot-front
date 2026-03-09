'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Users, label: 'HRIS Accounts', href: '/dashboard/hris-users' },
  { icon: UserPlus, label: 'Referral Logs', href: '/dashboard/referrals' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full glass border-r border-white/5 z-50 flex flex-col"
      >
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-white font-bold text-lg tracking-tight whitespace-nowrap"
              >
                Guardian Panel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group
                    ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 w-40"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
              </button>
              
              <div className="h-8 w-[1px] bg-white/5 mx-2" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-none">{user.fullname}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
                  {user.fullname.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
