import { useState, useRef, useEffect } from 'react';
import { useThirdweb } from '@/context/ThirdwebContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAIAssistance } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

interface GptAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GptAssistant = ({ isOpen, onClose }: GptAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm your campaign assistant. I can help you craft a compelling campaign pitch, estimate realistic funding goals, and set up milestones. What would you like help with today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useThirdweb();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to use the AI assistant.',
        variant: 'destructive',
      });
      return;
    }
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Dummy user ID (in a real app, this would come from authentication)
      const userId = 1;
      
      // Get AI response
      const response = await getAIAssistance(input, userId);
      
      // Format AI response
      let assistantContent = '';
      
      if (response.campaignPitch) {
        assistantContent = response.campaignPitch;
      } else if (response.goalEstimate) {
        assistantContent = `Here's my funding goal recommendation:
        
Min: ${response.goalEstimate.min} ETH
Max: ${response.goalEstimate.max} ETH
Recommended: ${response.goalEstimate.recommendedAmount} ETH

${response.goalEstimate.rationale}`;
      } else if (response.milestones && response.milestones.length > 0) {
        assistantContent = `Here are some suggested milestones for your campaign:\n\n${
          response.milestones.map((milestone, index) => 
            `${index + 1}. ${milestone.name} (${milestone.timeframe})
            ${milestone.description}`
          ).join('\n\n')
        }`;
      } else {
        // If response is an object but doesn't match expected format
        assistantContent = JSON.stringify(response, null, 2);
      }
      
      // Add assistant message
      const assistantMessage = { role: 'assistant' as const, content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      
      // Add error message
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error processing your request. Please try again later.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to get AI assistance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 right-4 z-40 w-full max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-gradient-primary flex justify-between items-center">
          <h3 className="text-white font-bold">Campaign Assistant</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <i className="ri-close-line"></i>
          </Button>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 space-y-4" id="assistantMessages">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start ${message.role === 'assistant' ? '' : 'justify-end'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mr-2">
                  <i className="ri-robot-line text-white text-sm"></i>
                </div>
              )}
              <div className={`${
                message.role === 'assistant' 
                  ? 'bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none' 
                  : 'bg-primary text-white rounded-2xl rounded-tr-none'
              } p-3 max-w-[85%] whitespace-pre-line`}>
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 ml-2">
                  <i className="ri-user-line text-gray-600 dark:text-gray-300 text-sm"></i>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Input 
              type="text" 
              placeholder="Ask the assistant..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit"
              className="ml-2 p-2 bg-gradient-primary rounded-full text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-send-plane-fill"></i>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GptAssistant;
