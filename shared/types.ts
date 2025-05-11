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

export interface UserData {
  id: number;
  address: string;
  badges?: number[]; // badge IDs
  streakHistory?: number[]; // 1 = donated, 0 = not, for last 7 days
  xp?: number;
  level?: number;
  streakCount?: number;
  lastDonationTime?: number;
}
