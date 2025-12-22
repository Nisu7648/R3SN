import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Integrations = () => {
  const [providers, setProviders] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = {
    all: 'All Apps',
    social: 'Social Media',
    productivity: 'Productivity',
    development: 'Development',
    analytics: 'Analytics',
    finance: 'Finance',
    communication: 'Communication',
    monitoring: 'Monitoring'
  };

  const providerCategories = {
    instagram: 'social',
    tiktok: 'social',
    linkedin: 'social',
    pinterest: 'social',
    snapchat: 'social',
    reddit: 'social',
    youtube: 'social',
    twitter: 'social',
    facebook: 'social',
    gmail: 'communication',
    'google-drive': 'productivity',
    'google-calendar': 'productivity',
    'google-sheets': 'productivity',
    'google-docs': 'productivity',
    slack: 'communication',
    notion: 'productivity',
    trello: 'productivity',
    linear: 'productivity',
    github: 'development',
    gitlab: 'development',
    vercel: 'development',
    railway: 'development',
    datadog: 'monitoring',
    sentry: 'monitoring',
    mixpanel: 'analytics',
    amplitude: 'analytics',
    stripe: 'finance',
    paypal: 'finance'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providersRes, connectionsRes] = await Promise.all([
        axios.get('/oauth/providers'),
        axios.get('/oauth/connections')
      ]);

      setProviders(providersRes.data.providers);
      setConnections(connectionsRes.data.connections);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const connectAccount = async (provider) => {
    try {
      const response = await axios.get(`/oauth/connect/${provider}`);
      window.location.href = response.data.authUrl;
    } catch (error) {
      alert('Failed to connect: ' + error.message);
    }
  };

  const disconnectAccount = async (provider, accountId) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await axios.delete(`/oauth/disconnect/${provider}/${accountId}`);
      await loadData();
    } catch (error) {
      alert('Failed to disconnect: ' + error.message);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || providerCategories[provider] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-2 text-gray-600">
            Connect your accounts - {providers.length}+ apps available
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Apps</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{providers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Connected</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {Object.keys(connections).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Accounts</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {Object.values(connections).reduce((sum, accounts) => sum + accounts.length, 0)}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => {
            const connectedAccounts = connections[provider] || [];
            const isConnected = connectedAccounts.length > 0;

            return (
              <div key={provider} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {provider.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {provider.replace(/-/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {providerCategories[provider] || 'Other'}
                        </p>
                      </div>
                    </div>
                    {isConnected && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {connectedAccounts.length} connected
                      </span>
                    )}
                  </div>

                  {/* Connected Accounts */}
                  {isConnected && (
                    <div className="mb-4 space-y-2">
                      {connectedAccounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {account.accountName || account.accountUsername || account.accountEmail}
                            </p>
                            {account.accountEmail && (
                              <p className="text-xs text-gray-500 truncate">{account.accountEmail}</p>
                            )}
                          </div>
                          <button
                            onClick={() => disconnectAccount(provider, account.id)}
                            className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Disconnect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Connect Button */}
                  <button
                    onClick={() => connectAccount(provider)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isConnected ? 'Add Another Account' : 'Connect Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No apps found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations;
