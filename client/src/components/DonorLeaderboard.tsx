import { useDonorXP } from '@/hooks/useDonorXP';

const DonorLeaderboard = () => {
  const { donorData } = useDonorXP();
  if (!donorData) return null;
  const levelTitles = [
    { title: "Supporter", icon: "🤝", minXp: 0 },
    { title: "Advocate", icon: "💪", minXp: 1000 },
    { title: "Hero", icon: "🦸", minXp: 2500 },
    { title: "Champion", icon: "🏆", minXp: 5000 },
    { title: "Legend", icon: "🌟", minXp: 10000 }
  ];
  const currentLevelTitle = levelTitles.find(level => donorData.xp >= level.minXp) || levelTitles[0];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign">
      <h3 className="text-lg font-bold mb-4">Your Donor Stats</h3>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{currentLevelTitle.icon}</span>
        <span className="font-bold">{currentLevelTitle.title}</span>
        <span className="text-sm text-gray-500">Level {donorData.currentLevel}</span>
      </div>
      <div className="mt-2">
        <span className="font-bold text-primary">{donorData.xp} XP</span>
      </div>
      <div className="text-sm text-gray-500 mt-1">{donorData.streakCount} day streak</div>
    </div>
  );
};

export default DonorLeaderboard; 