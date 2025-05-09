import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { walletProviders } from '@/constants';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
}

const ConnectWalletModal = ({ isOpen, onClose, onConnect }: ConnectWalletModalProps) => {
  const handleConnect = async () => {
    await onConnect();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            Connect with one of our available wallet providers or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 my-4">
          {walletProviders.map((provider) => (
            <Button
              key={provider.name}
              variant="outline"
              className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 h-auto"
              onClick={handleConnect}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-3">
                  <i className={`${provider.icon} text-white`}></i>
                </div>
                <span className="font-medium">{provider.name}</span>
              </div>
              <i className="ri-arrow-right-line"></i>
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
