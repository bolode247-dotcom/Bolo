export interface Job {
  // --- System fields ---
  $id?: string; // Optional for new jobs, required when fetched
  $createdAt?: string;
  $updatedAt?: string;

  // --- Core fields ---
  title: string; // Job title
  description: string; // Job description
  type: string; // Job type ID (many-to-one)
  skills: string; // Skill ID (many-to-one)
  locations: string; // Location ID (many-to-one)
  recruiters?: string; // Recruiter ID (many-to-one, optional on creation)

  // --- Job details ---
  salary?: number | string; // Can be string (form) or number (DB)
  salaryType?: string; // e.g., "Monthly", "Hourly"
  salaryPeriod?: string; // e.g., "per month", "per hour"
  maxApplicants?: number | string | null;
  status?: string; // e.g., "Open", "Closed"

  [key: string]: any;
}

export type JobSkill = {
  $id?: string;
  name: string;
  icon?: any;
};

export type JobLocation = {
  region?: string;
  division?: string;
  subdivision?: string;
};

export type JobWithDetails = Omit<Job, 'skills' | 'locations'> & {
  $id?: string; // ensure always defined
  skills?: JobSkill | null; // expanded skill object
  location?: JobLocation | null; // expanded location object
  startDate?: string;
};

export interface Offer {
  offerId: string;
  job: Job;
}
export type Skill = {
  id: string;
  name: string;
  icon: any;
  count: number;
};
export interface RecruiterFeedData {
  topSkills: Skill[];
  topWorkers: Skill[];
}

export interface WorkerFeedData {
  offers: Offer[];
  recommended: Offer[];
  recent: Offer[];
}
export type HomeFeedData = WorkerFeedData | RecruiterFeedData;
