import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkIfWalletIsConnected, connectWallet } from '@/lib/contract';
import { WalletInfo } from '@shared/types';
import { ethers } from 'ethers';

interface ThirdwebContextType {
  address: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const ThirdwebContext = createContext<ThirdwebContextType>({
  address: null,
  balance: '0',
  connect: async () => {},
  disconnect: () => {},
  isLoading: false,
});

export const useThirdweb = () => useContext(ThirdwebContext);

interface ThirdwebProviderProps {
  children: ReactNode;
}

export const ThirdwebProvider = ({ children }: ThirdwebProviderProps) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    balance: '0',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const updateWalletInfo = async (address: string) => {
    if (address) {
      try {
        // Get account balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        
        setWalletInfo({
          address,
          balance: formattedBalance,
        });
      } catch (error) {
        console.error('Error updating wallet info:', error);
      }
    } else {
      setWalletInfo({
        address: '',
        balance: '0',
      });
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setWalletInfo({
        address: '',
        balance: '0',
      });
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet has been disconnected.',
        variant: 'destructive',
      });
    } else {
      // User changed their account
      updateWalletInfo(accounts[0]);
      toast({
        title: 'Account changed',
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const address = await checkIfWalletIsConnected();
        if (address) {
          await updateWalletInfo(address);
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Setup event listeners for wallet
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connect = async () => {
    try {
      setIsLoading(true);
      const address = await connectWallet();
      
      if (address) {
        await updateWalletInfo(address);
        toast({
          title: 'Wallet connected',
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWalletInfo({
      address: '',
      balance: '0',
    });
    
    toast({
      title: 'Wallet disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  return (
    <ThirdwebContext.Provider
      value={{
        address: walletInfo.address || null,
        balance: walletInfo.balance,
        connect,
        disconnect,
        isLoading,
      }}
    >
      {children}
    </ThirdwebContext.Provider>
  );
};
