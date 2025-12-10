package com.r3sn.automation.data.repository

import com.r3sn.automation.data.api.R3SNApi
import com.r3sn.automation.data.local.dao.ExecutionDao
import com.r3sn.automation.data.local.entities.ExecutionEntity
import com.r3sn.automation.data.models.ExecuteRequest
import com.r3sn.automation.ui.screens.executor.ExecutionItem
import com.r3sn.automation.ui.screens.executor.ExecutionStatus
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExecutorRepository @Inject constructor(
    private val api: R3SNApi,
    private val executionDao: ExecutionDao
) {
    
    fun executePrompt(prompt: String): Flow<ExecutionResult> = flow {
        try {
            emit(ExecutionResult(isLoading = true, step = "Analyzing prompt...", progress = 0.1f))
            delay(500)
            
            emit(ExecutionResult(isLoading = true, step = "Preparing execution...", progress = 0.3f))
            delay(500)
            
            // Call API
            val response = api.executePrompt(ExecuteRequest(prompt = prompt))
            
            if (response.isSuccessful && response.body() != null) {
                val execution = response.body()!!
                
                emit(ExecutionResult(isLoading = true, step = "Executing...", progress = 0.6f))
                delay(500)
                
                // Save to database
                val entity = ExecutionEntity(
                    id = execution.executionId,
                    prompt = prompt,
                    status = execution.status,
                    result = execution.result?.output,
                    timestamp = execution.startTime,
                    duration = (execution.endTime ?: System.currentTimeMillis()) - execution.startTime,
                    steps = execution.result?.steps?.joinToString("\n") { it.name } ?: "",
                    metadata = "{}"
                )
                executionDao.insertExecution(entity)
                
                emit(ExecutionResult(isLoading = true, step = "Completed!", progress = 1.0f))
                delay(300)
                
                emit(ExecutionResult(isSuccess = true))
            } else {
                emit(ExecutionResult(isError = true, error = "Execution failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            emit(ExecutionResult(isError = true, error = e.message ?: "Unknown error"))
        }
    }
    
    suspend fun getExecutionHistory(): List<ExecutionItem> {
        return try {
            val entities = executionDao.getRecentExecutions(20)
            entities.map { entity ->
                ExecutionItem(
                    id = entity.id,
                    prompt = entity.prompt,
                    status = when (entity.status) {
                        "success" -> ExecutionStatus.SUCCESS
                        "failed" -> ExecutionStatus.FAILED
                        else -> ExecutionStatus.RUNNING
                    },
                    result = entity.result ?: "",
                    timestamp = formatTimestamp(entity.timestamp),
                    duration = formatDuration(entity.duration)
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private fun formatTimestamp(timestamp: Long): String {
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60000 -> "Just now"
            diff < 3600000 -> "${diff / 60000}m ago"
            diff < 86400000 -> "${diff / 3600000}h ago"
            else -> "${diff / 86400000}d ago"
        }
    }
    
    private fun formatDuration(duration: Long): String {
        return when {
            duration < 1000 -> "${duration}ms"
            duration < 60000 -> "${duration / 1000}s"
            else -> "${duration / 60000}m ${(duration % 60000) / 1000}s"
        }
    }
}

data class ExecutionResult(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isError: Boolean = false,
    val step: String? = null,
    val progress: Float? = null,
    val error: String? = null
)
