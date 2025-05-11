import {
    Campaign,
    Donation,
    GptInteraction,
    InsertCampaign,
    InsertDonation,
    InsertGptInteraction,
    InsertUser,
    User
} from "@shared/schema";

function getStreakBadge(streak: number): string | null {
  if (streak >= 30) return 'Custom Governance';
  if (streak >= 14) return 'Voting Rights NFT';
  if (streak >= 7) return 'Gold Badge NFT';
  if (streak >= 3) return 'Silver Badge NFT';
  if (streak >= 1) return 'Bronze Badge NFT';
  return null;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(userId: number, method: string, proof: string): Promise<User>;
  
  // Campaign operations
  getCampaigns(): Promise<Campaign[]>;
  getCampaignsByCategory(category: string): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByOwner(owner: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignAmountCollected(id: number, amount: number): Promise<void>;
  updateCampaignVerificationStatus(id: number, verified: boolean): Promise<void>;
  
  // Donation operations
  getDonations(campaignId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  
  // GPT interactions
  getGptInteractions(userId: number): Promise<GptInteraction[]>;
  createGptInteraction(interaction: InsertGptInteraction): Promise<GptInteraction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private donations: Map<number, Donation>;
  private gptInteractions: Map<number, GptInteraction>;
  
  private currentUserId: number;
  private currentCampaignId: number;
  private currentDonationId: number;
  private currentGptInteractionId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.donations = new Map();
    this.gptInteractions = new Map();
    
    this.currentUserId = 1;
    this.currentCampaignId = 1;
    this.currentDonationId = 1;
    this.currentGptInteractionId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.address === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      verificationMethod: null,
      verificationProof: null,
      verificationTimestamp: null,
      badges: ['Pioneer'],
      streakCount: 0,
      lastDonationTime: undefined,
    };
    this.users.set(id, user);
    return user;
  }
  
  async verifyUser(userId: number, method: string, proof: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      isVerified: true,
      verificationMethod: method,
      verificationProof: proof,
      verificationTimestamp: new Date()
    };
    
    this.users.set(userId, updatedUser);
    
    // Also update any campaigns owned by this user
    Array.from(this.campaigns.values())
      .filter(campaign => campaign.owner === user.address)
      .forEach(campaign => {
        this.campaigns.set(campaign.id, {
          ...campaign,
          creatorVerified: true
        });
      });
    
    return updatedUser;
  }
  
  // Campaign operations
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }
  
  async getCampaignsByCategory(category: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.category === category,
    );
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getCampaignsByOwner(owner: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.owner === owner,
    );
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const amountCollected = "0";
    const createdAt = new Date();
    
    // Check if user is verified
    let creatorVerified = false;
    const user = Array.from(this.users.values()).find(
      user => user.address === insertCampaign.owner
    );
    
    if (user && user.isVerified) {
      creatorVerified = true;
    }
    
    // Check BrightID verification status
    try {
      const brightIdResponse = await fetch(
        `https://app.brightid.org/node/v5/verifications/Crowdfund3r/${insertCampaign.owner}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const brightIdData = await brightIdResponse.json();
      if (brightIdData.data && brightIdData.data.unique) {
        creatorVerified = true;
      }
    } catch (error) {
      console.error('Error checking BrightID verification:', error);
    }
    
    const campaign: Campaign = { 
      ...insertCampaign, 
      id, 
      amountCollected, 
      createdAt,
      requiresVerification: true,
      creatorVerified,
      pId: insertCampaign.pId || null
    };
    
    this.campaigns.set(id, campaign);

    if (user) {
      // Award 'Creator' badge if this is their first campaign
      const userCampaigns = Array.from(this.campaigns.values()).filter(c => c.owner === user.address);
      if (userCampaigns.length === 0 && !(user.badges || []).includes('Creator')) {
        user.badges = [...(user.badges || []), 'Creator'];
        this.users.set(user.id, user);
      }
    }
    
    return campaign;
  }
  
  async updateCampaignAmountCollected(id: number, amount: number): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    
    const currentAmount = parseFloat(campaign.amountCollected.toString());
    const newAmount = currentAmount + amount;
    
    this.campaigns.set(id, {
      ...campaign,
      amountCollected: newAmount.toString()
    });
  }
  
  async updateCampaignVerificationStatus(id: number, verified: boolean): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    
    this.campaigns.set(id, {
      ...campaign,
      creatorVerified: verified
    });
  }
  
  // Donation operations
  async getDonations(campaignId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.campaignId === campaignId,
    );
  }
  
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    const timestamp = new Date();
    
    // Streak logic and badge logic
    const user = Array.from(this.users.values()).find(
      (u) => u.address === insertDonation.donator
    );
    if (user) {
      const now = new Date();
      const last = user.lastDonationTime ? new Date(user.lastDonationTime) : null;
      const oneDay = 24 * 60 * 60 * 1000;
      const twoDays = 2 * oneDay;
      if (last) {
        const diff = now.getTime() - last.getTime();
        if (diff < twoDays && diff >= oneDay) {
          user.streakCount = (user.streakCount || 0) + 1;
        } else if (diff >= twoDays) {
          user.streakCount = 1;
        }
      } else {
        user.streakCount = 1;
      }
      user.lastDonationTime = now;
      // Award streak badge
      const badge = getStreakBadge(user.streakCount || 0);
      if (badge && !(user.badges || []).includes(badge)) {
        user.badges = [...(user.badges || []), badge];
      }
      this.users.set(user.id, user);
    }
    const donation: Donation = { 
      ...insertDonation, 
      id, 
      timestamp
    };
    this.donations.set(id, donation);
    return donation;
  }
  
  // GPT interactions
  async getGptInteractions(userId: number): Promise<GptInteraction[]> {
    return Array.from(this.gptInteractions.values()).filter(
      (interaction) => interaction.userId === userId,
    );
  }
  
  async createGptInteraction(insertInteraction: InsertGptInteraction): Promise<GptInteraction> {
    const id = this.currentGptInteractionId++;
    const timestamp = new Date();
    
    const interaction: GptInteraction = { 
      ...insertInteraction, 
      id, 
      timestamp
    };
    
    this.gptInteractions.set(id, interaction);
    return interaction;
  }
}

export const storage = new MemStorage();
