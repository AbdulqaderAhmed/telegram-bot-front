import { create } from 'zustand';
import api from '@/lib/axios';

// --- Types ---
export interface UserStats {
  totalHris: number;
  activeNodes: number;
  syncTime: string;
}

export interface ReferralStats {
  total: number;
  verified: number;
  pending: number;
  left: number;
  conversionRate: number;
}

export interface ActivityLog {
  id: number;
  status: 'pending' | 'verified' | 'left';
  joinTime: string;
  referrer?: { id: number; username?: string; telegramId?: string };
  referredUser?: { id: number; username?: string; telegramId?: string };
}

interface DashboardState {
  // Data
  userStats: UserStats | null;
  referralStats: ReferralStats | null;
  activity: ActivityLog[];
  
  // UI
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  
  // Actions
  fetchAll: () => Promise<void>;
  startPolling: (intervalMs?: number) => () => void;
}

// Closure-based interval tracking to prevent multiple background loops
let activeInterval: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  userStats: null,
  referralStats: null,
  activity: [],
  isLoading: false,
  lastUpdated: null,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [userRes, referralRes, activityRes] = await Promise.all([
        api.get<UserStats>('/users/stats'),
        api.get<ReferralStats>('/referrals/stats'),
        api.get<ActivityLog[]>('/referrals/activity?limit=10'),
      ]);
      set({
        userStats: userRes.data,
        referralStats: referralRes.data,
        activity: activityRes.data,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || 'Failed to fetch dashboard data',
      });
    }
  },

  startPolling: (intervalMs = 30_000) => {
    // Clear any existing interval to prevent duplicates
    if (activeInterval) clearInterval(activeInterval);
    
    // Initial fetch
    get().fetchAll();
    
    // Setup new polling interval
    activeInterval = setInterval(() => get().fetchAll(), intervalMs);
    
    return () => {
      if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
      }
    };
  },
}));
