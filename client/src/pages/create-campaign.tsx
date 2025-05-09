import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import CustomFormField from '@/components/FormField';
import Loader from '@/components/Loader';
import { createCampaign } from '@/lib/contract';
import { categories } from '@/constants';
import { getPitchSuggestion, getFundingGoalEstimation, getMilestoneSuggestions } from '@/lib/openai';
import GptAssistant from '@/components/GptAssistant';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import VerifyUserDialog from '@/components/VerifyUserDialog';
import { apiRequest } from '@/lib/queryClient';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  target: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Target amount must be a positive number',
  }),
  deadline: z.date().refine((date) => date > new Date(), {
    message: 'Deadline must be in the future',
  }),
  image: z.string().min(5, 'Please provide a valid image URL'),
  category: z.string().min(1, 'Please select a category'),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCampaign = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGptHelping, setIsGptHelping] = useState(false);
  const [isGptAssistantOpen, setIsGptAssistantOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userVerified, setUserVerified] = useState(false);
  
  const { address, connect } = useThirdweb();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      target: '',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      image: '',
      category: '',
    },
  });

  // Check if user exists and get verification status
  useEffect(() => {
    const checkUser = async () => {
      if (!address) return;
      
      try {
        const response = await apiRequest(`/api/users/address/${address}`, 'GET');
        if (response && response.id) {
          setUserId(response.id);
          setUserVerified(!!response.isVerified);
        } else {
          // User doesn't exist, create one
          try {
            const newUser = await apiRequest('/api/users', 'POST', {
              username: `user_${address.substring(2, 8)}`,
              address,
              avatar: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
            });
            if (newUser && newUser.id) {
              setUserId(newUser.id);
              setUserVerified(!!newUser.isVerified);
            }
          } catch (createError) {
            console.error('Error creating user:', createError);
          }
        }
      } catch (error) {
        // User not found, but that's okay
        console.log('User not found or other error:', error);
      }
    };
    
    checkUser();
  }, [address]);

  const handleVerificationComplete = () => {
    setUserVerified(true);
    setIsVerifyDialogOpen(false);
    toast({
      title: 'Verification Successful',
      description: 'Your identity has been verified. You can now create campaigns.',
    });
  };

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (!address) {
      handleConnectWallet();
      return;
    }

    // Check BrightID verification first
    try {
      const brightIdResponse = await fetch(`https://app.brightid.org/node/v5/verifications/Crowdfund3r/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const brightIdData = await brightIdResponse.json();
      
      if (!brightIdData.data || !brightIdData.data.unique) {
        toast({
          title: "Verification Required",
          description: "You must be verified on BrightID to create a campaign",
          variant: "destructive",
        });
        setIsVerifyDialogOpen(true);
        return;
      }
    } catch (error) {
      console.error('Error checking BrightID verification:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify BrightID status. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is verified
    if (!userVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify your identity before creating a campaign",
        variant: "destructive",
      });
      setIsVerifyDialogOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create campaign on blockchain
      await createCampaign(values, address);
      
      // Also create in our backend for verification data
      try {
        await apiRequest('/api/campaigns', 'POST', {
          title: values.title,
          description: values.description,
          target: values.target,
          deadline: values.deadline.toISOString(),
          image: values.image,
          category: values.category,
          owner: address,
          requiresVerification: true,
          creatorVerified: true,
          verificationMethod: "BrightID", // Default to BrightID for simplicity
        });
      } catch (backendError) {
        console.error('Error creating campaign in backend:', backendError);
        // Continue even if backend creation fails
      }
      
      toast({
        title: 'Success!',
        description: 'Your campaign has been created successfully.',
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Assistant Functions
  const handleGetPitchSuggestion = async () => {
    const { title, category } = form.getValues();
    
    if (!title) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title for your campaign.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGptHelping(true);
    
    try {
      // Dummy user ID (in a real app, this would come from authentication)
      const userId = 1;
      
      const suggestion = await getPitchSuggestion(
        title,
        category || 'general audience',
        userId
      );
      
      if (suggestion) {
        form.setValue('description', suggestion);
      }
    } catch (error) {
      console.error('Error getting pitch suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to get pitch suggestion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGptHelping(false);
    }
  };

  const handleGetFundingEstimation = async () => {
    const { title, description } = form.getValues();
    
    if (!title || !description) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and description for your campaign.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGptHelping(true);
    
    try {
      // Dummy user ID (in a real app, this would come from authentication)
      const userId = 1;
      
      const estimation = await getFundingGoalEstimation(
        title,
        description,
        '3 months',
        userId
      );
      
      if (estimation) {
        form.setValue('target', estimation.recommended);
        
        toast({
          title: 'Funding Goal Estimation',
          description: `Recommended: ${estimation.recommended} ETH. ${estimation.rationale}`,
        });
      }
    } catch (error) {
      console.error('Error getting funding estimation:', error);
      toast({
        title: 'Error',
        description: 'Failed to get funding estimation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGptHelping(false);
    }
  };

  const handleOpenGptAssistant = () => {
    setIsGptAssistantOpen(true);
  };

  // Display a form to create a new campaign
  if (!address) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-wallet-3-line text-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Connect your wallet to create a campaign.
        </p>
        <Button 
          onClick={handleConnectWallet}
          className="px-6 py-3 bg-gradient-primary rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-all"
        >
          Connect Wallet
        </Button>
        
        <ConnectWalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
          onConnect={connect}
        />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-campaign">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Create a Campaign</h1>
        
        <div className="mb-8 p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold mb-1">Need help with your campaign?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our AI assistant can help you craft better campaign pitches, estimate funding goals, and set up milestones.
              </p>
            </div>
            <Button
              onClick={handleOpenGptAssistant}
              className="bg-gradient-primary rounded-full text-white self-start"
            >
              Open AI Assistant
            </Button>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CustomFormField
                  form={form}
                  name="title"
                  labelText="Campaign Title"
                  placeholder="Write a catchy title"
                />
                
                <CustomFormField
                  form={form}
                  name="category"
                  labelText="Category"
                  placeholder="Select a category"
                  isSelect={true}
                  options={categories.filter(cat => cat !== 'All Categories').map(cat => ({ label: cat, value: cat }))}
                />
                
                <CustomFormField
                  form={form}
                  name="target"
                  labelText="Target Amount (ETH)"
                  placeholder="0.50"
                />
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <CustomFormField
                      form={form}
                      name="deadline"
                      labelText="End Date"
                      placeholder="End Date"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGetFundingEstimation}
                    disabled={isGptHelping}
                    className="mb-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {isGptHelping ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <i className="ri-ai-generate"></i>
                    )}
                    <span className="ml-2 hidden md:inline">Estimate Goal</span>
                  </Button>
                </div>
                
                <CustomFormField
                  form={form}
                  name="image"
                  labelText="Campaign Image URL"
                  placeholder="Place image URL of your campaign"
                />
              </div>
              
              <div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <CustomFormField
                      form={form}
                      name="description"
                      labelText="Story"
                      placeholder="Write your campaign story"
                      isTextArea={true}
                      description="Tell your story and explain why you're raising funds"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGetPitchSuggestion}
                    disabled={isGptHelping}
                    className="mb-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {isGptHelping ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <i className="ri-ai-generate"></i>
                    )}
                    <span className="ml-2 hidden md:inline">Generate Pitch</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-6 bg-gradient-primary rounded-full text-white font-medium"
              >
                {isSubmitting ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i> Creating Campaign</>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      {/* GPT Assistant Modal */}
      <GptAssistant 
        isOpen={isGptAssistantOpen} 
        onClose={() => setIsGptAssistantOpen(false)}
      />
      
      <ConnectWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        onConnect={connect}
      />

      {/* Verification Dialog */}
      {userId && (
        <VerifyUserDialog
          isOpen={isVerifyDialogOpen}
          onClose={() => setIsVerifyDialogOpen(false)}
          userId={userId}
          userAddress={address || ''}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default CreateCampaign;
