package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.ExecutionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ExecutionDao {
    
    @Query("SELECT * FROM executions ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentExecutions(limit: Int = 20): List<ExecutionEntity>
    
    @Query("SELECT * FROM executions ORDER BY timestamp DESC")
    fun observeExecutions(): Flow<List<ExecutionEntity>>
    
    @Query("SELECT * FROM executions WHERE id = :id")
    suspend fun getExecutionById(id: String): ExecutionEntity?
    
    @Query("SELECT * FROM executions WHERE status = :status ORDER BY timestamp DESC")
    suspend fun getExecutionsByStatus(status: String): List<ExecutionEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExecution(execution: ExecutionEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExecutions(executions: List<ExecutionEntity>)
    
    @Update
    suspend fun updateExecution(execution: ExecutionEntity)
    
    @Delete
    suspend fun deleteExecution(execution: ExecutionEntity)
    
    @Query("DELETE FROM executions WHERE timestamp < :timestamp")
    suspend fun deleteOldExecutions(timestamp: Long)
    
    @Query("DELETE FROM executions")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM executions")
    suspend fun getExecutionCount(): Int
    
    @Query("SELECT COUNT(*) FROM executions WHERE status = 'success'")
    suspend fun getSuccessCount(): Int
    
    @Query("SELECT COUNT(*) FROM executions WHERE status = 'failed'")
    suspend fun getFailedCount(): Int
}
