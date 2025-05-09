import { useState, useEffect } from 'react';
import { useThirdweb } from '@/context/ThirdwebContext';
import { getCampaigns } from '@/lib/contract';
import { CampaignMetadata } from '@shared/types';
import Loader from '@/components/Loader';
import CampaignCard from '@/components/CampaignCard';
import { Button } from '@/components/ui/button';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignMetadata[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  
  const { address, connect, balance } = useThirdweb();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        if (!address) return;
        
        setIsLoading(true);
        const allCampaigns = await getCampaigns();
        
        // Filter campaigns based on active tab
        const filteredCampaigns = activeTab === "created" 
          ? allCampaigns.filter(campaign => campaign.owner.toLowerCase() === address.toLowerCase())
          : allCampaigns.filter(campaign => campaign.donators.some(
              donator => donator.toLowerCase() === address.toLowerCase()
            ));
        
        setCampaigns(filteredCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch campaigns. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [address, activeTab]);

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // If wallet is not connected, show connect prompt
  if (!address) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-wallet-3-line text-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Connect your wallet to view your profile and campaigns.
        </p>
        <Button 
          onClick={handleConnectWallet}
          className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
        >
          Connect Wallet
        </Button>
        
        <ConnectWalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
          onConnect={connect}
        />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <i className="ri-user-3-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">My Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </p>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex items-center gap-2">
                <i className="ri-wallet-3-line text-primary"></i>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Balance:</span>
              </div>
              <span className="font-bold">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="created" onValueChange={handleTabChange}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">My Campaigns</h2>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="backed">Backed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="created">
          {isLoading ? (
            <Loader />
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, i) => (
                <CampaignCard key={i} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-add-circle-line text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">No campaigns created</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                You haven't created any campaigns yet.
              </p>
              <Button 
                onClick={() => window.location.href = '/create-campaign'}
                className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
              >
                Create Campaign
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="backed">
          {isLoading ? (
            <Loader />
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, i) => (
                <CampaignCard key={i} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-hand-heart-line text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">No campaigns backed</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                You haven't backed any campaigns yet.
              </p>
              <Button 
                onClick={() => window.location.href = '/campaigns'}
                className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
              >
                Discover Campaigns
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
