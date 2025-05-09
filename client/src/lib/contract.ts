import { ethers } from 'ethers';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CampaignFormData, CampaignMetadata } from '@shared/types';

// ABI for the CrowdFunding contract
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_target",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_image",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_category",
        "type": "string"
      }
    ],
    "name": "createCampaign",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "donateToCampaign",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getCampaign",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "target",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountCollected",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "image",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "donators",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "donations",
            "type": "uint256[]"
          },
          {
            "internalType": "string",
            "name": "category",
            "type": "string"
          }
        ],
        "internalType": "struct CrowdFunding.Campaign",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaigns",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "target",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountCollected",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "image",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "donators",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "donations",
            "type": "uint256[]"
          },
          {
            "internalType": "string",
            "name": "category",
            "type": "string"
          }
        ],
        "internalType": "struct CrowdFunding.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getDonators",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numberOfCampaigns",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address for CrowdFunding smart contract
// This would normally be set based on deployment
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Using sepolia testnet for development - would use mainnet for production
export const chain = import.meta.env.VITE_USE_MAINNET === 'true' ? mainnet : sepolia;

// Initialize public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain,
  transport: http()
});

// Check if Web3 is available
export const checkIfWalletIsConnected = async (): Promise<string | null> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      console.log('No wallet found');
      return null;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error checking if wallet is connected:', error);
    return null;
  }
};

// Connect wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return null;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Initialize wallet client for writing to the blockchain
export const getWalletClient = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('No wallet found');
  }

  return createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });
};

// Create a campaign
export const createCampaign = async (form: CampaignFormData, address: string): Promise<number> => {
  try {
    if (!address) throw new Error('No wallet connected');

    // Initialize ethers provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Initialize contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Convert form data to contract parameters
    const ethersTarget = ethers.parseEther(form.target);
    const deadline = Math.floor(new Date(form.deadline).getTime() / 1000);
    
    // Call contract method
    const tx = await contract.createCampaign(
      address,
      form.title,
      form.description,
      ethersTarget,
      deadline,
      form.image,
      form.category
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Return the campaign ID
    const event = receipt.logs[0];
    return parseInt(event.topics[1], 16);
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Donate to a campaign
export const donateToCampaign = async (pId: number, amount: string): Promise<void> => {
  try {
    // Initialize ethers provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Initialize contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Convert amount to wei
    const ethersAmount = ethers.parseEther(amount);
    
    // Call contract method
    const tx = await contract.donateToCampaign(pId, { value: ethersAmount });
    
    // Wait for transaction to be mined
    await tx.wait();
  } catch (error) {
    console.error('Error donating to campaign:', error);
    throw error;
  }
};

// Get all campaigns
export const getCampaigns = async (): Promise<CampaignMetadata[]> => {
  try {
    // Initialize ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Initialize contract
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Call contract method
    const campaigns = await contract.getCampaigns();
    
    // Parse campaign data
    return campaigns.map((campaign: any, i: number) => ({
      owner: campaign[0],
      title: campaign[1],
      description: campaign[2],
      target: ethers.formatEther(campaign[3]),
      deadline: new Date(campaign[4] * 1000).toISOString(),
      amountCollected: ethers.formatEther(campaign[5]),
      image: campaign[6],
      donators: campaign[7],
      donations: campaign[8].map((donation: any) => ethers.formatEther(donation)),
      category: campaign[9],
      pId: i
    }));
  } catch (error) {
    console.error('Error getting campaigns:', error);
    throw error;
  }
};

// Get a single campaign
export const getCampaign = async (pId: number): Promise<CampaignMetadata> => {
  try {
    // Initialize ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Initialize contract
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Call contract method
    const campaign = await contract.getCampaign(pId);
    
    // Parse campaign data
    return {
      owner: campaign[0],
      title: campaign[1],
      description: campaign[2],
      target: ethers.formatEther(campaign[3]),
      deadline: new Date(campaign[4] * 1000).toISOString(),
      amountCollected: ethers.formatEther(campaign[5]),
      image: campaign[6],
      donators: campaign[7],
      donations: campaign[8].map((donation: any) => ethers.formatEther(donation)),
      category: campaign[9],
      pId
    };
  } catch (error) {
    console.error('Error getting campaign:', error);
    throw error;
  }
};

// Get donators for a campaign
export const getDonators = async (pId: number): Promise<{ donators: string[], donations: string[] }> => {
  try {
    // Initialize ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Initialize contract
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Call contract method
    const [donators, donations] = await contract.getDonators(pId);
    
    // Parse donation data
    return {
      donators,
      donations: donations.map((donation: any) => ethers.formatEther(donation))
    };
  } catch (error) {
    console.error('Error getting donators:', error);
    throw error;
  }
};

// Calculate days left for a campaign
export const calculateDaysLeft = (deadline: string): number => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);
  
  return remainingDays > 0 ? Math.ceil(remainingDays) : 0;
};
