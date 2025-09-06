import { create } from 'zustand';
import { createUser, getUserByEmail, getUserById, User } from '../services/userService';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Add flag to track if init has been completed
  init: () => Promise<void>;
  onboard: (data: { email: string; username: string; password: string; bio?: string; role: string }) => Promise<void>;
  logoutLocal: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  init: async () => {
    console.log('[user store] init - starting initialization, initialized:', get().initialized);
    
    // If already initialized, don't run again
    if (get().initialized) {
      console.log('[user store] init - already initialized, skipping');
      return;
    }
    
    const storedId = localStorage.getItem('userId');
    console.log('[user store] init - storedId from localStorage:', storedId);
    
    // If no stored ID, mark as initialized and return
    if (!storedId) {
      console.log('[user store] init - no storedId found, marking as initialized and returning');
      set({ initialized: true });
      return;
    }
    
    // If user is already loaded, don't fetch again
    const currentUser = get().user;
    console.log('[user store] init - current user in store:', currentUser);
    
    if (currentUser && currentUser.id === storedId) {
      console.log('[user store] init - user already loaded with matching ID, marking as initialized');
      set({ initialized: true });
      return;
    }
    
    console.log('[user store] init - fetching user from API...');
    set({ loading: true, error: null });
    try {
      const user = await getUserById(storedId);
      console.log('[user store] init - API response received:', user);
      if (user) {
        console.log('[user store] init - setting user in store');
        set({ user, initialized: true });
      } else {
        console.log('[user store] init - no user found in API response, marking as initialized');
        set({ initialized: true });
      }
    } catch (e: any) {
      console.error('[user store] init - error occurred:', e);
      set({ error: e?.message || 'Failed to load user', initialized: true });
    } finally {
      console.log('[user store] init - setting loading to false');
      set({ loading: false });
    }
  },
  onboard: async (data) => {
    console.log('[user store] onboard - starting onboarding with data:', { email: data.email, username: data.username, role: data.role });
    set({ loading: true, error: null });
    try {
      const existing = await getUserByEmail(data.email);
      if (existing) {
        console.log('[user store] onboard - existing user found:', existing.id);
        localStorage.setItem('userId', existing.id);
        set({ user: existing, initialized: true });
        return;
      }
      const created = await createUser(data);
      console.log('[user store] onboard - new user created:', created.id);
      localStorage.setItem('userId', created.id);
      set({ user: created, initialized: true });
    } catch (e: any) {
      console.error('[user store] onboard - error occurred:', e);
      set({ error: e?.message || 'Failed to create user' });
    } finally {
      set({ loading: false });
    }
  },
  logoutLocal: () => {
    console.log('[user store] logoutLocal - clearing user data');
    localStorage.removeItem('userId');
    set({ user: null, initialized: false });
  }
})); 