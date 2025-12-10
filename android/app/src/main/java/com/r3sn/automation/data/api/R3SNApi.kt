package com.r3sn.automation.data.api

import com.r3sn.automation.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface R3SNApi {
    
    // Authentication
    @POST("api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthResponse>
    
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    // Executor
    @POST("api/execute")
    suspend fun executePrompt(@Body request: ExecuteRequest): Response<ExecutionResponse>
    
    @GET("api/executions/history")
    suspend fun getExecutionHistory(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ExecutionHistoryResponse>
    
    @GET("api/executions/{id}")
    suspend fun getExecutionDetails(@Path("id") id: String): Response<ExecutionDetail>
    
    // Integrations
    @GET("api/integrations/manifest")
    suspend fun getIntegrationsManifest(): Response<IntegrationsManifest>
    
    @GET("api/integrations/search")
    suspend fun searchIntegrations(@Query("q") query: String): Response<List<Integration>>
    
    @POST("api/integrations/{id}/connect")
    suspend fun connectIntegration(
        @Path("id") id: String,
        @Body config: IntegrationConfig
    ): Response<IntegrationStatus>
    
    @DELETE("api/integrations/{id}/disconnect")
    suspend fun disconnectIntegration(@Path("id") id: String): Response<Unit>
    
    @GET("api/integrations/connected")
    suspend fun getConnectedIntegrations(): Response<List<Integration>>
    
    // Workflows
    @GET("api/workflows")
    suspend fun getWorkflows(): Response<List<Workflow>>
    
    @POST("api/workflows")
    suspend fun createWorkflow(@Body workflow: CreateWorkflowRequest): Response<Workflow>
    
    @PUT("api/workflows/{id}")
    suspend fun updateWorkflow(
        @Path("id") id: String,
        @Body workflow: UpdateWorkflowRequest
    ): Response<Workflow>
    
    @DELETE("api/workflows/{id}")
    suspend fun deleteWorkflow(@Path("id") id: String): Response<Unit>
    
    @POST("api/workflows/{id}/execute")
    suspend fun executeWorkflow(
        @Path("id") id: String,
        @Body input: WorkflowInput
    ): Response<WorkflowExecution>
    
    @GET("api/workflows/{id}/executions")
    suspend fun getWorkflowExecutions(@Path("id") id: String): Response<List<WorkflowExecution>>
    
    // Agents
    @GET("api/agents")
    suspend fun getAgents(): Response<List<Agent>>
    
    @POST("api/agents")
    suspend fun createAgent(@Body agent: CreateAgentRequest): Response<Agent>
    
    @PUT("api/agents/{id}")
    suspend fun updateAgent(
        @Path("id") id: String,
        @Body agent: UpdateAgentRequest
    ): Response<Agent>
    
    @DELETE("api/agents/{id}")
    suspend fun deleteAgent(@Path("id") id: String): Response<Unit>
    
    @POST("api/agents/{id}/activate")
    suspend fun activateAgent(@Path("id") id: String): Response<Agent>
    
    @POST("api/agents/{id}/deactivate")
    suspend fun deactivateAgent(@Path("id") id: String): Response<Agent>
    
    @GET("api/agents/{id}/tasks")
    suspend fun getAgentTasks(@Path("id") id: String): Response<List<AgentTask>>
    
    // Analytics
    @GET("api/analytics/overview")
    suspend fun getAnalyticsOverview(): Response<AnalyticsOverview>
    
    @GET("api/analytics/executions")
    suspend fun getExecutionAnalytics(
        @Query("from") from: String,
        @Query("to") to: String
    ): Response<ExecutionAnalytics>
    
    @GET("api/analytics/performance")
    suspend fun getPerformanceMetrics(): Response<PerformanceMetrics>
    
    @GET("api/analytics/integrations")
    suspend fun getIntegrationAnalytics(): Response<IntegrationAnalytics>
    
    // Evolution
    @GET("api/evolution/stats")
    suspend fun getEvolutionStats(): Response<EvolutionStats>
    
    @GET("api/evolution/history")
    suspend fun getEvolutionHistory(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<EvolutionHistory>
    
    @GET("api/evolution/improvements")
    suspend fun getImprovements(): Response<List<Improvement>>
    
    // Debugging
    @GET("api/debug/stats")
    suspend fun getDebugStats(): Response<DebugStats>
    
    @GET("api/debug/bugs")
    suspend fun getBugs(): Response<List<Bug>>
    
    @GET("api/debug/fixes")
    suspend fun getFixes(): Response<List<Fix>>
    
    @GET("api/debug/health")
    suspend fun getSystemHealth(): Response<SystemHealth>
    
    // Dashboard
    @GET("api/dashboard/stats")
    suspend fun getDashboardStats(): Response<DashboardStats>
    
    @GET("api/dashboard/activities")
    suspend fun getRecentActivities(): Response<List<ActivityItem>>
    
    // Metrics
    @GET("api/metrics")
    suspend fun getMetrics(): Response<SystemMetrics>
    
    // Health
    @GET("health")
    suspend fun healthCheck(): Response<HealthStatus>
    
    // Settings
    @GET("api/settings")
    suspend fun getSettings(): Response<UserSettings>
    
    @PUT("api/settings")
    suspend fun updateSettings(@Body settings: UserSettings): Response<UserSettings>
}
