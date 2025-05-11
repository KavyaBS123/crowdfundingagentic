import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDonorXP } from '@/hooks/useDonorXP';
import { useUserAccount } from '@/hooks/useUserAccount';
import confetti from 'canvas-confetti';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const levelTitles = [
  { title: "Supporter", icon: "🤝", minXp: 0 },
  { title: "Advocate", icon: "💪", minXp: 1000 },
  { title: "Hero", icon: "🦸", minXp: 2500 },
  { title: "Champion", icon: "🏆", minXp: 5000 },
  { title: "Legend", icon: "🌟", minXp: 10000 }
];
const streakData: { day: string; streak: number }[] = [
  { day: 'Mon', streak: 1 },
  { day: 'Tue', streak: 1 },
  { day: 'Wed', streak: 0 },
  { day: 'Thu', streak: 0 },
  { day: 'Fri', streak: 1 },
  { day: 'Sat', streak: 0 },
  { day: 'Sun', streak: 1 }
];

const DonorProfile = () => {
  const { donorData, badges, isLoading, makeDonation } = useDonorXP();
  const [donationAmount, setDonationAmount] = useState('');
  const { user } = useUserAccount();
  const [showXpInfo, setShowXpInfo] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all');
  const [donationsToday, setDonationsToday] = useState(0);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ type: string; label: string; emoji: string } | null>(null);

  // Track previous badge and user state for animation
  const prevBadgesRef = useRef<number[]>([]);
  const prevUserRef = useRef<any>(null);

  // Get current level title
  const currentLevelTitle = useMemo(() => {
    if (!donorData) return null;
    return levelTitles.find(level => donorData.xp >= level.minXp) || levelTitles[0];
  }, [donorData]);

  // Detect badge unlocks
  useEffect(() => {
    const prevBadges = prevBadgesRef.current;
    const currentBadges = badges.map(b => b.id);
    
    // Check for new badges
    const newBadges = currentBadges.filter(id => !prevBadges.includes(id));
    if (newBadges.length > 0) {
      const badge = badges.find(b => b.id === newBadges[0]);
      if (badge) {
        setUnlockedBadge({
          type: 'badge',
          label: badge.name,
          emoji: getBadgeEmoji(badge.id)
        });
        setShowBadgeModal(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    prevBadgesRef.current = currentBadges;
  }, [badges]);

  // Simulate streak data for the last 7 days
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

  const getBadgeEmoji = (id: number): string => {
    switch (id) {
      case 0: return '👋';
      case 1: return '💸';
      case 2: return '🔥';
      case 3: return '🏆';
      case 4: return '🎯';
      default: return '🌟';
    }
  };

  if (!donorData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-wallet-3-line text-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Connect your wallet to view your donor profile and make donations.
        </p>
      </div>
    );
  }

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount) return;
    await makeDonation(donationAmount);
    setDonationAmount('');
    setDonationsToday(prev => prev + 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign">
      {/* Badge Unlock Modal */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Badge Unlocked! 🎉</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <span className="text-6xl mb-4">{unlockedBadge?.emoji}</span>
            <h3 className="text-xl font-bold mb-2">{unlockedBadge?.label}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Keep up the great work! Continue donating to unlock more badges.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">{currentLevelTitle?.icon}</span>
              <span>{currentLevelTitle?.title}</span>
            </h3>
            <span className="text-sm text-gray-500">Level {donorData.currentLevel}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold">{donorData.xp} XP</span>
            <button 
              onClick={() => setShowXpInfo(!showXpInfo)}
              className="ml-1 text-primary hover:text-primary/80"
            >
              <i className="ri-question-line"></i>
            </button>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500" 
            style={{ width: `${(donorData.xp/donorData.nextLevelXP)*100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{donorData.xp} XP</span>
          <span>{donorData.nextLevelXP} XP</span>
        </div>
      </div>

      {/* XP Info Tooltip */}
      {showXpInfo && (
        <div className="absolute bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mt-2 z-10">
          <div className="font-bold mb-2">How to earn XP:</div>
          <ul className="text-sm space-y-1">
            <li>• Donate → +100 XP</li>
            <li>• Daily login → +10 XP</li>
            <li>• Share campaign → +50 XP</li>
            <li>• Complete daily challenge → +200 XP</li>
          </ul>
        </div>
      )}

      {/* Daily Challenge */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
        <div className="font-bold text-lg mb-2">🎯 Today's Challenge</div>
        <div className="text-sm mb-2">Donate to 2 campaigns to earn <span className="font-bold text-primary">+200 XP</span></div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(donationsToday/2)*100}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{donationsToday}/2 donations done</div>
      </div>

      {/* Leaderboard Filters */}
      <div className="mb-6">
        <Tabs defaultValue="all" value={leaderboardFilter} onValueChange={setLeaderboardFilter}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">🏅 All-Time</TabsTrigger>
            <TabsTrigger value="weekly">🔥 Weekly</TabsTrigger>
            <TabsTrigger value="streak">💯 Streak</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
{/* 
      {/* Streak Graph */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Streak Progress (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={streakData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="streak" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div> */} 
      {/* Streak Graph */}
    
      <div className="mb-6">
  <h3 className="text-lg font-bold mb-2">Streak Progress (Last 7 Days)</h3>
  <ResponsiveContainer width="100%" height={80}>
    <BarChart data={streakData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="day" tickLine={false} axisLine={false} />
      <YAxis hide domain={[0, 1]} />
      <Tooltip />
      <Bar dataKey="streak" fill="#6366f1" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>

  {/* Streak Summary */}
  <div className="flex justify-between mt-4 px-2">
    {streakData.map((entry, index) => (
      <div
        key={index}
        className={`flex flex-col items-center text-sm ${
          entry.streak ? 'text-green-600' : 'text-gray-400'
        }`}
      >
        <span
          className={`px-3 py-1 rounded-full border ${
            entry.streak ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'
          }`}
        >
          {entry.streak ? '✔️' : '❌'}
        </span>
        <span className="mt-1 font-medium">{entry.day}</span>
      </div>
    ))}
  </div>
</div>


      {/* Badges */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Your Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center"
            >
              <span className="text-3xl mb-2 block">{getBadgeEmoji(badge.id)}</span>
              <h4 className="font-medium">{badge.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Form */}
      <form onSubmit={handleDonation} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Make a Donation
          </label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount in ETH"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit"
              disabled={isLoading || !donationAmount}
            >
              {isLoading ? 'Processing...' : 'Donate'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DonorProfile; 