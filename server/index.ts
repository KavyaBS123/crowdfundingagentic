import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

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
          description: "We're creating a sustainable community center powered entirely by solar energy. This hub will provide educational resources, workspace, and serve as a model for renewable energy in urban areas.",
          owner: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
          target: "5",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          image: "https://images.unsplash.com/photo-1509390144018-eeef46f70b8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
          category: "Environment",
          pId: 0
        },
        {
          title: "Decentralized Education Platform",
          description: "Our platform aims to make education accessible to everyone through blockchain technology. We're building a decentralized learning platform where educators can create courses and students can access them with cryptocurrency payments.",
          owner: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
          target: "3.5",
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
          category: "Education",
          pId: 1
        },
        {
          title: "Smart Healthcare Monitoring",
          description: "We're developing wearable devices that track vital health metrics and store them securely on the blockchain. This will give patients ownership of their health data while providing critical information to healthcare providers.",
          owner: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          target: "7.2",
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
          category: "Healthcare",
          pId: 2
        },
        {
          title: "Community Garden Initiative",
          description: "Help us transform vacant urban lots into productive community gardens. We'll provide tools, seeds, and training to local residents, promoting food security and community building.",
          owner: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
          target: "2.1",
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
          category: "Community",
          pId: 3
        },
        {
          title: "Clean Water Technology",
          description: "Our innovative filtration system makes clean water accessible to remote communities. We're using blockchain to track the impact and ensure transparency in the distribution of these life-saving systems.",
          owner: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
          target: "4.5",
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
          image: "https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1015&q=80",
          category: "Technology",
          pId: 4
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
