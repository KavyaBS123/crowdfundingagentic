import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CampaignMetadata, Reward, FAQ, CampaignUpdate, CampaignComment } from '@shared/types';
import { useThirdweb } from '@/context/ThirdwebContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CampaignTabsProps {
  campaign: CampaignMetadata;
  onUpdate: () => void;
}

const CampaignTabs = ({ campaign, onUpdate }: CampaignTabsProps) => {
  const [activeTab, setActiveTab] = useState('rewards');
  const [newComment, setNewComment] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address } = useThirdweb();
  const { toast } = useToast();

  const tabs = [
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'creator', label: 'Creator', icon: '👤' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'updates', label: 'Updates', icon: '📢' },
    { id: 'comments', label: 'Comments', icon: '💬' },
    { id: 'community', label: 'Community', icon: '👥' }
  ];

  const handleAddComment = async () => {
    if (!newComment.trim() || !address) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/campaigns/${campaign.pId}/comments`, 'POST', {
        user: address,
        comment: newComment
      });
      
      setNewComment('');
      onUpdate();
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !address) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/campaigns/${campaign.pId}/updates`, 'POST', {
        content: newUpdate
      });
      
      setNewUpdate('');
      onUpdate();
      toast({
        title: 'Update posted',
        description: 'Your update has been posted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post update. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRewards = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Campaign Rewards</h3>
      {campaign.rewards && campaign.rewards.length > 0 ? (
        <div className="grid gap-4">
          {campaign.rewards.map((reward: Reward, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{reward.title}</h4>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {reward.minimumAmount} ETH
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {reward.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No rewards available for this campaign.</p>
      )}
    </div>
  );

  const renderCreator = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">About the Creator</h3>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <i className="ri-user-3-line text-gray-600 dark:text-gray-300 text-xl"></i>
        </div>
        <div>
          <h4 className="font-medium">{campaign.owner.substring(0, 6)}...{campaign.owner.substring(campaign.owner.length - 4)}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Campaign Creator</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {campaign.creatorVerified ? 'Verified Creator' : 'Unverified Creator'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
      {campaign.faq && campaign.faq.length > 0 ? (
        <div className="space-y-4">
          {campaign.faq.map((faq: FAQ, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No FAQ available for this campaign.</p>
      )}
    </div>
  );

  const renderUpdates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Campaign Updates</h3>
        {campaign.owner.toLowerCase() === address?.toLowerCase() && (
          <Button size="sm" onClick={() => setActiveTab('add-update')}>
            Add Update
          </Button>
        )}
      </div>
      
      {activeTab === 'add-update' && campaign.owner.toLowerCase() === address?.toLowerCase() ? (
        <div className="space-y-4">
          <Textarea
            placeholder="Share an update about your campaign..."
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            rows={4}
          />
          <div className="flex space-x-2">
            <Button onClick={handleAddUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Update'}
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('updates')}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {campaign.updates && campaign.updates.length > 0 ? (
            <div className="space-y-4">
              {campaign.updates.map((update: CampaignUpdate, index: number) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{update.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No updates available for this campaign.</p>
          )}
        </>
      )}
    </div>
  );

  const renderComments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      
      {address && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {campaign.comments && campaign.comments.length > 0 ? (
          campaign.comments.map((comment: CampaignComment, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">
                  {comment.user.substring(0, 6)}...{comment.user.substring(comment.user.length - 4)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{comment.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Community</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {campaign.community?.backers || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Backers</div>
        </div>
        <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {campaign.community?.discussions || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Discussions</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'rewards':
        return renderRewards();
      case 'creator':
        return renderCreator();
      case 'faq':
        return renderFAQ();
      case 'updates':
        return renderUpdates();
      case 'comments':
        return renderComments();
      case 'community':
        return renderCommunity();
      default:
        return renderRewards();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-campaign">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default CampaignTabs; 