import { 
  User, InsertUser, 
  Campaign, InsertCampaign, 
  Donation, InsertDonation, 
  GptInteraction, InsertGptInteraction 
} from "@shared/schema";

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
      verificationTimestamp: null
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
