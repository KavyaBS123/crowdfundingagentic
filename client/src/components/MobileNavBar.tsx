import { Link, useLocation } from 'wouter';
import { navLinks } from '@/constants';

const MobileNavBar = () => {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => (
          <Link 
            key={link.name}
            href={link.path} 
            className={`flex flex-col items-center justify-center ${
              location === link.path 
                ? 'text-primary' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <i className={`${link.icon} text-xl`}></i>
            <span className="text-xs mt-1">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;
