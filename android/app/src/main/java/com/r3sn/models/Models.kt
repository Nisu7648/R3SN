package com.r3sn.models

import com.google.gson.annotations.SerializedName

// Auth Models
data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val success: Boolean,
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val email: String,
    val name: String,
    val role: String = "user",
    @SerializedName("createdAt") val createdAt: String
)

// Agent Models
data class Agent(
    val id: String,
    val name: String,
    val type: String,
    val capabilities: List<String>,
    val status: String = "active",
    @SerializedName("createdAt") val createdAt: String
)

data class CreateAgentRequest(
    val name: String,
    val type: String,
    val capabilities: List<String>
)

data class ExecutePromptRequest(
    val prompt: String,
    val context: Map<String, Any> = emptyMap()
)

data class ExecutionResult(
    val success: Boolean,
    val prompt: String? = null,
    val strategy: ExecutionStrategy? = null,
    val results: List<TaskResult>? = null,
    val finalResult: String? = null,
    val executionTime: Long? = null,
    val error: String? = null
)

data class ExecutionStrategy(
    val type: String,
    val tasks: List<String>,
    val dependencies: Map<String, List<String>>
)

data class TaskResult(
    val task: String,
    val success: Boolean,
    val result: Any?,
    val error: String? = null
)

// Workflow Models
data class Workflow(
    val id: String,
    val name: String,
    val description: String? = null,
    val trigger: WorkflowTrigger,
    val steps: List<WorkflowStep>,
    val status: String = "active",
    @SerializedName("createdAt") val createdAt: String
)

data class CreateWorkflowRequest(
    val name: String,
    val description: String? = null,
    val trigger: WorkflowTrigger,
    val steps: List<WorkflowStep>
)

data class WorkflowTrigger(
    val type: String, // schedule, webhook, event
    val config: Map<String, Any>
)

data class WorkflowStep(
    val type: String, // integration, agent, plugin
    val action: String,
    val config: Map<String, Any> = emptyMap()
)

data class WorkflowAnalytics(
    val totalExecutions: Int,
    val successRate: Double,
    val averageExecutionTime: Long,
    val lastExecution: String?,
    val executionHistory: List<ExecutionHistoryItem>
)

data class ExecutionHistoryItem(
    val timestamp: String,
    val success: Boolean,
    val executionTime: Long
)

// Integration Models
data class Integration(
    val id: String,
    val name: String,
    val category: String,
    val description: String,
    val icon: String? = null,
    val actions: List<IntegrationActionDef>,
    val requiresAuth: Boolean = true
)

data class IntegrationActionDef(
    val name: String,
    val description: String,
    val parameters: List<ActionParameter>
)

data class ActionParameter(
    val name: String,
    val type: String,
    val required: Boolean = true,
    val description: String? = null
)

data class IntegrationConnection(
    val id: String,
    val integrationId: String,
    val status: String,
    val connectedAt: String
)

data class IntegrationAction(
    val action: String,
    val parameters: Map<String, Any>
)

// Plugin Models
data class Plugin(
    val id: String,
    val name: String,
    val appName: String,
    val appPackage: String,
    val platform: String = "android",
    val actions: List<PluginActionDef>,
    val status: String = "active",
    @SerializedName("createdAt") val createdAt: String
)

data class GeneratePluginRequest(
    val appName: String,
    val appPackage: String,
    val actions: List<String>,
    val platform: String = "android"
)

data class PluginActionDef(
    val name: String,
    val description: String,
    val code: String
)

data class PluginAction(
    val action: String,
    val parameters: Map<String, Any> = emptyMap()
)

// Execution Models
data class Execution(
    val id: String,
    val type: String, // agent, workflow, plugin
    val entityId: String,
    val status: String, // pending, running, completed, failed
    val result: Any? = null,
    val error: String? = null,
    val startTime: String,
    val endTime: String? = null,
    val executionTime: Long? = null
)

data class AnalyticsOverview(
    val totalExecutions: Int,
    val successfulExecutions: Int,
    val failedExecutions: Int,
    val averageExecutionTime: Long,
    val executionsByType: Map<String, Int>,
    val recentExecutions: List<Execution>
)

// System Models
data class SystemStats(
    val totalUsers: Int,
    val totalAgents: Int,
    val totalWorkflows: Int,
    val totalIntegrations: Int,
    val totalPlugins: Int,
    val totalExecutions: Int,
    val uptime: Long
)
