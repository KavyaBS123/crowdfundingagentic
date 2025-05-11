import DonorLeaderboard from '@/components/DonorLeaderboard';
import DonorProfile from '@/components/DonorProfile';
import TopDonors from '@/components/TopDonors';

const DonorDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Donor Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <DonorProfile />
          <TopDonors />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          <DonorLeaderboard />
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-campaign">
            <h3 className="text-lg font-bold mb-4">🎯 Daily Challenges</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Donate to 2 campaigns</span>
                  <span className="text-primary font-bold">+200 XP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '50%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">1/2 completed</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Maintain 7-day streak</span>
                  <span className="text-primary font-bold">+500 XP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '71%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">5/7 days completed</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Share 3 campaigns</span>
                  <span className="text-primary font-bold">+150 XP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '33%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">1/3 completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard; 