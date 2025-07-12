import express, { NextFunction, type Request, Response } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { log, serveStatic, setupVite } from "./vite";

// Add sample campaign data for demo purposes
async function addSampleData() {
  try {
    // Check if we already have campaigns to avoid duplicates
    const existingCampaigns = await storage.getCampaigns();
    if (existingCampaigns.length === 0) {
      // Add sample campaigns
      const sampleCampaigns = [
        {
          title: "Solar Powered Community Hub",
          description: "",
          owner: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
          target: "5",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // Solar panels / renewable energy
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Environment",
          pId: 0,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "BrightID",
          amountCollected: "2.3",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Decentralized Education Platform",
          description: "Our platform aims to make education accessible to everyone through blockchain technology. We're building a decentralized learning platform where educators can create courses and students can access them with cryptocurrency payments.",
          owner: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
          target: "3.5",
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80", // Classroom / education
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Education",
          pId: 1,
          requiresVerification: true,
          creatorVerified: false,
          amountCollected: "1.2",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Smart Healthcare Monitoring",
          description: "We're developing wearable devices that track vital health metrics and store them securely on the blockchain. This will give patients ownership of their health data while providing critical information to healthcare providers.",
          owner: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          target: "7.2",
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd07?auto=format&fit=crop&w=600&q=80", // Healthcare / medical (unique image)
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Healthcare",
          pId: 2,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "PolygonID",
          amountCollected: "3.8",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Community Garden Initiative",
          description: "Help us transform vacant urban lots into productive community gardens. We'll provide tools, seeds, and training to local residents, promoting food security and community building.",
          owner: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
          target: "2.1",
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80", // Community garden
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Community",
          pId: 3,
          requiresVerification: false,
          amountCollected: "1.6",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Clean Water Technology",
          description: "Our innovative filtration system makes clean water accessible to remote communities. We're using blockchain to track the impact and ensure transparency in the distribution of these life-saving systems.",
          owner: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
          target: "4.5",
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
          image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80", // Clean water
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Technology",
          pId: 4,
          requiresVerification: true,
          creatorVerified: false,
          amountCollected: "0.9",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Artists for Social Change",
          description: "Supporting local artists to create public murals and installations that address social issues. We're using blockchain to ensure fair compensation and transparent funding distribution to artists from marginalized communities.",
          owner: "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54",
          target: "1.8",
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
          image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80", // Mural / art
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Arts",
          pId: 5,
          requiresVerification: false,
          amountCollected: "0.7",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Renewable Energy Microgrid",
          description: "Building a decentralized energy grid powered by solar and wind for rural communities. This will provide reliable electricity while reducing carbon emissions and creating local energy independence.",
          owner: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          target: "8.5",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=80", // Wind turbines / microgrid
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Environment",
          pId: 6,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "BrightID",
          amountCollected: "5.2",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Mental Health Support Network",
          description: "Creating an AI-powered mental health platform that connects users with licensed therapists and provides 24/7 crisis support. All data is encrypted and stored on blockchain for privacy and transparency.",
          owner: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
          target: "6.3",
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
          image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80", // Therapy / mental health
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Healthcare",
          pId: 7,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "PolygonID",
          amountCollected: "2.8",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Sustainable Fashion Marketplace",
          description: "A blockchain-based marketplace connecting eco-conscious consumers with sustainable fashion brands. We verify the environmental impact of each product and reward sustainable practices with token incentives.",
          owner: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
          target: "3.2",
          deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
          image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80", // Eco-fashion
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Fashion",
          pId: 8,
          requiresVerification: false,
          amountCollected: "1.1",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Urban Farming Technology",
          description: "Developing vertical farming systems for urban areas using IoT sensors and blockchain for supply chain transparency. This will provide fresh, locally-grown produce while reducing transportation costs and carbon footprint.",
          owner: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
          target: "4.8",
          deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000), // 65 days from now
          image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80", // Vertical farm
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Technology",
          pId: 9,
          requiresVerification: true,
          creatorVerified: false,
          amountCollected: "2.4",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Digital Literacy for Seniors",
          description: "Providing free digital literacy training and devices to senior citizens. We're creating an inclusive digital society where everyone can access online services, connect with family, and participate in the digital economy.",
          owner: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
          target: "2.7",
          deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000), // 55 days from now
          image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80", // Seniors using tech
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Education",
          pId: 10,
          requiresVerification: false,
          amountCollected: "1.9",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Wildlife Conservation Drones",
          description: "Deploying AI-powered drones to monitor endangered species and prevent poaching. The drones use blockchain to record and verify conservation data, ensuring transparency in wildlife protection efforts.",
          owner: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          target: "5.6",
          deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000), // 80 days from now
          image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80", // Drone / wildlife
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Environment",
          pId: 11,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "BrightID",
          amountCollected: "3.1",
          metaDescription: "This is a dummy meta description for the campaign.",
        },
        {
          title: "Local Food Bank Network",
          description: "Connecting local farmers with food banks through a blockchain-based platform. This reduces food waste, supports local agriculture, and ensures fresh produce reaches those in need while providing fair compensation to farmers.",
          owner: "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54",
          target: "1.5",
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // Food bank
          storySections: JSON.stringify([{ title: "Dummy Section 1", content: "This is a dummy story section." }, { title: "Dummy Section 2", content: "Another dummy story section." }]),
          rewards: JSON.stringify([{ title: "Dummy Reward 1", description: "This is a dummy reward.", minimumAmount: "0.1" }, { title: "Dummy Reward 2", description: "Another dummy reward.", minimumAmount: "0.5" }]),
          stretchGoals: JSON.stringify([{ goal: "6 ETH", description: "Dummy stretch goal." }]),
          timeline: JSON.stringify([{ milestone: "Dummy Milestone", date: "2024-08-01", description: "Dummy milestone description." }]),
          team: JSON.stringify([{ name: "Dummy Name", role: "Dummy Role", bio: "Dummy bio.", avatar: "https://dummyimage.com/100x100/000/fff" }]),
          faq: JSON.stringify([{ question: "Dummy FAQ?", answer: "Dummy answer." }]),
          updates: JSON.stringify([{ date: new Date().toISOString(), content: "Dummy update." }]),
          comments: JSON.stringify([{ user: "0xDummy", comment: "Dummy comment.", date: new Date().toISOString() }]),
          community: JSON.stringify({ backers: 1, discussions: 1 }),
          category: "Community",
          pId: 12,
          requiresVerification: false,
          amountCollected: "0.8",
          metaDescription: "This is a dummy meta description for the campaign.",
        }
      ];

      // Add each sample campaign to the database
      for (const campaign of sampleCampaigns) {
        await storage.createCampaign(campaign);
      }

      log('Sample campaigns added successfully');
    }
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Add sample data for demo purposes
  await addSampleData();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment variable PORT or default to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
