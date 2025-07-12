import {
  insertCampaignSchema,
  insertDonationSchema,
  insertUserSchema
} from "@shared/schema";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import fetch from 'node-fetch'; // or use global fetch if on Node 18+
import OpenAI from "openai";
import { storage } from "./storage";

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
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
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
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // User verification with BrightID
  app.post("/api/users/:userId/verify/brightid", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { proof } = req.body;
      
      if (!proof) {
        return res.status(400).json({ message: "Verification proof is required" });
      }
      
      // In a real implementation, we would validate the BrightID proof here
      // by making an API call to the BrightID verification endpoint
      
      const user = await storage.verifyUser(userId, "BrightID", proof);
      
      // Update any existing campaigns by this user
      const campaigns = await storage.getCampaignsByOwner(user.address);
      for (const campaign of campaigns) {
        await storage.updateCampaignVerificationStatus(campaign.id, true);
      }
      
      res.json({ 
        success: true, 
        user,
        message: "User verified with BrightID successfully" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // User verification with Polygon ID
  app.post("/api/users/:userId/verify/polygonid", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { proof, credentialType } = req.body;
      
      if (!proof) {
        return res.status(400).json({ message: "Verification proof is required" });
      }
      
      if (!credentialType) {
        return res.status(400).json({ message: "Credential type is required" });
      }
      
      // In a real implementation, we would validate the Polygon ID proof here
      // by verifying the zero-knowledge proof against the schema
      
      const user = await storage.verifyUser(userId, "PolygonID", proof);
      
      // Update any existing campaigns by this user
      const campaigns = await storage.getCampaignsByOwner(user.address);
      for (const campaign of campaigns) {
        await storage.updateCampaignVerificationStatus(campaign.id, true);
      }
      

      res.json({ 
        success: true, 
        user,
        message: "User verified with Polygon ID successfully" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // Campaign routes
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
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
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // Campaign features routes
  app.post("/api/campaigns/:id/rewards", async (req: Request, res: Response) => {
    try {
      const { title, description, minimumAmount } = req.body;
      if (!title || !description || !minimumAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      await storage.addCampaignReward(parseInt(req.params.id), {
        title,
        description,
        minimumAmount
      });
      
      res.json({ success: true, message: "Reward added successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.post("/api/campaigns/:id/faq", async (req: Request, res: Response) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      await storage.addCampaignFAQ(parseInt(req.params.id), {
        question,
        answer
      });
      
      res.json({ success: true, message: "FAQ added successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.post("/api/campaigns/:id/updates", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Update content is required" });
      }
      
      await storage.addCampaignUpdate(parseInt(req.params.id), {
        date: new Date().toISOString(),
        content
      });
      
      res.json({ success: true, message: "Update added successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.post("/api/campaigns/:id/comments", async (req: Request, res: Response) => {
    try {
      const { user, comment } = req.body;
      if (!user || !comment) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      await storage.addCampaignComment(parseInt(req.params.id), {
        user,
        comment,
        date: new Date().toISOString()
      });
      
      res.json({ success: true, message: "Comment added successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.patch("/api/campaigns/:id/community", async (req: Request, res: Response) => {
    try {
      const { backers, discussions } = req.body;
      
      await storage.updateCampaignCommunity(parseInt(req.params.id), {
        backers: backers || 0,
        discussions: discussions || 0
      });
      
      res.json({ success: true, message: "Community data updated successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.get("/api/campaigns/owner/:owner", async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaignsByOwner(req.params.owner);
      res.json(campaigns);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.get("/api/campaigns/category/:category", async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaignsByCategory(req.params.category);
      res.json(campaigns);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.post("/api/campaigns", async (req: Request, res: Response) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
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
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // Check campaign verification status
  app.get("/api/campaigns/:id/verification", async (req: Request, res: Response) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Check if the campaign creator is verified
      const user = await storage.getUserByAddress(campaign.owner);
      const isVerified = user ? user.isVerified : false;
      
      res.json({
        requiresVerification: campaign.requiresVerification,
        creatorVerified: campaign.creatorVerified || isVerified,
        verificationMethod: user ? user.verificationMethod : null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // Update campaign verification requirement
  app.patch("/api/campaigns/:id/verification", async (req: Request, res: Response) => {
    try {
      const { verified } = req.body;
      
      if (verified === undefined) {
        return res.status(400).json({ message: "Verification status is required" });
      }
      
      await storage.updateCampaignVerificationStatus(parseInt(req.params.id), verified);
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      
      res.json({ 
        success: true, 
        campaign,
        message: verified ? "Campaign creator verified" : "Campaign creator verification removed" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  // Donation routes
  app.get("/api/donations/:campaignId", async (req: Request, res: Response) => {
    try {
      const donations = await storage.getDonations(parseInt(req.params.campaignId));
      res.json(donations);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });
  
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      res.status(201).json(donation);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  });
  
  // GPT Assistant routes
  app.post("/api/gpt/assist", async (req: Request, res: Response) => {
    try {
      const { userId, promptText } = req.body;
      
      if (!userId || !promptText) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check for OpenAI API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
        // Provide a fallback response for when API key is not available or rate limited
        const mockResponse = {
          campaignPitch: "This is a compelling campaign that will revolutionize the industry by leveraging blockchain technology to create a decentralized solution. Our platform is designed to be user-friendly while maintaining the highest standards of security and transparency.",
          goalEstimate: {
            min: "1.5",
            max: "5.0",
            recommendedAmount: "3.0",
            rationale: "Based on similar blockchain projects, a recommended funding target of 3.0 ETH provides enough capital for development while remaining achievable."
          },
          milestones: [
            {
              name: "Initial Development",
              description: "Complete the core functionality and smart contract development.",
              timeframe: "1-2 months"
            },
            {
              name: "Beta Testing",
              description: "Launch beta version to early adopters and gather feedback.",
              timeframe: "3-4 months"
            },
            {
              name: "Public Launch",
              description: "Full public release with all features implemented.",
              timeframe: "6 months"
            }
          ]
        };
        
        // Save the interaction with mock response
        const responseTextStr: string = JSON.stringify(mockResponse) ?? '{}';
        const interaction = await storage.createGptInteraction({
          userId,
          promptText,
          responseText: responseTextStr
        });
        
        return res.json({
          id: interaction.id,
          response: JSON.parse(responseTextStr)
        });
      }
      
      // If API key is available, try to use it
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Fallback to a less expensive model that has higher rate limits
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
        const responseTextStr: string = typeof responseText === 'string' ? responseText : (responseText ?? '{}');
        const interaction = await storage.createGptInteraction({
          userId,
          promptText,
          responseText: responseTextStr
        });
        
        res.json({
          id: interaction.id,
          response: JSON.parse(responseTextStr)
        });
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        
        // Fallback to mock response with at least one field always present
        const mockResponse = {
          campaignPitch: "This is a compelling campaign that will revolutionize the industry by leveraging blockchain technology to create a decentralized solution. Our platform is designed to be user-friendly while maintaining the highest standards of security and transparency.",
          goalEstimate: {
            min: "1.5",
            max: "5.0",
            recommendedAmount: "3.0",
            rationale: "Based on similar blockchain projects, a recommended funding target of 3.0 ETH provides enough capital for development while remaining achievable."
          },
          milestones: [
            {
              name: "Initial Development",
              description: "Complete the core functionality and smart contract development.",
              timeframe: "1-2 months"
            },
            {
              name: "Beta Testing",
              description: "Launch beta version to early adopters and gather feedback.",
              timeframe: "3-4 months"
            },
            {
              name: "Public Launch",
              description: "Full public release with all features implemented.",
              timeframe: "6 months"
            }
          ]
        };
        
        // Save the interaction with mock response
        const responseTextStr: string = JSON.stringify(mockResponse) ?? '{}';
        const interaction = await storage.createGptInteraction({
          userId,
          promptText,
          responseText: responseTextStr
        });
        
        res.json({
          id: interaction.id,
          response: JSON.parse(responseTextStr)
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Server error:", message);
      res.status(500).json({ error: message });
    }
  });
  
  app.get("/api/gpt/history/:userId", async (req: Request, res: Response) => {
    try {
      const interactions = await storage.getGptInteractions(parseInt(req.params.userId));
      res.json(interactions);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  // DeepSeek route
  app.post('/api/deepseek/assist', async (req, res) => {
    try {
      const { promptText, userId } = req.body;
      if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: "DeepSeek API key not set" });
      }
      const deepseekResponse = await fetch('https://api.deepseek.com/your-endpoint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          // ...other params as required by DeepSeek...
        })
      });
      const data = await deepseekResponse.json();
      res.json({
        campaignPitch: data.result || data.campaignPitch || data.text || "No result from DeepSeek"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error in /api/deepseek/assist:', message);
      res.status(500).json({ error: 'Failed to get DeepSeek response: ' + message });
    }
  });

  // Top Donors route (hardcoded for demo)
  app.get('/api/donors/top', (_req: Request, res: Response) => {
    res.json({
      donors: [
        {
          address: "0x1234...abcd",
          totalDonated: 5.2,
          streakCount: 10,
          badges: ["🏅", "🔥"],
          level: 4
        },
        {
          address: "0xabcd...5678",
          totalDonated: 3.8,
          streakCount: 7,
          badges: ["🏅"],
          level: 3
        },
        {
          address: "0x9876...4321",
          totalDonated: 2.5,
          streakCount: 5,
          badges: ["🏅"],
          level: 2
        }
      ]
    });
  });

  // Saved campaigns routes
  app.post("/api/users/:userId/save/:campaignId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const campaignId = parseInt(req.params.campaignId);
      await storage.saveCampaign(userId, campaignId);
      res.json({ success: true, message: "Campaign saved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  app.delete("/api/users/:userId/save/:campaignId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const campaignId = parseInt(req.params.campaignId);
      await storage.unsaveCampaign(userId, campaignId);
      res.json({ success: true, message: "Campaign unsaved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/users/:userId/saved-campaigns", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const savedCampaignIds = await storage.getSavedCampaigns(userId);
      res.json({ savedCampaignIds });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
