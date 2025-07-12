import ConnectWalletModal from '@/components/ConnectWalletModal';
import CountBox from '@/components/CountBox';
import Loader from '@/components/Loader';
import VerificationBadge from '@/components/VerificationBadge';
import VerifyUserDialog from '@/components/VerifyUserDialog';
import CampaignTabs from '@/components/CampaignTabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { useDonorXP } from '@/hooks/useDonorXP';
import { calculateDaysLeft, donateToCampaign, getCampaign, getDonators } from '@/lib/contract';
import { apiRequest } from '@/lib/queryClient';
import { CampaignMetadata } from '@shared/types';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const CampaignDetails = () => {
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState<{ address: string; donation: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    requiresVerification: true,
    creatorVerified: false,
    verificationMethod: null as string | null
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const { addXP, updateStreak, checkAndAwardBadges } = useDonorXP();
  
  const { address, connect } = useThirdweb();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const pId = parseInt(location.split('/').pop() || '0');
  
  // Function to fetch user by wallet address
  const fetchUserByAddress = async (walletAddress: string) => {
    try {
      const response = await apiRequest(`/api/users/address/${walletAddress}`, "GET");
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  // Function to fetch campaign verification status
  const fetchVerificationStatus = async (campaignId: number) => {
    try {
      const response = await apiRequest(`/api/campaigns/${campaignId}/verification`, "GET");
      if (response) {
        setVerificationStatus({
          requiresVerification: response.requiresVerification || false,
          creatorVerified: response.creatorVerified || false,
          verificationMethod: response.verificationMethod || null
        });
      }
      return response;
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return null;
    }
  };

  const handleVerification = async () => {
    if (!address || !campaign) return;
    
    try {
      // Check if user exists
      const user = await fetchUserByAddress(address);
      
      if (user) {
        setUserId(user.id);
        
        // If user is the campaign owner, open verification dialog
        if (user.address.toLowerCase() === campaign.owner.toLowerCase()) {
          setIsVerifyDialogOpen(true);
        } else {
          toast({
            title: 'Not authorized',
            description: 'Only the campaign creator can verify this campaign.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'User not found',
          description: 'Your wallet address is not registered. Please register first.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error handling verification:', error);
      toast({
        title: 'Verification error',
        description: 'Failed to start verification process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerificationComplete = async () => {
    // Refresh verification status after completion
    await fetchVerificationStatus(pId);
    
    toast({
    
      title: 'Verification complete',
      description: 'Your campaign creator identity has been verified.',
    });
  };

  const refreshCampaignData = async () => {
    try {
      const backendCampaign = await apiRequest(`/api/campaigns/${pId}`, 'GET');
      if (backendCampaign) {
        const formattedCampaign: CampaignMetadata = {
          pId: backendCampaign.id,
          owner: backendCampaign.owner,
          title: backendCampaign.title,
          description: backendCampaign.description,
          target: backendCampaign.target.toString(),
          deadline: new Date(backendCampaign.deadline).toISOString(),
          amountCollected: backendCampaign.amountCollected?.toString() || '0',
          image: backendCampaign.image,
          category: backendCampaign.category,
          requiresVerification: backendCampaign.requiresVerification || false,
          creatorVerified: backendCampaign.creatorVerified || false,
          verificationMethod: backendCampaign.verificationMethod || null,
          rewards: Array.isArray(backendCampaign.rewards) ? backendCampaign.rewards : (backendCampaign.rewards ? JSON.parse(backendCampaign.rewards) : []),
          storySections: Array.isArray(backendCampaign.storySections) ? backendCampaign.storySections : (backendCampaign.storySections ? JSON.parse(backendCampaign.storySections) : []),
          stretchGoals: Array.isArray(backendCampaign.stretchGoals) ? backendCampaign.stretchGoals : (backendCampaign.stretchGoals ? JSON.parse(backendCampaign.stretchGoals) : []),
          timeline: Array.isArray(backendCampaign.timeline) ? backendCampaign.timeline : (backendCampaign.timeline ? JSON.parse(backendCampaign.timeline) : []),
          team: Array.isArray(backendCampaign.team) ? backendCampaign.team : (backendCampaign.team ? JSON.parse(backendCampaign.team) : []),
          faq: Array.isArray(backendCampaign.faq) ? backendCampaign.faq : (backendCampaign.faq ? JSON.parse(backendCampaign.faq) : []),
          updates: Array.isArray(backendCampaign.updates) ? backendCampaign.updates : (backendCampaign.updates ? JSON.parse(backendCampaign.updates) : []),
          comments: Array.isArray(backendCampaign.comments) ? backendCampaign.comments : (backendCampaign.comments ? JSON.parse(backendCampaign.comments) : []),
          community: typeof backendCampaign.community === 'object' ? backendCampaign.community : (backendCampaign.community ? JSON.parse(backendCampaign.community) : { backers: 0, discussions: 0 }),
          donators: [],
          donations: []
        };
        setCampaign(formattedCampaign);
      }
    } catch (error) {
      console.error('Error refreshing campaign data:', error);
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        if (isNaN(pId)) return;
        
        setIsLoading(true);
        
        // Try to fetch campaign from backend API first
        try {
          const backendCampaign = await apiRequest(`/api/campaigns/${pId}`, 'GET');
          if (backendCampaign) {
            // Convert to CampaignMetadata format
            const formattedCampaign: CampaignMetadata = {
              pId: backendCampaign.id,
              owner: backendCampaign.owner,
              title: backendCampaign.title,
              description: backendCampaign.description,
              target: backendCampaign.target.toString(),
              deadline: new Date(backendCampaign.deadline).toISOString(),
              amountCollected: backendCampaign.amountCollected?.toString() || '0',
              image: backendCampaign.image,
              category: backendCampaign.category,
              requiresVerification: backendCampaign.requiresVerification || false,
              creatorVerified: backendCampaign.creatorVerified || false,
              verificationMethod: backendCampaign.verificationMethod || null,
              rewards: Array.isArray(backendCampaign.rewards) ? backendCampaign.rewards : (backendCampaign.rewards ? JSON.parse(backendCampaign.rewards) : []),
              storySections: Array.isArray(backendCampaign.storySections) ? backendCampaign.storySections : (backendCampaign.storySections ? JSON.parse(backendCampaign.storySections) : []),
              stretchGoals: Array.isArray(backendCampaign.stretchGoals) ? backendCampaign.stretchGoals : (backendCampaign.stretchGoals ? JSON.parse(backendCampaign.stretchGoals) : []),
              timeline: Array.isArray(backendCampaign.timeline) ? backendCampaign.timeline : (backendCampaign.timeline ? JSON.parse(backendCampaign.timeline) : []),
              team: Array.isArray(backendCampaign.team) ? backendCampaign.team : (backendCampaign.team ? JSON.parse(backendCampaign.team) : []),
              faq: Array.isArray(backendCampaign.faq) ? backendCampaign.faq : (backendCampaign.faq ? JSON.parse(backendCampaign.faq) : []),
              updates: Array.isArray(backendCampaign.updates) ? backendCampaign.updates : (backendCampaign.updates ? JSON.parse(backendCampaign.updates) : []),
              comments: Array.isArray(backendCampaign.comments) ? backendCampaign.comments : (backendCampaign.comments ? JSON.parse(backendCampaign.comments) : []),
              community: typeof backendCampaign.community === 'object' ? backendCampaign.community : (backendCampaign.community ? JSON.parse(backendCampaign.community) : { backers: 0, discussions: 0 }),
              donators: [],
              donations: []
            };
            
            setCampaign(formattedCampaign);
            
            // Set verification status from backend data
            setVerificationStatus({
              requiresVerification: backendCampaign.requiresVerification || false,
              creatorVerified: backendCampaign.creatorVerified || false,
              verificationMethod: backendCampaign.verificationMethod || null
            });
            
        
            // Try to fetch donation data if available
            try {
              const donationsData = await apiRequest(`/api/donations/${pId}`, 'GET');
              if (donationsData && donationsData.length > 0) {
                const formattedDonators = donationsData.map((donation: any) => ({
                  address: donation.donorAddress,
                  donation: donation.amount.toString()
                }));
                setDonators(formattedDonators);
              }
            } catch (donationError) {
              console.error('Error fetching donations from backend:', donationError);
              // If we can't get donations from backend, still continue
            }
            
            return; // Exit early if we got the campaign from backend
          }
        } catch (backendError) {
          console.error('Error fetching campaign from backend:', backendError);
        }
        
        // Fallback to smart contract if backend fails
        try {
          const campaignData = await getCampaign(pId);
          setCampaign(campaignData);
          
          const donatorsData = await getDonators(pId);
          const formattedDonators = donatorsData.donators.map((donator, i) => ({
            address: donator,
            donation: donatorsData.donations[i]
          }));
          
          setDonators(formattedDonators);
          
          // Fetch verification status
          await fetchVerificationStatus(pId);
        } catch (contractError) {
          console.error('Error fetching campaign from contract:', contractError);
          throw contractError; // Re-throw to be caught by outer catch
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch campaign details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch campaign, even if wallet is not connected
    fetchCampaign();
  }, [pId]);

  const handleDonate = async () => {
    if (!address) {
      setIsWalletModalOpen(true);
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await donateToCampaign(pId, amount);
      
      // Add XP for donation
      await addXP(100, 'donation');
      
      // Update streak
      await updateStreak();
      
      // Check for new badges
      const earnedBadges = await checkAndAwardBadges();
      if (earnedBadges.length > 0) {
        setNewBadges(earnedBadges);
      }
      
      toast({
        title: 'Success!',
        description: `You have successfully donated ${amount} ETH to this campaign.`,
      });
      
      // Show donation success modal with badges if any were earned
      setShowDonationSuccess(true);
      
      // Refresh campaign data
      const campaignData = await getCampaign(pId);
      setCampaign(campaignData);
      
      const donatorsData = await getDonators(pId);
      const formattedDonators = donatorsData.donators.map((donator, i) => ({
        address: donator,
        donation: donatorsData.donations[i]
      }));
      
      setDonators(formattedDonators);
      setAmount('');
    } catch (error) {
      console.error('Error donating to campaign:', error);
      toast({
        title: 'Donation failed',
        description: 'Failed to process your donation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-wallet-3-line text-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Connect your wallet to view campaign details and donate.
        </p>
        <Button 
          onClick={() => setIsWalletModalOpen(true)}
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

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Campaign not found</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-campaign mb-8">
            {/* Always show image, never video */}
            <img 
              src={campaign.image} 
              alt={campaign.title} 
              className="w-full h-64 md:h-96 object-cover"
              onError={e => { e.currentTarget.src = '/default-campaign-poster.jpg'; }}
            />
            
            <div className="p-6">
              <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  {campaign.category}
                </span>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <i className="ri-time-line mr-1"></i>
                  {calculateDaysLeft(campaign.deadline) > 0 
                    ? `${calculateDaysLeft(campaign.deadline)} days left` 
                    : 'Campaign ended'}
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h1>
              {campaign.metaDescription && (
                <p className="text-gray-500 dark:text-gray-400 text-base mb-4">{campaign.metaDescription}</p>
              )}
              
              {/* Introductory Summary / Meta Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Introductory Summary</h2>
                <p className="text-gray-500 dark:text-gray-400 text-base">
                  {campaign.metaDescription || 'This is some example information about this campaign summary.'}
                </p>
              </div>

              {/* Project Story / Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Project Story</h2>
                {campaign.storySections && campaign.storySections.length > 0 ? (
                  campaign.storySections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <h3 className="font-semibold mb-1">{section.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{section.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">This is some example information about the project story and description.</p>
                )}
              </div>

              {/* Rewards / Perks Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Rewards / Perks</h2>
                {campaign.rewards && campaign.rewards.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {campaign.rewards.map((reward, idx) => (
                      <li key={idx} className="mb-2">
                        <span className="font-semibold">{reward.title}:</span> {reward.description} {reward.minimumAmount && (<span className="text-primary">(Min: {reward.minimumAmount} ETH)</span>)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">This is some example information about the rewards and perks for this campaign.</p>
                )}
              </div>

              {/* Stretch Goals / Add‑Ons */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Stretch Goals / Add‑Ons</h2>
                {campaign.stretchGoals && campaign.stretchGoals.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {campaign.stretchGoals.map((goal, idx) => (
                      <li key={idx} className="mb-2"><span className="font-semibold">{goal.goal}:</span> {goal.description}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">This is some example information about the stretch goals and add-ons for this campaign.</p>
                )}
              </div>

              {/* Timeline or Project Schedule */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Timeline / Project Schedule</h2>
                {campaign.timeline && campaign.timeline.length > 0 ? (
                  <ul className="list-none">
                    {campaign.timeline.map((item, idx) => (
                      <li key={idx} className="mb-2">
                        <span className="font-semibold">{item.milestone}</span> ({item.date}): {item.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">This is some example information about the timeline and project schedule.</p>
                )}
              </div>

              {/* Team / About Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Team / About</h2>
                {campaign.team && campaign.team.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.team.map((member, idx) => (
                      <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {member.avatar && <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />}
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">This is some example information about the team and people behind this campaign.</p>
                )}
              </div>

              {/* Risks & Challenges */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Risks & Challenges</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{campaign.risks || 'This is some example information about the risks and challenges for this campaign.'}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Creator</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <i className="ri-user-3-line text-gray-600 dark:text-gray-300"></i>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{campaign.owner.substring(0, 6)}...{campaign.owner.substring(campaign.owner.length - 4)}</p>
                        <VerificationBadge 
                          isVerified={verificationStatus.creatorVerified}
                          requiresVerification={verificationStatus.requiresVerification}
                          method={verificationStatus.verificationMethod}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Campaign Creator</p>
                    </div>
                  </div>
                  
                  {/* Show verify button if creator is the current user and not verified */}
                  {campaign.owner.toLowerCase() === address?.toLowerCase() && !verificationStatus.creatorVerified && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleVerification}
                      className="text-xs"
                    >
                      Verify Identity
                    </Button>
                  )}
                </div>
              </div>
              
              {/* <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Story</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {campaign.description}
                </p>
              </div> */}
              
              <div>
                <h2 className="text-xl font-bold mb-4">Donators</h2>
                {donators.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {donators.map((donator, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium">{donator.address.substring(0, 6)}...{donator.address.substring(donator.address.length - 4)}</p>
                        <p className="text-sm text-primary font-medium">{parseFloat(donator.donation).toFixed(2)} ETH</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No donations yet. Be the first to donate!</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Campaign Tabs */}
        <div className="md:col-span-2 mb-8">
          <CampaignTabs campaign={campaign} onUpdate={refreshCampaignData} />
        </div>
        
        {/* Donation Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign sticky top-20">
            <h2 className="text-xl font-bold mb-4">Fund the Campaign</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Support this image.pngcampaign by donating ETH. Your contribution makes a difference!
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Pledge amount
                </label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="0.1"
                    className="pl-10 bg-gray-100 dark:bg-gray-800 border-none rounded-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 dark:text-gray-400">ETH</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Target</span>
                  <span className="font-medium">{parseFloat(campaign.target).toFixed(2)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Raised</span>
                  <span className="font-medium">{parseFloat(campaign.amountCollected).toFixed(2)} ETH</span>
                </div>
              </div>
              
              <Button 
                onClick={handleDonate}
                disabled={isSubmitting}
                className="w-full bg-gradient-primary rounded-full py-3 text-white font-medium"
              >
                {isSubmitting ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i> Processing...</>
                ) : (
                  'Fund Campaign'
                )}
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Secured by blockchain technology</p>
              <p>0% platform fees, only gas fees apply</p>
            </div>
          </div>
        </div>
      </div>
      
      <ConnectWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        onConnect={connect}
      />
      
      {userId && (
        <VerifyUserDialog
          isOpen={isVerifyDialogOpen}
          onClose={() => setIsVerifyDialogOpen(false)}
          userId={userId}
          userAddress={address || ''}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
      
      {/* Donation Success Modal */}
      <Dialog open={showDonationSuccess} onOpenChange={setShowDonationSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donation Successful! 🎉</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">Thank you for your donation!</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              You've earned 100 XP for your contribution.
            </p>
            
            {newBadges.length > 0 && (
              <div className="w-full">
                <h4 className="font-bold mb-2">New Badges Unlocked!</h4>
                <div className="grid grid-cols-2 gap-2">
                  {newBadges.map((badge, index) => (
                    <div key={index} className="bg-primary/10 rounded-lg p-3 text-center">
                      <span className="text-2xl mb-1 block">{badge}</span>
                      <span className="text-sm font-medium">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignDetails;
