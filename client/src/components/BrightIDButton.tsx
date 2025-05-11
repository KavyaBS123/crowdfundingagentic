import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BrightIDButtonProps {
  address: string;
  onVerificationComplete: () => void;
}

const BrightIDButton = ({ address, onVerificationComplete }: BrightIDButtonProps) => {
  const { toast } = useToast();

  const handleBrightIDVerification = async () => {
    try {
      // Open BrightID verification in a new window
      const brightIdUrl = `https://www.brightid.org/`;
      window.open(brightIdUrl, '_blank');

      // Start polling for verification status
      const checkVerification = async () => {
        try {
          const response = await fetch(`https://app.brightid.org/node/v5/verifications/Crowdfund3r/${address}`);
          const data = await response.json();
          
          if (data.data && data.data.unique) {
            onVerificationComplete();
            toast({
              title: "Verification Successful",
              description: "Your BrightID verification has been completed.",
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error checking BrightID verification:', error);
          return false;
        }
      };

      // Poll every 5 seconds for up to 2 minutes
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes total
      
      const pollInterval = setInterval(async () => {
        attempts++;
        const isVerified = await checkVerification();
        
        if (isVerified || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          if (!isVerified) {
            toast({
              title: "Verification Timeout",
              description: "Please complete the verification process and try again.",
              variant: "destructive",
            });
          }
        }
      }, 5000);

    } catch (error) {
      console.error('Error initiating BrightID verification:', error);
      toast({
        title: "Verification Error",
        description: "Failed to start BrightID verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleBrightIDVerification}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
    >
      <i className="ri-shield-check-line mr-2"></i>
      Verify with BrightID
    </Button>
  );
};

export default BrightIDButton; 