export interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: Date;
  image: string;
  category: string;
}

export interface CampaignMetadata {
  title: string;
  description: string;
  metaDescription?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  storySections?: StorySection[];
  stretchGoals?: StretchGoal[];
  timeline?: TimelineMilestone[];
  team?: TeamMember[];
  risks?: string;
  target: string; // Ethers in string format
  deadline: string; // Date in string format
  image: string;
  owner: string; // Address of the campaign creator
  pId: number; // Campaign ID in smart contract
  amountCollected: string; // Ethers in string format
  donators: string[]; // List of donator addresses
  donations: string[]; // List of donation amounts
  category: string;
  requiresVerification?: boolean; // Whether the campaign requires creator verification
  creatorVerified?: boolean; // Whether the creator is verified
  verificationMethod?: string; // BrightID or PolygonID
  rewards?: Reward[];
  faq?: FAQ[];
  updates?: CampaignUpdate[];
  comments?: CampaignComment[];
  community?: CampaignCommunity;
}

export interface Reward {
  title: string;
  description: string;
  minimumAmount: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CampaignUpdate {
  date: string;
  content: string;
}

export interface CampaignComment {
  user: string;
  comment: string;
  date: string;
}

export interface CampaignCommunity {
  backers: number;
  discussions: number;
  // Add more fields as needed
}

export interface DonationData {
  amount: string;
  campaignId: number;
  donorAddress: string;
  timestamp: number;
}

export interface GptAssistantResponse {
  campaignPitch?: string;
  goalEstimate?: {
    min: string;
    max: string;
    recommendedAmount: string;
    rationale: string;
  };
  milestones?: {
    name: string;
    description: string;
    timeframe: string;
  }[];
}

export interface WalletInfo {
  address: string;
  balance: string;
}

export interface SavedCampaign {
  id: number;
  userId: number;
  campaignId: number;
  createdAt: string;
}

export interface UserData {
  id: number;
  address: string;
  badges?: number[]; // badge IDs
  streakHistory?: number[]; // 1 = donated, 0 = not, for last 7 days
  xp?: number;
  level?: number;
  streakCount?: number;
  lastDonationTime?: number;
  savedCampaigns?: SavedCampaign[];
}

export interface StorySection {
  title: string;
  content: string;
}

export interface StretchGoal {
  goal: string;
  description: string;
}

export interface TimelineMilestone {
  milestone: string;
  date: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
}
