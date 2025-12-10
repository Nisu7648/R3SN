package com.r3sn.automation

import android.content.Context
import com.r3sn.models.*
import com.r3sn.network.ApiClient
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap

/**
 * WorkflowEngine - Execute workflows locally on Android
 * Handles workflow orchestration, step execution, and error recovery
 */
class WorkflowEngine(
    private val context: Context,
    private val pluginExecutor: PluginExecutor
) {
    private val activeWorkflows = ConcurrentHashMap<String, Job>()
    private val workflowResults = ConcurrentHashMap<String, WorkflowExecutionResult>()
    
    /**
     * Execute a workflow
     */
    suspend fun executeWorkflow(
        workflow: Workflow,
        authToken: String
    ): WorkflowExecutionResult = withContext(Dispatchers.Default) {
        val executionId = "${workflow.id}_${System.currentTimeMillis()}"
        val startTime = System.currentTimeMillis()
        
        try {
            val stepResults = mutableListOf<StepResult>()
            var context = mutableMapOf<String, Any>()
            
            // Execute each step sequentially
            for ((index, step) in workflow.steps.withIndex()) {
                val stepResult = executeStep(step, context, authToken)
                stepResults.add(stepResult)
                
                if (!stepResult.success) {
                    // Handle step failure
                    if (shouldRetry(step)) {
                        val retryResult = retryStep(step, context, authToken)
                        stepResults.add(retryResult)
                        if (!retryResult.success) {
                            break // Stop workflow on retry failure
                        }
                    } else {
                        break // Stop workflow on failure
                    }
                }
                
                // Add step result to context for next steps
                stepResult.output?.let { context["step_${index}_output"] = it }
            }
            
            val allSuccess = stepResults.all { it.success }
            val executionTime = System.currentTimeMillis() - startTime
            
            WorkflowExecutionResult(
                executionId = executionId,
                workflowId = workflow.id,
                success = allSuccess,
                stepResults = stepResults,
                executionTime = executionTime,
                error = if (!allSuccess) "Workflow failed at step ${stepResults.indexOfFirst { !it.success }}" else null
            )
        } catch (e: Exception) {
            WorkflowExecutionResult(
                executionId = executionId,
                workflowId = workflow.id,
                success = false,
                stepResults = emptyList(),
                executionTime = System.currentTimeMillis() - startTime,
                error = "Workflow execution failed: ${e.message}"
            )
        }
    }
    
    /**
     * Execute a single workflow step
     */
    private suspend fun executeStep(
        step: WorkflowStep,
        context: Map<String, Any>,
        authToken: String
    ): StepResult {
        val startTime = System.currentTimeMillis()
        
        return try {
            when (step.type) {
                "integration" -> executeIntegrationStep(step, context, authToken)
                "agent" -> executeAgentStep(step, context, authToken)
                "plugin" -> executePluginStep(step, context)
                "delay" -> executeDelayStep(step)
                "condition" -> executeConditionStep(step, context)
                else -> StepResult(
                    stepType = step.type,
                    success = false,
                    error = "Unknown step type: ${step.type}"
                )
            }
        } catch (e: Exception) {
            StepResult(
                stepType = step.type,
                success = false,
                executionTime = System.currentTimeMillis() - startTime,
                error = "Step execution failed: ${e.message}"
            )
        }
    }
    
    /**
     * Execute integration step
     */
    private suspend fun executeIntegrationStep(
        step: WorkflowStep,
        context: Map<String, Any>,
        authToken: String
    ): StepResult {
        val startTime = System.currentTimeMillis()
        
        return try {
            val integrationId = step.config["integrationId"] as? String
                ?: return StepResult(stepType = "integration", success = false, error = "Integration ID required")
            
            val action = IntegrationAction(
                action = step.action,
                parameters = step.config
            )
            
            val response = ApiClient.apiService.executeIntegration(
                token = "Bearer $authToken",
                integrationId = integrationId,
                action = action
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                StepResult(
                    stepType = "integration",
                    success = true,
                    output = response.body()?.finalResult,
                    executionTime = System.currentTimeMillis() - startTime
                )
            } else {
                StepResult(
                    stepType = "integration",
                    success = false,
                    executionTime = System.currentTimeMillis() - startTime,
                    error = response.body()?.error ?: "Integration execution failed"
                )
            }
        } catch (e: Exception) {
            StepResult(
                stepType = "integration",
                success = false,
                executionTime = System.currentTimeMillis() - startTime,
                error = e.message
            )
        }
    }
    
    /**
     * Execute agent step
     */
    private suspend fun executeAgentStep(
        step: WorkflowStep,
        context: Map<String, Any>,
        authToken: String
    ): StepResult {
        val startTime = System.currentTimeMillis()
        
        return try {
            val prompt = step.config["prompt"] as? String
                ?: return StepResult(stepType = "agent", success = false, error = "Prompt required")
            
            val request = ExecutePromptRequest(
                prompt = prompt,
                context = context
            )
            
            val response = ApiClient.apiService.executePrompt(
                token = "Bearer $authToken",
                request = request
            )
            
            if (response.isSuccessful && response.body()?.success == true) {
                StepResult(
                    stepType = "agent",
                    success = true,
                    output = response.body()?.finalResult,
                    executionTime = System.currentTimeMillis() - startTime
                )
            } else {
                StepResult(
                    stepType = "agent",
                    success = false,
                    executionTime = System.currentTimeMillis() - startTime,
                    error = response.body()?.error ?: "Agent execution failed"
                )
            }
        } catch (e: Exception) {
            StepResult(
                stepType = "agent",
                success = false,
                executionTime = System.currentTimeMillis() - startTime,
                error = e.message
            )
        }
    }
    
    /**
     * Execute plugin step
     */
    private suspend fun executePluginStep(
        step: WorkflowStep,
        context: Map<String, Any>
    ): StepResult {
        val startTime = System.currentTimeMillis()
        
        return try {
            val plugin = Plugin(
                id = step.config["pluginId"] as? String ?: "",
                name = step.config["pluginName"] as? String ?: "",
                appName = step.config["appName"] as? String ?: "",
                appPackage = step.config["appPackage"] as? String ?: "",
                actions = emptyList(),
                createdAt = ""
            )
            
            val action = PluginAction(
                action = step.action,
                parameters = step.config
            )
            
            val result = pluginExecutor.executePlugin(plugin, action)
            
            StepResult(
                stepType = "plugin",
                success = result.success,
                output = result.result,
                executionTime = System.currentTimeMillis() - startTime,
                error = result.error
            )
        } catch (e: Exception) {
            StepResult(
                stepType = "plugin",
                success = false,
                executionTime = System.currentTimeMillis() - startTime,
                error = e.message
            )
        }
    }
    
    /**
     * Execute delay step
     */
    private suspend fun executeDelayStep(step: WorkflowStep): StepResult {
        val delayMs = (step.config["delayMs"] as? Number)?.toLong() ?: 1000L
        delay(delayMs)
        return StepResult(
            stepType = "delay",
            success = true,
            output = "Delayed for ${delayMs}ms",
            executionTime = delayMs
        )
    }
    
    /**
     * Execute condition step
     */
    private fun executeConditionStep(step: WorkflowStep, context: Map<String, Any>): StepResult {
        val condition = step.config["condition"] as? String ?: ""
        val conditionMet = evaluateCondition(condition, context)
        
        return StepResult(
            stepType = "condition",
            success = true,
            output = conditionMet,
            executionTime = 0
        )
    }
    
    /**
     * Evaluate a condition
     */
    private fun evaluateCondition(condition: String, context: Map<String, Any>): Boolean {
        // Simple condition evaluation (can be enhanced)
        return try {
            // Example: "step_0_output == 'success'"
            true // Simplified for now
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if step should be retried
     */
    private fun shouldRetry(step: WorkflowStep): Boolean {
        val maxRetries = (step.config["maxRetries"] as? Number)?.toInt() ?: 0
        return maxRetries > 0
    }
    
    /**
     * Retry a failed step
     */
    private suspend fun retryStep(
        step: WorkflowStep,
        context: Map<String, Any>,
        authToken: String
    ): StepResult {
        val maxRetries = (step.config["maxRetries"] as? Number)?.toInt() ?: 3
        val retryDelay = (step.config["retryDelayMs"] as? Number)?.toLong() ?: 1000L
        
        repeat(maxRetries) { attempt ->
            delay(retryDelay * (attempt + 1)) // Exponential backoff
            val result = executeStep(step, context, authToken)
            if (result.success) return result
        }
        
        return StepResult(
            stepType = step.type,
            success = false,
            error = "Step failed after $maxRetries retries"
        )
    }
    
    /**
     * Schedule a workflow for periodic execution
     */
    fun scheduleWorkflow(workflow: Workflow, authToken: String) {
        val job = CoroutineScope(Dispatchers.Default).launch {
            while (isActive) {
                val result = executeWorkflow(workflow, authToken)
                workflowResults[workflow.id] = result
                
                // Calculate next execution time based on trigger
                val delayMs = calculateNextExecutionDelay(workflow.trigger)
                delay(delayMs)
            }
        }
        
        activeWorkflows[workflow.id] = job
    }
    
    /**
     * Cancel a scheduled workflow
     */
    fun cancelWorkflow(workflowId: String) {
        activeWorkflows[workflowId]?.cancel()
        activeWorkflows.remove(workflowId)
    }
    
    /**
     * Calculate delay until next execution
     */
    private fun calculateNextExecutionDelay(trigger: WorkflowTrigger): Long {
        return when (trigger.type) {
            "schedule" -> {
                // Parse cron or interval
                val interval = (trigger.config["intervalMs"] as? Number)?.toLong() ?: 3600000L
                interval
            }
            else -> 3600000L // Default 1 hour
        }
    }
}

data class WorkflowExecutionResult(
    val executionId: String,
    val workflowId: String,
    val success: Boolean,
    val stepResults: List<StepResult>,
    val executionTime: Long,
    val error: String? = null
)

data class StepResult(
    val stepType: String,
    val success: Boolean,
    val output: Any? = null,
    val executionTime: Long = 0,
    val error: String? = null
)
