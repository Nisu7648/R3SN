package com.r3sn.automation.data.repository

import androidx.compose.ui.graphics.Color
import com.r3sn.automation.data.api.R3SNApi
import com.r3sn.automation.data.local.dao.AgentDao
import com.r3sn.automation.data.local.entities.AgentEntity
import com.r3sn.automation.data.models.CreateAgentRequest
import com.r3sn.automation.ui.screens.agents.Agent
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AgentsRepository @Inject constructor(
    private val api: R3SNApi,
    private val agentDao: AgentDao
) {
    
    suspend fun getAllAgents(): List<Agent> {
        return try {
            val response = api.getAgents()
            if (response.isSuccessful && response.body() != null) {
                val agents = response.body()!!.map { agent ->
                    Agent(
                        id = agent.id,
                        name = agent.name,
                        type = agent.type,
                        color = getColorForType(agent.type),
                        isActive = agent.isActive,
                        tasksCompleted = agent.tasksCompleted
                    )
                }
                
                // Cache in database
                val entities = agents.map { it.toEntity() }
                agentDao.insertAgents(entities)
                
                agents
            } else {
                getCachedAgents()
            }
        } catch (e: Exception) {
            getCachedAgents()
        }
    }
    
    private suspend fun getCachedAgents(): List<Agent> {
        val entities = agentDao.getAllAgents()
        return entities.map { it.toAgent() }
    }
    
    suspend fun createAgent(name: String, type: String) {
        try {
            val request = CreateAgentRequest(
                name = name,
                type = type,
                capabilities = emptyList()
            )
            val response = api.createAgent(request)
            if (response.isSuccessful && response.body() != null) {
                val agent = response.body()!!
                val entity = AgentEntity(
                    id = agent.id,
                    name = agent.name,
                    type = agent.type,
                    status = agent.status,
                    isActive = agent.isActive,
                    capabilities = agent.capabilities.joinToString(","),
                    tasksCompleted = 0,
                    successRate = 0.0,
                    createdAt = agent.createdAt
                )
                agentDao.insertAgent(entity)
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun activateAgent(id: String) {
        try {
            val response = api.activateAgent(id)
            if (response.isSuccessful) {
                val entity = agentDao.getAgentById(id)
                entity?.let {
                    agentDao.updateAgent(it.copy(isActive = true))
                }
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun deactivateAgent(id: String) {
        try {
            val response = api.deactivateAgent(id)
            if (response.isSuccessful) {
                val entity = agentDao.getAgentById(id)
                entity?.let {
                    agentDao.updateAgent(it.copy(isActive = false))
                }
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun deleteAgent(id: String) {
        try {
            val response = api.deleteAgent(id)
            if (response.isSuccessful) {
                agentDao.deleteAgentById(id)
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    private fun getColorForType(type: String) = when (type) {
        "General" -> Color(0xFF6366F1)
        "Data Processor" -> Color(0xFF10B981)
        "API Handler" -> Color(0xFFF59E0B)
        "Automation" -> Color(0xFFEC4899)
        "Analytics" -> Color(0xFF8B5CF6)
        else -> Color(0xFF6B7280)
    }
}

fun Agent.toEntity() = AgentEntity(
    id = id,
    name = name,
    type = type,
    status = if (isActive) "active" else "inactive",
    isActive = isActive,
    capabilities = "[]",
    tasksCompleted = tasksCompleted,
    successRate = 0.0,
    createdAt = System.currentTimeMillis()
)

fun AgentEntity.toAgent() = Agent(
    id = id,
    name = name,
    type = type,
    color = Color(0xFF6366F1),
    isActive = isActive,
    tasksCompleted = tasksCompleted
)
