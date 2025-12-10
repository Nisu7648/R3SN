package com.r3sn.automation.data.models

import com.google.gson.annotations.SerializedName

// Authentication
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String
)

data class AuthResponse(
    val token: String,
    val userId: String,
    val email: String,
    val name: String
)

// Executor
data class ExecuteRequest(
    val prompt: String,
    val context: Map<String, Any>? = null
)

data class ExecutionResponse(
    val executionId: String,
    val status: String,
    val result: ExecutionResult?,
    val startTime: Long,
    val endTime: Long?
)

data class ExecutionResult(
    val success: Boolean,
    val output: String,
    val steps: List<ExecutionStep>,
    val metadata: Map<String, Any>
)

data class ExecutionStep(
    val name: String,
    val status: String,
    val duration: Long,
    val output: String?
)

data class ExecutionHistoryResponse(
    val executions: List<ExecutionHistoryItem>,
    val total: Int,
    val page: Int,
    val totalPages: Int
)

data class ExecutionHistoryItem(
    val id: String,
    val prompt: String,
    val status: String,
    val result: String?,
    val timestamp: Long,
    val duration: Long
)

data class ExecutionDetail(
    val id: String,
    val prompt: String,
    val status: String,
    val result: ExecutionResult?,
    val logs: List<LogEntry>,
    val metrics: ExecutionMetrics
)

data class LogEntry(
    val timestamp: Long,
    val level: String,
    val message: String
)

data class ExecutionMetrics(
    val cpuUsage: Double,
    val memoryUsage: Long,
    val duration: Long,
    val stepsCompleted: Int
)

// Integrations
data class IntegrationsManifest(
    val total: Int,
    val categories: Map<String, List<Integration>>,
    val manifest: Map<String, List<Integration>>
)

data class Integration(
    val id: String,
    val name: String,
    val category: String,
    val type: String,
    val features: List<String>,
    val isConnected: Boolean,
    val icon: String?,
    val description: String?
)

data class IntegrationConfig(
    val apiKey: String? = null,
    val credentials: Map<String, String>? = null,
    val settings: Map<String, Any>? = null
)

data class IntegrationStatus(
    val id: String,
    val connected: Boolean,
    val lastSync: Long?,
    val status: String
)

// Workflows
data class Workflow(
    val id: String,
    val name: String,
    val description: String,
    val status: String,
    val tasks: List<WorkflowTask>,
    val createdAt: Long,
    val updatedAt: Long,
    val executionCount: Int,
    val successRate: Double
)

data class WorkflowTask(
    val id: String,
    val name: String,
    val type: String,
    val config: Map<String, Any>,
    val order: Int
)

data class CreateWorkflowRequest(
    val name: String,
    val description: String,
    val tasks: List<WorkflowTask>
)

data class UpdateWorkflowRequest(
    val name: String?,
    val description: String?,
    val tasks: List<WorkflowTask>?,
    val status: String?
)

data class WorkflowInput(
    val data: Map<String, Any>
)

data class WorkflowExecution(
    val id: String,
    val workflowId: String,
    val status: String,
    val startTime: Long,
    val endTime: Long?,
    val result: Map<String, Any>?,
    val error: String?
)

// Agents
data class Agent(
    val id: String,
    val name: String,
    val type: String,
    val status: String,
    val isActive: Boolean,
    val capabilities: List<String>,
    val tasksCompleted: Int,
    val successRate: Double,
    val createdAt: Long
)

data class CreateAgentRequest(
    val name: String,
    val type: String,
    val capabilities: List<String>
)

data class UpdateAgentRequest(
    val name: String?,
    val type: String?,
    val capabilities: List<String>?
)

data class AgentTask(
    val id: String,
    val agentId: String,
    val name: String,
    val status: String,
    val startTime: Long,
    val endTime: Long?,
    val result: String?
)

// Analytics
data class AnalyticsOverview(
    val totalExecutions: Int,
    val successRate: Double,
    val averageDuration: Long,
    val activeAgents: Int,
    val connectedIntegrations: Int,
    val totalEvolutions: Int
)

data class ExecutionAnalytics(
    val period: String,
    val totalExecutions: Int,
    val successfulExecutions: Int,
    val failedExecutions: Int,
    val averageDuration: Long,
    val executionsByDay: Map<String, Int>,
    val executionsByHour: Map<Int, Int>
)

data class PerformanceMetrics(
    val cpuUsage: Double,
    val memoryUsage: Long,
    val diskUsage: Long,
    val networkUsage: Long,
    val uptime: Long,
    val requestsPerMinute: Int
)

data class IntegrationAnalytics(
    val totalIntegrations: Int,
    val connectedIntegrations: Int,
    val mostUsedIntegrations: List<IntegrationUsage>,
    val integrationsByCategory: Map<String, Int>
)

data class IntegrationUsage(
    val integrationId: String,
    val name: String,
    val usageCount: Int,
    val lastUsed: Long
)

// Evolution
data class EvolutionStats(
    val totalEvolutions: Int,
    val successfulEvolutions: Int,
    val improvementsDeployed: Int,
    val capabilitiesGenerated: Int,
    val codeOptimizations: Int,
    val integrationsDiscovered: Int
)

data class EvolutionHistory(
    val evolutions: List<EvolutionEvent>,
    val total: Int,
    val page: Int
)

data class EvolutionEvent(
    val id: String,
    val type: String,
    val description: String,
    val timestamp: Long,
    val status: String,
    val impact: String,
    val details: Map<String, Any>
)

data class Improvement(
    val id: String,
    val type: String,
    val description: String,
    val priority: Int,
    val status: String,
    val createdAt: Long,
    val deployedAt: Long?
)

// Debugging
data class DebugStats(
    val totalBugs: Int,
    val fixedBugs: Int,
    val activeBugs: Int,
    val autoFixRate: Double,
    val averageFixTime: Long
)

data class Bug(
    val id: String,
    val type: String,
    val severity: String,
    val message: String,
    val stackTrace: String?,
    val occurrences: Int,
    val firstSeen: Long,
    val lastSeen: Long,
    val status: String,
    val fix: Fix?
)

data class Fix(
    val id: String,
    val bugId: String,
    val description: String,
    val codeChanges: List<CodeChange>,
    val status: String,
    val appliedAt: Long?,
    val success: Boolean
)

data class CodeChange(
    val file: String,
    val changes: String,
    val linesAdded: Int,
    val linesRemoved: Int
)

data class SystemHealth(
    val status: String,
    val components: Map<String, ComponentHealth>,
    val uptime: Long,
    val lastCheck: Long
)

data class ComponentHealth(
    val name: String,
    val status: String,
    val message: String?,
    val lastCheck: Long
)

// Dashboard
data class DashboardStats(
    val totalExecutions: Int,
    val activeAgents: Int,
    val connectedIntegrations: Int,
    val totalEvolutions: Int,
    val uptimeSeconds: Long,
    val systemHealth: String
)

data class ActivityItem(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val timestamp: Long,
    val icon: String,
    val color: String
)

// Metrics
data class SystemMetrics(
    val orchestrator: OrchestratorMetrics,
    val scalability: ScalabilityMetrics,
    val evolution: EvolutionMetrics,
    val debugging: DebuggingMetrics
)

data class OrchestratorMetrics(
    val activeWorkflows: Int,
    val completedWorkflows: Int,
    val failedWorkflows: Int,
    val averageExecutionTime: Long
)

data class ScalabilityMetrics(
    val activeWorkers: Int,
    val maxWorkers: Int,
    val cpuUsage: Double,
    val memoryUsage: Long,
    val requestsPerMinute: Int
)

data class EvolutionMetrics(
    val totalEvolutions: Int,
    val pendingImprovements: Int,
    val lastEvolutionTime: Long
)

data class DebuggingMetrics(
    val activeBugs: Int,
    val fixedBugs: Int,
    val autoFixRate: Double
)

// Health
data class HealthStatus(
    val status: String,
    val timestamp: Long,
    val uptime: Long,
    val version: String
)

// Settings
data class UserSettings(
    val userId: String,
    val theme: String,
    val notifications: NotificationSettings,
    val autoEvolution: Boolean,
    val autoDebugging: Boolean,
    val apiEndpoint: String
)

data class NotificationSettings(
    val enabled: Boolean,
    val executionComplete: Boolean,
    val workflowFailed: Boolean,
    val evolutionDeployed: Boolean,
    val bugFixed: Boolean
)
