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
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { useRef } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: UserPlus, label: 'Referral Logs', href: '/dashboard/referrals' },
  { icon: Trophy, label: 'Reports & Leaderboard', href: '/dashboard/reports' },
  { icon: ShieldCheck, label: 'Security Audit', href: '/dashboard/fraud' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Configuration', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to get breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment: string, index: number) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold transition-all border-2 border-white"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full glass border-r border-foreground/10 z-50 flex flex-col"
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
                className="text-foreground font-bold text-lg tracking-tight whitespace-nowrap"
              >
                Wegagen Referral Hub
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
                    ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-normal text-[14px] whitespace-nowrap"
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

        <div className="p-4 border-t border-foreground/10">
          <div 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-foreground/70 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-normal text-[14px] whitespace-nowrap"
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
        <header className="h-20 glass border-b border-foreground/10 px-8 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <Search className="w-4 h-4 text-foreground/60" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search... (Ctrl+K)" 
                className="bg-transparent border-none outline-none text-[14px] font-normal text-foreground placeholder:text-foreground/50 w-40"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground/70 hover:text-foreground relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-background" />
              </button>
              
              <div className="h-8 w-[1px] bg-foreground/5 mx-2" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[14px] font-bold text-foreground leading-none">{user.fullname}</p>
                  <p className="text-[12px] text-foreground/60 mt-1 uppercase tracking-wider font-normal">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
                  {user.fullname.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div id="main-content" className="p-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[12px] font-normal uppercase tracking-widest text-foreground/40">
            {breadcrumbs.map((crumb: { label: string, href: string }, i: number) => (
              <React.Fragment key={crumb.href}>
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <Link 
                  href={crumb.href}
                  className={`hover:text-blue-500 transition-colors ${i === breadcrumbs.length - 1 ? 'text-foreground/60' : ''}`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
          {children}
        </div>
      </main>
    </div>
  );
}
