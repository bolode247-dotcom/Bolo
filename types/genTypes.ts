import { Ionicons } from '@expo/vector-icons';

export interface Job {
  id: string;
  $createdAt?: string;
  $updatedAt?: string;

  title?: string;
  description?: string;
  type?: string;
  skill?: string;
  location?: Location | null;
  recruiters?: string;

  // --- Job details ---
  salary?: number | string;
  salaryType?: string;
  salaryPeriod?: string;
  maxApplicants?: number | string | null;
  status?: string;

  [key: string]: any;
}
export interface Location {
  // --- System fields ---
  id?: string;
  region: string;
  division?: string;
  subdivision?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export type JobSkill = {
  $id?: string;
  name: string;
  icon?: any;
};

export type JobWithDetails = Omit<Job, 'skills' | 'locations'> & {
  $id?: string; // ensure always defined
  skills?: JobSkill | null; // expanded skill object
  location?: Location | null; // expanded location object
  startDate?: string;
};

export type Skill = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
};

export interface Worker {
  id: string;
  name: string;
  avatar?: string | null;
  skill: Skill | null;
  location: Location | null;
  payRate: string;
  rating: number;
  bio?: string;
}

export type User = {
  $id: string;
  name: string;
  avatar?: string | null;
  skills: Skill[];
  locations?: Location | null;
};

export type ListItem =
  | { id: string; job: Job } // for jobs
  | {
      id: string;
      users: User;
      payRate: string;
      rating: number;
      location: string;
    }; // for recommended workers

export interface Offer {
  id: string;
  job: Job;
}
export interface JobsWithSource {
  id: string;
  source?: string;
  job: Job;
}

export interface RecruiterFeedData {
  mustHaveSkills: Skill[];
  recommendedWorkers: Worker[];
}

export interface WorkerFeedData {
  offers: Offer[];
  recommended: JobsWithSource[];
  jobsByPlan: JobsWithSource[];
}

export type HomeFeedData = RecruiterFeedData | WorkerFeedData;

export interface Chat {
  $id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadByRecruiter?: number;
  unreadBySeeker?: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface Message {
  $id: string;
  chats: string; // chat ID reference
  message: string;
  senderId: string;
  $createdAt: string;
}

export interface ChatDetails {
  chat: Chat;
  participants: string[];
  messages: Message[];
}
