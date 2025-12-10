package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.WorkflowEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkflowDao {
    
    @Query("SELECT * FROM workflows ORDER BY updatedAt DESC")
    suspend fun getAllWorkflows(): List<WorkflowEntity>
    
    @Query("SELECT * FROM workflows ORDER BY updatedAt DESC")
    fun observeWorkflows(): Flow<List<WorkflowEntity>>
    
    @Query("SELECT * FROM workflows WHERE id = :id")
    suspend fun getWorkflowById(id: String): WorkflowEntity?
    
    @Query("SELECT * FROM workflows WHERE status = :status ORDER BY updatedAt DESC")
    suspend fun getWorkflowsByStatus(status: String): List<WorkflowEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkflow(workflow: WorkflowEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkflows(workflows: List<WorkflowEntity>)
    
    @Update
    suspend fun updateWorkflow(workflow: WorkflowEntity)
    
    @Delete
    suspend fun deleteWorkflow(workflow: WorkflowEntity)
    
    @Query("DELETE FROM workflows WHERE id = :id")
    suspend fun deleteWorkflowById(id: String)
    
    @Query("DELETE FROM workflows")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM workflows")
    suspend fun getWorkflowCount(): Int
    
    @Query("SELECT COUNT(*) FROM workflows WHERE status = 'active'")
    suspend fun getActiveWorkflowCount(): Int
}
