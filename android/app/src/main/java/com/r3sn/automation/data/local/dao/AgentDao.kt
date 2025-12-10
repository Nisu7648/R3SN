package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.AgentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AgentDao {
    
    @Query("SELECT * FROM agents ORDER BY createdAt DESC")
    suspend fun getAllAgents(): List<AgentEntity>
    
    @Query("SELECT * FROM agents ORDER BY createdAt DESC")
    fun observeAgents(): Flow<List<AgentEntity>>
    
    @Query("SELECT * FROM agents WHERE id = :id")
    suspend fun getAgentById(id: String): AgentEntity?
    
    @Query("SELECT * FROM agents WHERE isActive = 1 ORDER BY createdAt DESC")
    suspend fun getActiveAgents(): List<AgentEntity>
    
    @Query("SELECT * FROM agents WHERE type = :type ORDER BY createdAt DESC")
    suspend fun getAgentsByType(type: String): List<AgentEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAgent(agent: AgentEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAgents(agents: List<AgentEntity>)
    
    @Update
    suspend fun updateAgent(agent: AgentEntity)
    
    @Delete
    suspend fun deleteAgent(agent: AgentEntity)
    
    @Query("DELETE FROM agents WHERE id = :id")
    suspend fun deleteAgentById(id: String)
    
    @Query("DELETE FROM agents")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM agents")
    suspend fun getAgentCount(): Int
    
    @Query("SELECT COUNT(*) FROM agents WHERE isActive = 1")
    suspend fun getActiveAgentCount(): Int
}
