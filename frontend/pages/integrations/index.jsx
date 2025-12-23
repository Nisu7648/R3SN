import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  Settings, 
  Zap,
  DollarSign,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [apiCredentials, setApiCredentials] = useState({});
  const [loading, setLoading] = useState(false);

  // Load all integrations from backend
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations/list');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
    setLoading(false);
  };

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(integrations.map(i => i.category))];

  // Handle connect button click
  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setApiCredentials({});
    setShowConnectModal(true);
  };

  // Handle API credential input
  const handleCredentialChange = (field, value) => {
    setApiCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit connection
  const handleSubmitConnection = async () => {
    if (!selectedIntegration) return;

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId: selectedIntegration.name,
          credentials: apiCredentials
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${selectedIntegration.displayName} connected successfully!`);
        setShowConnectModal(false);
        loadIntegrations(); // Reload to show connected status
      } else {
        alert(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Connection error: ${error.message}`);
    }
    setLoading(false);
  };

  // Disconnect integration
  const handleDisconnect = async (integration) => {
    if (!confirm(`Disconnect ${integration.displayName}?`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId: integration.name
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${integration.displayName} disconnected successfully!`);
        loadIntegrations();
      }
    } catch (error) {
      alert(`❌ Disconnect error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Integrations Hub
            </h1>
            <p className="text-gray-400">
              Connect {integrations.length} powerful apps • Save $15,528+/year
            </p>
          </div>
          <button
            onClick={loadIntegrations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Total Apps</span>
            </div>
            <p className="text-2xl font-bold">{integrations.length}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Connected</span>
            </div>
            <p className="text-2xl font-bold">
              {integrations.filter(i => i.connected).length}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">Premium</span>
            </div>
            <p className="text-2xl font-bold">
              {integrations.filter(i => i.premiumTier).length}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Annual Savings</span>
            </div>
            <p className="text-2xl font-bold">
              ${integrations.reduce((sum, i) => sum + (i.costSavings?.annualValue || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={integration.icon}
                    alt={integration.displayName}
                    className="w-12 h-12 rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48?text=' + integration.displayName.charAt(0);
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{integration.displayName}</h3>
                    <span className="text-xs text-gray-400 capitalize">
                      {integration.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                {integration.connected ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    <Check className="w-3 h-3" />
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                    <X className="w-3 h-3" />
                    Not Connected
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {integration.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {integration.premiumTier && (
                  <div className="flex items-center gap-2 text-xs">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-purple-400 font-semibold">
                      {integration.premiumTier.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                )}
                {integration.costSavings && (
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      Save ${integration.costSavings.annualValue.toLocaleString()}/year
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Zap className="w-4 h-4" />
                  <span>{integration.endpoints?.length || 0} endpoints</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(integration)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No integrations found</p>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={selectedIntegration.icon}
                  alt={selectedIntegration.displayName}
                  className="w-10 h-10 rounded-lg"
                />
                <h2 className="text-xl font-bold">Connect {selectedIntegration.displayName}</h2>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium mb-2">API Key *</label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiCredentials.apiKey || ''}
                  onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              {/* API Secret (if OAuth2) */}
              {selectedIntegration.authentication?.type === 'oauth2' && (
                <div>
                  <label className="block text-sm font-medium mb-2">API Secret</label>
                  <input
                    type="password"
                    placeholder="Enter your API secret"
                    value={apiCredentials.apiSecret || ''}
                    onChange={(e) => handleCredentialChange('apiSecret', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
              )}

              {/* Base URL (optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Base URL (optional)</label>
                <input
                  type="text"
                  placeholder={selectedIntegration.baseUrl}
                  value={apiCredentials.baseUrl || ''}
                  onChange={(e) => handleCredentialChange('baseUrl', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              {/* Additional Fields */}
              <div>
                <label className="block text-sm font-medium mb-2">Workspace/Account ID (if required)</label>
                <input
                  type="text"
                  placeholder="Enter workspace or account ID"
                  value={apiCredentials.workspaceId || ''}
                  onChange={(e) => handleCredentialChange('workspaceId', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-400">
                💡 <strong>How to get API credentials:</strong>
                <br />
                1. Go to {selectedIntegration.displayName} settings
                <br />
                2. Navigate to API or Developer section
                <br />
                3. Generate new API key/token
                <br />
                4. Copy and paste here
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitConnection}
                disabled={loading || !apiCredentials.apiKey}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
