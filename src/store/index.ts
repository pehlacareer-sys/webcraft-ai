// Global Store - Zustand State Management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User state
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'user' | 'admin';
}

// Project state
export interface Project {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Session state
export interface Session {
  id: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  code: string;
  isGenerating: boolean;
}

// API Key state (admin)
export interface APIKey {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  dailyLimit: number;
  dailyUsed: number;
  lastUsed: string | null;
}

// App State
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Session
  currentSession: Session | null;
  
  // Project
  currentProject: Project | null;
  projects: Project[];
  
  // UI
  sidebarOpen: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  codeView: 'code' | 'preview' | 'split';
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  
  setCurrentSession: (session: Session | null) => void;
  addMessage: (message: { role: string; content: string }) => void;
  updateCode: (code: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  toggleSidebar: () => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setCodeView: (view: 'code' | 'preview' | 'split') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      currentSession: null,
      currentProject: null,
      projects: [],
      sidebarOpen: true,
      previewMode: 'desktop',
      codeView: 'split',
      
      // Auth actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        currentSession: null,
        currentProject: null
      }),
      
      // Session actions
      setCurrentSession: (session) => set({ currentSession: session }),
      addMessage: (message) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        set({
          currentSession: {
            ...currentSession,
            messages: [
              ...currentSession.messages,
              { ...message, timestamp: Date.now() }
            ]
          }
        });
      },
      updateCode: (code) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        set({
          currentSession: { ...currentSession, code }
        });
      },
      setGenerating: (isGenerating) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        set({
          currentSession: { ...currentSession, isGenerating }
        });
      },
      
      // Project actions
      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        currentProject: state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject
      })),
      
      // UI actions
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setCodeView: (codeView) => set({ codeView })
    }),
    {
      name: 'ai-website-builder-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        previewMode: state.previewMode,
        codeView: state.codeView
      })
    }
  )
);

// Admin Store
interface AdminState {
  apiKeys: APIKey[];
  stats: {
    totalUsers: number;
    totalProjects: number;
    activeSessions: number;
    apiCalls: number;
  } | null;
  
  setAPIKeys: (keys: APIKey[]) => void;
  addAPIKey: (key: APIKey) => void;
  updateAPIKey: (id: string, updates: Partial<APIKey>) => void;
  deleteAPIKey: (id: string) => void;
  setStats: (stats: AdminState['stats']) => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  apiKeys: [],
  stats: null,
  
  setAPIKeys: (apiKeys) => set({ apiKeys }),
  addAPIKey: (key) => set((state) => ({
    apiKeys: [...state.apiKeys, key]
  })),
  updateAPIKey: (id, updates) => set((state) => ({
    apiKeys: state.apiKeys.map((k) =>
      k.id === id ? { ...k, ...updates } : k
    )
  })),
  deleteAPIKey: (id) => set((state) => ({
    apiKeys: state.apiKeys.filter((k) => k.id !== id)
  })),
  setStats: (stats) => set({ stats })
}));
