import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { useUserAccount } from '@/hooks/useUserAccount';
import { apiRequest } from '@/lib/queryClient';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

// Contract ABI - only the functions we need
const DONOR_XP_ABI = [
  "function donate() external payable",
  "function claimWelcomeBadge() external",
  "function getDonorData(address) external view returns (uint256, uint256, uint256, uint256, bool)",
  "function balanceOf(address, uint256) external view returns (uint256)"
];

export interface DonorData {
  xp: number;
  currentLevel: number;
  nextLevelXP: number;
  streakCount: number;
  badges: string[];
  totalDonated: number;
  lastDonationDate: string | null;
  lastDonationTime: number;
  hasWelcomeBadge: boolean;
}

interface BadgeData {
  id: number;
  name: string;
  image: string;
  balance: number;
}

export interface UserData {
  id: number;
  address: string;
  badges?: number[]; // badge IDs
  streakHistory?: number[]; // 1 = donated, 0 = not, for last 7 days
  // ...other fields
}

export const useDonorXP = () => {
  const { address, provider } = useThirdweb();
  const { toast } = useToast();
  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserAccount();

  // Contract address - replace with your deployed contract address
  const contractAddress = "0x279b...9a66";

  const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const calculateNextLevelXP = (currentLevel: number): number => {
    return Math.pow(currentLevel, 2) * 100;
  };

  const fetchDonorData = async () => {
    if (!address) {
      setDonorData(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest(`/api/donors/${address}`, 'GET');
      if (response) {
        const currentLevel = calculateLevel(response.xp);
        setDonorData({
          ...response,
          currentLevel,
          nextLevelXP: calculateNextLevelXP(currentLevel)
        });
      }
    } catch (error) {
      console.error('Error fetching donor data:', error);
      // Initialize with default values if no data exists
      setDonorData({
        xp: 0,
        currentLevel: 1,
        nextLevelXP: 100,
        streakCount: 0,
        badges: [],
        totalDonated: 0,
        lastDonationDate: null,
        lastDonationTime: 0,
        hasWelcomeBadge: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addXP = async (amount: number, reason: string) => {
    if (!address) return;

    try {
      const response = await apiRequest('/api/donors/xp', 'POST', {
        address,
        amount,
        reason
      });

      if (response) {
        const currentLevel = calculateLevel(response.xp);
        setDonorData({
          ...response,
          currentLevel,
          nextLevelXP: calculateNextLevelXP(currentLevel)
        });
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const updateStreak = async () => {
    if (!address) return;

    try {
      const response = await apiRequest('/api/donors/streak', 'POST', {
        address
      });

      if (response) {
        setDonorData(prev => prev ? { ...prev, streakCount: response.streakCount } : null);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const checkAndAwardBadges = async () => {
    if (!address || !donorData) return;

    try {
      const response = await apiRequest('/api/donors/badges/check', 'POST', {
        address,
        xp: donorData.xp,
        streakCount: donorData.streakCount,
        totalDonated: donorData.totalDonated
      });

      if (response && response.newBadges) {
        setDonorData(prev => prev ? {
          ...prev,
          badges: [...prev.badges, ...response.newBadges]
        } : null);
        return response.newBadges;
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
    return [];
  };

  // Claim welcome badge
  const claimWelcomeBadge = async () => {
    if (!address || !provider) return;

    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DONOR_XP_ABI, signer);
      
      const tx = await contract.claimWelcomeBadge();
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Welcome badge claimed successfully!',
      });

      await fetchDonorData();
    } catch (error) {
      console.error('Error claiming welcome badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim welcome badge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Make a donation
  const makeDonation = async (amount: string) => {
    if (!address || !provider) return;

    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DONOR_XP_ABI, signer);
      
      const tx = await contract.donate({
        value: ethers.parseEther(amount)
      });
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Donation made successfully!',
      });

      await fetchDonorData();
    } catch (error) {
      console.error('Error making donation:', error);
      toast({
        title: 'Error',
        description: 'Failed to make donation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getBadgeName = (id: number): string => {
    switch (id) {
      case 0: return 'Welcome Badge';
      case 1: return 'Bronze Donor';
      case 2: return 'Silver Donor';
      case 3: return 'Gold Donor';
      case 4: return 'Governance Tier';
      default: return 'Unknown Badge';
    }
  };

  const getBadgeImage = (id: number): string => {
    // Replace with your actual badge image URLs
    return `/badges/badge-${id}.png`;
  };

  // Check and claim welcome badge on wallet connect
  useEffect(() => {
    if (address && donorData && !donorData.hasWelcomeBadge) {
      claimWelcomeBadge();
    }
  }, [address, donorData]);

  // Fetch donor data when address changes
  useEffect(() => {
    if (address) {
      fetchDonorData();
    }
  }, [address]);

  const streakData = useMemo(() => {
    const days = 7;
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        streak: donorData?.streakCount && i >= days - donorData.streakCount ? 1 : 0,
      };
    });
  }, [donorData?.streakCount]);

  return {
    donorData,
    badges,
    isLoading,
    makeDonation,
    claimWelcomeBadge,
    fetchDonorData,
    addXP,
    updateStreak,
    checkAndAwardBadges
  };
}; 