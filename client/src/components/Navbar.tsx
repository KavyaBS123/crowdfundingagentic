import { useThirdweb } from '@/context/ThirdwebContext';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import ConnectWalletModal from './ConnectWalletModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  
  const { address, connect } = useThirdweb();
  const [location] = useLocation();

  // Handle scroll event to add shadow to navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Toggle wallet connection modal
  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  // Handle wallet connection
  const handleWalletConnect = async () => {
    if (!address) {
      toggleWalletModal();
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 fixed top-0 left-0 right-0 z-30 transition-shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-hand-heart-line text-white"></i>
              </div>
              <span className="ml-2 text-xl font-bold dark:text-white text-gray-900">CrowdChain</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="search" 
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search for campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </form>
          </div>

          {/* Right side Nav Items */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              <i className={`${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </button>
            
            {/* Connect Wallet Button - Desktop */}
            {!address ? (
              <button 
                onClick={handleWalletConnect}
                className="hidden md:flex items-center px-4 py-2 rounded-full bg-gradient-primary text-white font-medium"
              >
                <i className="ri-wallet-3-line mr-2"></i>
                Connect Wallet
              </button>
            ) : (
              <button 
                className="hidden md:flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
              >
                {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
              </button>
            )}
            
            {/* Create Campaign Link - Desktop */}
            <Link 
              href="/create-campaign" 
              className="hidden md:block font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary"
            >
              Create a Campaign
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isSearchOpen ? (
                <i className="ri-close-line"></i>
              ) : (
                <i className="ri-search-line"></i>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-3 px-2 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="search" 
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search for campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Connect Wallet Modal */}
      <ConnectWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        onConnect={connect}
      />
    </nav>
  );
};

export default Navbar;
