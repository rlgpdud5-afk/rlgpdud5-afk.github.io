export type CrewRole = 'maker' | 'reviewer' | 'client' | 'admin';

export interface CrewUser {
  id: string;
  name: string;
  role: CrewRole;
  grade?: string;
  trustScore?: number;
  badges?: number;
  completedProjects?: number;
  deadlineRate?: number;
  avgRating?: number;
  skills?: string[];
  region?: string;
  company?: string;
  projects?: number;
  activeProjects?: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  deadline: string;
  security: string;
  budget: string;
  tasks: number;
  completedTasks: number;
  modules: string[];
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  status: string;
  assignee: string;
  difficulty: string;
  deadline: string;
  skills: string[];
  autoCheck: string | null;
  reviewScore: number | null;
}

export interface Credential {
  id: string;
  project: string;
  role: string;
  task: string;
  period: string;
  skills: string[];
  qaPass: boolean;
  rating: number;
  trustDelta: string;
  issuedAt: string;
  verifyId: string;
  isNew?: boolean;
}

export interface TalentCard {
  id: string;
  name: string;
  grade: string;
  trustScore: number;
  projects: number;
  deadlineRate: number;
  rating: number;
  skills: string[];
  region: string;
  available: boolean;
}

export interface CrewDb {
  projects: Project[];
  tasks: Task[];
  credentials: Credential[];
}

export interface ProjectForm {
  name: string;
  deadline: string;
  budget: string;
  security: string;
  description: string;
  client: string;
}
