import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Researcher {
  id: string;
  empNo: string;
  name: string;
  joinDate: string; // YYYY-MM-DD
  leaveDate: string | null; // YYYY-MM-DD
  rankHistory: Record<string, string>; // { "2023": "선임연구원", "2024": "책임연구원" }
  education: string;
  major: string;
  researchFields: string[]; // max 2
  role: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  budgetByYear: Record<string, number>; // { "2023": 50000000, "2024": 60000000 }
}

export interface Participation {
  id: string;
  researcherId: string;
  projectId: string;
  yearMonth: string; // YYYY-MM
  rate: number; // 0-100
}

interface AppState {
  researchers: Researcher[];
  projects: Project[];
  participations: Participation[];
  currentSnapshot: string; // YYYY-MM
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  geminiApiKey: string;
  
  // Actions
  addResearcher: (researcher: Researcher) => void;
  updateResearcher: (id: string, data: Partial<Researcher>) => void;
  deleteResearcher: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addParticipation: (participation: Participation) => void;
  addParticipations: (participations: Participation[]) => void;
  updateParticipation: (id: string, data: Partial<Participation>) => void;
  deleteParticipation: (id: string) => void;
  
  setCurrentSnapshot: (snapshot: string) => void;
  setGeminiApiKey: (key: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      researchers: [],
      projects: [],
      participations: [],
      categories: ['AI 카피라이팅', '데이터 드리븐 퍼포먼스 마케팅', 'AD Tech', '마케팅 오토메이션'],
      currentSnapshot: new Date().toISOString().slice(0, 7),
      geminiApiKey: '',

      addCategory: (category) => set((state) => ({ 
        categories: state.categories.includes(category) ? state.categories : [...state.categories, category] 
      })),
      deleteCategory: (category) => set((state) => ({ 
        categories: state.categories.filter(c => c !== category) 
      })),

      addResearcher: (researcher) => set((state) => ({ researchers: [...state.researchers, researcher] })),
      updateResearcher: (id, data) => set((state) => ({
        researchers: state.researchers.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteResearcher: (id) => set((state) => ({
        researchers: state.researchers.filter(r => r.id !== id),
        participations: state.participations.filter(p => p.researcherId !== id)
      })),

      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        participations: state.participations.filter(p => p.projectId !== id)
      })),

      addParticipation: (participation) => set((state) => ({ participations: [...state.participations, participation] })),
      addParticipations: (newParts) => set((state) => {
        const keys = new Set(newParts.map(np => `${np.researcherId}_${np.projectId}_${np.yearMonth}`));
        const filteredExisting = state.participations.filter(p => !keys.has(`${p.researcherId}_${p.projectId}_${p.yearMonth}`));
        return { participations: [...filteredExisting, ...newParts] };
      }),
      updateParticipation: (id, data) => set((state) => ({
        participations: state.participations.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteParticipation: (id) => set((state) => ({
        participations: state.participations.filter(p => p.id !== id)
      })),

      setCurrentSnapshot: (snapshot) => set({ currentSnapshot: snapshot }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: 'koita-compliance-storage',
    }
  )
);
