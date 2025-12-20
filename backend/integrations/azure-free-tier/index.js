const axios = require('axios');

class AzureFreeTierIntegration {
  constructor(subscriptionId, accessToken) {
    this.subscriptionId = subscriptionId;
    this.accessToken = accessToken;
    this.baseUrl = 'https://management.azure.com';
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  async request(method, path, data = null) {
    try {
      const response = await axios({ method, url: `${this.baseUrl}${path}`, headers: this.getHeaders(), data });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Azure API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Virtual Machines (FREE: 750 hours B1S for 12 months)
  async listVms(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines?api-version=2021-03-01`);
  }
  async createVm(resourceGroup, vmName, location, vmSize = 'Standard_B1s') {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}?api-version=2021-03-01`, { location, properties: { hardwareProfile: { vmSize } } });
  }
  async startVm(resourceGroup, vmName) {
    return this.request('POST', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}/start?api-version=2021-03-01`);
  }
  async stopVm(resourceGroup, vmName) {
    return this.request('POST', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}/powerOff?api-version=2021-03-01`);
  }
  async restartVm(resourceGroup, vmName) {
    return this.request('POST', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}/restart?api-version=2021-03-01`);
  }
  async deleteVm(resourceGroup, vmName) {
    return this.request('DELETE', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/${vmName}?api-version=2021-03-01`);
  }

  // Storage (ALWAYS FREE: 5GB Blob)
  async listStorageAccounts(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts?api-version=2021-04-01`);
  }
  async createStorageAccount(resourceGroup, accountName, location) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${accountName}?api-version=2021-04-01`, { location, sku: { name: 'Standard_LRS' }, kind: 'StorageV2' });
  }

  // Azure Functions (ALWAYS FREE: 1M requests/month)
  async listFunctions(resourceGroup, functionAppName) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${functionAppName}/functions?api-version=2021-02-01`);
  }
  async createFunction(resourceGroup, functionAppName, functionName, code) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${functionAppName}/functions/${functionName}?api-version=2021-02-01`, { properties: { config: { bindings: [] }, files: { 'index.js': code } } });
  }

  // SQL Database (ALWAYS FREE: 250GB)
  async listSqlServers(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Sql/servers?api-version=2021-02-01-preview`);
  }
  async createSqlServer(resourceGroup, serverName, location, adminLogin, adminPassword) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Sql/servers/${serverName}?api-version=2021-02-01-preview`, { location, properties: { administratorLogin: adminLogin, administratorLoginPassword: adminPassword } });
  }
  async listDatabases(resourceGroup, serverName) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Sql/servers/${serverName}/databases?api-version=2021-02-01-preview`);
  }
  async createDatabase(resourceGroup, serverName, databaseName) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Sql/servers/${serverName}/databases/${databaseName}?api-version=2021-02-01-preview`, { sku: { name: 'Free', tier: 'Free' } });
  }

  // Cosmos DB (ALWAYS FREE: 25GB + 400 RU/s)
  async listCosmosAccounts(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts?api-version=2021-04-15`);
  }
  async createCosmosAccount(resourceGroup, accountName, location) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${accountName}?api-version=2021-04-15`, { location, properties: { databaseAccountOfferType: 'Standard', enableFreeTier: true } });
  }

  // App Service (ALWAYS FREE: 10 apps)
  async listAppServices(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites?api-version=2021-02-01`);
  }
  async createAppService(resourceGroup, appName, location) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${appName}?api-version=2021-02-01`, { location, properties: { serverFarmId: 'free-plan' } });
  }

  // Container Instances (ALWAYS FREE: 20 vCPU-hours)
  async listContainerInstances(resourceGroup) {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups?api-version=2021-03-01`);
  }
  async createContainer(resourceGroup, containerName, location, image) {
    return this.request('PUT', `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups/${containerName}?api-version=2021-03-01`, { location, properties: { containers: [{ name: containerName, properties: { image, resources: { requests: { cpu: 1, memoryInGB: 1.5 } } } }], osType: 'Linux' } });
  }

  // Cost & Usage
  async getCost() {
    return this.request('POST', `/subscriptions/${this.subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2021-10-01`, { type: 'Usage', timeframe: 'MonthToDate', dataset: { granularity: 'Daily', aggregation: { totalCost: { name: 'PreTaxCost', function: 'Sum' } } } });
  }
  async getUsage() {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/providers/Microsoft.Commerce/UsageAggregates?api-version=2015-06-01-preview`);
  }
  async getFreeTierStatus() {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/providers/Microsoft.Consumption/balances?api-version=2021-10-01`);
  }

  // Regions
  async listRegions() {
    return this.request('GET', `/subscriptions/${this.subscriptionId}/locations?api-version=2020-01-01`);
  }
}

module.exports = AzureFreeTierIntegration;
