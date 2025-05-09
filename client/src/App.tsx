import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CampaignDetails from "@/pages/campaign-details";
import CreateCampaign from "@/pages/create-campaign";
import Profile from "@/pages/profile";
import Campaigns from "@/pages/campaigns";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileNavBar from "@/components/MobileNavBar";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaign-details/:id" component={CampaignDetails} />
      <Route path="/create-campaign" component={CreateCampaign} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-bgLight dark:bg-bgDark">
          <Navbar />
          <div className="pt-16 min-h-screen">
            <Sidebar />
            <main className="lg:pl-64">
              <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
                <Router />
              </div>
            </main>
            <MobileNavBar />
          </div>
          <PwaInstallBanner />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
