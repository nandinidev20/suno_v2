import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stripeAPI } from '../utils/api';
import { Crown, Zap, Infinity, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionStatus = () => {
  const { isAuthenticated } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
    }
  }, [isAuthenticated]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await stripeAPI.getSubscriptionStatus();
      
      if (response.data.success) {
        setSubscriptionInfo(response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'basic':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'lifetime':
        return <Infinity className="h-5 w-5 text-yellow-500" />;
      default:
        return <Zap className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'basic':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'pro':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'lifetime':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!subscriptionInfo) {
    return null;
  }

  const { subscription } = subscriptionInfo;
  const isFreeTier = !subscription || subscription.planType === 'free';

  return (
    <section className="price-section section-padding">
      <div className="container">
        <h2>Current Subscription</h2>
        <p>Your active plan details and usage</p>

        <div className="pricing">
          <div className={`plan ${subscription?.planType === 'basic' ? 'green' : ''} ${subscription?.planType === 'pro' ? 'pro' : ''}`}>
            <div className="plan-box">
              <h3>{subscription?.planDetails?.name?.toUpperCase() || 'FREE'}</h3>
              <p className={subscription?.planType === 'basic' ? 'black-font' : 'grey-font'}>
                {subscription?.planDetails?.description || '3 songs per day'}
              </p>
              <div className="price">
                ${subscription?.planDetails?.price || 0}
                {subscription?.planType !== 'lifetime' && <sub>/MO</sub>}
              </div>
            </div>
            
            <div className="status-info">
              <div className="flex items-center space-x-2 mb-3">
                {subscription?.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm text-gray-300 capitalize">
                  {subscription?.status || 'Active'}
                </span>
              </div>
              
              <p className={subscription?.planType === 'basic' ? '' : 'grey-font'}>
                ${subscription?.planDetails?.price || 0} per user / month
              </p>
            </div>

            {/* Usage Progress */}
            <div className="usage-progress">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Songs Generated</span>
                <span className="text-sm text-gray-300">
                  {subscription?.songsUsed || subscriptionInfo.dailyCount || 0} / {subscription?.songsLimit || 3}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    subscription?.planType === 'lifetime' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    subscription?.planType === 'pro' ? 'bg-purple-500' :
                    subscription?.planType === 'basic' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, ((subscription?.songsUsed || subscriptionInfo.dailyCount || 0) / (subscription?.songsLimit || 3)) * 100)}%` 
                  }}
                />
              </div>

              <div className="text-xs text-gray-400 mb-4">
                {subscription?.remainingSongs !== undefined ? (
                  `${subscription.remainingSongs} songs remaining`
                ) : (
                  `${Math.max(0, (subscription?.songsLimit || 3) - (subscription?.songsUsed || subscriptionInfo.dailyCount || 0))} songs remaining`
                )}
              </div>
            </div>

            {/* Features */}
            <ul className={subscription?.planType === 'basic' ? 'basic' : subscription?.planType === 'pro' ? 'pro' : ''}>
              <li>
                {subscription?.songsLimit === 500 ? '500 songs/month' : 
                 subscription?.songsLimit === 1000 ? '1,000 songs' : 
                 `${subscription?.songsLimit || 3} songs`}
              </li>
              <li>
                {subscription?.planType === 'lifetime' ? 'Unlimited (fair use)' : 'Full song generation'}
              </li>
              <li>
                {subscription?.includesWav ? 'High-quality WAV exports' : 'MP3 exports only'}
              </li>
              <li>
                {subscription?.includesStems ? 'Individual stems included' : 'Full mix only'}
              </li>
              <li>
                {subscription?.planType === 'lifetime' ? 'Lifetime access' : 'Cancel anytime'}
              </li>
              <li>Access to our latest model</li>
              <li>Credits renew daily</li>
              <li>Commercial use</li>
              <li>Standard features only</li>
              <li>Upload up to 1 min of audio</li>
              <li>Shared creation queue</li>
              <li>No add-on credit purchases</li>
            </ul>

            {/* Reset Info */}
            {isFreeTier && (
              <div className="reset-info">
                <p className="text-xs text-gray-400">
                  Daily limit resets at midnight
                </p>
              </div>
            )}

            {subscription?.planType === 'lifetime' && (
              <div className="reset-info">
                <p className="text-xs text-gray-400">
                  Monthly soft cap resets on {new Date(subscription.monthly_reset_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionStatus;
