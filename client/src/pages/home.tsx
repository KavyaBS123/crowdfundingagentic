import CampaignCard from '@/components/CampaignCard';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import Loader from '@/components/Loader';
import { categories, howItWorksData, statsData, web3BenefitsData } from '@/constants';
import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { getCampaigns } from '@/lib/contract';
import { CampaignMetadata } from '@shared/types';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignMetadata[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const { address, connect } = useThirdweb();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const allCampaigns = await getCampaigns();
        setCampaigns(allCampaigns);
        setFilteredCampaigns(allCampaigns);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchCampaigns();
    } else {
      // Show some dummy campaigns if wallet not connected
      setIsLoading(false);
      setCampaigns([]);
      setFilteredCampaigns([]);
    }
  }, [address]);

  useEffect(() => {
    // Filter campaigns based on search term and category
    const filtered = campaigns.filter((campaign) => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'All Categories' || campaign.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredCampaigns(filtered);
  }, [searchTerm, activeCategory, campaigns]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleConnectWallet = async () => {
    setIsWalletModalOpen(true);
  };

  return (
    <div className="mb-12 md:mb-16">
      {/* Hero Section */}
      <section className="mb-12 md:mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span>Decentralized </span>
              <span className="gradient-text">Funding</span>
              <span> for Everyone</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Fund innovative ideas, creative projects, and causes you care about using blockchain technology.
              Transparent, secure, and accessible.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleConnectWallet}
                className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
              >
                {address ? 'Start Funding' : 'Connect Wallet'}
              </button>
              <Link 
                href="/create-campaign" 
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Create Campaign
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              {statsData.map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl font-bold">{stat.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1607359390930-206a99777fa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=500" 
              alt="Blockchain Crowdfunding Illustration" 
              className="rounded-3xl shadow-xl w-full h-auto"
            />
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="ri-secure-payment-line text-primary text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Secured by</p>
                  <p className="font-medium">Blockchain Technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Browse Campaigns</h2>
          <div className="hidden md:flex items-center space-x-2 overflow-x-auto">
            {categories.map((category, index) => (
              <button 
                key={index}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <select 
            className="md:hidden bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-sm"
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <input 
            type="search" 
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Search for campaigns..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <Loader />
      ) : !address ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-wallet-3-line text-primary text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Connect your wallet to browse and fund campaigns.
          </p>
          <button 
            onClick={handleConnectWallet}
            className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCampaigns.map((campaign, i) => (
            <CampaignCard key={i} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-search-line text-primary text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">No campaigns found</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {searchTerm || activeCategory !== 'All Categories' ? 
              'Try changing your search or filter criteria.' : 
              'Be the first to create a campaign!'}
          </p>
          {!searchTerm && activeCategory === 'All Categories' && (
            <Link 
              href="/create-campaign" 
              className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
            >
              Create Campaign
            </Link>
          )}
        </div>
      )}

      {/* Load More Button */}
      {filteredCampaigns.length > 6 && (
        <div className="flex justify-center mb-16">
          <button className="px-6 py-3 border border-primary text-primary rounded-full font-medium hover:bg-primary/5 transition-all">
            Load More Campaigns
          </button>
        </div>
      )}
      
      {/* How It Works Section */}
      <section className="mb-16 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our platform makes crowdfunding with blockchain technology simple and transparent for everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`${item.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Web3 Benefits Section */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Why Use Blockchain for Crowdfunding?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Traditional crowdfunding platforms have intermediaries, high fees, and limited transparency. 
              Our Web3 approach offers significant advantages:
            </p>
            
            <ul className="space-y-4">
              {web3BenefitsData.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <i className="ri-check-line text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-bold">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&h=600" 
              alt="Blockchain Technology Illustration" 
              className="rounded-3xl w-full h-auto shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        onConnect={connect}
      />
    </div>
  );
};

export default HomePage;
