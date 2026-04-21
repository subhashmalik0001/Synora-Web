import { create } from "zustand";

interface AuthState {
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl?: string;
    } | null;
    isLoading: boolean;
    setUser: (user: AuthState["user"]) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    clearUser: () => set({ user: null, isLoading: false }),
}));

interface DashboardState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
