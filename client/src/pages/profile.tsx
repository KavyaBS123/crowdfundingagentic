import CampaignCard from '@/components/CampaignCard';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { getCampaigns } from '@/lib/contract';
import { apiRequest } from '@/lib/queryClient';
import { CampaignMetadata } from '@shared/types';
import { useEffect, useState } from 'react';

const badgeSvgs: Record<string, JSX.Element> = {
  'Pioneer': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#00b894"/><text x="14" y="19" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">🚀</text></svg>
  ),
  'Creator': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#fdcb6e"/><text x="14" y="19" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">✍️</text></svg>
  ),
  'Bronze Badge NFT': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#cd7f32"/><text x="14" y="19" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">🥉</text></svg>
  ),
  'Silver Badge NFT': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#C0C0C0"/><text x="14" y="19" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">🥈</text></svg>
  ),
  'Gold Badge NFT': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#FFD700"/><text x="14" y="19" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">🥇</text></svg>
  ),
  'Voting Rights NFT': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#4F8AFA"/><g><rect x="8" y="10" width="12" height="8" rx="2" fill="#fff"/><rect x="12" y="8" width="4" height="4" rx="1" fill="#4F8AFA"/></g></svg>
  ),
  'Custom Governance': (
    <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#8e44ad"/><g><polygon points="14,6 18,20 10,20" fill="#fff"/><circle cx="14" cy="10" r="2" fill="#8e44ad"/></g></svg>
  ),
};

const badgeDescriptions: Record<string, string> = {
  'Pioneer': 'Awarded for connecting your wallet for the first time',
  'Creator': 'Awarded for creating your first campaign',
  'Bronze Badge NFT': 'Awarded for a 1+ day donation streak',
  'Silver Badge NFT': 'Awarded for a 3+ day donation streak',
  'Gold Badge NFT': 'Awarded for a 7+ day donation streak',
  'Voting Rights NFT': 'Awarded for a 14+ day donation streak',
  'Custom Governance': 'Awarded for a 30+ day donation streak',
};

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignMetadata[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [savedCampaigns, setSavedCampaigns] = useState<CampaignMetadata[]>([]);
  
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
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [address, activeTab]);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!address) return;
      try {
        const user = await apiRequest(`/api/users/address/${address}`, 'GET');
        if (user) {
          setUserBadges(user.badges || []);
          setUserStreak(user.streakCount || 0);
        }
      } catch (error) {
        setUserBadges([]);
        setUserStreak(0);
      }
    };
    fetchUserBadges();
  }, [address]);

  useEffect(() => {
    const fetchSavedCampaigns = async () => {
      if (!address) return;
      try {
        const user = await apiRequest(`/api/users/address/${address}`, 'GET');
        if (user?.id) {
          const saved = await apiRequest(`/api/users/${user.id}/saved-campaigns`, 'GET');
          if (saved.savedCampaignIds && saved.savedCampaignIds.length > 0) {
            const allCampaigns = await getCampaigns();
            setSavedCampaigns(allCampaigns.filter(c => saved.savedCampaignIds.includes(c.pId)));
          } else {
            setSavedCampaigns([]);
          }
        }
      } catch (e) {
        setSavedCampaigns([]);
      }
    };
    fetchSavedCampaigns();
  }, [address]);

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
              {/* Badge and streak display */}
              {userBadges.length > 0 && (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {userBadges.map((badge) => (
                    <span
                      key={badge}
                      className="w-7 h-7 flex items-center justify-center"
                      title={badgeDescriptions[badge]}
                    >
                      {badgeSvgs[badge]}
                    </span>
                  ))}
                  {userStreak > 0 && (
                    <span className="ml-2 text-xs text-gray-500">Streak: {userStreak}</span>
                  )}
                </div>
              )}
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
      
      <Tabs defaultValue="created" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="backed">Backed</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
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
        <TabsContent value="saved">
          {isLoading ? (
            <Loader />
          ) : savedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCampaigns.map((campaign, i) => (
                <CampaignCard key={i} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bookmark-line text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">No saved campaigns</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                You haven't saved any campaigns yet.
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
