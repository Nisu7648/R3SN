package com.r3sn.network

import com.r3sn.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Authentication
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<User>
    
    // Agents
    @GET("agents")
    suspend fun getAgents(@Header("Authorization") token: String): Response<List<Agent>>
    
    @POST("agents")
    suspend fun createAgent(
        @Header("Authorization") token: String,
        @Body agent: CreateAgentRequest
    ): Response<Agent>
    
    @POST("agents/execute-prompt")
    suspend fun executePrompt(
        @Header("Authorization") token: String,
        @Body request: ExecutePromptRequest
    ): Response<ExecutionResult>
    
    @GET("agents/{id}/executions")
    suspend fun getAgentExecutions(
        @Header("Authorization") token: String,
        @Path("id") agentId: String
    ): Response<List<Execution>>
    
    // Workflows/Automations
    @GET("automations")
    suspend fun getWorkflows(@Header("Authorization") token: String): Response<List<Workflow>>
    
    @POST("automations")
    suspend fun createWorkflow(
        @Header("Authorization") token: String,
        @Body workflow: CreateWorkflowRequest
    ): Response<Workflow>
    
    @POST("automations/{id}/execute")
    suspend fun executeWorkflow(
        @Header("Authorization") token: String,
        @Path("id") workflowId: String
    ): Response<ExecutionResult>
    
    @GET("automations/{id}/analytics")
    suspend fun getWorkflowAnalytics(
        @Header("Authorization") token: String,
        @Path("id") workflowId: String
    ): Response<WorkflowAnalytics>
    
    // Integrations
    @GET("integrations")
    suspend fun getIntegrations(
        @Header("Authorization") token: String,
        @Query("category") category: String? = null
    ): Response<List<Integration>>
    
    @POST("integrations/{id}/connect")
    suspend fun connectIntegration(
        @Header("Authorization") token: String,
        @Path("id") integrationId: String,
        @Body credentials: Map<String, String>
    ): Response<IntegrationConnection>
    
    @POST("integrations/{id}/execute")
    suspend fun executeIntegration(
        @Header("Authorization") token: String,
        @Path("id") integrationId: String,
        @Body action: IntegrationAction
    ): Response<ExecutionResult>
    
    // Plugins
    @GET("plugins")
    suspend fun getPlugins(@Header("Authorization") token: String): Response<List<Plugin>>
    
    @POST("plugins/generate")
    suspend fun generatePlugin(
        @Header("Authorization") token: String,
        @Body request: GeneratePluginRequest
    ): Response<Plugin>
    
    @POST("plugins/{id}/execute")
    suspend fun executePlugin(
        @Header("Authorization") token: String,
        @Path("id") pluginId: String,
        @Body action: PluginAction
    ): Response<ExecutionResult>
    
    // Executions
    @GET("executions")
    suspend fun getExecutions(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int = 50
    ): Response<List<Execution>>
    
    @GET("executions/analytics/overview")
    suspend fun getAnalyticsOverview(
        @Header("Authorization") token: String
    ): Response<AnalyticsOverview>
    
    // System
    @GET("stats")
    suspend fun getSystemStats(): Response<SystemStats>
}
