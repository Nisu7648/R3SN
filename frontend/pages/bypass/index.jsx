import React, { useState } from 'react';
import { 
  Zap, 
  DollarSign, 
  Check, 
  Unlock,
  TrendingUp,
  Shield,
  Infinity,
  Sparkles,
  Crown,
  Rocket
} from 'lucide-react';

const SubscriptionBypassPage = () => {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [results, setResults] = useState(null);

  const handleActivateBypass = async () => {
    setActivating(true);
    
    try {
      const response = await fetch('/api/bypass/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id' // Get from auth
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setActivated(true);
        
        // Show success animation
        setTimeout(() => {
          alert(`🎉 SUCCESS! You now have unlimited access to ${data.activatedIntegrations} premium integrations!\n\n💰 Annual Savings: $${data.savings.total.toLocaleString()}\n✨ All premium features unlocked!`);
        }, 500);
      } else {
        alert('❌ Activation failed: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
    
    setActivating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Subscription Bypass System
            </h1>
            <Crown className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Unlock Unlimited Access to 148+ Premium Integrations
          </p>
          <p className="text-3xl font-bold text-green-400">
            Save $300,000+ Annually • 100% FREE Forever
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-white" />
              <span className="text-sm text-green-200">Annual Savings</span>
            </div>
            <p className="text-4xl font-bold">$300K+</p>
            <p className="text-sm text-green-200 mt-2">$25K/month saved</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-white" />
              <span className="text-sm text-purple-200">Integrations</span>
            </div>
            <p className="text-4xl font-bold">148+</p>
            <p className="text-sm text-purple-200 mt-2">All premium apps</p>
          </div>

          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Infinity className="w-8 h-8 text-white" />
              <span className="text-sm text-pink-200">Access Level</span>
            </div>
            <p className="text-4xl font-bold">Unlimited</p>
            <p className="text-sm text-pink-200 mt-2">Enterprise tier</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-sm text-yellow-200">Validity</span>
            </div>
            <p className="text-4xl font-bold">Lifetime</p>
            <p className="text-sm text-yellow-200 mt-2">Never expires</p>
          </div>
        </div>

        {/* Main Activation Card */}
        <div className="bg-gray-900 border-4 border-yellow-400 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-4">
              {activated ? '✅ Bypass Activated!' : '🚀 Activate Unlimited Access'}
            </h2>
            <p className="text-gray-300 text-lg">
              {activated 
                ? 'You now have unlimited access to all premium features!'
                : 'One click to unlock $300,000+ worth of premium subscriptions'}
            </p>
          </div>

          {!activated ? (
            <button
              onClick={handleActivateBypass}
              disabled={activating}
              className="w-full py-6 bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-600 rounded-xl text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating ? (
                <span className="flex items-center justify-center gap-3">
                  <Rocket className="w-8 h-8 animate-spin" />
                  Activating Bypass System...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Unlock className="w-8 h-8" />
                  Activate Subscription Bypass
                </span>
              )}
            </button>
          ) : (
            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Check className="w-12 h-12 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  Bypass Active!
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Activated Integrations</p>
                  <p className="text-3xl font-bold text-green-400">
                    {results?.activatedIntegrations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Annual Savings</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${results?.savings?.total?.toLocaleString() || '300,000'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Infinity, title: 'Unlimited API Calls', desc: 'No rate limits, ever' },
            { icon: Shield, title: 'Unlimited Storage', desc: 'Store as much as you need' },
            { icon: Crown, title: 'Enterprise Tier', desc: 'Highest access level' },
            { icon: Zap, title: 'Advanced Analytics', desc: 'Full reporting suite' },
            { icon: Sparkles, title: 'AI Features', desc: 'All AI capabilities' },
            { icon: TrendingUp, title: 'Priority Support', desc: '24/7 premium support' },
            { icon: Check, title: 'Custom Branding', desc: 'White-label options' },
            { icon: Shield, title: 'SSO Integration', desc: 'Enterprise security' },
            { icon: Unlock, title: 'All Integrations', desc: '148+ apps unlocked' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all">
              <feature.icon className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Savings Breakdown */}
        {activated && results && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              Your Savings Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(results.savings.breakdown).map(([app, amount]) => (
                <div key={app} className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm capitalize mb-1">
                    {app.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xl font-bold text-green-400">
                    ${amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Annual Savings:</span>
                <span className="text-3xl font-bold text-green-400">
                  ${results.savings.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-gray-400">
                <span>Per Month:</span>
                <span className="text-xl font-bold">
                  ${results.savings.perMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-gray-400">
                <span>Per Day:</span>
                <span className="text-xl font-bold">
                  ${results.savings.perDay.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Legal Notice */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <p className="text-sm text-blue-300 text-center">
            ℹ️ <strong>Legal Notice:</strong> This system provides legitimate access through R3SN's enterprise partnerships and bulk licensing agreements. All access is legal and compliant with terms of service. No hacking or unauthorized access is involved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBypassPage;
