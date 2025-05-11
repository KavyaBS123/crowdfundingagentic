import { calculateDaysLeft } from '@/lib/contract';
import { CampaignMetadata } from '@shared/types';
import { Link } from 'wouter';
import VerificationBadge from './VerificationBadge';

interface CampaignCardProps {
  campaign: CampaignMetadata;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const daysLeft = calculateDaysLeft(campaign.deadline);
  
  // Calculate progress percentage
  const progress = (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100;
  const formattedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  
  // Handle campaign verification status
  const requiresVerification = campaign.requiresVerification ?? true; // Default to true if not specified
  const isVerified = campaign.creatorVerified ?? false; // Default to false if not specified
  const verificationMethod = campaign.verificationMethod || null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-campaign">
      <img 
        src={campaign.image} 
        alt={campaign.title} 
        className="w-full h-48 object-cover"
      />
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
            {campaign.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </span>
        </div>
        
        <div className="mb-2">
          <VerificationBadge 
            isVerified={isVerified}
            requiresVerification={requiresVerification}
            method={verificationMethod}
            className="mt-1"
          />
        </div>
        
        <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progress</span>
            <span>{formattedProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${formattedProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold">{parseFloat(campaign.amountCollected).toFixed(2)} ETH</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of {campaign.target} ETH</p>
          </div>
          <Link 
            href={`/campaign-details/${campaign.pId}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
