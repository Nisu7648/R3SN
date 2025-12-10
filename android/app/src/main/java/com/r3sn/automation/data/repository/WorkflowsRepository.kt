package com.r3sn.automation.data.repository

import com.r3sn.automation.data.api.R3SNApi
import com.r3sn.automation.data.local.dao.WorkflowDao
import com.r3sn.automation.data.local.entities.WorkflowEntity
import com.r3sn.automation.data.models.CreateWorkflowRequest
import com.r3sn.automation.data.models.WorkflowInput
import com.r3sn.automation.ui.screens.workflows.Workflow
import com.r3sn.automation.ui.screens.workflows.WorkflowStatus
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WorkflowsRepository @Inject constructor(
    private val api: R3SNApi,
    private val workflowDao: WorkflowDao
) {
    
    suspend fun getAllWorkflows(): List<Workflow> {
        return try {
            val response = api.getWorkflows()
            if (response.isSuccessful && response.body() != null) {
                val workflows = response.body()!!.map { workflow ->
                    Workflow(
                        id = workflow.id,
                        name = workflow.name,
                        description = workflow.description,
                        status = when (workflow.status) {
                            "active" -> WorkflowStatus.ACTIVE
                            "paused" -> WorkflowStatus.PAUSED
                            else -> WorkflowStatus.FAILED
                        },
                        taskCount = workflow.tasks.size,
                        executionCount = workflow.executionCount,
                        successRate = (workflow.successRate * 100).toInt()
                    )
                }
                
                // Cache in database
                val entities = workflows.map { it.toEntity() }
                workflowDao.insertWorkflows(entities)
                
                workflows
            } else {
                getCachedWorkflows()
            }
        } catch (e: Exception) {
            getCachedWorkflows()
        }
    }
    
    private suspend fun getCachedWorkflows(): List<Workflow> {
        val entities = workflowDao.getAllWorkflows()
        return entities.map { it.toWorkflow() }
    }
    
    suspend fun createWorkflow(name: String, description: String) {
        try {
            val request = CreateWorkflowRequest(
                name = name,
                description = description,
                tasks = emptyList()
            )
            val response = api.createWorkflow(request)
            if (response.isSuccessful && response.body() != null) {
                val workflow = response.body()!!
                val entity = WorkflowEntity(
                    id = workflow.id,
                    name = workflow.name,
                    description = workflow.description,
                    status = workflow.status,
                    tasks = "[]",
                    createdAt = workflow.createdAt,
                    updatedAt = workflow.updatedAt,
                    executionCount = 0,
                    successRate = 0.0
                )
                workflowDao.insertWorkflow(entity)
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun executeWorkflow(id: String) {
        try {
            api.executeWorkflow(id, WorkflowInput(data = emptyMap()))
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun deleteWorkflow(id: String) {
        try {
            val response = api.deleteWorkflow(id)
            if (response.isSuccessful) {
                workflowDao.deleteWorkflowById(id)
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
}

fun Workflow.toEntity() = WorkflowEntity(
    id = id,
    name = name,
    description = description,
    status = when (status) {
        WorkflowStatus.ACTIVE -> "active"
        WorkflowStatus.PAUSED -> "paused"
        WorkflowStatus.FAILED -> "failed"
    },
    tasks = "[]",
    createdAt = System.currentTimeMillis(),
    updatedAt = System.currentTimeMillis(),
    executionCount = executionCount,
    successRate = successRate.toDouble()
)

fun WorkflowEntity.toWorkflow() = Workflow(
    id = id,
    name = name,
    description = description,
    status = when (status) {
        "active" -> WorkflowStatus.ACTIVE
        "paused" -> WorkflowStatus.PAUSED
        else -> WorkflowStatus.FAILED
    },
    taskCount = 0,
    executionCount = executionCount,
    successRate = successRate.toInt()
)
