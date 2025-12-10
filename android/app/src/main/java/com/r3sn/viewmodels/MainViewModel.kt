package com.r3sn.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.models.*
import com.r3sn.network.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * MainViewModel - Manages app state and API interactions
 */
class MainViewModel : ViewModel() {
    
    // Auth State
    private val _authState = MutableStateFlow<AuthState>(AuthState.Unauthenticated)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()
    
    private var authToken: String? = null
    
    // Agents State
    private val _agents = MutableStateFlow<List<Agent>>(emptyList())
    val agents: StateFlow<List<Agent>> = _agents.asStateFlow()
    
    private val _agentsLoading = MutableStateFlow(false)
    val agentsLoading: StateFlow<Boolean> = _agentsLoading.asStateFlow()
    
    // Workflows State
    private val _workflows = MutableStateFlow<List<Workflow>>(emptyList())
    val workflows: StateFlow<List<Workflow>> = _workflows.asStateFlow()
    
    private val _workflowsLoading = MutableStateFlow(false)
    val workflowsLoading: StateFlow<Boolean> = _workflowsLoading.asStateFlow()
    
    // Integrations State
    private val _integrations = MutableStateFlow<List<Integration>>(emptyList())
    val integrations: StateFlow<List<Integration>> = _integrations.asStateFlow()
    
    private val _integrationsLoading = MutableStateFlow(false)
    val integrationsLoading: StateFlow<Boolean> = _integrationsLoading.asStateFlow()
    
    // Plugins State
    private val _plugins = MutableStateFlow<List<Plugin>>(emptyList())
    val plugins: StateFlow<List<Plugin>> = _plugins.asStateFlow()
    
    private val _pluginsLoading = MutableStateFlow(false)
    val pluginsLoading: StateFlow<Boolean> = _pluginsLoading.asStateFlow()
    
    // Executions State
    private val _executions = MutableStateFlow<List<Execution>>(emptyList())
    val executions: StateFlow<List<Execution>> = _executions.asStateFlow()
    
    private val _executionsLoading = MutableStateFlow(false)
    val executionsLoading: StateFlow<Boolean> = _executionsLoading.asStateFlow()
    
    // Analytics State
    private val _analytics = MutableStateFlow<AnalyticsOverview?>(null)
    val analytics: StateFlow<AnalyticsOverview?> = _analytics.asStateFlow()
    
    // Error State
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    // ==================== Auth Functions ====================
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                _authState.value = AuthState.Loading
                
                val response = ApiClient.apiService.login(
                    LoginRequest(email, password)
                )
                
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    authToken = authResponse.token
                    _currentUser.value = authResponse.user
                    _authState.value = AuthState.Authenticated
                    
                    // Load initial data
                    loadAgents()
                    loadWorkflows()
                    loadIntegrations()
                    loadPlugins()
                    loadExecutions()
                    loadAnalytics()
                } else {
                    _authState.value = AuthState.Error("Login failed")
                    _error.value = "Invalid credentials"
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Unknown error")
                _error.value = e.message
            }
        }
    }
    
    fun register(email: String, password: String, name: String) {
        viewModelScope.launch {
            try {
                _authState.value = AuthState.Loading
                
                val response = ApiClient.apiService.register(
                    RegisterRequest(email, password, name)
                )
                
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    authToken = authResponse.token
                    _currentUser.value = authResponse.user
                    _authState.value = AuthState.Authenticated
                } else {
                    _authState.value = AuthState.Error("Registration failed")
                    _error.value = "Registration failed"
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Unknown error")
                _error.value = e.message
            }
        }
    }
    
    fun logout() {
        authToken = null
        _currentUser.value = null
        _authState.value = AuthState.Unauthenticated
        _agents.value = emptyList()
        _workflows.value = emptyList()
        _integrations.value = emptyList()
        _plugins.value = emptyList()
        _executions.value = emptyList()
        _analytics.value = null
    }
    
    // ==================== Agent Functions ====================
    
    fun loadAgents() {
        viewModelScope.launch {
            try {
                _agentsLoading.value = true
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getAgents("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _agents.value = response.body()!!
                } else {
                    _error.value = "Failed to load agents"
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _agentsLoading.value = false
            }
        }
    }
    
    fun createAgent(name: String, type: String, capabilities: List<String>) {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.createAgent(
                    token = "Bearer $token",
                    agent = CreateAgentRequest(name, type, capabilities)
                )
                
                if (response.isSuccessful && response.body() != null) {
                    loadAgents() // Reload agents
                } else {
                    _error.value = "Failed to create agent"
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
    
    fun executePrompt(prompt: String, onResult: (ExecutionResult?) -> Unit) {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.executePrompt(
                    token = "Bearer $token",
                    request = ExecutePromptRequest(prompt)
                )
                
                if (response.isSuccessful) {
                    onResult(response.body())
                    loadExecutions() // Reload executions
                } else {
                    _error.value = "Failed to execute prompt"
                    onResult(null)
                }
            } catch (e: Exception) {
                _error.value = e.message
                onResult(null)
            }
        }
    }
    
    // ==================== Workflow Functions ====================
    
    fun loadWorkflows() {
        viewModelScope.launch {
            try {
                _workflowsLoading.value = true
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getWorkflows("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _workflows.value = response.body()!!
                } else {
                    _error.value = "Failed to load workflows"
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _workflowsLoading.value = false
            }
        }
    }
    
    fun createWorkflow(workflow: CreateWorkflowRequest) {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.createWorkflow(
                    token = "Bearer $token",
                    workflow = workflow
                )
                
                if (response.isSuccessful) {
                    loadWorkflows() // Reload workflows
                } else {
                    _error.value = "Failed to create workflow"
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
    
    fun executeWorkflow(workflowId: String, onResult: (ExecutionResult?) -> Unit) {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.executeWorkflow(
                    token = "Bearer $token",
                    workflowId = workflowId
                )
                
                if (response.isSuccessful) {
                    onResult(response.body())
                    loadExecutions() // Reload executions
                } else {
                    _error.value = "Failed to execute workflow"
                    onResult(null)
                }
            } catch (e: Exception) {
                _error.value = e.message
                onResult(null)
            }
        }
    }
    
    // ==================== Integration Functions ====================
    
    fun loadIntegrations(category: String? = null) {
        viewModelScope.launch {
            try {
                _integrationsLoading.value = true
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getIntegrations(
                    token = "Bearer $token",
                    category = category
                )
                
                if (response.isSuccessful && response.body() != null) {
                    _integrations.value = response.body()!!
                } else {
                    _error.value = "Failed to load integrations"
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _integrationsLoading.value = false
            }
        }
    }
    
    // ==================== Plugin Functions ====================
    
    fun loadPlugins() {
        viewModelScope.launch {
            try {
                _pluginsLoading.value = true
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getPlugins("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _plugins.value = response.body()!!
                } else {
                    _error.value = "Failed to load plugins"
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _pluginsLoading.value = false
            }
        }
    }
    
    fun generatePlugin(request: GeneratePluginRequest) {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.generatePlugin(
                    token = "Bearer $token",
                    request = request
                )
                
                if (response.isSuccessful) {
                    loadPlugins() // Reload plugins
                } else {
                    _error.value = "Failed to generate plugin"
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
    
    // ==================== Execution Functions ====================
    
    fun loadExecutions() {
        viewModelScope.launch {
            try {
                _executionsLoading.value = true
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getExecutions(
                    token = "Bearer $token",
                    limit = 50
                )
                
                if (response.isSuccessful && response.body() != null) {
                    _executions.value = response.body()!!
                } else {
                    _error.value = "Failed to load executions"
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _executionsLoading.value = false
            }
        }
    }
    
    // ==================== Analytics Functions ====================
    
    fun loadAnalytics() {
        viewModelScope.launch {
            try {
                val token = authToken ?: return@launch
                
                val response = ApiClient.apiService.getAnalyticsOverview("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _analytics.value = response.body()!!
                } else {
                    _error.value = "Failed to load analytics"
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
    
    // ==================== Utility Functions ====================
    
    fun clearError() {
        _error.value = null
    }
}

sealed class AuthState {
    object Unauthenticated : AuthState()
    object Loading : AuthState()
    object Authenticated : AuthState()
    data class Error(val message: String) : AuthState()
}
