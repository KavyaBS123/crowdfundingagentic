import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCampaignSchema, 
  insertDonationSchema, 
  insertGptInteractionSchema, 
  insertUserSchema
} from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get("/api/users/address/:address", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Campaign routes
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/campaigns/owner/:owner", async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaignsByOwner(req.params.owner);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/campaigns/category/:category", async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaignsByCategory(req.params.category);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/campaigns", async (req: Request, res: Response) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.patch("/api/campaigns/:id/donate", async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      await storage.updateCampaignAmountCollected(parseInt(req.params.id), amount);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Donation routes
  app.get("/api/donations/:campaignId", async (req: Request, res: Response) => {
    try {
      const donations = await storage.getDonations(parseInt(req.params.campaignId));
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // GPT Assistant routes
  app.post("/api/gpt/assist", async (req: Request, res: Response) => {
    try {
      const { userId, promptText } = req.body;
      
      if (!userId || !promptText) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a crowdfunding campaign advisor specializing in blockchain projects. You help users create better pitches, estimate realistic funding goals, and set up milestones for their campaigns. Provide practical advice and respond in JSON format."
          },
          {
            role: "user",
            content: promptText
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const responseText = response.choices[0].message.content;
      
      // Save the interaction
      const interaction = await storage.createGptInteraction({
        userId,
        promptText,
        responseText
      });
      
      res.json({
        id: interaction.id,
        response: JSON.parse(responseText)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/gpt/history/:userId", async (req: Request, res: Response) => {
    try {
      const interactions = await storage.getGptInteractions(parseInt(req.params.userId));
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
