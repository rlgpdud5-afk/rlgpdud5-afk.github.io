export type StorageMode = 'local' | 'cloud';

export interface Worker {
  id: string;
  name: string;
  tags: string[];
  regions: string[];
  duration: string;
  rating: number;
  completed: number;
  bio: string;
  userId?: string | null;
}

export interface Gig {
  id: string;
  employer: string;
  title: string;
  tags: string[];
  region: string;
  duration: string;
  pay: string;
  status: string;
  employerRating: number;
  jdText: string;
  postedBy?: string | null;
}

export interface Application {
  id: string;
  gigId: string;
  workerId: string;
  status: string;
  matchScore: number;
  tailoredSummary: string | null;
  workerReview: { rating: number; text: string } | null;
  employerReview: { rating: number; text: string } | null;
}

export interface MatchDb {
  workers: Worker[];
  gigs: Gig[];
  applications: Application[];
}

export interface GigForm {
  title: string;
  employer: string;
  tags: string[];
  region: string;
  duration: string;
  pay: string;
  jdText: string;
}
