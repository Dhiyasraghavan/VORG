export enum AppView {
  HOME = "HOME",
  ORG_LOGIN = "ORG_LOGIN",
  VOL_LOGIN = "VOL_LOGIN",
  ORG_DASHBOARD = "ORG_DASHBOARD",
  HOST_EVENT = "HOST_EVENT",
  RECRUITMENT_SUMMARY = "RECRUITMENT_SUMMARY",
  EMERGENCY_CRISIS = "EMERGENCY_CRISIS",
  FUND_RAISE = "FUND_RAISE",
  VOL_SIGNUP = "VOL_SIGNUP",
  VOL_LANG_SELECT = "VOL_LANG_SELECT",
  VOL_QUIZ = "VOL_QUIZ",
  VOL_EXP_VERIFY = "VOL_EXP_VERIFY",
  VOL_DASHBOARD = "VOL_DASHBOARD",
  VOL_PROFILE = "VOL_PROFILE",
}

export type Language = "english" | "hindi" | "tamil";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type Rank = "Initiate" | "Activist" | "Impact Leader";

export interface AppliedEvent {
  eventId: string;
  role: string;
  passcode: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  profileImages: string[];
  preferredLanguage?: Language;
  quizCompleted?: boolean;
  rank: Rank;
  badges: Badge[];
  completedEvents: string[];
  joinedDate: string;
  appliedEvents: AppliedEvent[];
}

export interface QuizResult {
  score: number;
}

export interface ExperienceData {
  essay: string;
  links: string[];
  experienceImages: string[];
  score: number;
}

export interface EventRole {
  name: string;
  description: string;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  prerequisites: string[];
  checklist: string[];
  suitableScore: number;
  roles: EventRole[];
}

export interface Organization {
  name: string;
  number: string;
  email: string;
  address: string;
}

export interface EventDetails {
  eventName: string;
  eventPlace: string;
  eventTime: string;
  attendeesCount: number;
  area: string;
  theme: string;
  requiredSkills: string[];
  images: string[];
  liveLocation: { lat: number; lng: number } | null;
  radiusKm: number;
}

export interface VolunteerDepartment {
  name: string;
  suggestedCount: number;
  finalCount: number;
  description: string;
}

export interface EmergencyDetails {
  type: string;
  volunteersNeeded: number;
  peopleAffected: number;
  location: {
    lat: number;
    lng: number;
    error?: string;
  } | null;
  description: string;
}

export interface SocialFundDetails {
  raiserName: string;
  email: string;
  number: string;
  description: string;
  rupeesNeeded: number;
  location: string;
}

export interface FundDetails {
  raiserName: string;
  email: string;
  number: string;
  description: string;
  amountNeeded: number;
  crisisType?: string;
  images?: string[];
  location?: string;
  affectedPeople?: number;
}

export interface Application {
  id: string;
  volunteerId: string;
  eventId: string;
  role: string;
  passcode: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any; // Firestore Timestamp
}

export interface FirebaseEvent extends EventDetails {
  id: string;
  orgId: string;
  status: "active" | "completed" | "cancelled";
  volunteerCount: number;
  acceptedVolunteers: string[];
  liveLocations?: Record<
    string,
    { latitude: number; longitude: number; lastUpdate: any }
  >;
  createdAt: any; // Firestore Timestamp
  recruitment?: VolunteerDepartment[];
}
