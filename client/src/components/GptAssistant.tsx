import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';

interface GptAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const chatbotFAQ: { question: string; answer: string }[] = [
  {
    question: "How can you help me craft better campaign pitches?",
    answer: "I can guide you on how to write a clear, compelling campaign pitch by helping you explain your project's purpose, the problem it solves, who benefits, and why it's important. I can also review your draft and suggest improvements."
  },
  {
    question: "How can you help me estimate funding goals?",
    answer: "I can help you estimate a realistic funding goal by guiding you to list all expected costs, add a buffer for unexpected expenses, and research similar campaigns for benchmarks."
  },
  {
    question: "How can you help me set up milestones?",
    answer: "I can help you break your project into key phases or deliverables. Each milestone should have a clear objective, timeline, and measurable outcome. I can suggest example milestones and help you structure them for your campaign."
  },
  {
    question: "What is the goal of the Mental Health Hotline campaign?",
    answer: "The goal is to provide a free, 24/7 mental health support hotline for individuals in crisis, connecting them with trained counselors and resources to save lives and promote mental well-being."
  },
  {
    question: "How will the funds be used?",
    answer: "Funds will be used to hire and train counselors, maintain the hotline infrastructure, run outreach programs, and provide free resources to those in need."
  },
  {
    question: "Who will benefit from this campaign?",
    answer: "Anyone experiencing mental health challenges, especially those who cannot afford private therapy or are in urgent need of support, will benefit from this hotline."
  },
  {
    question: "How can I help beyond donating?",
    answer: "You can help by sharing the campaign, volunteering as a counselor if qualified, or spreading awareness about mental health in your community."
  },
  {
    question: "Is my donation tax-deductible?",
    answer: "Yes, all donations to this campaign are tax-deductible. You will receive a receipt after your donation."
  },
  {
    question: "How do I craft a better campaign pitch?",
    answer: "To craft a better campaign pitch, clearly explain your project's purpose, the problem it solves, who benefits, and why it's important. Use simple language, share your passion, and include a call to action."
  },
  {
    question: "How can I estimate a realistic funding goal?",
    answer: "Estimate your funding goal by listing all expected costs (development, marketing, operations, etc.), adding a buffer for unexpected expenses, and researching similar campaigns for benchmarks."
  },
  {
    question: "How do I set up effective milestones?",
    answer: "Break your project into key phases or deliverables. Each milestone should have a clear objective, timeline, and measurable outcome. This helps build trust and keeps backers updated on your progress."
  },
  {
    question: "What is crowdfunding?",
    answer: "Crowdfunding is a way of raising money from a large number of people, typically via the internet, to fund a project or venture."
  },
  {
    question: "How do I start a campaign?",
    answer: "To start a campaign, click on 'Create Campaign', fill in the required details, and submit your campaign for review."
  },
  {
    question: "How can I contact support?",
    answer: "You can contact support by emailing support@crowdchain.com or using the contact form on our website."
  }
];

const GptAssistant = ({ isOpen, onClose }: GptAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Assistant: Hi there! I'm your campaign assistant. Ask me anything about crowdfunding, campaign creation, or our Mental Health Hotline campaign.",
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: `You: ${input}` };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Find the best matching FAQ (case-insensitive substring match)
    const matchedQA = chatbotFAQ.find(qa =>
      input.toLowerCase().includes(qa.question.toLowerCase()) ||
      qa.question.toLowerCase().includes(input.toLowerCase())
    );

    let assistantContent = '';
    if (matchedQA) {
      assistantContent = matchedQA.answer;
    } else if (input.trim().toLowerCase() === 'show faqs') {
      assistantContent = chatbotFAQ
        .map((qa, idx) => `${idx + 1}. Q: ${qa.question}\nA: ${qa.answer}`)
        .join('\n\n');
    } else {
      assistantContent = "Sorry, I don't have an answer for that. Try asking about campaign creation, funding, milestones, or type 'show faqs' to see all questions.";
    }

    const assistantMessage: Message = { role: 'assistant', content: `Assistant: ${assistantContent}` };
    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500); // Simulate a short delay for realism
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 right-4 z-40 w-full max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-gradient-primary flex justify-between items-center">
          <h3 className="text-white font-bold">Campaign Assistant</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <i className="ri-close-line"></i>
          </Button>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-4" id="assistantMessages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${message.role === 'assistant' ? '' : 'justify-end'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mr-2">
                  <i className="ri-robot-line text-white text-sm"></i>
                </div>
              )}
              <div
                className={`${
                  message.role === 'assistant'
                    ? 'bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none'
                    : 'bg-primary text-white rounded-2xl rounded-tr-none'
                } p-3 max-w-[85%] whitespace-pre-line`}
              >
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
              {isLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-fill"></i>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GptAssistant;
