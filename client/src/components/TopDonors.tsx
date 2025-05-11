import { apiRequest } from '@/lib/queryClient';
import { useEffect, useState } from 'react';

interface TopDonor {
  address: string;
  totalDonated: number;
  streakCount: number;
  badges: string[];
  level: number;
}

const TopDonors = () => {
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopDonors = async () => {
      try {
        const response = await apiRequest('/api/donors/top', 'GET');
        setTopDonors(response.donors || []);
      } catch (error) {
        console.error('Error fetching top donors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopDonors();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading top donors...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign">
      <h3 className="text-lg font-bold mb-4">🏆 Top Donors</h3>
      <div className="space-y-4">
        {topDonors.map((donor, index) => (
          <div key={donor.address} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>

           
              <div>
                <p className="font-medium">{donor.address.substring(0, 6)}...{donor.address.substring(donor.address.length - 4)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {donor.badges.map((badge, i) => (
                    <span key={i} className="text-sm">{badge}</span>
                  ))}
                  {donor.streakCount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      🔥 {donor.streakCount} day streak
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{donor.totalDonated.toFixed(2)} ETH</p>
              <p className="text-xs text-gray-500">Level {donor.level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDonors; 