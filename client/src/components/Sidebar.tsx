import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { navLinks } from '@/constants';
import GptAssistant from './GptAssistant';

const TopCampaignItem = ({ 
  image, 
  title, 
  progress, 
  id 
}: { 
  image: string; 
  title: string; 
  progress: number; 
  id: number; 
}) => (
  <li>
    <Link href={`/campaign-details/${id}`} className="flex items-start">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="ml-3">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="flex items-center mt-1">
          <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">{progress}%</span>
        </div>
      </div>
    </Link>
  </li>
);

const Sidebar = () => {
  const [isGptAssistantOpen, setIsGptAssistantOpen] = useState(false);
  const [location] = useLocation();

  const topCampaigns = [
    {
      id: 1,
      title: 'Solar for All',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
      progress: 75
    },
    {
      id: 2,
      title: 'Community Garden',
      image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
      progress: 45
    }
  ];

  const toggleGptAssistant = () => {
    setIsGptAssistantOpen(!isGptAssistantOpen);
  };

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="py-6 px-4">
          {/* Menu Links */}
          <div className="mb-8">
            <h3 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">Menu</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                      location === link.path 
                        ? 'text-primary bg-primary/10 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <i className={`${link.icon} mr-3 text-lg`}></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Top Campaigns */}
          <div className="mb-8">
            <h3 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">Top Campaigns</h3>
            <ul className="space-y-4">
              {topCampaigns.map((campaign) => (
                <TopCampaignItem 
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  image={campaign.image}
                  progress={campaign.progress}
                />
              ))}
            </ul>
          </div>
          
          {/* AI Assistant Promo */}
          <div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-primary text-white">
              <h3 className="font-bold mb-2">Need help?</h3>
              <p className="text-sm mb-3">Our AI assistant can help you create better campaigns</p>
              <button 
                onClick={toggleGptAssistant}
                className="w-full py-2 bg-white text-primary rounded-lg text-sm font-medium"
              >
                Open Assistant
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* GPT Assistant Modal */}
      <GptAssistant 
        isOpen={isGptAssistantOpen} 
        onClose={() => setIsGptAssistantOpen(false)}
      />
    </>
  );
};

export default Sidebar;
